import { CollisionManager } from './CollisionManager.js';

export class MapManager {
    constructor(scene) {
        this.scene = scene;
        this.map = null;
        this.layers = [];
        //this.collisionManager = new CollisionManager(scene);
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
        console.log('=== createTilesets開始 ===');
        const availableTilesets = [];
        
        console.log('this.map.tilesets:', this.map.tilesets);
        console.log('tilesets length:', this.map.tilesets.length);
        
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
        console.log('Final availableTilesets:', availableTilesets);
        console.log('availableTilesets length:', availableTilesets.length);

        return availableTilesets;
    }

    createLayers(availableTilesets) {
        console.log('=== createLayers開始 ===');
        console.log('availableTilesets:', availableTilesets);
        console.log('this.map.layers:', this.map.layers);
        console.log('layers length:', this.map.layers.length);
        // === データ定義エリア ===
        const baseDepth = -1000;
        const depthStep = 100;

        // === 処理エリア ===
        this.map.layers.forEach((layerData, index) => {
            console.log(`Processing layer ${index}:`, layerData.name);

            const layer = this.map.createLayer(layerData.name, availableTilesets, 0, 0);
            console.log('Created layer result:', layer);
            
            if (layer) {
                // 基本設定
                this.layers.push(layer);
                
                // 深度設定
                const depth = baseDepth + (index * depthStep);
                layer.setDepth(depth);

                // 当たり判定設定
                layer.setCollisionByProperty({ collides: true });
                
                // デバッグ出力
                console.log(`Layer created: ${layerData.name}, depth: ${depth}`, layer);
            } else {
                console.error(`Failed to create layer: ${layerData.name}`);
            }
        });
    }

    // // ★★★ 新しく追加：オブジェクト配置メソッド ★★★
    // placeObjects() {
    //     // オブジェクトレイヤーがあるかチェック
    //     if (!this.map.objects || this.map.objects.length === 0) {
    //         console.log('No object layers found');
    //         return;
    //     }

    //     console.log('Placing objects...');

    //     // 各オブジェクトレイヤーを処理
    //     this.map.objects.forEach(objectLayer => {
    //         console.log(`Processing object layer: ${objectLayer.name}`);
            
    //         // レイヤー内の各オブジェクトを処理
    //         objectLayer.objects.forEach(obj => {
    //             this.createObject(obj);
    //         });
    //     });
    // }

    // createObject(obj) {
    //     // オブジェクト名またはタイプから画像キーを決定
    //     const imageKey = obj.type || obj.name || 'defaultSprite';
        
    //     try {
    //         // スプライトを作成
    //         const sprite = this.scene.add.sprite(obj.x, obj.y, imageKey);
            
    //         console.log(`Created object: ${obj.name || 'unnamed'} at (${obj.x}, ${obj.y})`);
            
    //     } catch (error) {
    //         console.warn(`Failed to create object: ${imageKey}`, error);
            
    //         // 代替として赤い円を表示
    //         const fallbackSprite = this.scene.add.circle(
    //             obj.x + 16, 
    //             obj.y + 16, 
    //             8, 
    //             0xff0000
    //         );
            
    //         console.log(`Created fallback object for: ${obj.name || 'unnamed'}`);
    //     }
    // }
    placeObjects() {
        console.log('=== placeObjects開始 ===');
        console.log('map.objects:', this.map.objects);

        // 当たり判定用のグループを作成
        this.objectGroup = this.scene.physics.add.staticGroup();

        this.map.objects.forEach(objectLayer => {
            console.log(`Layer: ${objectLayer.name}, objects: ${objectLayer.objects.length}`);

            objectLayer.objects.forEach((obj, objIndex) => {

                const imageKey = obj.name;
                console.log(`  Object ${objIndex}: ${obj.name} → ${imageKey} at (${obj.x}, ${obj.y})`);

                console.log('チェック: this.scene.textures.exists(\'' + imageKey + '\') = ', this.scene.textures.exists(imageKey));


                console.log('obj.properties:', obj.properties);
                console.log('obj.properties.collides:', obj.properties?.collides);
                console.log('条件チェック結果:', obj.properties && obj.properties.collides);

                // ★★★ 追加：obj.typeのデバッグ ★★★
                console.log('obj.type:', obj.type);

                // ★★★ ここに新しいデバッグを追加 ★★★
                console.log('=== objType判定詳細デバッグ ===');
                console.log('obj.type:', obj.type);
                console.log('typeof obj.type:', typeof obj.type);
                console.log('obj.type === "npc":', obj.type === 'npc');
                console.log('obj.type && obj.type.trim() !== "":', obj.type && obj.type.trim() !== '');

                // 画像が読み込まれているかチェック
                if (this.scene.textures.exists(imageKey)) {
                    console.log(`✅ Image ${imageKey} exists`);
                    // 第4引数に1を追加（スプライトシートの2番目のフレームを指定）
                    const sprite = this.scene.add.sprite(obj.x, obj.y, imageKey, 1);
                    // 基準点を左上に設定（Tiledの座標と合わせるため）
                    sprite.setOrigin(0, 0);
                    sprite.setScale(1);

                    // プロパティ配列からcollidesを検索
                    let hasCollision = false;
                    if (obj.properties && Array.isArray(obj.properties)) {
                        const collidesProp = obj.properties.find(prop => prop.name === 'collides');
                        hasCollision = collidesProp && collidesProp.value === true;
                    }

                    if (hasCollision) {
                        console.log('this.scene.collisionManager:', this.scene.collisionManager);
                        // Classプロパティからtypeを判定
                        let objType = obj.type || 'wall';  // デフォルト
                                                
                        // 最終的なobjTypeのデバッグ
                        console.log(`Final objType for ${imageKey}: ${objType}`);


                        this.scene.collisionManager.addObjectToCollision(sprite, {
                            type: objType,
                            width: obj.width || 32,
                            height: obj.height || 32,
                            name: obj.name
                        });  
                        console.log(`Added collision to ${imageKey} as ${objType}`);

                    } else {
                        console.log(`No collision for ${imageKey}`); 
                    }
                } else {
                    console.log('❌ Image ' + imageKey + ' NOT found!');
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
}