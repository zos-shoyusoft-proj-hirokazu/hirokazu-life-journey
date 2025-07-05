export class ConversationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConversationScene' });
        this.currentConversationIndex = 0;
        this.currentConversation = null;
        this.isTextAnimating = false;
        this.textSpeed = 30; // ms per character
    }

    preload() {
        // 立ち絵の読み込み
        this.load.image('heroine_happy', 'assets/characters/heroine_happy.png');
        this.load.image('heroine_smile', 'assets/characters/heroine_smile.png');
        this.load.image('heroine_normal', 'assets/characters/heroine_normal.png');
        
        // 背景の読み込み
        this.load.image('school_classroom', 'assets/backgrounds/school_classroom.png');
        
        // UI要素の読み込み
        this.load.image('textbox', 'assets/ui/textbox.png');
        this.load.image('namebox', 'assets/ui/namebox.png');
    }

    create() {
        // 画面サイズを取得
        const { width, height } = this.sys.game.config;
        
        // 背景を設定
        this.background = this.add.image(width / 2, height / 2, 'school_classroom');
        this.background.setDisplaySize(width, height);
        
        // 立ち絵用のコンテナ
        this.characterContainer = this.add.container(0, 0);
        
        // テキストボックスの設定
        this.textbox = this.add.image(width / 2, height - 150, 'textbox');
        this.textbox.setOrigin(0.5, 0.5);
        this.textbox.setDisplaySize(width - 100, 200);
        
        // 名前ボックスの設定
        this.namebox = this.add.image(150, height - 230, 'namebox');
        this.namebox.setOrigin(0.5, 0.5);
        this.namebox.setDisplaySize(250, 60);
        
        // テキスト表示用
        this.dialogText = this.add.text(width / 2, height - 150, '', {
            fontSize: '24px',
            fill: '#000000',
            wordWrap: { width: width - 200, useAdvancedWrap: true }
        });
        this.dialogText.setOrigin(0.5, 0.5);
        
        // 名前表示用
        this.nameText = this.add.text(150, height - 230, '', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        this.nameText.setOrigin(0.5, 0.5);
        
        // クリックでテキスト進行
        this.input.on('pointerdown', () => {
            console.log('クリックイベント発生');
            this.nextDialog();
        });
        
        // スペースキーでも進行
        this.input.keyboard.on('keydown-SPACE', () => {
            console.log('スペースキーイベント発生');
            this.nextDialog();
        });
    }

    // 会話開始
    startConversation(conversationData) {
        this.currentConversation = conversationData;
        this.currentConversationIndex = 0;
        
        // 背景を変更
        this.updateBackground(conversationData.background);
        
        this.showDialog();
    }

    // 次の会話に進む
    nextDialog() {
        console.log('nextDialog() 呼び出し');
        console.log('現在のインデックス:', this.currentConversationIndex);
        console.log('会話総数:', this.currentConversation?.conversations?.length);
        console.log('テキストアニメーション中:', this.isTextAnimating);
        
        if (this.isTextAnimating) {
            // テキストアニメーション中なら即座に完了
            console.log('テキストアニメーションを完了');
            this.completeTextAnimation();
            return;
        }
        
        this.currentConversationIndex++;
        console.log('次のインデックス:', this.currentConversationIndex);
        
        if (this.currentConversationIndex < this.currentConversation.conversations.length) {
            console.log('次の会話を表示');
            this.showDialog();
        } else {
            // 会話終了
            console.log('会話終了');
            this.endConversation();
        }
    }

    // 会話表示
    showDialog() {
        const dialog = this.currentConversation.conversations[this.currentConversationIndex];
        
        // 立ち絵の更新
        this.updateCharacterSprite(dialog.character, dialog.expression);
        
        // 名前の表示
        this.nameText.setText(dialog.speaker);
        
        // テキストのアニメーション表示
        this.animateText(dialog.text);
    }

    // 立ち絵の更新
    updateCharacterSprite(character, expression) {
        if (!this.characterSprites) {
            this.characterSprites = {};
        }
        
        // characterContainerが初期化されていない場合は何もしない
        if (!this.characterContainer) {
            console.warn('characterContainer is not initialized yet');
            return;
        }
        
        if (character && expression) {
            const spriteKey = `${character}_${expression}`;
            const { width, height } = this.sys.game.config;
            
            // 既存のキャラクターがいる場合は削除
            if (this.characterSprites[character]) {
                this.characterSprites[character].destroy();
            }
            
            // 新しいスプライトを作成
            const sprite = this.add.image(0, 0, spriteKey);
            
            // キャラクターの位置を決定（複数キャラクター対応）
            const characterPositions = {
                'heroine': { x: width * 0.7, y: height * 0.4 },
                'friend': { x: width * 0.3, y: height * 0.4 },
                'teacher': { x: width * 0.5, y: height * 0.4 }
            };
            
            const position = characterPositions[character] || { x: width * 0.7, y: height * 0.4 };
            sprite.setPosition(position.x, position.y);
            sprite.setOrigin(0.5, 0.5);
            sprite.setDisplaySize(400, 600);
            
            this.characterContainer.add(sprite);
            this.characterSprites[character] = sprite;
            
            // 立ち絵の登場アニメーション
            sprite.setAlpha(0);
            sprite.setScale(0.8);
            this.tweens.add({
                targets: sprite,
                alpha: 1,
                scaleX: 1,
                scaleY: 1,
                duration: 500,
                ease: 'Power2'
            });
            
            // 話していないキャラクターを少し暗くする
            this.dimOtherCharacters(character);
        }
    }
    
    // 他のキャラクターを暗くする
    dimOtherCharacters(activeCharacter) {
        if (this.characterSprites) {
            Object.keys(this.characterSprites).forEach(charKey => {
                const sprite = this.characterSprites[charKey];
                if (charKey === activeCharacter) {
                    sprite.setTint(0xFFFFFF); // 通常の色
                } else {
                    sprite.setTint(0x888888); // 暗くする
                }
            });
        }
    }

    // テキストアニメーション
    animateText(text) {
        this.isTextAnimating = true;
        this.dialogText.setText('');
        
        let currentText = '';
        let charIndex = 0;
        
        const timer = this.time.addEvent({
            delay: this.textSpeed,
            callback: () => {
                if (charIndex < text.length) {
                    currentText += text[charIndex];
                    this.dialogText.setText(currentText);
                    charIndex++;
                } else {
                    this.isTextAnimating = false;
                    timer.destroy();
                }
            },
            loop: true
        });
        
        this.currentTextTimer = timer;
    }

    // テキストアニメーション完了
    completeTextAnimation() {
        if (this.currentTextTimer) {
            this.currentTextTimer.destroy();
        }
        
        const dialog = this.currentConversation.conversations[this.currentConversationIndex];
        this.dialogText.setText(dialog.text);
        this.isTextAnimating = false;
    }

    // 背景を更新
    updateBackground(backgroundKey) {
        if (backgroundKey && this.textures.exists(backgroundKey)) {
            this.background.setTexture(backgroundKey);
        }
    }
    
    // 会話終了
    endConversation() {
        console.log('会話終了');
        
        // 会話終了イベントを発火
        this.events.emit('conversationEnded');
        
        // 元のシーンに戻る、または次のイベントに移行
        this.scene.stop();
        // 必要に応じて他のシーンを開始
        // this.scene.start('GameScene');
    }
} 