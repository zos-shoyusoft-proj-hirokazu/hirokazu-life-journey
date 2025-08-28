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
        
        // 現在のマップキーを追跡
        this.currentMapKey = null;
        
        // 後方互換性のためのプロパティ
        this.map = null; // 旧バージョンとの互換性
        this.layers = []; // 旧バージョンとの互換性
        this.npcSprites = new Map(); // NPCスプライトの参照を保持
        this.objectGroup = null; // 当たり判定用のグループ
    }

    createMap(mapKey, tilesetKey, layerName) {
        // 引数が存在する場合は新しいマップ作成
        if (mapKey && tilesetKey) {
            return this.createNewMap(mapKey, tilesetKey, layerName);
        } else {
            // 引数がない場合は実際に歩けるマップを作成
            return this.createLegacyMap();
        }
    }

    createNewMap(mapKey) {
        // 現在のマップキーを保存
        this.currentMapKey = mapKey;
        
        // Tiledマップを作成
        try {
        this.tilemap = this.scene.make.tilemap({ key: mapKey });
        this.map = this.tilemap; // 後方互換性
        
            // tilemapが正常に作成されたか確認
            if (!this.tilemap) {
                console.error('[MapManager] タイルマップの作成に失敗しました');
                return;
            }
        } catch (error) {
            console.error('[MapManager] タイルマップ作成エラー:', error);
            throw error;
        }
        
        // タイルセットを追加
        if (this.tilemap && this.tilemap.tilesets && this.tilemap.tilesets.length > 0) {
            this.tilemap.tilesets.forEach((tiledTileset) => {
                try {
                    // テクスチャキーを検索
                    const availableTextures = Object.keys(this.scene.textures.list);
                    let textureKey = null;
                    
                    // 完全一致を試行
                    if (availableTextures.includes(tiledTileset.name)) {
                        textureKey = tiledTileset.name;
                    }
                    
                    // 部分一致を試行（完全一致で見つからない場合）
                    if (!textureKey) {
                        const partialMatch = availableTextures.find(texture => 
                            tiledTileset.name.includes(texture) || 
                            texture.includes(tiledTileset.name)
                        );
                        if (partialMatch) {
                            textureKey = partialMatch;
                        }
                    }
                    
                    if (textureKey && this.tilemap) {
                        this.tilemap.addTilesetImage(tiledTileset.name, textureKey);
                    }
                } catch (error) {
                    console.error(`[MapManager] タイルセット処理エラー: ${tiledTileset.name}`, error);
                }
            });
        }
        
        // レイヤー作成
        if (this.tilemap && this.tilemap.layers && this.tilemap.layers.length > 0) {
            this.layers = [];
            
            this.tilemap.layers.forEach((layerData, index) => {
                try {
                    if (this.tilemap && this.tilemap.tilesets) {
                        const layer = this.tilemap.createLayer(layerData.name, this.tilemap.tilesets, 0, 0);
                        
                        if (layer) {
                            this.layers.push(layer);
                            
                            // 最初のレイヤーをメインレイヤーとして設定
                            if (index === 0) {
                                this.mapLayer = layer;
                            }
                        }
                    }
                } catch (error) {
                    console.error(`[MapManager] ❌ レイヤー${index + 1}作成エラー: ${layerData.name}`, error);
                }
            });
            
            if (this.layers.length === 0) {
                console.error('[MapManager] レイヤーが作成されていません');
                return this.tilemap;
            }
        } else {
            console.error('[MapManager] Tiledマップにレイヤーが定義されていません');
            return this.tilemap;
        }
        
        // マップサイズを取得（tilemapが存在することを確認）
        if (this.tilemap) {
            this.mapWidth = this.tilemap.widthInPixels || 
                          (this.tilemap.width * this.tilemap.tileWidth) || 0;
            this.mapHeight = this.tilemap.heightInPixels || 
                           (this.tilemap.height * this.tilemap.tileHeight) || 0;
        } else {
            this.mapWidth = 0;
            this.mapHeight = 0;
        }
        
        // スマホ画面に合わせてマップレイヤーをスケール
        this.scaleMapToScreen();
        
        // オブジェクトレイヤーから場所データを取得（マップごとに適切なレイヤー名を指定）
        const objectLayerName = this.getObjectLayerName(mapKey);
        this.extractAreaData(objectLayerName);
        
        // レイヤーの可視性と深度を明示的に設定
        if (this.mapLayer) {
            this.mapLayer.setVisible(true);
            this.mapLayer.setDepth(0); // 背景レイヤーとして最背面に配置
        }
    }

    createLegacyMap() {
        try {
            // 現在のマップキーを取得
            const mapKey = this.currentMapKey;
            if (!mapKey) {
                console.error('[MapManager] マップキーが設定されていません');
                return;
            }
            
            // Tiledマップを作成
            this.tilemap = this.scene.make.tilemap({ key: mapKey });
            this.map = this.tilemap;
            
            // tilemapが正常に作成されたか確認
            if (!this.tilemap) {
                console.error('[MapManager] タイルマップの作成に失敗しました');
                return;
            }
            
            // 竹田高校と三重中学校の場合は新しいタイルセット処理を使用
            if (mapKey && (mapKey.includes('taketa_highschool') || mapKey.includes('mie_high_school'))) {
                // 新しいタイルセット処理（createNewMapと同じ方法）
                if (this.tilemap && this.tilemap.tilesets && this.tilemap.tilesets.length > 0) {
                    this.tilemap.tilesets.forEach((tiledTileset) => {
                        try {
                            // テクスチャキーを検索（より柔軟な検索）
                            const availableTextures = Object.keys(this.scene.textures.list);
                            let textureKey = null;
                            
                            // 完全一致を試行
                            if (availableTextures.includes(tiledTileset.name)) {
                                textureKey = tiledTileset.name;
                            }
                            
                            // 部分一致を試行（完全一致で見つからない場合）
                            if (!textureKey) {
                                const partialMatch = availableTextures.find(texture => 
                                    texture.includes(tiledTileset.name)
                                );
                                if (partialMatch) {
                                    textureKey = partialMatch;
                                }
                            }
                            
                            if (textureKey) {
                                this.tilemap.addTilesetImage(tiledTileset.name, textureKey);
                            }
                        } catch (error) {
                            console.error(`[MapManager] タイルセット処理エラー: ${tiledTileset.name}`, error);
                        }
                    });
                }
            
            // レイヤー作成
                if (this.tilemap && this.tilemap.layers && this.tilemap.layers.length > 0) {
                    this.layers = [];
                    
                    this.tilemap.layers.forEach((layerData, index) => {
                        try {
                            const actualTilesets = [];
                            
                            this.tilemap.tilesets.forEach((tiledTileset) => {
                                if (tiledTileset && tiledTileset.name) {
                                    // テクスチャキーを検索
                                    const availableTextures = Object.keys(this.scene.textures.list);
                                    const textureKey = availableTextures.find(texture => 
                                        texture.includes(tiledTileset.name)
                                    );
                                    
                                    if (textureKey) {
                                        // 実際のタイルセットオブジェクトを作成
                                        const tileset = this.tilemap.addTilesetImage(tiledTileset.name, textureKey);
                                        if (tileset) {
                                            actualTilesets.push(tileset);
                                        }
                                    }
                                }
                            });
                            
                            if (actualTilesets.length === 0) {
                                console.warn(`[MapManager] ⚠️ レイヤー${index + 1}用の実際のタイルセットがありません: ${layerData.name}`);
                            }
                            
                            const layer = this.tilemap.createLayer(layerData.name, actualTilesets, 0, 0);
                            
                            if (layer) {
                                // レイヤーの深度設定
                                let layerDepth;
                                
                                if (layerData.name.includes('床')) {
                                    layerDepth = 0;   // 床は最奥
                                } else {
                                    layerDepth = 50 + index; // 床以外は主人公より上
                                }
                                
                                layer.setDepth(layerDepth);
                                layer.setVisible(true);
                                
                                this.layers.push(layer);
                                
                                if (index === 0) {
                                    this.mapLayer = layer;
                                }
                            }
                        } catch (error) {
                            console.error(`[MapManager] ❌ レイヤー${index + 1}作成エラー: ${layerData.name}`, error);
                        }
                    });
                    
                    // マップサイズを取得（mapLayerが存在しない場合はtilemapから直接取得）
                    this.mapWidth = this.tilemap.widthInPixels || 
                                  (this.tilemap.width * this.tilemap.tileWidth) || 0;
                    this.mapHeight = this.tilemap.heightInPixels || 
                                   (this.tilemap.height * this.tilemap.tileHeight) || 0;
                    
                    // オブジェクトレイヤー処理（統合）
                    if (this.tilemap) {
                        const objectLayerNames = ['オブジェクトレイヤー1', 'オブジェクトレイヤー2', 'オブジェクトレイヤー3'];
                        
                        console.log('[MapManager] オブジェクトレイヤー処理開始');
                        console.log(`[MapManager] tilemap情報: 幅=${this.tilemap.width}, 高さ=${this.tilemap.height}, タイル幅=${this.tilemap.tileWidth}, タイル高さ=${this.tilemap.tileHeight}`);
                        
                        objectLayerNames.forEach(layerName => {
                            const objectLayer = this.tilemap.getObjectLayer(layerName);
                            if (objectLayer) {
                                // オブジェクトレイヤーの寸法を正しく取得
                                const layerWidth = objectLayer.width || this.tilemap.widthInPixels || (this.tilemap.width * this.tilemap.tileWidth) || 0;
                                const layerHeight = objectLayer.height || this.tilemap.heightInPixels || (this.tilemap.height * this.tilemap.tileHeight) || 0;
                                
                                console.log(`[MapManager] オブジェクトレイヤー発見: ${layerName}, 幅: ${layerWidth}, 高さ: ${layerHeight}`);
                                
                                // オブジェクトレイヤーの寸法を設定
                                objectLayer.width = layerWidth;
                                objectLayer.height = layerHeight;
                                
                                this.processObjectLayer(layerName);
                            } else {
                                console.warn(`[MapManager] オブジェクトレイヤーが見つかりません: ${layerName}`);
                            }
                        });
                    } else {
                        console.warn('[MapManager] tilemapが存在しません');
                    }
                    
                    // エリアデータを抽出（最初のオブジェクトレイヤーを使用）
                    if (this.tilemap && this.tilemap.layers) {
                        const objectLayers = this.tilemap.layers.filter(layer => layer.type === 'objectgroup');
                        if (objectLayers.length > 0) {
                            this.extractAreaData(objectLayers[0].name);
                        }
                    }
                }
                
            } else {
                // 従来のタイルセット処理（stage1, stage2, stage3用）
                /*
                const availableTilesets = this.createTilesets();
                this.createLayers(availableTilesets);
            this.placeObjects();
                */
                console.log('[MapManager] 従来のタイルセット処理は現在無効化されています');
            }
            
        } catch (error) {
            console.error('[MapManager] createLegacyMapエラー:', error);
        }
    }
    


    // オブジェクトレイヤーを処理
    
    processObjectLayer(layerName) {
        try {
            if (!this.tilemap) {
                console.warn('[MapManager] tilemapが存在しません');
                return;
            }
            
            const objectLayer = this.tilemap.getObjectLayer(layerName);
            if (!objectLayer) {
                console.warn(`[MapManager] オブジェクトレイヤー '${layerName}' が見つかりません`);
                return;
            }
            
            // 当たり判定用のグループを作成（既存のものがある場合は使用）
            if (!this.objectGroup) {
                this.objectGroup = this.scene.physics.add.staticGroup();
            }
            
            // オブジェクトレイヤー1の場合は壁専用処理を試行
            if (layerName === 'オブジェクトレイヤー1') {
                console.log('[MapManager] 壁レイヤー処理開始（オブジェクトレイヤー1）');
                
                // 壁オブジェクトのみを処理
                const wallObjects = objectLayer.objects.filter(obj => obj.type === 'wall');
                if (wallObjects.length > 0) {
                    console.log(`[MapManager] 壁オブジェクト ${wallObjects.length}個 を発見`);
                    wallObjects.forEach((obj, index) => {
                        this.createWallObject(obj, index);
                    });
                }
                
                // 壁以外のオブジェクトがある場合は警告
                const nonWallObjects = objectLayer.objects.filter(obj => obj.type !== 'wall');
                if (nonWallObjects.length > 0) {
                    console.warn(`[MapManager] 壁レイヤーにwall以外のオブジェクト: ${nonWallObjects.map(obj => `${obj.type} (${obj.name})`).join(', ')}`);
                }
                
                // 壁レイヤーは専用処理で完了
                return;
            }
            
            // オブジェクトレイヤー2の場合はNPC専用処理を試行
            if (layerName === 'オブジェクトレイヤー2') {
                console.log('[MapManager] NPCレイヤー処理開始（オブジェクトレイヤー2）');
                
                // NPCオブジェクトのみを処理
                const npcObjects = objectLayer.objects.filter(obj => obj.type === 'npc');
                if (npcObjects.length > 0) {
                    console.log(`[MapManager] NPCオブジェクト ${npcObjects.length}個 を発見`);
                    npcObjects.forEach((obj, index) => {
                        this.createNPCObject(obj, index);
                    });
                }
                
                // NPC以外のオブジェクトがある場合は警告
                const nonNPCObjects = objectLayer.objects.filter(obj => obj.type !== 'npc');
                if (nonNPCObjects.length > 0) {
                    console.warn(`[MapManager] NPCレイヤーにnpc以外のオブジェクト: ${nonNPCObjects.map(obj => `${obj.type} (${obj.name})`).join(', ')}`);
                }
                
                // NPCレイヤーは専用処理で完了
                return;
            }
            
            // オブジェクトレイヤー3の場合は移動専用処理を試行
            if (layerName === 'オブジェクトレイヤー3') {
                console.log('[MapManager] 移動レイヤー処理開始（オブジェクトレイヤー3）');
                
                // 移動オブジェクトのみを処理
                const moveObjects = objectLayer.objects.filter(obj => obj.type === 'move');
                if (moveObjects.length > 0) {
                    console.log(`[MapManager] 移動オブジェクト ${moveObjects.length}個 を発見`);
                    moveObjects.forEach((obj, index) => {
                        this.createMoveObject(obj, index);
                    });
                }
                
                // 移動以外のオブジェクトがある場合は警告
                const nonMoveObjects = objectLayer.objects.filter(obj => obj.type !== 'move');
                if (nonMoveObjects.length > 0) {
                    console.warn(`[MapManager] 移動レイヤーにmove以外のオブジェクト: ${nonMoveObjects.map(obj => `${obj.type} (${obj.name})`).join(', ')}`);
                }
                
                // 移動レイヤーは専用処理で完了
                return;
            }
            
            // 既存の処理（その他のレイヤー用）
            this.processGenericObjects(objectLayer, layerName);
            
        } catch (error) {
            console.error('[MapManager] オブジェクトレイヤー処理エラー:', error);
        }
    }

    // 壁オブジェクト作成（専用）
    createWallObject(obj, index) {
        const width = obj.width || 32;
        const height = obj.height || 32;
        const name = obj.name || `wall_${index}`;
        
        // 壁は黒い矩形で表示
        const sprite = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.5);
        
        // 汎用処理で座標変換、物理ボディ設定、オブジェクト情報保存を実行
        this.processGenericObjectSetup(sprite, obj, 'wall', name);
        
        // 当たり判定グループに追加
        this.objectGroup.add(sprite);
        
        console.log(`[MapManager] 壁オブジェクト作成: ${name}, サイズ: ${width}x${height}`);
    }

    // NPCオブジェクト作成（専用）
    createNPCObject(obj, index) {
        const width = obj.width || 32;
        const height = obj.height || 32;
        const name = obj.name || `npc_${index}`;
        
        // NPCはスプライトとして作成（setFrameが使えるように）
        // テクスチャが存在しない場合は代替画像を作成
        let textureKey = 'npc_default';
        if (!this.scene.textures.exists(textureKey)) {
            this.createNPCTexture(textureKey, width, height);
        }
        
        const sprite = this.scene.add.sprite(0, 0, textureKey);
        sprite.setDisplaySize(width, height); // サイズを設定
        
        // 汎用処理で座標変換、物理ボディ設定、オブジェクト情報保存を実行
        this.processGenericObjectSetup(sprite, obj, 'npc', name);
        
        // 当たり判定グループに追加（MapManager用）
        this.objectGroup.add(sprite);
        
        // NPC専用の衝突グループにも追加（CollisionManager用）
        if (this.scene.collisionManager && 
            this.scene.collisionManager.collisionGroups && 
            this.scene.collisionManager.collisionGroups.npcs) {
            this.scene.collisionManager.collisionGroups.npcs.add(sprite);
        }
        
        // NPCスプライトを保存
        this.npcSprites.set(name, sprite);
        
        // オブジェクト名のテキストラベルを追加（座標変換後の位置に設定）
        const label = this.scene.add.text(sprite.x, sprite.y - height/2 - 10, `${name} (npc)`, {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 2, y: 1 }
        });
        label.setOrigin(0.5, 1);
        label.setDepth(1000);
        
        console.log(`[MapManager] NPCオブジェクト作成: ${name}, サイズ: ${width}x${height}`);
    }

    // NPC用のテクスチャを作成
    createNPCTexture(textureKey, width, height) {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x00FF00); // 緑色
        graphics.fillRect(0, 0, width, height);
        graphics.lineStyle(2, 0x008000); // 濃い緑の枠線
        graphics.strokeRect(0, 0, width, height);
        graphics.generateTexture(textureKey, width, height);
        graphics.destroy();
    }

    // 移動オブジェクト作成（専用）
    createMoveObject(obj, index) {
        const width = obj.width || 32;
        const height = obj.height || 32;
        const name = obj.name || `move_${index}`;
        
        // 移動オブジェクトは青い矩形で表示
        const sprite = this.scene.add.rectangle(0, 0, width, height, 0x0000FF, 0.5);
        
        // 汎用処理で座標変換、物理ボディ設定、オブジェクト情報保存を実行
        this.processGenericObjectSetup(sprite, obj, 'move', name);
        
        // 当たり判定グループに追加
        this.objectGroup.add(sprite);
        
        // 移動オブジェクトの特別な設定
        sprite.setData('moveId', name);
        sprite.setData('moveType', 'move');
        
        // オブジェクト名のテキストラベルを追加（座標変換後の位置に設定）
        const label = this.scene.add.text(sprite.x, sprite.y - height/2 - 10, `${name} (move)`, {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 2, y: 1 }
        });
        label.setOrigin(0.5, 1);
        label.setDepth(1000);
        
        console.log(`[MapManager] moveオブジェクト作成: ${name}, サイズ: ${width}x${height}`);
        
        // move_3の場合は特別なログ
        if (name === 'move_3') {
            console.log('[MapManager] ⭐ move_3オブジェクトを発見！物理ボディ設定:', sprite.body);
        }
    }

    // 既存の汎用処理（その他のレイヤー用）
    processGenericObjects(objectLayer, layerName) {
        console.log(`[MapManager] 汎用レイヤー処理: ${layerName}`);
        
        // 専用メソッドで処理されるオブジェクトタイプを除外
        const excludedTypes = ['wall', 'npc', 'move'];
        
        objectLayer.objects.forEach((obj, index) => {
            // 専用メソッドで処理されるオブジェクトはスキップ
            if (excludedTypes.includes(obj.type)) {
                console.log(`[MapManager] ${obj.type}オブジェクトは専用メソッドで処理済み: ${obj.name}`);
                return;
            }
            
            // 正しい座標変換を実装
            // TMJファイルの座標は左上が(0,0)、Phaserのadd.rectangleは中央が(0,0)
            // そのため、座標を調整する必要がある
            let x = obj.x || 0;
            let y = obj.y || 0;
            
            // マップのスケールを適用（正しい取得方法）
            const mapScale = this.tilemap.scale || this.tilemap.scaleX || 1;
            if (mapScale !== 1) {
                x *= mapScale;
                y *= mapScale;
            }
            
            // マップのオフセットを適用（正しい取得方法）
            const mapOffsetX = this.tilemap.x || this.tilemap.scrollX || 0;
            const mapOffsetY = this.tilemap.y || this.tilemap.scrollY || 0;
            x += mapOffsetX;
            y += mapOffsetY;
            
            // レイヤーのオフセットも考慮
            if (this.mapLayer) {
                const layerOffsetX = this.mapLayer.x || 0;
                const layerOffsetY = this.mapLayer.y || 0;
                x += layerOffsetX;
                y += layerOffsetY;
            }
            
            const width = obj.width || 32;
            const height = obj.height || 32;
            const type = obj.type || 'object';
            const name = obj.name || `object_${index}`;
            
            // Phaserのadd.rectangleは中央が原点なので、左上の座標を中央座標に変換
            const centerX = x + (width / 2);
            const centerY = y + (height / 2);
            
            // 汎用オブジェクト用の色設定
            let color = 0x808080; // デフォルトはグレー
            if (type === 'item') {
                color = 0xFFD700; // アイテムは金色
            } else if (type === 'enemy') {
                color = 0xFF0000; // 敵は赤色
            }
            
            const sprite = this.scene.add.rectangle(centerX, centerY, width, height, color, 0.5);
            
            // 物理ボディを追加
            this.scene.physics.add.existing(sprite, true);
            
            // 当たり判定グループに追加
            this.objectGroup.add(sprite);
            
            // オブジェクト名のテキストラベルを追加
            const label = this.scene.add.text(centerX, centerY - height/2 - 10, `${name} (${type})`, {
                fontSize: '12px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 2, y: 1 }
            });
            label.setOrigin(0.5, 1);
            label.setDepth(1000); // 最前面に表示
            
            // オブジェクトの情報を保存
            sprite.setData('objectType', type);
            sprite.setData('objectName', name);
            sprite.setData('objectId', obj.id);
            
            console.log(`[MapManager] 汎用オブジェクト作成: ${name} (${type}), 座標: (${centerX}, ${centerY}), サイズ: ${width}x${height}`);
        });
    }

    // 汎用オブジェクトのセットアップ（座標変換、物理ボディ、オブジェクト情報）
    processGenericObjectSetup(sprite, obj, type, name) {
        // 座標変換
        let x = obj.x || 0;
        let y = obj.y || 0;
        const mapScale = this.tilemap.scale || this.tilemap.scaleX || 1;
        if (mapScale !== 1) {
            x *= mapScale;
            y *= mapScale;
        }
        const mapOffsetX = this.tilemap.x || this.tilemap.scrollX || 0;
        const mapOffsetY = this.tilemap.y || this.tilemap.scrollY || 0;
        x += mapOffsetX;
        y += mapOffsetY;
        if (this.mapLayer) {
            const layerOffsetX = this.mapLayer.x || 0;
            const layerOffsetY = this.mapLayer.y || 0;
            x += layerOffsetX;
            y += layerOffsetY;
        }

        // Phaserのオブジェクトは中央が原点なので、左上の座標を中央座標に変換
        const width = obj.width || 32;
        const height = obj.height || 32;
        const centerX = x + (width / 2);
        const centerY = y + (height / 2);
        
        // スプライトの位置を設定
        sprite.setPosition(centerX, centerY);

        // 物理ボディ設定
        this.scene.physics.add.existing(sprite, true);

        // オブジェクト情報保存
        sprite.setData('objectType', type);
        sprite.setData('objectName', name);
        sprite.setData('objectId', obj.id);
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
        }
        
        // スケール切り替え時は座標のみ再計算
        this.updateObjectPositions(this.mapScaleX);
    }

    // マップキーに応じたオブジェクトレイヤー名を取得
    getObjectLayerName() {
        // 竹田高校の場合は「オブジェクトレイヤー1」
        if (this.currentMapKey && this.currentMapKey.includes('highschool')) {
            return 'オブジェクトレイヤー1';
        }
        
        // 竹田マップの場合は「taketa」
        if (this.currentMapKey && this.currentMapKey.includes('taketa') && !this.currentMapKey.includes('highschool')) {
            return 'taketa';
        }
        
        // 三重町マップの場合は「miemachi」
        if (this.currentMapKey && this.currentMapKey.includes('miemachi')) {
            return 'miemachi';
        }
        
        // 全国マップの場合は「japan」
        if (this.currentMapKey && this.currentMapKey.includes('japan')) {
            return 'japan';
        }
        
        // デフォルト
        return 'オブジェクトレイヤー1';
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
        
        // Tiledのオブジェクトレイヤーを取得（tilelayerとは別 API）
        let objectLayer = null;
        try {
            if (typeof this.tilemap.getObjectLayer === 'function') {
                objectLayer = this.tilemap.getObjectLayer(objectLayerName);
            }
        } catch (_) { /* ignore */ }

        // 互換: tilemap.objects からの直接検索
        if (!objectLayer && Array.isArray(this.tilemap.objects)) {
            objectLayer = this.tilemap.objects.find(l => l && l.name === objectLayerName);
        }
        
        // オブジェクトレイヤーが見つからない場合の詳細調査
        if (!objectLayer) {
            console.warn(`[MapManager] オブジェクトレイヤー'${objectLayerName}'が見つかりません`);
        }
        
        if (objectLayer && objectLayer.objects) {
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
            
        } else {
            console.warn(`[MapManager] Object layer '${objectLayerName}' not found or has no objects`);
            
            // 代替処理：最初のオブジェクトレイヤーを探す
            const fallbackLayer = this.tilemap.layers.find(layer => layer.type === 'objectgroup');
            if (fallbackLayer) {
                this.extractAreaData(fallbackLayer.name);
            }
        }
    }

    handleResize() {
        // リサイズ時の処理
        this.scaleMapToScreen();
        
        // エリアデータを再計算（現在のマップキーに基づいて適切なレイヤー名を使用）
        const currentMapKey = this.scene.mapConfig?.mapKey || this.currentMapKey;
        if (currentMapKey) {
            const objectLayerName = this.getObjectLayerName(currentMapKey);
        this.extractAreaData(objectLayerName);
        }
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
            
            // エリアの座標とサイズを更新
            this.areas.forEach(area => {
                // originalX/originalYを使用して正確な座標を計算
                area.x = area.originalX * scale + mapOffsetX;
                area.y = area.originalY * scale + mapOffsetY;
                
                // サイズもスケールに合わせて調整（元のサイズから計算）
                area.width = area.originalWidth * scale;
                area.height = area.originalHeight * scale;
            });
            
            // スケール後のマップサイズを更新
            this.scaledMapWidth = this.mapWidth * scale;
            this.scaledMapHeight = this.mapHeight * scale;
            
            // エリア選択マネージャーに位置更新を通知（更新されたエリアデータを渡す）
            if (this.scene.areaSelectionManager) {
                this.scene.areaSelectionManager.updateAreaPositions([...this.areas]);
            }
        } else {
            console.warn('MapManager: No areas available for position update');
        }
    }

    // === 旧バージョンとの互換性メソッド（現在は使用されていません） ===
    /*
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

    // レイヤーを作成
    createLayers() {
        try {
            if (!this.tilemap) {
                console.warn('[MapManager] tilemapが存在しません');
                return;
            }
            
            // タイルセットを追加
            if (this.tilemap.tilesets && this.tilemap.tilesets.length > 0) {
                this.tilemap.tilesets.forEach((tiledTileset) => {
                    try {
                        // テクスチャキーを検索
                        const availableTextures = Object.keys(this.scene.textures.list);
                        const textureKey = availableTextures.find(texture => 
                            texture.includes(tiledTileset.name.replace(/[!@#$%^&*()]/g, ''))
                        );
                        
                        if (textureKey) {
                            this.tilemap.addTilesetImage(tiledTileset.name, textureKey);
                        }
                    } catch (error) {
                        console.warn(`[MapManager] タイルセット追加エラー: ${tiledTileset.name}`, error);
                    }
                });
            }
            
            // レイヤーを作成
            this.layers = [];
            if (this.tilemap.layers) {
                this.tilemap.layers.forEach((layerData, index) => {
                    try {
                        if (layerData.type === 'tilelayer') {
                            const layer = this.tilemap.createLayer(layerData.name, this.tilemap.tilesets, 0, 0);
            if (layer) {
                                // レイヤーの深度設定
                                let layerDepth;
                                if (layerData.name.includes('床')) {
                                    layerDepth = 0;
                                } else {
                                    layerDepth = 50 + index;
                                }
                                
                                layer.setDepth(layerDepth);
                this.layers.push(layer);
                
                                if (index === 0) {
                                    this.mapLayer = layer;
                                }
                                
                            }
                        }
                    } catch (error) {
                        console.warn(`[MapManager] レイヤー作成エラー: ${layerData.name}`, error);
                    }
                });
            }
            
        } catch (error) {
            console.error('[MapManager] レイヤー作成エラー:', error);
        }
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
                    
                    // オブジェクトの深度を適切に設定
                    let objectDepth;
                    if (obj.type === 'npc') {
                        objectDepth = 200; // NPCは主人公より手前
                    } else if (obj.type === 'wall' || obj.type === '建物') {
                        objectDepth = 150; // 壁・建物は主人公より手前
                    } else {
                        objectDepth = 75; // その他は中間
                    }
                    
                    sprite.setDepth(objectDepth);
                    
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
    */

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