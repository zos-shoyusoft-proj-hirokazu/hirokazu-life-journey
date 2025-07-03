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
        
        // スティックの初期位置
        this.centerX = padX;
        this.centerY = padY;
        this.maxDistance = 40; // 少し小さくして操作しやすく
        
        // 現在の入力状態
        this.currentInput = { x: 0, y: 0 };
        
        // タッチ状態
        this.isStickActive = false;
        this.currentPointerId = null;
        
        // ベースエリアでのタッチ操作を監視（より大きなエリアで受け付け）
        const touchArea = this.scene.add.circle(padX, padY, 80, 0x000000, 0.01); // 透明な大きなエリア
        touchArea.setScrollFactor(0);
        touchArea.setDepth(999);
        touchArea.setInteractive();
        
        // タッチイベントの設定
        touchArea.on('pointerdown', (pointer) => {
            if (this.currentPointerId === null) {
                this.startStickControl(pointer);
            }
        });
        
        // グローバルなタッチイベントも監視
        this.scene.input.on('pointermove', (pointer) => {
            if (this.isStickActive && pointer.id === this.currentPointerId) {
                this.updateStick(pointer.x, pointer.y);
            }
        });
        
        this.scene.input.on('pointerup', (pointer) => {
            if (this.isStickActive && pointer.id === this.currentPointerId) {
                this.endStickControl();
            }
        });
        
        // 画面リサイズ時の対応
        this.scene.scale.on('resize', this.handleResize, this);
    }
    
    startStickControl(pointer) {
        this.isStickActive = true;
        this.currentPointerId = pointer.id;
        
        // 視覚的フィードバック
        this.stickCircle.setAlpha(1.0);
        this.baseCircle.setAlpha(0.8);
        
        // 初期位置を設定
        this.updateStick(pointer.x, pointer.y);
    }
    
    endStickControl() {
        this.isStickActive = false;
        this.currentPointerId = null;
        
        // スティックをリセット
        this.resetStick();
        
        // 視覚的フィードバック
        this.stickCircle.setAlpha(0.9);
        this.baseCircle.setAlpha(0.6);
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
    }

    updateStick(touchX, touchY) {
        // 中心からの距離を計算
        const deltaX = touchX - this.centerX;
        const deltaY = touchY - this.centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // 最大距離内に制限
        let finalX = touchX;
        let finalY = touchY;
        
        if (distance > this.maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            finalX = this.centerX + Math.cos(angle) * this.maxDistance;
            finalY = this.centerY + Math.sin(angle) * this.maxDistance;
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
}