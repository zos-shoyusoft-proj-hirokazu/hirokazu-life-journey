export class TouchControlManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        
        // タッチ操作の状態管理
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isPointerDown = false;
        this.targetX = 0;
        this.targetY = 0;
        
        this.setupTouchControls();
    }

    setupTouchControls() {
        // タップ移動
        this.scene.input.on('pointerdown', (pointer) => {
            this.touchStartX = pointer.x;
            this.touchStartY = pointer.y;
            this.isPointerDown = true;
            
            this.targetX = pointer.worldX;
            this.targetY = pointer.worldY;

            // 継続移動の開始（0.1秒後から開始して重複を避ける）
            this.scene.time.delayedCall(100, () => {
                if (this.isPointerDown) {
                    this.startContinuousMovement();
                }
            });
        });

        // マウス/指の移動中
        this.scene.input.on('pointermove', (pointer) => {
            if (this.isPointerDown) {
                // 移動中は目標座標を更新
                this.targetX = pointer.worldX;
                this.targetY = pointer.worldY;
            }
        });

        // スワイプ操作
        this.scene.input.on('pointerup', (pointer) => {
            this.isPointerDown = false;

            const deltaX = pointer.x - this.touchStartX;
            const deltaY = pointer.y - this.touchStartY;
            const minSwipeDistance = 50;
            
            if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
                this.handleSwipe(deltaX, deltaY);
            }
        });
    }

    handleSwipe(deltaX, deltaY) {
        const speed = 600;
        let vx = 0, vy = 0;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 横方向のスワイプ
            vx = deltaX > 0 ? speed : -speed;
        } else {
            // 縦方向のスワイプ
            vy = deltaY > 0 ? speed : -speed;
        }
        
        this.player.setVelocity(vx, vy);
        
        // 0.3秒後に停止
        this.scene.time.delayedCall(300, () => {
            this.player.setVelocity(0, 0);
        });
    }

    startContinuousMovement() {
        if (!this.isPointerDown) return;
        
        const playerX = this.player.x;
        const playerY = this.player.y;
        
        // プレイヤーから目標地点への方向を計算
        const deltaX = this.targetX - playerX;
        const deltaY = this.targetY - playerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 10) { // 最小移動距離
            const speed = 300;
            this.player.setVelocity(
                (deltaX / distance) * speed,
                (deltaY / distance) * speed
            );
        } else {
            // 目標地点に到達したら停止
            this.player.setVelocity(0, 0);
        }
        
        // 継続的に更新（60FPSで更新）
        this.scene.time.delayedCall(16, () => {
            if (this.isPointerDown) {
                this.startContinuousMovement();
            }
        });
    }
}