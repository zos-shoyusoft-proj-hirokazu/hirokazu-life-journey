export class DialogSystem {
    constructor(scene, stageData) { 
        // シーンの有効性チェック
        if (!scene || !scene.scene) {
            console.error('DialogSystem: Invalid scene provided');
            return;
        }
        
        this.scene = scene;
        this.isActive = false;
        this.dialogContainer = null;
        this.dialogText = null;
        this.currentDialog = null;
        this.currentTextIndex = 0;

        // 渡されたステージデータのみを使用
        this.dialogs = stageData;
        
        this.setupUI();
        this.setupInput();
    }

    setupUI() {
        // シーンが有効でない場合は処理を停止
        if (!this.scene || !this.scene.cameras || !this.scene.cameras.main) {
            console.warn('DialogSystem: Scene or camera is not available');
            return;
        }

        if (this.dialogContainer) {
            this.dialogContainer.destroy();
        }

        // 2. カメラ情報取得（安全なアクセス）
        const camera = this.scene.cameras.main;
        const gameWidth = camera.width || 800;
        const gameHeight = camera.height || 600;

        // 3. レイアウト計算
        const dialogHeight = 120;
        const margin = 20;
        const dialogY = gameHeight - dialogHeight - margin - 20;

        // コンテナを固定位置に作成
        this.dialogContainer = this.scene.add.container(0, 0);
        this.dialogContainer.setDepth(10000);  // より高い深度
        this.dialogContainer.setVisible(false);
                
        // 背景を画面全体にクリック可能エリアとして作成
        const bg = this.scene.add.rectangle(
            gameWidth / 2, 
            dialogY + dialogHeight / 2,
            gameWidth - 20,
            120,
            0x000000, 
            0.8
        );
        // bg.setStrokeStyle(2, 0xffffff); // 枠線を削除

        // テキストをコンテナ内の相対座標で作成
        this.dialogText = this.scene.add.text(
            30,                            // コンテナ内でのX座標
            dialogY + dialogHeight / 2,    // コンテナ内でのY座標
            '', 
            {
                fontSize: '18px',
                fill: '#ffffff',
                metrics: {
                    ascent: 15,    // 文字の上部分
                    descent: 5,    // 文字の下部分
                    fontSize: 18
                },
                wordWrap: { width: gameWidth - 60 }
            }
        );
        this.dialogText.setOrigin(0, 0.5); // 左中央を基準点に

        // スマホ対応：続行インジケーター
        this.continueIndicator = this.scene.add.text(
            gameWidth - margin,      
            dialogY + dialogHeight / 2 - margin, // 下部
            'タップで続行',
            {
                fontSize: '12px',
                fill: '#ffff00',           // 黄色
                align: 'center'
            }
        );
        this.continueIndicator.setOrigin(1, 1); // 右下を基準点に

        // 点滅アニメーション
        this.scene.tweens.add({
            targets: this.continueIndicator,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // 5. オブジェクト作成後、即座にコンテナに追加
        this.dialogContainer.add([bg, this.dialogText, this.continueIndicator]);
        
        // イベントリスナー重複問題の解決
        bg.removeAllListeners();

        bg.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(-gameWidth/2, -dialogHeight/2 - 20, gameWidth, dialogHeight + 40),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: false
        });

        bg.on('pointerdown', (pointer, localX, localY, event) => {
            
            // イベントの伝播を停止
            if (event && event.stopPropagation) {
                event.stopPropagation();
            }
            
            if (this.isActive) {
                this.nextDialog();
            } else {
                // Dialog not active, ignoring click
            }
        });

        this.dialogContainer.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0, 0, gameWidth, gameHeight),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains
        });

        this.dialogContainer.on('pointerdown', (pointer, localX, localY, event) => {
            if (event && event.stopPropagation) {
                event.stopPropagation();
            }
            if (this.isActive) {
                this.nextDialog();
            }
        });

        // 7. カメラ固定設定
        this.dialogContainer.setScrollFactor(0);


        // 位置確認ログ
        // console.log('Dialog container position:', this.dialogContainer.x, this.dialogContainer.y);
        // console.log('Background rectangle bounds:', bg.getBounds());

        // 8. リサイズイベント設定
        this.scene.scale.off('resize', this.handleResize, this);
        this.scene.scale.on('resize', this.handleResize, this);
    }

    //画面リサイズ時の処理
    //@param {Object} gameSize - 新しいゲームサイズ
    
    // eslint-disable-next-line no-unused-vars
    handleResize(gameSize) {
        // シーンが有効でない場合は処理を停止
        if (!this.scene || !this.scene.cameras || !this.scene.cameras.main || !this.dialogContainer) {
            console.warn('DialogSystem: Scene, camera, or dialog container is not available for resize');
            return;
        }

        // UI要素の位置を再計算して更新
        this.setupUI();
    }

    setupInput() {
        // シーンとinputの有効性チェック
        if (!this.scene || !this.scene.input || !this.scene.input.keyboard) {
            console.warn('DialogSystem: Scene input is not available');
            return;
        }
        
        this.scene.input.keyboard.on('keydown-SPACE', () => {
            if (this.isActive) {
                this.nextDialog();
            }
        });
    
        // // ダイアログエリアのみクリック可能にする
        //     this.dialogContainer.setInteractive();
        //     this.dialogContainer.on('pointerdown', () => {
        //     console.log('Dialog container clicked!');
        //     if (this.isActive) {
        //         console.log('Calling nextDialog()');
        //         this.nextDialog();
        //     }
        // });
    }


    startDialog(npcId) {
        // 指定されたNPCの会話データが存在するかチェック
        if (!this.dialogs[npcId]) {
            console.error('No dialog found for:', npcId);
            return;
        }

        this.currentDialog = this.dialogs[npcId];  // 会話データを設定
        this.currentTextIndex = 0;                 // メッセージ番号をリセット
        this.isActive = true;                      // 会話中フラグをON
        // 強制的にリセット（デバッグ用）
        this.currentTextIndex = 0;
        
        this.dialogContainer.setVisible(true);     // ウィンドウを表示
        this.showMessage();                        // 最初のメッセージを表示
        
    }


    showMessage() {
        if (!this.currentDialog || !this.currentDialog.messages) return;
        if (this.currentTextIndex >= this.currentDialog.messages.length) {
            this.endDialog();
            return;
        }
        const message = this.currentDialog.messages[this.currentTextIndex];
        console.log('[DialogSystem] showMessage', {
            index: this.currentTextIndex,
            name: this.currentDialog.name,
            text: message
        });
        this.dialogText.setText(message);
        
    }

    nextDialog() {
    this.currentTextIndex++;
    this.showMessage();
    }

    endDialog() {
        this.isActive = false;
        if (this.dialogContainer) {
            this.dialogContainer.setVisible(false);
        }
        
        // イベントリスナーを削除
        if (this.scene && this.scene.scale) {
            this.scene.scale.off('resize', this.handleResize, this);
        }
    }

    isDialogActive() {
        return this.isActive;
    }
}