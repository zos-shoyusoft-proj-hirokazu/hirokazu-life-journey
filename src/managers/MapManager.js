export class MapManager {
    constructor(scene) {
        this.scene = scene;
        this.tilemap = null;
        this.mapLayer = null;
        this.areas = [];
        
        // マップサイズとスケール
        this.mapWidth = 0;
        this.mapHeight = 0;
        this.mapScaleX = 1;
        this.mapScaleY = 1;
        this.scaledMapWidth = 0;
        this.scaledMapHeight = 0;
        
        // 後方互換性のためのプロパティ
        this.map = null; // 旧バージョンとの互換性
        this.layers = []; // 旧バージョンとの互換性
        this.npcSprites = new Map(); // NPCスプライトの参照を保持
        this.objectGroup = null; // 当たり判定用のグループ
    }

    createMap(mapKey, tilesetKey, layerName = 'タイルレイヤー1') {
        // 街の概要マップ作成
        if (arguments.length > 0) {
            return this.createNewMap(mapKey, tilesetKey, layerName);
        } else {
            // 引数なしの場合は実際に歩けるマップを作成
            return this.createLegacyMap();
        }
    }

    createNewMap(mapKey, tilesetKey, layerName = 'タイルレイヤー1') {
        // Tiledマップを作成
        this.tilemap = this.scene.make.tilemap({ key: mapKey });
        this.map = this.tilemap; // 後方互換性
        
        // タイルセットを追加
        const tileset = this.tilemap.addTilesetImage(tilesetKey, tilesetKey);
        
        // レイヤーを作成
        this.mapLayer = this.tilemap.createLayer(layerName, tileset);
        this.layers = [this.mapLayer]; // 後方互換性
        
        // マップサイズを取得
        this.mapWidth = this.tilemap.widthInPixels;
        this.mapHeight = this.tilemap.heightInPixels;
        
        // スマホ画面に合わせてマップレイヤーをスケール
        this.scaleMapToScreen();
        
        // オブジェクトレイヤーから場所データを取得（マップごとに適切なレイヤー名を指定）
        const objectLayerName = this.getObjectLayerName(mapKey);
        this.extractAreaData(objectLayerName);
        
        return this.tilemap;
    }

    createLegacyMap() {
        // 旧バージョンのcreateMap()（引数なし）
        this.map = this.scene.make.tilemap({ key: 'map' });
        this.tilemap = this.map; // 新しいプロパティにも設定

        try {
            // タイルセット作成
            const availableTilesets = this.createTilesets();
            
            // レイヤー作成
            this.createLayers(availableTilesets);
            
            // オブジェクト作成
            this.placeObjects();
            
        } catch (error) {
            console.error('Error creating tilesets/layers:', error);
            this.createFallbackMap();
        }
        
        return this.map;
    }

    scaleMapToScreen() {
        // スマホ画面に合わせてマップ全体を表示
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        
        // マップ全体がスマホに収まるスケールを計算
        const scaleX = screenWidth / this.mapWidth;
        const scaleY = screenHeight / this.mapHeight;
        const scale = Math.min(scaleX, scaleY); // 小さい方を採用
        
        // CameraManagerに全体表示用スケールを設定
        if (this.scene.cameraManager) {
            this.scene.cameraManager.currentScale = scale;
            console.log(`MapManager: Set initial scale to ${scale} (whole map view)`);
        }
        
        this.mapScaleX = scale;
        this.mapScaleY = scale;
        
        // マップレイヤーをスケール
        if (this.mapLayer) {
            this.mapLayer.setScale(this.mapScaleX, this.mapScaleY);
            
            // マップを画面の中心に配置
            const scaledWidth = this.mapWidth * this.mapScaleX;
            const scaledHeight = this.mapHeight * this.mapScaleY;
            
            // 画面の中心に配置（正確な中央配置）
            const mapX = (screenWidth - scaledWidth) / 2;
            const mapY = (screenHeight - scaledHeight) / 2;
            
            this.mapLayer.setPosition(mapX, mapY);
        }
        
        // スケール後のマップサイズを更新
        this.scaledMapWidth = this.mapWidth * this.mapScaleX;
        this.scaledMapHeight = this.mapHeight * this.mapScaleY;
        
        // カメラの境界を再設定
        if (this.scene.cameraManager) {
            // 全体表示時は画面全体をカメラの境界にする
            // これにより青い余白が解消される
            this.scene.cameraManager.camera.setBounds(0, 0, screenWidth, screenHeight);
            
            // 背景色を設定して、マップが画面より小さい場合の余白を埋める
            this.scene.cameraManager.camera.setBackgroundColor('#87CEEB');
            
            // カメラをマップの中心に設定
            const mapOffsetX = this.mapLayer ? this.mapLayer.x : 0;
            const mapOffsetY = this.mapLayer ? this.mapLayer.y : 0;
            this.scene.cameraManager.camera.centerOn(
                mapOffsetX + this.scaledMapWidth / 2, 
                mapOffsetY + this.scaledMapHeight / 2
            );
            
            console.log(`MapManager: Initial camera bounds: (0, 0, ${screenWidth}, ${screenHeight})`);
        }
        
        // スケール切り替え時は座標のみ再計算
        this.updateObjectPositions(this.mapScaleX);
    }

    getObjectLayerName(mapKey) {
        // マップキーに基づいて適切なオブジェクトレイヤー名を返す
        const layerNames = {
            'bunngo_mie_city': 'miemachi',
            'taketa': 'taketa'
        };
        
        // マップキーが登録されていない場合は警告を出す
        if (!layerNames[mapKey]) {
            console.warn(`MapManager: Unknown mapKey '${mapKey}', using default layer name`);
        }
        
        // 登録されたマップキーの場合のみ値を返す
        return layerNames[mapKey];
    }

    extractAreaData(objectLayerName = null) {
        // オブジェクトレイヤーから場所データを抽出（初回のみ呼ぶ）
        // objectLayerNameが指定されていない場合は、現在のマップキーに基づいて自動決定
        if (!objectLayerName) {
            const mapKey = this.scene.mapConfig?.mapKey || 'taketa';
            objectLayerName = this.getObjectLayerName(mapKey);
        }
        
        // objectLayerNameがundefinedの場合は処理をスキップ
        if (!objectLayerName) {
            console.warn(`MapManager: No object layer name found for mapKey '${this.scene.mapConfig?.mapKey}'`);
            return;
        }
        
        const objectLayer = this.tilemap.getObjectLayer(objectLayerName);
        if (objectLayer) {
            // 既存のエリアをクリア
            this.areas = [];
            
            this.areas = objectLayer.objects.map(obj => ({
                id: obj.id,
                name: obj.name,
                originalX: obj.x,  // 元の座標を保存
                originalY: obj.y,  // 元の座標を保存
                originalWidth: obj.width,  // 元のサイズを保存
                originalHeight: obj.height,  // 元のサイズを保存
                x: obj.x * this.mapScaleX + (this.mapLayer ? this.mapLayer.x : 0),
                y: obj.y * this.mapScaleY + (this.mapLayer ? this.mapLayer.y : 0),
                width: obj.width * this.mapScaleX,  // スケールに合わせてサイズも調整
                height: obj.height * this.mapScaleY,  // スケールに合わせてサイズも調整
                ellipse: obj.ellipse || false,
                rotation: obj.rotation || 0,
                type: obj.type || 'location'
            }));
            
            console.log(`MapManager: Extracted ${this.areas.length} areas from object layer '${objectLayerName}'`);
        } else {
            console.warn(`MapManager: Object layer '${objectLayerName}' not found`);
        }
    }

    handleResize() {
        // リサイズ時の処理
        this.scaleMapToScreen();
        
        // エリアデータを再計算（現在のマップキーに基づいて適切なレイヤー名を使用）
        const objectLayerName = this.getObjectLayerName(this.scene.mapConfig?.mapKey || 'taketa');
        this.extractAreaData(objectLayerName);
    }

    createFallbackImage(key) {
        // 代替画像を動的に作成
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x00ff00);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture(key, 32, 32);
        graphics.destroy();
    }

    // ゲッター
    getTilemap() {
        return this.tilemap;
    }

    getMapLayer() {
        return this.mapLayer;
    }

    getAreas() {
        return this.areas;
    }

    getMapSize() {
        return {
            width: this.mapWidth,
            height: this.mapHeight,
            scaledWidth: this.scaledMapWidth,
            scaledHeight: this.scaledMapHeight
        };
    }

    getMapScale() {
        return {
            scaleX: this.mapScaleX,
            scaleY: this.mapScaleY
        };
    }

    updateObjectPositions(scale) {
        // エリアオブジェクトの位置を更新（originalX/originalYを必ず使う）
        if (this.areas && this.areas.length > 0) {
            // マップレイヤーの現在の位置を取得（確実に取得）
            const mapOffsetX = this.mapLayer ? this.mapLayer.x : 0;
            const mapOffsetY = this.mapLayer ? this.mapLayer.y : 0;
            
            console.log(`MapManager: Map layer position - x: ${mapOffsetX}, y: ${mapOffsetY}, scale: ${scale}`);
            
            // エリアの座標とサイズを更新
            this.areas.forEach(area => {
                // originalX/originalYを使用して正確な座標を計算
                area.x = area.originalX * scale + mapOffsetX;
                area.y = area.originalY * scale + mapOffsetY;
                
                // サイズもスケールに合わせて調整（元のサイズから計算）
                area.width = area.originalWidth * scale;
                area.height = area.originalHeight * scale;
                
                console.log(`MapManager: Area ${area.name} - original: (${area.originalX}, ${area.originalY}), new: (${area.x}, ${area.y}), size: (${area.width}, ${area.height})`);
            });
            
            // スケール後のマップサイズを更新
            this.scaledMapWidth = this.mapWidth * scale;
            this.scaledMapHeight = this.mapHeight * scale;
            
            // エリア選択マネージャーに位置更新を通知（更新されたエリアデータを渡す）
            if (this.scene.areaSelectionManager) {
                console.log(`MapManager: Sending ${this.areas.length} areas to AreaSelectionManager`);
                this.scene.areaSelectionManager.updateAreaPositions([...this.areas]);
            }
            
            // デバッグ用：座標更新を確認
            console.log(`MapManager: Updated object positions with scale ${scale}, areas count: ${this.areas.length}`);
        } else {
            console.warn('MapManager: No areas available for position update');
        }
    }

    // === 旧バージョンとの互換性メソッド ===
    createTilesets() {
        const availableTilesets = [];
        
        // タイルセットマッピング定義
        const tilesetMappings = {
            '[A]Grass1_pipo': '[A]Grass1_pipo',
            'backgraund': 'pipo-map001_at-kusa',
            'GK_A2_C_autotile': 'GK_A2_C_autotile',
            'Preview_RPGMakerVXAce': 'Preview_RPGMakerVXAce',
            'Preview': 'Preview',
            'GK_JC_A5_2': 'GK_JC_A5_2',
            'GK_JC_B_2': 'GK_JC_B_2',
            'tiles': 'tiles',
            'tileset': 'tiles',
            'Tilemap': 'Tilemap'
        };

        // 部分一致チェック用のキーワード
        const partialMatches = [
            { keyword: 'GK_A2_C', texture: 'GK_A2_C_autotile' },
            { keyword: 'Preview_RPGMaker', texture: 'Preview_RPGMakerVXAce' },
            { keyword: 'GK_JC_A5', texture: 'GK_JC_A5_2' },
            { keyword: 'GK_JC_B', texture: 'GK_JC_B_2' },
            { keyword: 'Tilemap', texture: 'Tilemap' }
        ];

        this.map.tilesets.forEach(tilesetData => {
            let tileset = null;
            const name = tilesetData.name;
            
            const tileWidth = tilesetData.tileWidth || 32;
            const tileHeight = tilesetData.tileHeight || 32;

            let textureKey = tilesetMappings[name];
            
            if (!textureKey) {
                const match = partialMatches.find(item => name.includes(item.keyword));
                textureKey = match ? match.texture : 'tiles';
                
                if (!match) {
                    console.warn(`Unknown tileset: ${name}, using tiles.png as fallback`);
                }
            }

            tileset = this.map.addTilesetImage(name, textureKey, tileWidth, tileHeight);
            
            if (tileset) {
                availableTilesets.push(tileset);
            }
        });

        return availableTilesets;
    }

    createLayers(availableTilesets) {
        const baseDepth = -1000;
        const depthStep = 100;

        this.map.layers.forEach((layerData, index) => {
            const layer = this.map.createLayer(layerData.name, availableTilesets, 0, 0);
            
            if (layer) {
                this.layers.push(layer);
                
                const depth = baseDepth + (index * depthStep);
                layer.setDepth(depth);

                layer.setCollisionByProperty({ collides: true });
            } else {
                console.error(`Failed to create layer: ${layerData.name}`);
            }
        });
    }

    placeObjects() {
        this.objectGroup = this.scene.physics.add.staticGroup();

        this.map.objects.forEach(objectLayer => {
            objectLayer.objects.forEach((obj) => {
                const imageKey = obj.name;

                if (this.scene.textures.exists(imageKey)) {
                    const sprite = this.scene.add.sprite(obj.x, obj.y, imageKey, 1);
                    sprite.setOrigin(0, 0);
                    sprite.setScale(1);
                    
                    if (obj.type === 'npc') {
                        this.npcSprites.set(obj.name, sprite);
                        // NPCは必ずCollisionManagerに追加
                        this.scene.collisionManager.addObjectToCollision(sprite, {
                            type: 'npc',
                            width: obj.width || 32,
                            height: obj.height || 32,
                            name: obj.name
                        });
                    } else {
                        // NPC以外のオブジェクトはcollidesプロパティをチェック
                        let hasCollision = false;
                        if (obj.properties && Array.isArray(obj.properties)) {
                            const collidesProp = obj.properties.find(prop => prop.name === 'collides');
                            hasCollision = collidesProp && collidesProp.value === true;
                        }

                        if (hasCollision) {
                            let objType = obj.type || 'wall';

                            this.scene.collisionManager.addObjectToCollision(sprite, {
                                type: objType,
                                width: obj.width || 32,
                                height: obj.height || 32,
                                name: obj.name
                            });  
                        }
                    }
                } else {
                    console.warn(`Image not found: ${imageKey} - スプライト作成をスキップします`);
                }
            });
        });
    }

    createFallbackMap() {
        const fallbackConfig = {
            tilesetName: 'tileset',
            textureKey: 'tiles',
            tileWidth: 32,
            tileHeight: 32,
            layerIndex: 0,
            depth: -1
        };

        try {
            const fallbackTileset = this.map.addTilesetImage(
                fallbackConfig.tilesetName, 
                fallbackConfig.textureKey, 
                fallbackConfig.tileWidth, 
                fallbackConfig.tileHeight
            );
            
            const fallbackLayer = this.map.createLayer(
                fallbackConfig.layerIndex, 
                fallbackTileset, 
                0, 
                0
            );
            
            if (fallbackLayer) {
                this.layers.push(fallbackLayer);
                fallbackLayer.setDepth(fallbackConfig.depth);
                fallbackLayer.setCollisionByProperty({ collides: true });
            }
            
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
        }
    }

    getObjectGroup() {
        return this.objectGroup;
    }

    getNpcSprite(npcId) {
        return this.npcSprites.get(npcId);
    }

    makeNpcFacePlayer(npcId, playerX, playerY) {
        const npcSprite = this.getNpcSprite(npcId);
        if (!npcSprite) {
            console.warn(`NPC sprite not found: ${npcId}`);
            return;
        }

        const deltaX = playerX - npcSprite.x;
        const deltaY = playerY - npcSprite.y;
        
        let direction;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }

        let frame;
        switch (direction) {
            case 'down':
                frame = 1;
                break;
            case 'left':
                frame = 4;
                break;
            case 'right':
                frame = 7;
                break;
            case 'up':
                frame = 10;
                break;
            default:
                frame = 1;
        }

        npcSprite.setFrame(frame);
    }

    // クリーンアップメソッド（シーン切り替え時に使用）
    destroy() {
        // タイルマップレイヤーを削除
        if (this.layers && this.layers.length > 0) {
            this.layers.forEach(layer => {
                if (layer && layer.destroy) {
                    layer.destroy();
                }
            });
            this.layers = [];
        }
        
        // マップレイヤーを削除
        if (this.mapLayer && this.mapLayer.destroy) {
            this.mapLayer.destroy();
            this.mapLayer = null;
        }
        
        // タイルマップを削除
        if (this.tilemap && this.tilemap.destroy) {
            this.tilemap.destroy();
            this.tilemap = null;
        }
        
        // 旧バージョン互換性のマップを削除
        if (this.map && this.map.destroy) {
            this.map.destroy();
            this.map = null;
        }
        
        // NPCスプライトを削除
        if (this.npcSprites) {
            this.npcSprites.forEach(sprite => {
                if (sprite && sprite.destroy) {
                    sprite.destroy();
                }
            });
            this.npcSprites.clear();
        }
        
        // オブジェクトグループを削除
        if (this.objectGroup && this.objectGroup.destroy) {
            this.objectGroup.destroy();
            this.objectGroup = null;
        }
        
        // プロパティをリセット
        this.areas = [];
        this.mapWidth = 0;
        this.mapHeight = 0;
        this.mapScaleX = 1;
        this.mapScaleY = 1;
        this.scaledMapWidth = 0;
        this.scaledMapHeight = 0;
    }
}