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

        // タッチ処理は削除（バーチャルパッドのみ使用）
        // this.setupTouchControls();

        // 自作バーチャルゲームパッドを追加
        this.setupVirtualGamepad();
    }

    setupVirtualGamepad() {
        // 実際の画面サイズを取得（スマホ対応）
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        
        // 画面右下にバーチャルパッドを作成（マージンを小さくして内側に）
        const margin = 120; // 80から120に増加して内側に
        const padX = gameWidth - margin;
        const padY = gameHeight - margin;
        
        console.log(`Virtual gamepad position: ${padX}, ${padY} (screen: ${gameWidth}x${gameHeight})`);
        
        // 外側の円（ベース）
        this.baseCircle = this.scene.add.circle(padX, padY, 50, 0x333333, 0.6);
        this.baseCircle.setScrollFactor(0); // カメラに固定
        this.baseCircle.setStrokeStyle(2, 0x555555); // 枠線を追加
        this.baseCircle.setDepth(1000); // 最前面に表示
        
        // 内側の円（スティック）
        this.stickCircle = this.scene.add.circle(padX, padY, 20, 0x888888, 0.9);
        this.stickCircle.setScrollFactor(0); // カメラに固定
        this.stickCircle.setStrokeStyle(2, 0xaaaaaa); // 枠線を追加
        this.stickCircle.setDepth(1001); // ベースより前面に
        this.stickCircle.setInteractive();
        
        // ドラッグ可能にする
        this.scene.input.setDraggable(this.stickCircle);
        
        // スティックの初期位置
        this.centerX = padX;
        this.centerY = padY;
        this.maxDistance = 40; // 少し小さくして操作しやすく
        
        // 現在の入力状態
        this.currentInput = { x: 0, y: 0 };
        
        // ドラッグイベント
        this.stickCircle.on('drag', (pointer, dragX, dragY) => {
            // デバッグ情報を追加
            console.log(`Drag event - pointer: (${pointer.x}, ${pointer.y}), drag: (${dragX}, ${dragY}), center: (${this.centerX}, ${this.centerY})`);
            this.updateStick(dragX, dragY);
        });
        
        this.stickCircle.on('dragstart', (pointer) => {
            // ドラッグ開始時の視覚的フィードバック
            this.stickCircle.setAlpha(1.0);
            this.baseCircle.setAlpha(0.8);
            console.log(`Drag start at: (${pointer.x}, ${pointer.y})`);
        });
        
        this.stickCircle.on('dragend', () => {
            this.resetStick();
            // ドラッグ終了時の視覚的フィードバック
            this.stickCircle.setAlpha(0.9);
            this.baseCircle.setAlpha(0.6);
        });
        
        // 画面リサイズ時の対応
        this.scene.scale.on('resize', this.handleResize, this);
    }
    
    handleResize() {
        // 画面サイズが変更された時にジョイスティックの位置を更新
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        const margin = 120; // マージンを統一
        
        this.centerX = gameWidth - margin;
        this.centerY = gameHeight - margin;
        
        this.baseCircle.setPosition(this.centerX, this.centerY);
        this.stickCircle.setPosition(this.centerX, this.centerY);
        
        console.log(`Gamepad repositioned to: ${this.centerX}, ${this.centerY}`);
    }

    updateStick(dragX, dragY) {
        // 中心からの距離を計算
        const deltaX = dragX - this.centerX;
        const deltaY = dragY - this.centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        console.log(`updateStick - delta: (${deltaX.toFixed(1)}, ${deltaY.toFixed(1)}), distance: ${distance.toFixed(1)}`);
        
        // 最大距離内に制限
        let finalX = dragX;
        let finalY = dragY;
        
        if (distance > this.maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            finalX = this.centerX + Math.cos(angle) * this.maxDistance;
            finalY = this.centerY + Math.sin(angle) * this.maxDistance;
            console.log(`Constrained to: (${finalX.toFixed(1)}, ${finalY.toFixed(1)}), angle: ${(angle * 180 / Math.PI).toFixed(1)}°`);
        }
        
        // スティックの位置を更新
        this.stickCircle.x = finalX;
        this.stickCircle.y = finalY;
        
        // 正規化された入力値を計算
        const normalizedX = (finalX - this.centerX) / this.maxDistance;
        const normalizedY = (finalY - this.centerY) / this.maxDistance;
        
        // 現在の入力状態を保存
        this.currentInput.x = normalizedX;
        this.currentInput.y = normalizedY;
        
        // デッドゾーンを追加（小さな入力を無視）
        const deadZone = 0.1; // デッドゾーンを10%に縮小
        const inputMagnitude = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
        
        if (inputMagnitude < deadZone) {
            this.player.setVelocity(0, 0);
            return;
        }
        
        // スピードを上げる
        const speed = 350; // 250から350に増加
        const velocityX = normalizedX * speed;
        const velocityY = normalizedY * speed;
        
        console.log(`Input - normalized: (${normalizedX.toFixed(2)}, ${normalizedY.toFixed(2)}), velocity: (${velocityX.toFixed(1)}, ${velocityY.toFixed(1)})`);
        
        this.player.setVelocity(velocityX, velocityY);
    }
    
    resetStick() {
        // スティックを中央に戻す
        this.stickCircle.x = this.centerX;
        this.stickCircle.y = this.centerY;
        
        // 入力状態をリセット
        this.currentInput.x = 0;
        this.currentInput.y = 0;
        
        // プレイヤーを停止
        this.player.setVelocity(0, 0);
        
        console.log('Joystick reset');
    }
    
    // 現在の入力状態を取得（他のシステムから参照可能）
    getCurrentInput() {
        return { ...this.currentInput };
    }
    
    // ジョイスティックを破棄
    destroy() {
        if (this.baseCircle) {
            this.baseCircle.destroy();
        }
        if (this.stickCircle) {
            this.stickCircle.destroy();
        }
        this.scene.scale.off('resize', this.handleResize, this);
    }

    // setupTouchControls() {
    //     // タップ移動
    //     this.scene.input.on('pointerdown', (pointer) => {
    //         console.log('TouchControl: pointerdown detected');
    //         console.log('Dialog active:', this.scene.dialogSystem && this.scene.dialogSystem.isDialogActive());
    
    //         if (this.scene.dialogSystem && this.scene.dialogSystem.isDialogActive()) {
    //             console.log('TouchControl: Skipping movement because dialog is active');
    //             return; // プレイヤー移動処理のみスキップ
    //         }
            
    //         console.log('TouchControl: Processing click for movement');
    //         this.touchStartX = pointer.x;
    //         this.touchStartY = pointer.y;
    //         this.isPointerDown = true;
            
    //         this.targetX = pointer.worldX;
    //         this.targetY = pointer.worldY;

    //         // 継続移動の開始（0.1秒後から開始して重複を避ける）
    //         this.scene.time.delayedCall(100, () => {
    //             if (this.isPointerDown) {
    //                 this.startContinuousMovement();
    //             }
    //         });
    //     });

    //     // マウス/指の移動中
    //     this.scene.input.on('pointermove', (pointer) => {
    //         if (this.scene.dialogSystem && this.scene.dialogSystem.isDialogActive()) {
    //             return;
    //         }
    //         if (this.isPointerDown) {
    //             // 移動中は目標座標を更新
    //             this.targetX = pointer.worldX;
    //             this.targetY = pointer.worldY;
    //         }
    //     });

    //     // スワイプ操作
    //     this.scene.input.on('pointerup', (pointer) => {
    //         if (this.scene.dialogSystem && this.scene.dialogSystem.isDialogActive()) {
    //             return;
    //         }
    //         this.isPointerDown = false;

    //         const deltaX = pointer.x - this.touchStartX;
    //         const deltaY = pointer.y - this.touchStartY;
    //         const minSwipeDistance = 50;
            
    //         if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
    //             this.handleSwipe(deltaX, deltaY);
    //         }
    //     });
    // }

    // handleSwipe(deltaX, deltaY) {
    //     // 最初に追加
    //     if (this.scene.dialogSystem && this.scene.dialogSystem.isDialogActive()) {
    //         return;
    //     }
    //     const speed = 600;
    //     let vx = 0, vy = 0;
        
    //     if (Math.abs(deltaX) > Math.abs(deltaY)) {
    //         // 横方向のスワイプ
    //         vx = deltaX > 0 ? speed : -speed;
    //     } else {
    //         // 縦方向のスワイプ
    //         vy = deltaY > 0 ? speed : -speed;
    //     }
        
    //     this.player.setVelocity(vx, vy);
        
    //     // 0.3秒後に停止
    //     this.scene.time.delayedCall(300, () => {
    //         this.player.setVelocity(0, 0);
    //     });
    // }

    // startContinuousMovement() {
    //     if (this.scene.dialogSystem && this.scene.dialogSystem.isDialogActive()) {
    //         this.player.setVelocity(0, 0);
    //         return;
    //     }

    //     if (!this.isPointerDown) return;
        
    //     const playerX = this.player.x;
    //     const playerY = this.player.y;
        
    //     // プレイヤーから目標地点への方向を計算
    //     const deltaX = this.targetX - playerX;
    //     const deltaY = this.targetY - playerY;
    //     const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
    //     if (distance > 10) { // 最小移動距離
    //         const speed = 300;
    //         this.player.setVelocity(
    //             (deltaX / distance) * speed,
    //             (deltaY / distance) * speed
    //         );
    //     } else {
    //         // 目標地点に到達したら停止
    //         this.player.setVelocity(0, 0);
    //     }
        
    //     // 継続的に更新（60FPSで更新）
    //     this.scene.time.delayedCall(16, () => {
    //         if (this.isPointerDown) {
    //             this.startContinuousMovement();
    //         }
    //     });
    // }
}