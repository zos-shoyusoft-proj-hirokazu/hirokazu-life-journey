export class CameraManager {
    constructor(scene) {
        this.scene = scene;
        this.camera = scene.cameras.main;
        
        // カメラの設定
        this.zoom = 1;
        this.followTarget = null;
        this.bounds = null;
        
        // 初期スケールは未設定（MapManagerで計算される）
        this.currentScale = null;
    }

    setupCamera(sceneOrMapSize, map, player) {
        // 新しいバージョン（MiemachiStage用）
        if (arguments.length === 1 && typeof sceneOrMapSize === 'object' && sceneOrMapSize.width) {
            const mapSize = sceneOrMapSize;
            this.camera.setZoom(this.zoom);
            
            // マップレイヤーの位置を取得
            const mapLayer = this.scene.mapManager?.mapLayer;
            const mapOffsetX = mapLayer ? mapLayer.x : 0;
            const mapOffsetY = mapLayer ? mapLayer.y : 0;
            
            // 全体表示時は画面全体をカメラの境界にする
            // これにより青い余白が解消される
            const screenWidth = this.scene.cameras.main.width;
            const screenHeight = this.scene.cameras.main.height;
            this.camera.setBounds(0, 0, screenWidth, screenHeight);
            
            // カメラをマップの中心に設定
            this.camera.centerOn(
                mapOffsetX + mapSize.scaledWidth / 2, 
                mapOffsetY + mapSize.scaledHeight / 2
            );
            
            console.log(`CameraManager: Initial setup - bounds: (0, 0, ${screenWidth}, ${screenHeight})`);
        } 
        // 学校などの歩き回るようのステージのcamera
        else if (arguments.length === 3) {
            const scene = sceneOrMapSize;
            const mapWidth = map.widthInPixels;
            const mapHeight = map.heightInPixels;
            
            // カメラの範囲をマップ内に制限
            scene.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
            
            // プレイヤーを中心に画面が動く
            scene.cameras.main.startFollow(player);
            
            // プレイヤーの移動範囲もマップ内に制限
            scene.physics.world.setBounds(0, 0, mapWidth, mapHeight);
        }
        else {
            console.error('Invalid arguments for setupCamera');
        }
    }

    // setBounds(x, y, width, height) {
    //     this.bounds = { x, y, width, height };
    //     this.camera.setBounds(x, y, width, height);
    // }

    setZoom(zoom) {
        this.zoom = zoom;
        this.camera.setZoom(zoom);
    }

    centerOn(x, y) {
        this.camera.centerOn(x, y);
    }

    setFollowTarget(target, lerp = 0.1) {
        this.followTarget = target;
        this.camera.startFollow(target, true, lerp, lerp);
    }

    stopFollow() {
        this.followTarget = null;
        this.camera.stopFollow();
    }

    setBackgroundColor(color) {
        this.camera.setBackgroundColor(color);
    }

    fadeIn(duration = 1000, callback) {
        this.camera.fadeIn(duration, 0, 0, 0, callback);
    }

    fadeOut(duration = 1000, callback) {
        this.camera.fadeOut(duration, 0, 0, 0, callback);
    }

    shake(duration = 100, intensity = 0.02) {
        this.camera.shake(duration, intensity);
    }

    flash(duration = 100, color = 0xffffff) {
        this.camera.flash(duration, color);
    }

    getBounds() {
        return this.bounds;
    }

    getZoom() {
        return this.zoom;
    }

    getWorldPoint(x, y) {
        return this.camera.getWorldPoint(x, y);
    }

    getScreenPoint(x, y) {
        return this.camera.getScreenPoint(x, y);
    }

    update() {
        // カメラの更新処理が必要な場合はここに記述
    }

    setupScrollControls() {
        let isDragging = false;
        let dragStart = { x: 0, y: 0 };
        let cameraStart = { x: 0, y: 0 };
        
        this.scene.input.on('pointerdown', (pointer) => {
            // スクロール開始
            isDragging = true;
            dragStart = { x: pointer.x, y: pointer.y };
            cameraStart = { 
                x: this.camera.scrollX, 
                y: this.camera.scrollY 
            };
        });
        
        this.scene.input.on('pointermove', (pointer) => {
            if (isDragging) {
                const deltaX = dragStart.x - pointer.x;
                const deltaY = dragStart.y - pointer.y;
                
                // 新しいスクロール位置を計算
                const newScrollX = cameraStart.x + deltaX;
                const newScrollY = cameraStart.y + deltaY;
                
                // カメラの境界内でスクロール
                this.camera.setScroll(newScrollX, newScrollY);
            }
        });
        
        this.scene.input.on('pointerup', () => {
            isDragging = false;
        });
        
        // デバッグ用：スクロール機能の設定を確認
        console.log('Scroll controls setup complete');
    }
    
    setupPinchZoom() {
        // ピンチズーム機能（スマホ向け）
        let initialDistance = 0;
        let initialZoom = 1;
        
        this.scene.input.on('pointerdown', () => {
            if (this.scene.input.pointers && this.scene.input.pointers.length === 2) {
                const pointer1 = this.scene.input.pointers[0];
                const pointer2 = this.scene.input.pointers[1];
                initialDistance = Phaser.Math.Distance.Between(
                    pointer1.x, pointer1.y, 
                    pointer2.x, pointer2.y
                );
                initialZoom = this.camera.zoom;
            }
        });
        
        this.scene.input.on('pointermove', () => {
            if (this.scene.input.pointers && this.scene.input.pointers.length === 2) {
                const pointer1 = this.scene.input.pointers[0];
                const pointer2 = this.scene.input.pointers[1];
                const currentDistance = Phaser.Math.Distance.Between(
                    pointer1.x, pointer1.y, 
                    pointer2.x, pointer2.y
                );
                
                const zoomFactor = currentDistance / initialDistance;
                const newZoom = Math.max(0.5, Math.min(3.0, initialZoom * zoomFactor));
                this.camera.setZoom(newZoom);
            }
        });
    }

    // スケール切り替え機能
    toggleMapScale() {
        // 現在のスケールを取得
        const currentScale = this.scene.mapManager?.mapScaleX || this.currentScale;
        
        if (currentScale === 1.5) {
            // 1.5倍の場合は全体表示に切り替え
            // 全体表示用のスケールを計算
            const screenWidth = this.scene.cameras.main.width;
            const screenHeight = this.scene.cameras.main.height;
            const mapWidth = this.scene.mapManager.mapWidth;
            const mapHeight = this.scene.mapManager.mapHeight;
            
            const scaleX = screenWidth / mapWidth;
            const scaleY = screenHeight / mapHeight;
            const wholeScale = Math.min(scaleX, scaleY);
            
            console.log(`Switching from 1.5 to whole scale: ${wholeScale}`);
            this.setMapScale(wholeScale);
        } else {
            // 全体表示の場合は1.5倍に切り替え
            console.log('Switching from whole scale to 1.5');
            this.setMapScale(1.5);
        }
    }

    setMapScale(scale) {
        this.currentScale = scale;
        
        if (!this.scene.mapManager || !this.scene.mapManager.mapLayer) {
            console.error('MapManager or mapLayer not available');
            return;
        }
        
        // マップレイヤーのスケールを変更
        this.scene.mapManager.mapLayer.setScale(scale, scale);
        
        // MapManagerのスケール値も更新
        this.scene.mapManager.mapScaleX = scale;
        this.scene.mapManager.mapScaleY = scale;
        
        // マップレイヤーを画面の中心に配置
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        const mapWidth = this.scene.mapManager.mapWidth;
        const mapHeight = this.scene.mapManager.mapHeight;
        
        const scaledWidth = mapWidth * scale;
        const scaledHeight = mapHeight * scale;
        
        // 画面の中心に配置（正確な中央配置）
        const mapX = (screenWidth - scaledWidth) / 2;
        const mapY = (screenHeight - scaledHeight) / 2;
        
        // マップレイヤーの位置を設定
        this.scene.mapManager.mapLayer.setPosition(mapX, mapY);

        // オブジェクトの位置を再計算（マップレイヤーの位置設定後に実行）
        this.scene.mapManager.updateObjectPositions(scale);

        // スケールに応じてカメラの境界を設定
        if (scale === 1.5) {
            // 1.5倍時：マップ全体をカバーする境界
            this.camera.setBounds(
                mapX,
                mapY,
                scaledWidth,
                scaledHeight
            );
        } else {
            // 全体表示時：画面全体をカメラの境界にする
            this.camera.setBounds(0, 0, screenWidth, screenHeight);
        }

        // カメラをマップの中心に設定
        this.camera.centerOn(
            mapX + scaledWidth / 2,
            mapY + scaledHeight / 2
        );
        
        // デバッグ用：スケール変更を確認
        const boundsInfo = scale === 1.5 ? 
            `(${mapX}, ${mapY}, ${scaledWidth}, ${scaledHeight})` : 
            `(0, 0, ${screenWidth}, ${screenHeight})`;
        console.log(`CameraManager: Set map scale to ${scale}, bounds: ${boundsInfo}`);
    }

    destroy() {
        // クリーンアップ
        this.stopFollow();
        this.followTarget = null;
        this.bounds = null;
    }
}