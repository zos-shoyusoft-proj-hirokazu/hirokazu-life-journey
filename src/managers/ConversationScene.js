export class ConversationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConversationScene' });
        this.currentConversationIndex = 0;
        this.currentConversation = null;
        this.isTextAnimating = false;
        this.textSpeed = 30; // ms per character
    }



    create() {
        // シーンが正しく初期化されているかチェック
        if (!this.sys) {
            console.error('[ConversationScene] this.sys が undefined です');
            return;
        }
        
        if (!this.sys.game) {
            console.error('[ConversationScene] this.sys.game が undefined です');
            return;
        }
        
        // 前回のデータをクリーンアップ
        this.cleanupCharacterSprites();
        if (this.currentTextTimer) {
            this.currentTextTimer.destroy();
            this.currentTextTimer = null;
        }
        
        // 画面サイズを取得（安全なアクセス）
        const width = this.sys?.game?.canvas?.width || this.sys?.game?.config?.width || 800;
        const height = this.sys?.game?.canvas?.height || this.sys?.game?.config?.height || 600;
        
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
            this.nextDialog();
        });
        
        // スペースキーでも進行
        this.input.keyboard.on('keydown-SPACE', () => {
            this.nextDialog();
        });
        
        // UI作成完了フラグを設定
        this.isUICreated = true;
    }
    
    // UIをリセット（再作成せずに初期化）
    resetUI() {
        // テキストをクリア
        if (this.dialogText) {
            this.dialogText.setText('');
        }
        if (this.nameText) {
            this.nameText.setText('');
        }
        
        // 背景を初期状態に戻す
        if (this.background) {
            this.background.setTexture('school_classroom');
        }
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
        if (this.isTextAnimating) {
            // テキストアニメーション中なら即座に完了
            this.completeTextAnimation();
            return;
        }
        
        this.currentConversationIndex++;
        
        if (this.currentConversationIndex < this.currentConversation.conversations.length) {
            this.showDialog();
        } else {
            // 会話終了
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
            const width = this.sys?.game?.canvas?.width || this.sys?.game?.config?.width || 800;
            const height = this.sys?.game?.canvas?.height || this.sys?.game?.config?.height || 600;
            
            // キャラクターの位置を決定（複数キャラクター対応）
            const characterPositions = {
                'heroine': { x: width * 0.7, y: height * 0.4 },
                'friend': { x: width * 0.3, y: height * 0.4 },
                'teacher': { x: width * 0.5, y: height * 0.4 },
                'kawamuro': { x: width * 0.7, y: height * 0.4 },
                'daichi': { x: width * 0.3, y: height * 0.4 },
                'naoki': { x: width * 0.5, y: height * 0.4 }
            };
            
            const position = characterPositions[character] || { x: width * 0.7, y: height * 0.4 };
            
            // 既存のキャラクターがいる場合は、テクスチャのみ変更
            if (this.characterSprites[character]) {
                const existingSprite = this.characterSprites[character];
                // テクスチャが変更されている場合のみ更新
                if (existingSprite.texture.key !== spriteKey) {
                    existingSprite.setTexture(spriteKey);
                }
            } else {
                // 新しいスプライトを作成（最初から正しい位置で作成）
                const sprite = this.add.image(position.x, position.y, spriteKey);
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
            }
            
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

    // スマホ最適化：軽量テキストアニメーション
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // テキストアニメーション
    animateText(text) {
        this.isTextAnimating = true;
        this.dialogText.setText('');
        
        if (this.isMobile()) {
            // スマホ版：アニメーション無効（即座に全文表示）
            this.dialogText.setText(text);
            this.isTextAnimating = false;
            return;
        }
        
        // PC版：通常のアニメーション
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
        // スプライトをクリーンアップ
        this.cleanupCharacterSprites();
        
        // テキストアニメーションタイマーをクリーンアップ
        if (this.currentTextTimer) {
            this.currentTextTimer.destroy();
            this.currentTextTimer = null;
        }
        
        // UI要素をリセット（削除はしない）
        this.resetUI();
        
        // 会話終了イベントを発火
        this.events.emit('conversationEnded');
        
        // 元のシーンに戻る、または次のイベントに移行
        this.scene.stop();
        // 必要に応じて他のシーンを開始
        // this.scene.start('GameScene');
    }
    
    // キャラクタースプライトのクリーンアップ
    cleanupCharacterSprites() {
        if (this.characterSprites) {
            Object.values(this.characterSprites).forEach(sprite => {
                if (sprite && sprite.destroy) {
                    sprite.destroy();
                }
            });
            this.characterSprites = {};
        }
        
        if (this.characterContainer) {
            this.characterContainer.removeAll();
        }
    }
    
    // 画面リサイズ時の対応
    resize(gameSize) {
        const { width, height } = gameSize;
        
        // 背景のリサイズ
        if (this.background) {
            this.background.setPosition(width / 2, height / 2);
            this.background.setDisplaySize(width, height);
        }
        
        // テキストボックスのリサイズ
        if (this.textbox) {
            this.textbox.setPosition(width / 2, height - 150);
            this.textbox.setDisplaySize(width - 100, 200);
        }
        
        // 名前ボックスのリサイズ
        if (this.namebox) {
            this.namebox.setPosition(150, height - 230);
        }
        
        // テキストのリサイズ
        if (this.dialogText) {
            this.dialogText.setPosition(width / 2, height - 150);
            this.dialogText.setWordWrapWidth(width - 200);
        }
        
        // 名前テキストのリサイズ
        if (this.nameText) {
            this.nameText.setPosition(150, height - 230);
        }
        
        // キャラクタースプライトの位置調整
        this.repositionCharacterSprites();
    }
    
    // キャラクタースプライトの位置調整
    repositionCharacterSprites() {
        if (this.characterSprites) {
            const width = this.sys?.game?.canvas?.width || this.sys?.game?.config?.width || 800;
            const height = this.sys?.game?.canvas?.height || this.sys?.game?.config?.height || 600;
            
            const characterPositions = {
                'heroine': { x: width * 0.7, y: height * 0.4 },
                'friend': { x: width * 0.3, y: height * 0.4 },
                'teacher': { x: width * 0.5, y: height * 0.4 },
                'kawamuro': { x: width * 0.7, y: height * 0.4 },
                'daichi': { x: width * 0.3, y: height * 0.4 },
                'naoki': { x: width * 0.5, y: height * 0.4 }
            };
            
            Object.keys(this.characterSprites).forEach(character => {
                const sprite = this.characterSprites[character];
                const position = characterPositions[character] || { x: width * 0.7, y: height * 0.4 };
                if (sprite && sprite.setPosition) {
                    sprite.setPosition(position.x, position.y);
                }
            });
        }
    }
} 