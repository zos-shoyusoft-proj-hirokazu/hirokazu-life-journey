export class MapManager {
    constructor(scene) {
        this.scene = scene;
        this.map = null;
        this.layers = [];
        this.npcSprites = new Map(); // NPCスプライトの参照を保持
    }

    createMap() {
        // === マップ初期化 ===
        this.map = this.scene.make.tilemap({ key: 'map' });

        try {
            // === タイルセット作成 ===
            const availableTilesets = this.createTilesets();
            
            // === レイヤー作成 ===
            this.createLayers(availableTilesets);
            
            // === オブジェクト作成 ===  
            this.placeObjects();
            
        } catch (error) {
            // === エラー時の代替処理 ===
            console.error('Error creating tilesets/layers:', error);
            this.createFallbackMap();
        }
    }

    createTilesets() {
        const availableTilesets = [];
        
        // === データ定義エリア ===
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

        // === 処理エリア ===
        this.map.tilesets.forEach(tilesetData => {
            let tileset = null;
            const name = tilesetData.name;
            
            // 縦横サイズ指定
            const tileWidth = tilesetData.tileWidth || 32;
            const tileHeight = tilesetData.tileHeight || 32;

            // タイルセット画像の決定
            let textureKey = tilesetMappings[name];
            
            if (!textureKey) {
                // 部分一致チェック
                const match = partialMatches.find(item => name.includes(item.keyword));
                textureKey = match ? match.texture : 'tiles'; // デフォルトはtiles
                
                if (!match) {
                    console.warn(`Unknown tileset: ${name}, using tiles.png as fallback`);
                }
            }

            // タイルセット作成
            tileset = this.map.addTilesetImage(name, textureKey, tileWidth, tileHeight);
            
            if (tileset) {
                availableTilesets.push(tileset);
            }
        });

        return availableTilesets;
    }

    createLayers(availableTilesets) {
        // === データ定義エリア ===
        const baseDepth = -1000;
        const depthStep = 100;

        // === 処理エリア ===
        this.map.layers.forEach((layerData, index) => {
            const layer = this.map.createLayer(layerData.name, availableTilesets, 0, 0);
            
            if (layer) {
                // 基本設定
                this.layers.push(layer);
                
                // 深度設定
                const depth = baseDepth + (index * depthStep);
                layer.setDepth(depth);

                // 当たり判定設定
                layer.setCollisionByProperty({ collides: true });
            } else {
                console.error(`Failed to create layer: ${layerData.name}`);
            }
        });
    }

    placeObjects() {
        // 当たり判定用のグループを作成
        this.objectGroup = this.scene.physics.add.staticGroup();

        this.map.objects.forEach(objectLayer => {
            objectLayer.objects.forEach((obj) => {

                const imageKey = obj.name;

                // 画像が読み込まれているかチェック
                if (this.scene.textures.exists(imageKey)) {
                    // 第4引数に1を追加（スプライトシートの2番目のフレームを指定）
                    const sprite = this.scene.add.sprite(obj.x, obj.y, imageKey, 1);
                    // 基準点を左上に設定（Tiledの座標と合わせるため）
                    sprite.setOrigin(0, 0);
                    sprite.setScale(1);
                    
                    // NPCスプライトの参照を保持
                    if (obj.type === 'npc') {
                        this.npcSprites.set(obj.name, sprite);
                    }

                    // プロパティ配列からcollidesを検索
                    let hasCollision = false;
                    if (obj.properties && Array.isArray(obj.properties)) {
                        const collidesProp = obj.properties.find(prop => prop.name === 'collides');
                        hasCollision = collidesProp && collidesProp.value === true;
                    }

                    if (hasCollision) {
                        // Classプロパティからtypeを判定
                        let objType = obj.type || 'wall';  // デフォルト


                        this.scene.collisionManager.addObjectToCollision(sprite, {
                            type: objType,
                            width: obj.width || 32,
                            height: obj.height || 32,
                            name: obj.name
                        });  
                    }
                } else {
                    console.warn(`Image not found: ${imageKey} - スプライト作成をスキップします`);
                    // 存在しないテクスチャの場合はスプライトを作成しない
                    // これにより左上に白い画像が表示されることを防ぐ
                }
            });
        });
    }


    createFallbackMap() {
        // === データ定義エリア ===
        const fallbackConfig = {
            tilesetName: 'tileset',
            textureKey: 'tiles',
            tileWidth: 32,
            tileHeight: 32,
            layerIndex: 0,
            depth: -1
        };

        // === 処理エリア ===
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
        // 当たり判定グループを取得するメソッド
        getObjectGroup() {
            return this.objectGroup;
        }

        // NPCスプライトを取得するメソッド
        getNpcSprite(npcId) {
            return this.npcSprites.get(npcId);
        }

        // プレイヤーの方向を向かせるメソッド
        makeNpcFacePlayer(npcId, playerX, playerY) {
            const npcSprite = this.getNpcSprite(npcId);
            if (!npcSprite) {
                console.warn(`NPC sprite not found: ${npcId}`);
                return;
            }

            // NPCとプレイヤーの位置差を計算
            const deltaX = playerX - npcSprite.x;
            const deltaY = playerY - npcSprite.y;
            
            // 向きを決定（縦横どちらの差が大きいかで判定）
            let direction;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 横方向の差が大きい場合
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                // 縦方向の差が大きい場合
                direction = deltaY > 0 ? 'down' : 'up';
            }

            // スプライトシートのフレームを設定
            // 0-2: 下向き, 3-5: 左向き, 6-8: 右向き, 9-11: 上向き
            let frame;
            switch (direction) {
                case 'down':
                    frame = 1; // 下向き静止フレーム
                    break;
                case 'left':
                    frame = 4; // 左向き静止フレーム
                    break;
                case 'right':
                    frame = 7; // 右向き静止フレーム
                    break;
                case 'up':
                    frame = 10; // 上向き静止フレーム
                    break;
                default:
                    frame = 1; // デフォルトは下向き
            }

            npcSprite.setFrame(frame);
        }
}