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
        // 新しいMiemachiStage用のマップ作成
        if (arguments.length > 0) {
            return this.createNewMap(mapKey, tilesetKey, layerName);
        } else {
            // 旧バージョンとの互換性：引数なしの場合
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
        
        console.log(`Map size: ${this.mapWidth}x${this.mapHeight}`);
        
        // スマホ画面に合わせてマップレイヤーをスケール
        this.scaleMapToScreen();
        
        // オブジェクトレイヤーから場所データを取得
        this.extractAreaData();
        
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
        // スマホ画面に合わせてマップレイヤーをスケール
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;
        
        // スケール比を計算（画面いっぱいに表示）
        const scaleX = screenWidth / this.mapWidth;
        const scaleY = screenHeight / this.mapHeight;
        
        // 画面全体を使用するためのスケール
        this.mapScaleX = scaleX;
        this.mapScaleY = scaleY;
        
        // マップレイヤーをスケール
        if (this.mapLayer) {
            this.mapLayer.setScale(this.mapScaleX, this.mapScaleY);
        }
        
        // スケール後のマップサイズを更新
        this.scaledMapWidth = this.mapWidth * this.mapScaleX;
        this.scaledMapHeight = this.mapHeight * this.mapScaleY;
        
        console.log(`Map scaled: ${this.mapScaleX.toFixed(2)}x${this.mapScaleY.toFixed(2)}, Screen: ${screenWidth}x${screenHeight}`);
    }

    extractAreaData(objectLayerName = 'miemachi') {
        // オブジェクトレイヤーから場所データを抽出
        const objectLayer = this.tilemap.getObjectLayer(objectLayerName);
        
        if (objectLayer) {
            this.areas = objectLayer.objects.map(obj => ({
                id: obj.id,
                name: obj.name,
                x: obj.x * this.mapScaleX, // スケールに合わせて座標を調整
                y: obj.y * this.mapScaleY, // スケールに合わせて座標を調整
                type: obj.type || 'location'
            }));
            
            console.log('Extracted areas (scaled):', this.areas);
        } else {
            console.warn(`Object layer "${objectLayerName}" not found`);
        }
    }

    handleResize(gameSize) {
        // リサイズ時の処理
        this.scaleMapToScreen();
        
        // エリアデータを再計算
        this.extractAreaData();
        
        console.log(`MapManager resized to: ${gameSize.width}x${gameSize.height}`);
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
                    }

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

        console.log('Trying fallback with single tileset...');
        
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
                
                console.log('Fallback layer created');
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

    destroy() {
        // クリーンアップ
        this.tilemap = null;
        this.mapLayer = null;
        this.areas = [];
        this.map = null;
        this.layers = [];
        this.npcSprites.clear();
        this.objectGroup = null;
    }
}