export class ConversationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConversationScene' });
        this.currentConversationIndex = 0;
        this.currentConversation = null;
        this.isTextAnimating = false;
        this.textSpeed = 30; // ms per character
        this.originalBgm = null; // 元のBGMを保存
        this.eventBgm = null; // イベント用BGM
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
        
        // 背景を設定（デフォルトは透明な背景）
        this.background = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5);
        this.background.setOrigin(0.5, 0.5);
        
        // 立ち絵用のコンテナ
        this.characterContainer = this.add.container(0, 0);
        
        // テキストボックスの設定（画像がない場合は黒い四角形で代替）
        if (this.textures.exists('textbox')) {
            this.textbox = this.add.image(width / 2, height - 60, 'textbox');
        } else {
            // 代替：黒い四角形を作成（スマホ対応）
            const textboxWidth = Math.min(width - 40, 700); // PCでは大きく、スマホでは小さく
            const textboxHeight = Math.min(150, height * 0.25); // 画面高の最大25%
            this.textbox = this.add.rectangle(width / 2, height - 60, textboxWidth, textboxHeight, 0x000000, 0.8);
        }
        this.textbox.setOrigin(0.5, 0.5);
        
        // 名前ボックスの設定（画像がない場合は黒い四角形で代替）
        if (this.textures.exists('namebox')) {
            this.namebox = this.add.image(width * 0.2, height - 100, 'namebox');
        } else {
            // 代替：黒い四角形を作成（スマホ対応）
            const nameboxWidth = Math.min(200, width * 0.4); // PCでは200px、スマホでは画面幅の40%
            const nameboxHeight = Math.min(50, height * 0.08); // 画面高の最大8%
            this.namebox = this.add.rectangle(width * 0.2, height - 100, nameboxWidth, nameboxHeight, 0x000000, 0.8);
        }
        this.namebox.setOrigin(0.5, 0.5);
        
        // テキスト表示用
        const textWrapWidth = Math.min(width - 80, 600); // PCでは大きく、スマホでは小さく
        const fontSize = width < 600 ? '18px' : '24px'; // スマホでは小さいフォント
        this.dialogText = this.add.text(width / 2, height - 60, '', {
            fontSize: fontSize,
            fill: '#ffffff',
            lineSpacing: 8,
            padding: { x: 10, y: 10 },
            wordWrap: { width: textWrapWidth, useAdvancedWrap: true }
        });
        this.dialogText.setOrigin(0.5, 0.5);
        
        // 名前表示用
        const nameFontSize = width < 600 ? '16px' : '20px'; // スマホでは小さいフォント
        this.nameText = this.add.text(width * 0.2, height - 100, '', {
            fontSize: nameFontSize,
            fill: '#ffffff',
            fontStyle: 'bold',
            padding: { x: 10, y: 10 }
        });
        this.nameText.setOrigin(0.5, 0.5);
        
        // クリックでテキスト進行（多重登録防止）
        this.input.removeAllListeners('pointerdown');
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
        
        // 背景を削除（初期状態に戻す）
        if (this.background) {
            this.background.destroy();
            this.background = null;
        }
    }

    // 会話開始
    startConversation(conversationData) {
        console.log('[ConversationScene] startConversation:', conversationData);
        this.currentConversation = conversationData;
        this.currentConversationIndex = 0;
        
        // 背景を変更
        this.updateBackground(conversationData.background);
        
        // イベント用BGMに切り替え
        this.switchToEventBgm(conversationData.bgm);
        
        this.showDialog();
    }

    // 次の会話に進む
    nextDialog() {
        console.log('[ConversationScene] nextDialog called', this.currentConversationIndex);
        if (this.isTextAnimating) {
            this.completeTextAnimation();
            return;
        }
        this.currentConversationIndex++;
        if (this.currentConversationIndex < this.currentConversation.conversations.length) {
            this.showDialog();
        } else {
            this.endConversation();
        }
    }

    // 会話表示
    showDialog() {
        const dialog = this.currentConversation.conversations[this.currentConversationIndex];
        console.log('[ConversationScene] showDialog', {
            index: this.currentConversationIndex,
            speaker: dialog?.speaker,
            text: dialog?.text,
            conversation: dialog
        });
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
                // 立ち絵は元のサイズで表示（引き延ばしなし）
                
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
            // 既存の背景を削除
            if (this.background) {
                this.background.destroy();
            }
            
            // 新しい背景画像を作成
            const width = this.sys?.game?.canvas?.width || this.sys?.game?.config?.width || 800;
            const height = this.sys?.game?.canvas?.height || this.sys?.game?.config?.height || 600;
            
            this.background = this.add.image(width / 2, height / 2, backgroundKey);
            this.background.setOrigin(0.5, 0.5);
            
            // スマホ画面に合わせて背景をスケール
            const scaleX = width / this.background.width;
            const scaleY = height / this.background.height;
            const scale = Math.max(scaleX, scaleY);
            this.background.setScale(scale);
            
            // 背景を最背面に移動
            this.background.setDepth(-1);
        }
    }
    
    // イベント用BGMに切り替え
    switchToEventBgm(eventBgmKey) {
        console.log('[ConversationScene] switchToEventBgm called:', eventBgmKey);
        const mainScene = this.scene.get('Stage1Scene') || this.scene.get('Stage2Scene') || this.scene.get('Stage3Scene');
        if (mainScene && mainScene.audioManager) {
            this.originalBgm = mainScene.audioManager.bgm;
            if (eventBgmKey) {
                mainScene.audioManager.playBgm(eventBgmKey, 0.3, true);
            } else {
                mainScene.audioManager.playBgm('bgm_event', 0.3, true);
            }
        }
    }

    // 元のBGMに戻す
    restoreOriginalBgm() {
        const mainScene = this.scene.get('Stage1Scene') || this.scene.get('Stage2Scene') || this.scene.get('Stage3Scene');
        if (mainScene && mainScene.audioManager) {
            mainScene.audioManager.stopBgm(false);
            const originalBgmKey = this.getOriginalBgmKey();
            if (originalBgmKey) {
                mainScene.audioManager.playBgm(originalBgmKey, 0.3, true);
            }
        }
    }

    // 元のBGMのキーを取得
    getOriginalBgmKey() {
        const mainScene = this.scene.get('Stage1Scene') || this.scene.get('Stage2Scene') || this.scene.get('Stage3Scene');
        if (mainScene) {
            if (mainScene.scene.key === 'Stage1Scene') {
                return 'bgm_kessen_diaruga';
            } else if (mainScene.scene.key === 'Stage2Scene') {
                return 'bgm_stage2';
            } else if (mainScene.scene.key === 'Stage3Scene') {
                return 'bgm_stage3';
            }
        }
        return 'bgm_kessen_diaruga'; // デフォルト
    }
    
    // 会話終了
    endConversation() {
        console.log('[ConversationScene] endConversation called', {
            index: this.currentConversationIndex,
            length: this.currentConversation?.conversations?.length,
            stack: new Error().stack
        });
        this.restoreOriginalBgm(); // イベント終了時にBGMを元に戻す
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
            const scaleX = width / this.background.width;
            const scaleY = height / this.background.height;
            const scale = Math.max(scaleX, scaleY);
            this.background.setScale(scale);
        }
        
        // テキストボックスのリサイズ（スマホ対応）
        if (this.textbox) {
            this.textbox.setPosition(width / 2, height - 60);
            const textboxWidth = Math.min(width - 40, 700);
            const textboxHeight = Math.min(150, height * 0.25);
            this.textbox.setDisplaySize(textboxWidth, textboxHeight);
        }
        
        // 名前ボックスのリサイズ（スマホ対応）
        if (this.namebox) {
            this.namebox.setPosition(width * 0.2, height - 100);
            const nameboxWidth = Math.min(200, width * 0.4);
            const nameboxHeight = Math.min(50, height * 0.08);
            this.namebox.setDisplaySize(nameboxWidth, nameboxHeight);
        }
        
        // テキストのリサイズ（スマホ対応）
        if (this.dialogText) {
            this.dialogText.setPosition(width / 2, height - 60);
            const textWrapWidth = Math.min(width - 80, 600);
            this.dialogText.setWordWrapWidth(textWrapWidth);
            
            // フォントサイズも調整
            const fontSize = width < 600 ? '18px' : '24px';
            this.dialogText.setFontSize(fontSize);
        }
        
        // 名前テキストのリサイズ（スマホ対応）
        if (this.nameText) {
            this.nameText.setPosition(width * 0.2, height - 100);
            
            // フォントサイズも調整
            const nameFontSize = width < 600 ? '16px' : '20px';
            this.nameText.setFontSize(nameFontSize);
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