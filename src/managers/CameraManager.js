export class CameraManager {
    constructor(scene) {
        this.scene = scene;
        this.camera = scene.cameras.main;
        
        // カメラの設定
        this.zoom = 1;
        this.followTarget = null;
        this.bounds = null;
    }

    setupCamera(sceneOrMapSize, map, player) {
        // 新しいバージョン（MiemachiStage用）
        if (arguments.length === 1 && typeof sceneOrMapSize === 'object' && sceneOrMapSize.width) {
            const mapSize = sceneOrMapSize;
            this.camera.setZoom(this.zoom);
            
            // スマホ向け：カメラの移動範囲をマップ全体に設定
            this.camera.setBounds(0, 0, mapSize.scaledWidth, mapSize.scaledHeight);
            
            // 初期位置をマップの中心に設定
            this.camera.centerOn(mapSize.scaledWidth / 2, mapSize.scaledHeight / 2);
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
                
                this.camera.setScroll(
                    cameraStart.x + deltaX,
                    cameraStart.y + deltaY
                );
            }
        });
        
        this.scene.input.on('pointerup', () => {
            isDragging = false;
        });
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

    destroy() {
        // クリーンアップ
        this.stopFollow();
        this.followTarget = null;
        this.bounds = null;
    }
}