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
            this.camera.centerOn(mapSize.scaledWidth / 2, mapSize.scaledHeight / 2);
            this.setBounds(0, 0, mapSize.scaledWidth, mapSize.scaledHeight);
        } 
        // 旧バージョン（Stage1-3用）
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

    setBounds(x, y, width, height) {
        this.bounds = { x, y, width, height };
        this.camera.setBounds(x, y, width, height);
    }

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

    destroy() {
        // クリーンアップ
        this.stopFollow();
        this.followTarget = null;
        this.bounds = null;
    }
}