export class PlayerController {
    constructor(scene) {
        this.scene = scene;
        this.player = null;
        this.cursors = null;
        this.wasd = null;
        this.speed = 300;
    }

    createPlayer(x, y) {
        // プレイヤー（新郎）作成 - 物理オブジェクトとして
        // 黒色の1x1ピクセルのテクスチャを作成
        if (!this.scene.textures.exists('player_placeholder')) {
            // より確実なテクスチャ作成
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000000';  // 黒色で塗りつぶし
            ctx.fillRect(0, 0, 1, 1);
            
            this.scene.textures.addCanvas('player_placeholder', canvas);
        }
        
        this.player = this.scene.physics.add.sprite(x, y, 'player_placeholder');
        this.player.setDisplaySize(30, 30);
        
        // 主人公を最前面に表示（レイヤーより手前）
        this.player.setDepth(40);
        
        // 透明度を完全に不透明に設定
        this.player.setAlpha(1.0);
        
        // 色調を黒色に設定
        this.player.clearTint();
        this.player.setTint(0x000000);  // 黒色

        // プレイヤーの物理設定
        this.player.setCollideWorldBounds(true); // 画面端で止まる
        this.player.setBounce(0); // 跳ね返りを無効化（滑らかな動きのため）
        this.player.setDrag(200); // 慣性を追加して滑らかに停止
        
        // シーン遷移時の問題を防ぐため、少し遅延してから設定を再適用
        this.scene.time.delayedCall(100, () => {
            if (this.player) {
                this.player.setDepth(40);
                this.player.setAlpha(1.0);
                this.player.clearTint();
                this.player.setTint(0x000000);  // 黒色を再設定
            }
        });
        
        // 定期的に主人公の状態を確認
        this.scene.time.addEvent({
            delay: 1000, // 1秒ごと
            callback: this.checkPlayerState,
            callbackScope: this,
            loop: true
        });
        
        // 主人公の設定変更を監視
        this.monitorPlayerChanges();
    }
    
    // 主人公の状態を確認するメソッド
    checkPlayerState() {
        if (this.player) {
            // 透明度が下がっている場合は修正
            if (this.player.alpha < 1.0) {
                this.player.setAlpha(1.0);
            }
            
            // 深度が正しくない場合は修正
            if (this.player.depth !== 40) {
                this.player.setDepth(40);
            }
        }
    }

    // 主人公の設定変更を監視するメソッド
    monitorPlayerChanges() {
        console.log('[PlayerController] 監視開始');
        
        if (this.player) {
            console.log('[PlayerController] 主人公オブジェクト確認: 存在します');
            
            // 深度の変更を監視
            const originalDepth = this.player.depth;
            console.log('[PlayerController] 元の深度:', originalDepth);
            
            const depthCheck = setInterval(() => {
                if (this.player && this.player.depth !== originalDepth) {
                    console.log('[PlayerController] ⚠️ 深度が変更されました:', originalDepth, '→', this.player.depth);
                    // 元の深度に戻す
                    this.player.setDepth(40);
                    console.log('[PlayerController] 深度を元に戻しました: 40');
                }
            }, 100);
            
            // 透明度の変更を監視
            const originalAlpha = this.player.alpha;
            console.log('[PlayerController] 元の透明度:', originalAlpha);
            
            const alphaCheck = setInterval(() => {
                if (this.player && this.player.alpha !== originalAlpha) {
                    console.log('[PlayerController] ⚠️ 透明度が変更されました:', originalAlpha, '→', this.player.alpha);
                    // 元の透明度に戻す
                    this.player.setAlpha(1.0);
                    console.log('[PlayerController] 透明度を元に戻しました: 1.0');
                }
            }, 100);
            
            // 色調の変更を監視（より頻繁に）
            const originalTint = this.player.tint;
            console.log('[PlayerController] 元の色調:', originalTint);
            
            const tintCheck = setInterval(() => {
                if (this.player && this.player.tint !== originalTint) {
                    console.log('[PlayerController] ⚠️ 色調が変更されました:', originalTint, '→', this.player.tint);
                    // 元の色調に戻す（より強力に）
                    this.player.clearTint();
                    this.player.setTint(0x000000);
                    this.player.setTint(0x000000);  // 2回実行
                    this.player.setTint(0x000000);  // 3回実行
                    console.log('[PlayerController] 色調を元に戻しました: 0x000000');
                }
            }, 50);  // 50msごとに監視（より頻繁に）
            
            // クリーンアップ用のタイマーを保存
            this._monitoringTimers = [depthCheck, alphaCheck, tintCheck];
            
            console.log('[PlayerController] 監視タイマー設定完了');
        } else {
            console.log('[PlayerController] 主人公オブジェクト確認: 存在しません');
        }
    }

    setInputKeys(cursors, wasd) {
        this.cursors = cursors;
        this.wasd = wasd;
    }

    update() {
        // プレイヤーの存在チェック（必須）
        if (!this.player) {
            return;
        }

        // キーボード入力の処理（オプション）
        if (this.cursors && this.wasd) {
            let velocityX = 0;
            let velocityY = 0;

            // 左右移動
            if (this.cursors.left.isDown || this.wasd.A.isDown) {
                velocityX = -this.speed;
            } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
                velocityX = this.speed;
            }

            // 上下移動
            if (this.cursors.up.isDown || this.wasd.W.isDown) {
                velocityY = -this.speed;
            } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
                velocityY = this.speed;
            }

            // 実際の速度設定
            this.player.setVelocityX(velocityX);
            this.player.setVelocityY(velocityY);
        }
    }

    // タッチ操作用のメソッド（統一された方法）
    setVelocity(vx, vy) {
        if (this.player) {
            this.player.setVelocityX(vx);
            this.player.setVelocityY(vy);
        }
    }

    getPosition() {
        return this.player ? { x: this.player.x, y: this.player.y } : { x: 0, y: 0 };
    }
    
    destroy() {
        try {
            if (this.player) {
                this.player.destroy();
                this.player = null;
            }
            
            this.cursors = null;
            this.wasd = null;
            
        } catch (error) {
            console.error('Error during PlayerController cleanup:', error);
        }
    }
}