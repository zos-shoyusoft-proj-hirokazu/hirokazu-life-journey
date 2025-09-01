export class PlayerController {
    constructor(scene) {
        this.scene = scene;
        this.player = null;
        this.cursors = null;
        this.wasd = null;
        this.speed = 300;
    }

    createPlayer(x, y) {
        console.log('[PlayerController] プレイヤー作成開始');
        
        // プレイヤー（新郎）作成 - スプライトシートを使用
        this.player = this.scene.physics.add.sprite(x, y, 'player_sprite');
        this.player.setDisplaySize(32, 32);
        
        // 主人公を最前面に表示（レイヤーより手前）
        this.player.setDepth(40);
        
        // 初期フレームを設定（下向き）
        this.player.setFrame(0);
        
        // プレイヤーの物理設定
        this.player.setCollideWorldBounds(true); // 画面端で止まる
        this.player.setBounce(0); // 跳ね返りを無効化（滑らかな動きのため）
        this.player.setDrag(200); // 慣性を追加して滑らかに停止
        
        console.log('[PlayerController] プレイヤースプライト作成完了');
        
        // アニメーションを設定
        this.setupPlayerAnimations();
        
        console.log('[PlayerController] プレイヤー作成完了');
    }
    
    setupPlayerAnimations() {
        console.log('[PlayerController] アニメーション設定開始');
        
        // プレイヤーのアニメーションを設定（3x4グリッド構成）
        if (!this.scene.anims.exists('player_walk_down')) {
            this.scene.anims.create({
                key: 'player_walk_down',
                frames: this.scene.anims.generateFrameNumbers('player_sprite', { start: 0, end: 2 }),
                frameRate: 8,
                repeat: -1
            });
            console.log('[PlayerController] 下向きアニメーション作成完了');
        }
        
        if (!this.scene.anims.exists('player_walk_left')) {
            this.scene.anims.create({
                key: 'player_walk_left',
                frames: this.scene.anims.generateFrameNumbers('player_sprite', { start: 3, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
            console.log('[PlayerController] 左向きアニメーション作成完了');
        }
        
        if (!this.scene.anims.exists('player_walk_right')) {
            this.scene.anims.create({
                key: 'player_walk_right',
                frames: this.scene.anims.generateFrameNumbers('player_sprite', { start: 6, end: 8 }),
                frameRate: 8,
                repeat: -1
            });
            console.log('[PlayerController] 右向きアニメーション作成完了');
        }
        
        if (!this.scene.anims.exists('player_walk_up')) {
            this.scene.anims.create({
                key: 'player_walk_up',
                frames: this.scene.anims.generateFrameNumbers('player_sprite', { start: 9, end: 11 }),
                frameRate: 8,
                repeat: -1
            });
            console.log('[PlayerController] 上向きアニメーション作成完了');
        }
        
        console.log('[PlayerController] アニメーション設定完了');
    }
    
    // 主人公の状態を確認するメソッド（削除）
    // checkPlayerState() {
    //     if (this.player) {
    //         // 透明度が下がっている場合は修正
    //         if (this.player.alpha < 1.0) {
    //             this.player.setAlpha(1.0);
    //         }
    //         
    //         // 深度が正しくない場合は修正
    //         if (this.player.depth !== 40) {
    //             this.player.setDepth(40);
    //         }
    //     }
    // }

    // 主人公の設定変更を監視するメソッド（削除）
    // monitorPlayerChanges() {
    //     console.log('[PlayerController] 監視開始');
    //     
    //     if (this.player) {
    //         console.log('[PlayerController] 主人公オブジェクト確認: 存在します');
    //         
    //         // 深度の変更を監視
    //         const originalDepth = this.player.depth;
    //         console.log('[PlayerController] 元の深度:', originalDepth);
    //         
    //         const depthCheck = setInterval(() => {
    //             if (this.player && this.player.depth !== originalDepth) {
    //                 console.log('[PlayerController] ⚠️ 深度が変更されました:', originalDepth, '→', this.player.depth);
    //                 // 元の深度に戻す
    //                 this.player.setDepth(40);
    //                 console.log('[PlayerController] 深度を元に戻しました: 40');
    //             }
    //         }, 100);
    //         
    //         // 透明度の変更を監視
    //         const originalAlpha = this.player.alpha;
    //         console.log('[PlayerController] 元の透明度:', originalAlpha);
    //         
    //         const alphaCheck = setInterval(() => {
    //             if (this.player && this.player.alpha !== originalAlpha) {
    //                 console.log('[PlayerController] ⚠️ 透明度が変更されました:', originalAlpha, '→', this.player.alpha);
    //                 // 元の透明度に戻す
    //                 this.player.setAlpha(1.0);
    //                 console.log('[PlayerController] 透明度を元に戻しました: 1.0');
    //             }
    //         }, 100);
    //         
    //         // 色調の変更を監視（より頻繁に）
    //         const originalTint = this.player.tint;
    //         console.log('[PlayerController] 元の色調:', originalTint);
    //         
    //         const tintCheck = setInterval(() => {
    //             if (this.player && this.player.tint !== originalTint) {
    //                 console.log('[PlayerController] ⚠️ 色調が変更されました:', originalTint, '→', this.player.tint);
    //                 // 元の色調に戻す（より強力に）
    //                 this.player.clearTint();
    //                 this.player.setTint(0x000000);
    //                 this.player.setTint(0x000000);  // 2回実行
    //                 this.player.setTint(0x000000);  // 3回実行
    //                 console.log('[PlayerController] 色調を元に戻しました: 0x000000');
    //         }
    //         }, 50);  // 50msごとに監視（より頻繁に）
    //         
    //         // クリーンアップ用のタイマーを保存
    //         this._monitoringTimers = [depthCheck, alphaCheck, tintCheck];
    //         
    //         console.log('[PlayerController] 監視タイマー設定完了');
    //     } else {
    //         console.log('[PlayerController] 主人公オブジェクト確認: 存在しません');
    //     }
    // }

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
            
            // アニメーション処理
            this.handlePlayerAnimation(velocityX, velocityY);
        }
    }
    
    handlePlayerAnimation(velocityX, velocityY) {
        console.log(`[PlayerController] handlePlayerAnimation: vx=${velocityX}, vy=${velocityY}`);
        
        // 移動していない場合はアニメーションを停止し、静止フレームを設定
        if (velocityX === 0 && velocityY === 0) {
            console.log('[PlayerController] 停止中 - アニメーション停止');
            this.player.anims.stop();
            // 最後の移動方向に応じて静止フレームを設定
            if (this.lastDirection) {
                switch (this.lastDirection) {
                    case 'up':
                        this.player.setFrame(9); // 上向き静止フレーム
                        break;
                    case 'down':
                        this.player.setFrame(0); // 下向き静止フレーム
                        break;
                    case 'left':
                        this.player.setFrame(3); // 左向き静止フレーム
                        break;
                    case 'right':
                        this.player.setFrame(6); // 右向き静止フレーム
                        break;
                }
            }
            return;
        }
        
        // 移動方向に応じてアニメーションを再生
        if (Math.abs(velocityY) > Math.abs(velocityX)) {
            // 上下移動が優先
            if (velocityY < 0) {
                console.log('[PlayerController] 上向きアニメーション再生');
                this.player.anims.play('player_walk_up', true);
                this.lastDirection = 'up';
            } else {
                console.log('[PlayerController] 下向きアニメーション再生');
                this.player.anims.play('player_walk_down', true);
                this.lastDirection = 'down';
            }
        } else {
            // 左右移動が優先
            if (velocityX < 0) {
                console.log('[PlayerController] 左向きアニメーション再生');
                this.player.anims.play('player_walk_left', true);
                this.lastDirection = 'left';
            } else {
                console.log('[PlayerController] 右向きアニメーション再生');
                this.player.anims.play('player_walk_right', true);
                this.lastDirection = 'right';
            }
        }
    }

    // タッチ操作用のメソッド（統一された方法）
    setVelocity(vx, vy) {
        if (this.player) {
            this.player.setVelocityX(vx);
            this.player.setVelocityY(vy);
            
            // タッチ操作でもアニメーションを処理
            this.handlePlayerAnimation(vx, vy);
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