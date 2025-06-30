export class DialogSystem {
    constructor(scene, stageData) { 
        console.log('NEW DialogSystem created for scene:', scene.scene.key);
        console.log('Stage data keys:', Object.keys(stageData));
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
        if (this.dialogContainer) {
            this.dialogContainer.destroy();
        }

        // カメラ情報取得
        const camera = this.scene.cameras.main;
        const gameWidth = camera.width;
        const gameHeight = camera.height;

        console.log('=== Dialog UI Setup Debug ===');
        console.log('gameWidth:', gameWidth, 'gameHeight:', gameHeight);

        // レイアウト計算
        const dialogHeight = 120;
        const margin = 20;
        const dialogY = gameHeight - dialogHeight - margin - 20;

        console.log('dialogY:', dialogY);

        // コンテナを固定位置に作成
        this.dialogContainer = this.scene.add.container(0, 0);
        this.dialogContainer.setDepth(10000);  // より高い深度
        this.dialogContainer.setVisible(false);

        // 背景を画面全体にクリック可能エリアとして作成
        const bg = this.scene.add.rectangle(
            gameWidth / 2, 
            dialogY + dialogHeight / 2,
            gameWidth, // 画面全幅
            dialogHeight + 40, // 少し大きめ
            0x000000, 
            0.8
        );
        bg.setStrokeStyle(2, 0xffffff);

        // テキスト
        this.dialogText = this.scene.add.text(
            30,                            
            dialogY + dialogHeight / 2,    
            '', 
            {
                fontSize: '18px',
                fill: '#ffffff',
                metrics: {
                    ascent: 15,    
                    descent: 5,    
                    fontSize: 18
                },
                wordWrap: { width: gameWidth - 60 }
            }
        );
        this.dialogText.setOrigin(0, 0.5);

        // 続行インジケーター
        this.continueIndicator = this.scene.add.text(
            gameWidth - margin,      
            dialogY + dialogHeight / 2 - margin,
            'タップで続行',
            {
                fontSize: '12px',
                fill: '#ffff00',           
                align: 'center'
            }
        );
        this.continueIndicator.setOrigin(1, 1);

        // 点滅アニメーション
        this.scene.tweens.add({
            targets: this.continueIndicator,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // オブジェクトをコンテナに追加
        this.dialogContainer.add([bg, this.dialogText, this.continueIndicator]);
        
        // ★★★修正3★★★ より確実なイベント設定
        bg.removeAllListeners();
        bg.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(-gameWidth/2, -dialogHeight/2 - 20, gameWidth, dialogHeight + 40),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: false
        });

        // ★★★修正4★★★ デバッグログ追加
        bg.on('pointerdown', (pointer, localX, localY, event) => {
            console.log('=== Dialog Background Clicked ===');
            console.log('NPC ID:', this.currentDialog ? 'Active' : 'None');
            console.log('isActive:', this.isActive);
            console.log('Click position:', { x: pointer.x, y: pointer.y });
            console.log('Local position:', { x: localX, y: localY });
            
            // イベントの伝播を停止
            if (event && event.stopPropagation) {
                event.stopPropagation();
                console.log('Event propagation stopped');
            }
            
            if (this.isActive) {
                console.log('Calling nextDialog()');
                this.nextDialog();
            } else {
                console.log('Dialog not active, ignoring click');
            }
        });

        // ★★★修正5★★★ さらに確実にするため、コンテナ全体もクリック可能に
        this.dialogContainer.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0, 0, gameWidth, gameHeight),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains
        });

        this.dialogContainer.on('pointerdown', (pointer, localX, localY, event) => {
            console.log('=== Dialog Container Clicked ===');
            if (event && event.stopPropagation) {
                event.stopPropagation();
            }
            if (this.isActive) {
                console.log('Container click -> calling nextDialog()');
                this.nextDialog();
            }
        });

        // カメラ固定設定
        this.dialogContainer.setScrollFactor(0);

        // ★★★修正6★★★ 位置確認ログ
        console.log('Dialog container position:', this.dialogContainer.x, this.dialogContainer.y);
        console.log('Background rectangle bounds:', bg.getBounds());

        // リサイズイベント設定
        this.scene.scale.off('resize', this.handleResize, this);
        this.scene.scale.on('resize', this.handleResize, this);
    }

    handleResize(gameSize) {
        if (!this.dialogContainer) return;

        const newWidth = gameSize.width;
        const newHeight = gameSize.height;
        
        console.log('Dialog resize:', newWidth, newHeight);

        // UI要素の位置を再計算して更新
        this.setupUI();
    }

    setupInput() {
        this.scene.input.keyboard.on('keydown-SPACE', () => {
            if (this.isActive) {
                this.nextDialog();
            }
        });
    }

    startDialog(npcId) {
        console.log('=== NEW CONVERSATION START ===');
        console.log('Scene:', this.scene.scene.key);
        console.log('NPC:', npcId);
        console.log('Available dialogs:', Object.keys(this.dialogs));
        
        // 指定されたNPCの会話データが存在するかチェック
        if (!this.dialogs[npcId]) {
            console.error('No dialog found for:', npcId);
            return;
        }

        this.currentDialog = this.dialogs[npcId];  
        this.currentTextIndex = 0;                 
        this.isActive = true;                      
        
        console.log('Dialog data for', npcId, ':', this.currentDialog);
        console.log('Number of messages:', this.currentDialog.messages.length);
        
        this.dialogContainer.setVisible(true);     
        this.showMessage();                        
        
        console.log('Dialog started for:', npcId);
        console.log('Dialog container visible:', this.dialogContainer.visible);
        console.log('Dialog container depth:', this.dialogContainer.depth);
    }

    showMessage() {
        console.log('=== showMessage() ===');
        console.log('currentTextIndex:', this.currentTextIndex);
        
        if (!this.currentDialog || !this.currentDialog.messages) {
            console.error('Invalid dialog or messages');
            this.endDialog();
            return;
        }

        if (this.currentTextIndex >= this.currentDialog.messages.length) {
            console.log('All messages shown, ending dialog');
            this.endDialog();
            return;
        }

        const message = this.currentDialog.messages[this.currentTextIndex];
        console.log('Displaying message:', message);
        
        if (this.dialogText) {
            this.dialogText.setText(message);
        }
    }

    nextDialog() {
        console.log('=== nextDialog() ===');
        console.log('Before increment:', this.currentTextIndex);
        console.log('Total messages:', this.currentDialog ? this.currentDialog.messages.length : 'NO DIALOG');
        
        if (!this.isActive) {
            console.log('Dialog not active, ignoring');
            return;
        }
        
        this.currentTextIndex++;
        console.log('After increment:', this.currentTextIndex);
        
        this.showMessage();
    }

    endDialog() {
        console.log('=== Dialog ended ===');
        this.isActive = false;
        this.dialogContainer.setVisible(false);
        this.currentDialog = null;
        this.currentTextIndex = 0;
    }

    isDialogActive() {
        return this.isActive;
    }
}