import { VisualFeedbackManager } from '../managers/VisualFeedbackManager.js';

export class TouchControlManager {
    constructor(scene, player, seKey = 'se_touch') {
        this.scene = scene;
        this.player = player;
        this.seKey = seKey;
        this.visualFeedback = new VisualFeedbackManager(scene);
        
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

        // グローバルなタッチイベントを設定
        this.scene.input.on('pointerdown', (pointer) => {
            // 初回タップでオーディオを確実に解除（ステージ系のSE/BGMが鳴らない問題対策）
            try {
                if (this.scene.sound && this.scene.sound.locked) {
                    try {
                        if (this.scene.sound.context && this.scene.sound.context.state !== 'running') {
                            this.scene.sound.context.resume();
                        }
                    } catch (resumeError) { /* ignore */ }
                    try {
                        const ctx = this.scene.sound.context;
                        if (ctx && typeof ctx.createOscillator === 'function') {
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            gain.gain.value = 0.0001;
                            osc.connect(gain).connect(ctx.destination);
                            osc.start();
                            osc.stop(ctx.currentTime + 0.05);
                        }
                    } catch (oscError) { /* ignore */ }
                }
            } catch (e) { /* ignore */ }
            this.showTouchFeedback(pointer.x, pointer.y);
        });
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
        
        // グローバルなタッチイベントも監視（スロットリング削除でより滑らか）
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
        const deadZone = 0.05; // デッドゾーンを5%に縮小（より敏感に）
        const inputMagnitude = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
        
        if (inputMagnitude < deadZone) {
            // PlayerControllerと同じ方法で停止（プレイヤーが存在する場合のみ）
            if (this.player && this.player.setVelocityX) {
                this.player.setVelocityX(0);
                this.player.setVelocityY(0);
            }
            return;
        }
        
        // スピードを上げる
        const speed = 450; // 350から450に増加
        const velocityX = normalizedX * speed;
        const velocityY = normalizedY * speed;
        
        // PlayerControllerと同じ方法で設定（プレイヤーが存在する場合のみ）
        if (this.player && this.player.setVelocityX) {
            this.player.setVelocityX(velocityX);
            this.player.setVelocityY(velocityY);
        }
    }
    
    resetStick() {
        // スティックを中央に戻す
        this.stickCircle.x = this.centerX;
        this.stickCircle.y = this.centerY;
        
        // 入力状態をリセット
        this.currentInput.x = 0;
        this.currentInput.y = 0;
        
        // プレイヤーを停止（プレイヤーが存在する場合のみ）
        if (this.player && this.player.setVelocityX) {
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
        }
    }
    
    // 現在の入力状態を取得（他のシステムから参照可能）
    getCurrentInput() {
        return { ...this.currentInput };
    }
    
    // エリア選択用のタッチコントロールを有効化
    enableAreaSelection(areaSelectionManager) {
        this.areaSelectionManager = areaSelectionManager;
        
        // 通常のゲームパッドを非表示にする
        this.hideVirtualGamepad();
        
        // エリア選択用のタッチイベントを設定
        this.setupAreaSelectionTouch();
    }
    
    // バーチャルゲームパッドを非表示
    hideVirtualGamepad() {
        if (this.baseCircle) {
            this.baseCircle.setVisible(false);
        }
        if (this.stickCircle) {
            this.stickCircle.setVisible(false);
        }
    }
    
    // バーチャルゲームパッドを表示
    showVirtualGamepad() {
        if (this.baseCircle) {
            this.baseCircle.setVisible(true);
        }
        if (this.stickCircle) {
            this.stickCircle.setVisible(true);
        }
    }
    
    // エリア選択用のタッチイベントを設定
    setupAreaSelectionTouch() {
        // タッチイベントを設定
        this.scene.input.on('pointerdown', (pointer) => {
            this.handleAreaSelectionTouch(pointer);
        });
        
        // 長押し検出用
        this.touchStartTime = 0;
        this.longPressThreshold = 500; // 500msで長押し判定
    }
    
    // エリア選択用のタッチハンドラ
    handleAreaSelectionTouch(pointer) {
        try {
            // タッチ開始時刻を記録
            this.touchStartTime = Date.now();
            
            // カメラの存在確認
            if (!this.scene.cameras || !this.scene.cameras.main) {
                console.error('TouchControlManager: Camera not available');
                return;
            }
            
            // ワールド座標に変換
            const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const worldX = worldPoint.x;
            const worldY = worldPoint.y;
            
            // エリアマネージャーに座標を渡す
            if (this.areaSelectionManager) {
                this.areaSelectionManager.handleTouchAt(worldX, worldY);
            }
            
            // mapをタッチした時のSEとリップルエフェクトを表示
            this.showTouchFeedback(worldX, worldY);
            
        } catch (error) {
            console.error('TouchControlManager: Error in handleAreaSelectionTouch:', error);
        }
    }
    
    // mapをタッチした時のSEとリップルエフェクトを表示
    showTouchFeedback(worldX, worldY) {
        this.visualFeedback.showTouchRipple(worldX, worldY);
        if (this.scene.audioManager && this.scene.audioManager.playSe) {
            this.scene.audioManager.playSe(this.seKey, 0.3);
        }
    }
    
    // エリア選択モードを無効化
    disableAreaSelection() {
        this.areaSelectionManager = null;
        
        // 通常のゲームパッドを再表示
        this.showVirtualGamepad();
        
        // タッチイベントを削除
        this.scene.input.off('pointerdown');
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