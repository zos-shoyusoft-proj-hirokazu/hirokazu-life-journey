export class MapManager {
    constructor(scene) {
        this.scene = scene;
        this.map = null;
        this.layers = [];
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
                
                // デバッグ出力
                console.log(`Layer created: ${layerData.name}, depth: ${depth}`, layer);
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

        this.map.objects.forEach(objectLayer => {
            console.log(`Layer: ${objectLayer.name}, objects: ${objectLayer.objects.length}`);

            objectLayer.objects.forEach((obj, objIndex) => {

                const imageKey = obj.name;
                console.log(`  Object ${objIndex}: ${obj.name} → ${imageKey} at (${obj.x}, ${obj.y})`);

                console.log(`  チェック: this.scene.textures.exists('${imageKey}') =`, this.scene.textures.exists(imageKey));
            
                // 画像が読み込まれているかチェック
                if (this.scene.textures.exists(imageKey)) {
                    console.log(`✅ Image ${imageKey} exists`);
                    const sprite = this.scene.add.sprite(obj.x, obj.y, imageKey);
                    sprite.setScale(1);
                    console.log(`✅ Sprite created`);
                } else {
                    console.log(`❌ Image ${imageKey} NOT found!`);
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
}