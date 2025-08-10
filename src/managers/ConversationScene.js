export class ConversationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConversationScene' });
        this.currentConversationIndex = 0;
        this.currentConversation = null;
        this.isTextAnimating = false;
        this.textSpeed = 30; // ms per character
        this.originalBgm = null; // 元のBGMを保存
        this.eventBgm = null; // イベント用BGM
        this.nameboxLeftMargin = 30; // 左の固定マージン
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
            this.textbox = this.add.image(width / 2, height - 80, 'textbox'); // Y座標を調整
        } else {
            // 代替：黒い四角形を作成（ギャルゲ風デザイン）
            const textboxWidth = width - 60; // 画面幅から60px引いた幅を使用
            const textboxHeight = 90; // 固定の高さ
            this.textbox = this.add.rectangle(width / 2, height - 60, textboxWidth, textboxHeight, 0x000000, 0.9); // 透明度を上げて見やすく
            // ギャルゲ風の枠線を追加
            this.textbox.setStrokeStyle(2, 0xFFFFFF, 1.0);
        }
        this.textbox.setOrigin(0.5, 0.5);
        
        // 名前ボックスの設定（画像がない場合は黒い四角形で代替）
        if (this.textures.exists('namebox')) {
            this.namebox = this.add.image(this.nameboxLeftMargin, height - 123, 'namebox'); // 左固定
        } else {
            // 代替：黒い四角形を作成（ギャルゲ風デザイン）
            const nameboxWidth = Math.min(200, width * 0.3);
            const nameboxHeight = Math.min(30, height * 0.1);
            this.namebox = this.add.rectangle(this.nameboxLeftMargin, height - 123, nameboxWidth, nameboxHeight, 0x333333, 0.9); // 左固定
            // ギャルゲ風の枠線を追加
            this.namebox.setStrokeStyle(2, 0x888888, 0.8);
        }
        this.namebox.setOrigin(0, 0.5); // 左端基準
        
        // テキスト表示用（高さを動的に調整）
        const textWrapWidth = Math.min(width - 80, 600); // PCでは大きく、スマホでは小さく
        const fontSize = width < 600 ? '18px' : '24px'; // スマホでは小さいフォント
        this.dialogText = this.add.text(width * 0.1 + 20, height - 95, '', { // Y座標を調整
            fontSize: fontSize,
            fill: '#ffffff',
            lineSpacing: 8,
            padding: { x: 10, y: 10 },
            wordWrap: { width: textWrapWidth, useAdvancedWrap: true },
        });
        this.dialogText.setOrigin(0, 0);
        
        // 名前表示用
        const nameFontSize = width < 600 ? '16px' : '20px'; // スマホでは小さいフォント
        this.nameText = this.add.text(this.nameboxLeftMargin + (this.namebox.displayWidth || 0) / 2, height - 130, '', { // 名前ボックス中心に配置
            fontSize: nameFontSize,
            fill: '#ffffff',
            fontStyle: 'bold',
            padding: { x: 10, y: 10 },
            fixedHeight: 50
        });
        this.nameText.setOrigin(0.5, 0.2);
        
        // クリックでテキスト進行（多重登録防止）
        this.input.removeAllListeners('pointerdown');
        this.input.on('pointerdown', () => {
            this.nextDialog();
        });
        
        // スペースキーでも進行
        this.input.keyboard.on('keydown-SPACE', () => {
            this.nextDialog();
        });
        
        // 会話データが設定されている場合は開始
        if (this.currentConversation) {
            // this.showDialog(); // startConversationで呼ばれるので削除
        }
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
        this.currentConversation = conversationData;
        this.currentConversationIndex = 0;
        
        // 背景とBGMの設定
        if (conversationData.background) {
            this.updateBackground(conversationData.background);
        }
        
        if (conversationData.bgm) {
            this.switchToEventBgm(conversationData.bgm);
        }
        
        // 最初のダイアログを表示
        this.showDialog();
    }

    // 次の会話に進む
    nextDialog() {
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
        // ナレーション判定：speaker未指定 or characterがnarrator
        const isNarration = !dialog.speaker || dialog.character === 'narrator';

        // 立ち絵の表示/非表示制御
        if (isNarration) {
            // ナレーション時は全立ち絵を一時的に隠す
            if (this.characterSprites) {
                Object.values(this.characterSprites).forEach(sprite => {
                    if (sprite && sprite.setVisible) {
                        sprite.setVisible(false);
                    }
                });
            }
        } else {
            // 通常発話時は全立ち絵を表示状態に戻す（以降のdim処理は既存ロジックに委譲）
            if (this.characterSprites) {
                Object.values(this.characterSprites).forEach(sprite => {
                    if (sprite && sprite.setVisible) {
                        sprite.setVisible(true);
                    }
                });
            }
            this.updateCharacterSprite(dialog.character, dialog.expression);
        }

        // 名前の表示（ナレーション時は非表示）
        if (isNarration) {
            this.nameText.setText('');
            if (this.namebox) this.namebox.setVisible(false);
            if (this.nameText) this.nameText.setVisible(false);
        } else {
            if (this.namebox) this.namebox.setVisible(true);
            if (this.nameText) this.nameText.setVisible(true);
            this.nameText.setText(dialog.speaker || '');
            // 名前の長さに応じて名前ボックスの幅だけを調整（高さ・位置は固定）
            if (dialog.speaker) {
                this.adjustNameboxWidth(dialog.speaker);
            }
        }
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
        
        // テキストの長さに応じて表示高さを動的に調整
        this.adjustTextDisplayHeight(text);
        
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
    
    // テキストの表示高さは固定にする（テキストボックスは高さ90固定）
    // ここでは何も変更しないことで、見た目の安定性を担保する
    adjustTextDisplayHeight() {
        return;
    }

    // 名前ボックスの幅を動的に調整
    adjustNameboxWidth(speakerName) {
        if (!this.namebox || !this.nameText) return;
        
        // 画面幅から最大幅の上限を決定（広めに許可）
        const screenWidth = this.sys?.game?.canvas?.width || this.sys?.game?.config?.width || 800;
        
        // 名前の長さに応じて幅を計算（高さや位置は不変）
        const minWidth = 160; // 最小幅を広げる
        const maxWidth = Math.min(600, screenWidth * 0.6); // 最大幅を拡大
        const padding = 30; // 左右余白を拡大
        
        // 一時的に名前を設定して実際の幅を測定
        this.nameText.setText(speakerName);
        const textWidth = this.nameText.width;
        
        // 必要な幅を計算（余白を含む）
        const requiredWidth = Math.max(minWidth, Math.min(maxWidth, textWidth + padding));
        
        // 名前ボックスが画像の場合は位置のみ調整、四角形の場合はサイズも調整
        if (this.textures.exists('namebox')) {
            // 画像の場合は位置のみ調整（幅は画像のサイズに依存）
            // 必要に応じてスケールを調整することも可能
        } else {
            // 四角形の場合は幅のみ動的に調整（高さと位置は変更しない）
            const currentHeight = this.namebox.displayHeight;
            this.namebox.setDisplaySize(requiredWidth, currentHeight);
            
            // ギャルゲ風の枠線を再設定（視覚品質維持のため）
            this.namebox.setStrokeStyle(2, 0x888888, 0.8);
        }
        
        // 名前テキストは名前ボックスの中心に置く
        const nbWidth = this.namebox?.displayWidth || 0;
        const height = this.sys?.game?.canvas?.height || this.sys?.game?.config?.height || 600;
        this.nameText.setPosition(this.nameboxLeftMargin + nbWidth / 2, height - 130);
    }
    


    // テキストアニメーション完了
    completeTextAnimation() {
        if (this.currentTextTimer) {
            this.currentTextTimer.destroy();
        }
        
        const dialog = this.currentConversation.conversations[this.currentConversationIndex];
        this.dialogText.setText(dialog.text);
        
        // テキストの高さを再調整
        this.adjustTextDisplayHeight(dialog.text);
        
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
        // MapSelectionStageも含めて検索
        const mainScene = this.scene.get('Stage1Scene') || this.scene.get('Stage2Scene') || this.scene.get('Stage3Scene') || this.scene.get('MiemachiStage') || this.scene.get('TaketastageStage') || this.scene.get('JapanStage');
        
        if (mainScene && mainScene.audioManager) {
            this.originalBgm = mainScene.audioManager.bgm;
            if (eventBgmKey) {
                // AreaConfigで定義したBGMは 'bgm_' プレフィックス付きで読み込まれる
                // ただし、eventBgmKeyが既に 'bgm_' で始まっている場合は二重に付けない
                const bgmKey = eventBgmKey.startsWith('bgm_') ? eventBgmKey : `bgm_${eventBgmKey}`;
                mainScene.audioManager.playBgm(bgmKey, 0.3, true);
            } else {
                mainScene.audioManager.playBgm('bgm_event', 0.3, true);
            }
        }
    }

    // 元のBGMに戻す
    restoreOriginalBgm() {
        try {
            // MapSelectionStageも含めて検索
            const mainScene = this.scene.get('Stage1Scene') || this.scene.get('Stage2Scene') || this.scene.get('Stage3Scene') || this.scene.get('MiemachiStage') || this.scene.get('TaketastageStage') || this.scene.get('JapanStage');
            if (mainScene && mainScene.audioManager) {
                mainScene.audioManager.stopBgm(false);
                const originalBgmKey = this.getOriginalBgmKey();
                if (originalBgmKey) {
                    mainScene.audioManager.playBgm(originalBgmKey, 0.3, true);
                }
            }
        } catch (error) {
            // エラーは無視
        }
    }

    // 元のBGMのキーを取得
    getOriginalBgmKey() {
        // MapSelectionStageも含めて検索
        const mainScene = this.scene.get('Stage1Scene') || this.scene.get('Stage2Scene') || this.scene.get('Stage3Scene') || this.scene.get('MiemachiStage') || this.scene.get('TaketastageStage') || this.scene.get('JapanStage');
        if (mainScene) {
            if (mainScene.scene.key === 'Stage1Scene') {
                return 'bgm_map'; // Stage1Sceneの場合はmap BGMに戻す
            } else if (mainScene.scene.key === 'Stage2Scene') {
                return 'bgm_stage2';
            } else if (mainScene.scene.key === 'Stage3Scene') {
                return 'bgm_stage3';
            } else if (mainScene.scene.key === 'MiemachiStage' || mainScene.scene.key === 'TaketastageStage' || mainScene.scene.key === 'JapanStage') {
                return 'bgm_map'; // MapSelectionStageの場合はmap BGMに戻す
            }
        }
        return 'bgm_map'; // デフォルト
    }
    
    // 会話終了
    endConversation() {
        try {
            // BGMを元に戻す
            this.restoreOriginalBgm();
            
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
            
            // 元のシーンに戻る
            this.scene.stop();
            
        } catch (error) {
            console.error('[ConversationScene] Error in endConversation:', error);
            // エラーが発生しても強制的にシーンを停止
            try {
                this.scene.stop();
            } catch (stopError) {
                console.error('[ConversationScene] Error stopping scene:', stopError);
            }
        }
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
        
        // テキストボックスのリサイズ（createメソッドと同じロジック）
        if (this.textbox) {
            if (this.textures.exists('textbox')) {
                // 画像がある場合は位置のみ調整
                this.textbox.setPosition(width / 2, height - 60);
            } else {
                // 代替の四角形の場合はサイズと位置を調整
                const textboxWidth = width - 60;
                const textboxHeight = 90;
                this.textbox.setDisplaySize(textboxWidth, textboxHeight);
                this.textbox.setPosition(width / 2, height - 60);
                
                // ギャルゲ風の枠線を再設定
                this.textbox.setStrokeStyle(2, 0xFFFFFF, 1.0);
            }
        }
        
        // 名前ボックスのリサイズ（createメソッドと同じロジック）
        if (this.namebox) {
            if (this.textures.exists('namebox')) {
                // 画像がある場合は左マージン固定
                this.namebox.setPosition(this.nameboxLeftMargin, height - 123);
            } else {
                // 代替の四角形の場合は幅は計算し直すが高さは元の設定を保持、左は固定
                const nameboxWidth = Math.min(200, width * 0.3);
                const nameboxHeight = Math.min(30, height * 0.1);
                this.namebox.setDisplaySize(nameboxWidth, nameboxHeight);
                this.namebox.setPosition(this.nameboxLeftMargin, height - 123);
                
                // ギャルゲ風の枠線を再設定
                this.namebox.setStrokeStyle(2, 0x888888, 0.8);
            }
        }
        
        // テキストのリサイズ（createメソッドと同じロジック）
        if (this.dialogText) {
            const textWrapWidth = Math.min(width - 80, 600);
            const fontSize = width < 600 ? '18px' : '24px';
            
            this.dialogText.setPosition(width * 0.1 + 20, height - 80);
            this.dialogText.setWordWrapWidth(textWrapWidth);
            this.dialogText.setFontSize(fontSize);
        }
        
        // 名前テキストのリサイズ（createメソッドと同じロジック）
        if (this.nameText) {
            const nameFontSize = width < 600 ? '16px' : '20px';
            
            // 名前テキストは名前ボックスの中心に置く
            const nbWidth = this.namebox?.displayWidth || 0;
            this.nameText.setPosition(this.nameboxLeftMargin + nbWidth / 2, height - 130);
            this.nameText.setFontSize(nameFontSize);
            
            // 現在の名前がある場合は名前ボックスの幅も再調整
            if (this.nameText.text && this.nameText.text !== '') {
                this.adjustNameboxWidth(this.nameText.text);
            }
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
                'hirokazu': { x: width * 0.7, y: height * 0.4 },
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