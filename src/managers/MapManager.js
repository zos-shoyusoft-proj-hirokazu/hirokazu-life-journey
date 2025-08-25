export class MapManager {
    constructor(scene) {
        console.log('[MapManager] コンストラクタ開始');
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
        
        console.log('[MapManager] コンストラクタ完了 - 初期値:', {
            tilemap: this.tilemap,
            mapLayer: this.mapLayer,
            map: this.map
        });
    }

    createMap(mapKey, tilesetKey, layerName) {
        console.log(`[MapManager] createMap呼び出し: mapKey=${mapKey}, tilesetKey=${tilesetKey}, layerName=${layerName}, arguments.length=${arguments.length}`);
        
        // 引数が存在する場合は新しいマップ作成
        if (mapKey && tilesetKey) {
            console.log('[MapManager] createNewMapを呼び出し');
            return this.createNewMap(mapKey, tilesetKey, layerName);
        } else {
            // 引数がない場合は実際に歩けるマップを作成
            console.log('[MapManager] createLegacyMapを呼び出し');
            return this.createLegacyMap();
        }
    }

    createNewMap(mapKey, tilesetKey, layerName) {
        console.log('=== FORCE LOG: createNewMap START ===');
        console.log(`[MapManager] マップ作成開始: mapKey=${mapKey}, tilesetKey=${tilesetKey}, layerName=${layerName}`);
        
        // 現在のマップキーを保存
        this.currentMapKey = mapKey;
        
        // Tiledマップを作成
        try {
            console.log('[MapManager] this.scene.make.tilemap呼び出し開始');
            this.tilemap = this.scene.make.tilemap({ key: mapKey });
            console.log('[MapManager] this.scene.make.tilemap呼び出し完了, 結果:', this.tilemap);
            
            this.map = this.tilemap; // 後方互換性
        } catch (error) {
            console.error('[MapManager] タイルマップ作成エラー:', error);
            throw error;
        }
        
        // タイルセットを追加
        if (this.tilemap.tilesets && this.tilemap.tilesets.length > 0) {
            console.log(`[MapManager] タイルセット処理開始 - 数: ${this.tilemap.tilesets.length}`);
            
            this.tilemap.tilesets.forEach((tiledTileset) => {
                try {
                    // テクスチャキーを検索
                    const availableTextures = Object.keys(this.scene.textures.list);
                    let textureKey = null;
                    
                    // 完全一致を試行
                    if (availableTextures.includes(tiledTileset.name)) {
                        textureKey = tiledTileset.name;
                    } else {
                        // 部分一致を試行
                        const partialMatch = availableTextures.find(texture => 
                            texture.includes(tiledTileset.name) || 
                            tiledTileset.name.includes(texture)
                        );
                        textureKey = partialMatch || null;
                    }
                    
                    if (textureKey) {
                        const tileset = this.tilemap.addTilesetImage(tiledTileset.name, textureKey);
                        if (tileset) {
                            console.log(`[MapManager] ✅ タイルセット追加成功: '${tiledTileset.name}'`);
                        } else {
                            console.warn(`[MapManager] ❌ タイルセット追加失敗: '${tiledTileset.name}'`);
                        }
                    } else {
                        console.warn(`[MapManager] ⚠️ テクスチャキー未発見: '${tiledTileset.name}'`);
                    }
                } catch (error) {
                    console.error(`[MapManager] ❌ タイルセット '${tiledTileset.name}' エラー:`, error);
                }
            });
        }
        console.log('[MapManager] タイルセット追加完了');
        
        // レイヤー作成（createLegacyMapと同じ方法で動作するように修正）
        console.log('[MapManager] レイヤー作成開始');
        console.log('[MapManager] this.tilemap.layers:', this.tilemap.layers);
        
        // createLegacyMapと同じ方法でレイヤーを作成
        if (this.tilemap.layers && this.tilemap.layers.length > 0) {
            console.log(`[MapManager] Tiledマップ内のレイヤー数: ${this.tilemap.layers.length}`);
            
            this.layers = [];
            
            // 各レイヤーを個別に作成（createLegacyMapと同じ方法）
            this.tilemap.layers.forEach((layerData, index) => {
                try {
                    console.log(`[MapManager] レイヤー${index + 1}作成開始: ${layerData.name}`);
                    
                    // createLegacyMapと同じ方法でレイヤーを作成
                    const layer = this.tilemap.createLayer(layerData.name, this.tilemap.tilesets, 0, 0);
                    
                    if (layer) {
                        console.log(`[MapManager] ✅ レイヤー${index + 1}作成成功: ${layerData.name}`);
                        this.layers.push(layer);
                        
                        // 最初のレイヤーをメインレイヤーとして設定
                        if (index === 0) {
                            this.mapLayer = layer;
                            console.log(`[MapManager] メインレイヤー設定: ${layerData.name}`);
                        }
                    } else {
                        console.warn(`[MapManager] ❌ レイヤー${index + 1}作成失敗: ${layerData.name}`);
                    }
                } catch (error) {
                    console.error(`[MapManager] ❌ レイヤー${index + 1}作成エラー: ${layerData.name}`, error);
                }
            });
            
            console.log(`[MapManager] レイヤー作成完了 - 作成数: ${this.layers.length}`);
            
            if (this.layers.length === 0) {
                console.error('[MapManager] レイヤーが作成されていません');
                return this.tilemap;
            }
        } else {
            console.error('[MapManager] Tiledマップにレイヤーが定義されていません');
            return this.tilemap;
        }
        
        // マップサイズを取得
        this.mapWidth = this.tilemap.widthInPixels;
        this.mapHeight = this.tilemap.heightInPixels;
        
        // スマホ画面に合わせてマップレイヤーをスケール
        this.scaleMapToScreen();
        
        // オブジェクトレイヤーから場所データを取得（マップごとに適切なレイヤー名を指定）
        console.log(`[MapManager] オブジェクトレイヤー処理開始: mapKey='${mapKey}'`);
        const objectLayerName = this.getObjectLayerName(mapKey);
        console.log('[MapManager] 取得したオブジェクトレイヤー名: ' + objectLayerName);
        this.extractAreaData(objectLayerName);
        console.log('[MapManager] オブジェクトレイヤー処理完了');
        
        console.log('[MapManager] マップ作成完了 - サイズ:', this.mapWidth, 'x', this.mapHeight);
        console.log('[MapManager] createNewMap 正常終了');
        
        // レイヤーの可視性と深度を明示的に設定
        if (this.mapLayer) {
            this.mapLayer.setVisible(true);
            this.mapLayer.setDepth(0); // 背景レイヤーとして最背面に配置
            console.log('[MapManager] レイヤー設定完了 - visible:', this.mapLayer.visible, 'depth:', this.mapLayer.depth);
        }
        
        console.log('[MapManager] マップレイヤー作成完了:', this.mapLayer);
        
        // レイヤーの詳細情報を出力
        if (this.mapLayer) {
            console.log('[MapManager] レイヤー詳細:', {
                visible: this.mapLayer.visible,
                depth: this.mapLayer.depth,
                alpha: this.mapLayer.alpha,
                x: this.mapLayer.x,
                y: this.mapLayer.y,
                scaleX: this.mapLayer.scaleX,
                scaleY: this.mapLayer.scaleY,
                width: this.mapLayer.width,
                height: this.mapLayer.height
            });
        }
        

    }

    createLegacyMap() {
        // 旧バージョンのcreateMap()（引数なし）
        // 現在のマップキーを使用（ハードコーディングを削除）
        const mapKey = this.currentMapKey || 'map';
        console.log('[MapManager] createLegacyMap: マップキー =', mapKey);
        
        this.map = this.scene.make.tilemap({ key: mapKey });
        this.tilemap = this.map; // 新しいプロパティにも設定

        try {
            // 竹田高校の場合は新しいタイルセット処理を使用
            if (mapKey && mapKey.includes('taketa_highschool')) {
                console.log('[MapManager] 竹田高校用のタイルセット処理を使用');
                
                // 新しいタイルセット処理（createNewMapと同じ方法）
                console.log('[MapManager] タイルセット情報:', this.tilemap.tilesets);
                if (this.tilemap.tilesets && this.tilemap.tilesets.length > 0) {
                    console.log(`[MapManager] タイルセット処理開始 - 数: ${this.tilemap.tilesets.length}`);
                    
                    let successCount = 0;
                    let failCount = 0;
                    
                    this.tilemap.tilesets.forEach((tiledTileset) => {
                        try {
                            console.log(`[MapManager] タイルセット処理中: ${tiledTileset.name}`);
                            
                            // テクスチャキーを検索（より柔軟な検索）
                            const availableTextures = Object.keys(this.scene.textures.list);
                            let textureKey = null;
                            
                            // 特殊文字を含むファイル名の処理
                            const cleanTilesetName = tiledTileset.name.replace(/[!@#$%^&*()]/g, '');
                            console.log(`[MapManager] 元の名前: ${tiledTileset.name}, クリーン名: ${cleanTilesetName}`);
                            
                            // 完全一致を試行
                            if (availableTextures.includes(tiledTileset.name)) {
                                textureKey = tiledTileset.name;
                                console.log(`[MapManager] 完全一致: ${tiledTileset.name}`);
                            } else if (availableTextures.includes(cleanTilesetName)) {
                                textureKey = cleanTilesetName;
                                console.log(`[MapManager] クリーン名一致: ${tiledTileset.name} -> ${cleanTilesetName}`);
                            } else {
                                // 部分一致を試行（より柔軟に）
                                const partialMatch = availableTextures.find(texture => {
                                    const tilesetName = tiledTileset.name.toLowerCase();
                                    const cleanTilesetNameLower = cleanTilesetName.toLowerCase();
                                    const textureName = texture.toLowerCase();
                                    
                                    return textureName.includes(tilesetName) || 
                                           textureName.includes(cleanTilesetNameLower) ||
                                           tilesetName.includes(textureName) ||
                                           cleanTilesetNameLower.includes(textureName) ||
                                           textureName.includes(tilesetName.replace('_', '')) ||
                                           cleanTilesetNameLower.includes(textureName.replace('_', ''));
                                });
                                textureKey = partialMatch || null;
                                
                                if (partialMatch) {
                                    console.log(`[MapManager] 部分一致: ${tiledTileset.name} -> ${partialMatch}`);
                                }
                            }
                            
                            if (textureKey) {
                                const tileset = this.tilemap.addTilesetImage(tiledTileset.name, textureKey);
                                if (tileset) {
                                    console.log(`[MapManager] ✅ タイルセット追加成功: '${tiledTileset.name}'`);
                                    successCount++;
                                } else {
                                    console.warn(`[MapManager] ❌ タイルセット追加失敗: '${tiledTileset.name}'`);
                                    failCount++;
                                }
                            } else {
                                console.warn(`[MapManager] ⚠️ テクスチャキー未発見: '${tiledTileset.name}'`);
                                console.log('[MapManager] 利用可能なテクスチャ:', availableTextures.filter(t => t.includes('pika')));
                                failCount++;
                            }
                        } catch (error) {
                            console.error(`[MapManager] ❌ タイルセット '${tiledTileset.name}' エラー:`, error);
                            failCount++;
                        }
                    });
                    
                    console.log(`[MapManager] タイルセット処理完了 - 成功: ${successCount}, 失敗: ${failCount}`);
                }
                
                // レイヤー作成（createNewMapと同じ方法）
                if (this.tilemap.layers && this.tilemap.layers.length > 0) {
                    console.log(`[MapManager] Tiledマップ内のレイヤー数: ${this.tilemap.layers.length}`);
                    
                    // タイルセットの初期化を待つ
                    console.log('[MapManager] タイルセット初期化完了後の状態:', this.tilemap.tilesets);
                    
                    this.layers = [];
                    
                    this.tilemap.layers.forEach((layerData, index) => {
                        try {
                            console.log(`[MapManager] レイヤー${index + 1}作成開始: ${layerData.name}`);
                            
                            // 正しく初期化されたタイルセットの配列を取得
                            // this.tilemap.tilesetsは[initialize]状態なので、実際のタイルセットオブジェクトを取得
                            const actualTilesets = [];
                            
                            // 各タイルセット名に対応する実際のタイルセットオブジェクトを取得
                            this.tilemap.tilesets.forEach((tiledTileset) => {
                                if (tiledTileset && tiledTileset.name) {
                                    // テクスチャキーを検索
                                    const availableTextures = Object.keys(this.scene.textures.list);
                                    const textureKey = availableTextures.find(texture => 
                                        texture.includes(tiledTileset.name.replace(/[!@#$%^&*()]/g, ''))
                                    );
                                    
                                    if (textureKey) {
                                        // 実際のタイルセットオブジェクトを作成
                                        const tileset = this.tilemap.addTilesetImage(tiledTileset.name, textureKey);
                                        if (tileset) {
                                            actualTilesets.push(tileset);
                                            console.log(`[MapManager] レイヤー${index + 1}用タイルセット追加: ${tiledTileset.name}`);
                                        }
                                    }
                                }
                            });
                            
                            console.log(`[MapManager] レイヤー${index + 1}用実際のタイルセット数:`, actualTilesets.length);
                            
                            if (actualTilesets.length === 0) {
                                console.warn(`[MapManager] ⚠️ レイヤー${index + 1}用の実際のタイルセットがありません: ${layerData.name}`);
                            }
                            
                            const layer = this.tilemap.createLayer(layerData.name, actualTilesets, 0, 0);
                            
                            if (layer) {
                                console.log(`[MapManager] ✅ レイヤー${index + 1}作成成功: ${layerData.name}`);
                                
                                // レイヤーの表示設定を明示的に追加
                                // レイヤー名に基づいて深度を設定
                                let layerDepth;
                                
                                if (layerData.name.includes('床')) {
                                    layerDepth = 0;   // 床は最奥
                                } else {
                                    layerDepth = 100 + index; // 床以外は主人公より上、タッチコントロールより下
                                }
                                
                                layer.setDepth(layerDepth);
                                layer.setVisible(true); // 可視性を設定
                                
                                console.log(`[MapManager] レイヤー${index + 1}の深度設定: ${layerDepth} (${layerData.name})`);
                                
                                this.layers.push(layer);
                                
                                if (index === 0) {
                                    this.mapLayer = layer;
                                    console.log(`[MapManager] メインレイヤー設定: ${layerData.name}`);
                                }
                            } else {
                                console.warn(`[MapManager] ❌ レイヤー${index + 1}作成失敗: ${layerData.name}`);
                            }
                        } catch (error) {
                            console.error(`[MapManager] ❌ レイヤー${index + 1}作成エラー: ${layerData.name}`, error);
                        }
                    });
                    
                    // マップサイズを取得（レイヤー作成後に再試行）
                    if (this.mapLayer) {
                        // 複数の方法でマップサイズを取得
                        this.mapWidth = this.mapLayer.width || 
                                      this.tilemap.widthInPixels || 
                                      (this.tilemap.width * this.tilemap.tileWidth) || 0;
                        this.mapHeight = this.mapLayer.height || 
                                       this.tilemap.heightInPixels || 
                                       (this.tilemap.height * this.tilemap.tileHeight) || 0;
                        
                        console.log(`[MapManager] マップサイズ取得: ${this.mapWidth} x ${this.mapHeight}`);
                        console.log(`[MapManager] タイルマップ情報: width=${this.tilemap.width}, height=${this.tilemap.height}, tileWidth=${this.tilemap.tileWidth}, tileHeight=${this.tilemap.tileHeight}`);
                    }
                    
                    // オブジェクトレイヤーの処理を追加
                    this.placeObjects();
                    
                    // 移動可能エリアの設定を追加
                    if (this.mapLayer && this.scene.collisionManager) {
                        // マップ全体を移動可能エリアとして設定
                        this.scene.collisionManager.addObjectToCollision(this.mapLayer, {
                            type: 'walkable',
                            width: this.mapWidth,
                            height: this.mapHeight,
                            name: 'map_area'
                        });
                        console.log('[MapManager] 移動可能エリアを設定しました');
                    } else {
                        console.warn('[MapManager] collisionManagerが利用できません - 移動可能エリアの設定をスキップ');
                    }
                }
            } else {
                // 従来のタイルセット処理（stage1, stage2, stage3用）
                console.log('[MapManager] 従来のタイルセット処理を使用');
                const availableTilesets = this.createTilesets();
                this.createLayers(availableTilesets);
                this.placeObjects();
            }
            
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
            'miemachi': 'miemachi',
            'taketa': 'taketa',
            'japan': 'japan',
            'miemachistage': 'miemachi',
            'taketastage': 'taketa',
            'japanstage': 'japan',
            // 竹田高校マップの追加（ハードコーディングを削除）
            'taketa_highschool_1': 'オブジェクトレイヤー',
            'taketa_highschool_2': 'オブジェクトレイヤー',
            'taketa_highschool_3': 'オブジェクトレイヤー'
        };
        
        console.log(`[MapManager] getObjectLayerName: mapKey='${mapKey}', layerName='${layerNames[mapKey]}'`);
        
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
            console.log(`[MapManager] extractAreaData: mapKey='${mapKey}', objectLayerName='${objectLayerName}'`);
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

        console.log(`[MapManager] extractAreaData: objectLayerName='${objectLayerName}', objectLayer:`, objectLayer);
        console.log('[MapManager] 利用可能なレイヤー:', this.tilemap.layers);
        console.log('[MapManager] レイヤー名一覧:', this.tilemap.layers.map(layer => ({ id: layer.id, name: layer.name, type: layer.type })));
        
        // オブジェクトレイヤーが見つからない場合の詳細調査
        if (!objectLayer) {
            console.warn(`[MapManager] オブジェクトレイヤー'${objectLayerName}'が見つかりません`);
            console.log('[MapManager] 全レイヤーの詳細:', this.tilemap.layers.map(layer => ({
                id: layer.id,
                name: layer.name,
                type: layer.type,
                visible: layer.visible,
                objects: layer.objects ? layer.objects.length : 'N/A'
            })));
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
            
            console.log(`[MapManager] Extracted ${this.areas.length} areas from object layer '${objectLayerName}'`);
        } else {
            console.warn(`[MapManager] Object layer '${objectLayerName}' not found or has no objects`);
            console.log('[MapManager] Available layers:', this.tilemap.layers);
            console.log('[MapManager] Tilemap:', this.tilemap);
            
            // 代替処理：最初のオブジェクトレイヤーを探す
            const fallbackLayer = this.tilemap.layers.find(layer => layer.type === 'objectgroup');
            if (fallbackLayer) {
                console.log('[MapManager] 代替レイヤーを使用: ' + fallbackLayer.name);
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
                    console.log(`[MapManager] オブジェクト深度設定: ${imageKey} = ${objectDepth}`);
                    
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
                    console.log('[MapManager] 利用可能なテクスチャ:', Object.keys(this.scene.textures.list).filter(t => t.includes('pika')));
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