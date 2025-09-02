

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
        
        // イベントBGM再生状態管理
        this._eventBgmStarted = false;
        this._originalBgmKey = null;
        this._eventHtmlBgm = null;
        this._pausedHtmlMapBgm = false;
        
        // 選択肢ボタン配列を初期化
        this.currentChoiceButtons = [];
        
        // ChoiceManagerのインスタンスを初期化
        this.choiceManager = null;
        
        // UIManagerを初期化
        this.uiManager = null;
        // この会話に選択肢が含まれていたかを記録
        this._hasAnyChoices = false;
    }

    init(data) {
        // audioManagerを受け取る
        this.audioManager = data.audioManager;
        
        // start() から渡された会話データを保持
        this._pendingConversation = data && data.conversations ? data.conversations : null;
        
        // 元のシーンのキーを保存（会話終了後に戻るため）
        this.originalSceneKey = data && data.originalSceneKey ? data.originalSceneKey : null;
        
        // エリア名を受け取る
        this.areaName = data && data.areaName ? data.areaName : null;
        
        // 現在の状態を受け取る（フロア、位置、マップ状態）
        this.currentState = data && data.currentState ? data.currentState : null;
        
        // 会話IDを受け取る
        this.conversationId = data && data.conversationId ? data.conversationId : null;
        
        // シーンキーを正規化（スペースを除去）
        if (this.originalSceneKey) {
            this.originalSceneKey = this.originalSceneKey.replace(/\s+/g, '');
        }
        

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
        const isPortrait = height > width;
        
        // 背景は後でstartConversationで設定されるため、ここでは設定しない
        
        // 立ち絵用のコンテナ
        this.characterContainer = this.add.container(0, 0);
        
        // UIManagerを初期化して会話終了ボタンを作成
        import('../managers/UIManager.js').then(({ UIManager }) => {
            this.uiManager = new UIManager(this);
            this.uiManager.createConversationBackButton(this);

        }).catch(error => {
            console.error('[ConversationScene] UIManager初期化エラー:', error);
        });
        
        // 会話イベント中の背景操作を無効化
        this.disableBackgroundInteraction();
        
        // テキストボックスの設定（画像がない場合は黒い四角形で代替）
        if (this.textures.exists('textbox')) {
            this.textbox = this.add.image(width / 2, height - 80, 'textbox'); // Y座標を調整
        } else {
            // 代替：黒い四角形を作成（ギャルゲ風デザイン）
            const textboxWidth = isPortrait ? (width - 20) : (width - 60); // 縦: 両端10px, 横: 従来どおり30px
            const textboxHeight = isPortrait ? 140 : 90; // 縦向きは4行分の高さを確保
            this.textbox = this.add.rectangle(width / 2, height - (isPortrait ? 70 : 60), textboxWidth, textboxHeight, 0x000000, 0.9); // 透明度を上げて見やすく
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
        // 会話ボックスより前面に
        try { if (this.textbox && this.textbox.depth !== undefined) this.namebox.setDepth(this.textbox.depth + 1); } catch (_) { /* ignore */ }
        // 見た目の装飾レイヤー（レイアウトは絶対に変更しない）
        this.createDecorationsForConversationUI();
        
        // テキスト表示用（高さを動的に調整）
        const leftPad = isPortrait ? 0 : 20; // 縦は左に20px寄せる → 左パディング0
        const rightPad = 20;                 // 右側は従来どおり20px
        const textWrapWidth = Math.min((this.textbox?.displayWidth || (width - 60)) - (leftPad + rightPad), 800); // ボックス内幅基準（横持ち対応）
        const fontSize = width < 600 ? '18px' : '22px'; // スマホでは小さいフォント
        // テキストはテキストボックスの左上から少し内側に配置
        const _boxW = this.textbox?.displayWidth || (width - 60);
        const _boxH = this.textbox?.displayHeight || (isPortrait ? 140 : 120); // 横持ち時の高さを増加
        const textX0 = (this.textbox?.x || width / 2) - _boxW / 2 + leftPad;
        const textY0 = (this.textbox?.y || (height - (isPortrait ? 70 : 60))) - _boxH / 2 + 7;
        this.dialogText = this.add.text(textX0, textY0, '', {
            fontSize: fontSize,
            fill: '#ffffff',
            lineSpacing: 8,
            padding: { x: 10, y: 10 },
            wordWrap: { width: textWrapWidth, useAdvancedWrap: true },
        });
        this.dialogText.setOrigin(0, 0);
        // 可読性向上のためのシャドウ（位置・サイズは不変）
        if (this.dialogText && this.dialogText.setShadow) {
            this.dialogText.setShadow(2, 2, '#000000', 4, false, true);
        }
        // テキストがボックスから飛び出さないようマスクを設定
        try {
            const maskLeft = (this.textbox?.x || width / 2) - _boxW / 2 + leftPad;
            const maskTop = textY0 - 10;
            const maskW = Math.max(1, (this.textbox?.displayWidth || (width - 60)) - (leftPad + rightPad));
            const maskH = Math.max(1, (this.textbox?.displayHeight || (isPortrait ? 140 : 90)) - 20);
            this._textMaskGraphics = this.add.graphics();
            this._textMaskGraphics.fillStyle(0xffffff, 1);
            this._textMaskGraphics.fillRect(maskLeft, maskTop, maskW, maskH);
            const geomMask = this._textMaskGraphics.createGeometryMask();
            this.dialogText.setMask(geomMask);
            // マスク用Graphicsは描画しない（真っ白に見えるのを防止）
            this._textMaskGraphics.setVisible(false);
        } catch (e) { /* ignore */ }
        
        // 名前表示用
        const nameFontSize = width < 600 ? '16px' : '20px'; // スマホでは小さいフォント
        this.nameText = this.add.text(this.nameboxLeftMargin + (this.namebox.displayWidth || 0) / 2, height - 130, '', { // 名前ボックス中心に配置
            fontSize: nameFontSize,
            fill: '#ffffff',
            fontStyle: 'bold',
            padding: { x: 10, y: 10 },
            fixedHeight: 50
        });
        // 名前は名前ボックス内に確実に収める（縦/横で原点Yを分ける）
        this.nameText.setOrigin(0.5, isPortrait ? 0.35 : 0.4);
        try { if (this.namebox && this.namebox.depth !== undefined) this.nameText.setDepth(this.namebox.depth + 1); } catch (_) { /* ignore */ }
        if (this.nameText && this.nameText.setShadow) {
            this.nameText.setShadow(1, 1, '#000000', 3, false, true);
        }
        // 初期表示で名前ボックス位置にテキストを追従
        try {
            const nbw = this.namebox?.displayWidth || 0;
            this.nameText.setPosition(this.nameboxLeftMargin + nbw / 2, this.namebox.y);
        } catch (_) { /* ignore */ }
        // 会話ボックスの上辺に沿って配置（縦横で被らないように）
        this._repositionNamebox(width, height);
        // 位置変更後に装飾も追従させる
        this.redrawNameboxDecorations && this.redrawNameboxDecorations();
        
        // クリックでテキスト進行（多重登録防止）
        this.input.removeAllListeners('pointerdown');
        this.input.on('pointerdown', () => {
            // 選択肢表示中は会話を進めない
            if (this.currentChoiceButtons && this.currentChoiceButtons.length > 0) {

                return;
            }
            this.nextDialog();
        });
        
        // スペースキーでも進行
        this.input.keyboard.on('keydown-SPACE', () => {
            this.nextDialog();
        });
        
        // 画面リサイズ/向き変更に対応（イベント会話中のUIずれ防止）
        try {
            if (!this._onResizeBound && this.scale && this.scale.on) {
                this.scale.on('resize', this.resize, this);
                this._onResizeBound = true;
            }
            // シーン終了時にリスナーを解除
            this.events.once('shutdown', () => {
                try { if (this._onResizeBound && this.scale && this.scale.off) this.scale.off('resize', this.resize, this); } catch(_) { /* ignore */ }
                this._onResizeBound = false;
            });
        } catch (_) { /* ignore */ }

        // start() からデータが渡されている場合はここで開始

        if (this._pendingConversation) {
            try {

                this.startConversation(this._pendingConversation);
            } catch (e) {
                console.error('[ConversationScene] pending conversation start error:', e);
            }
            this._pendingConversation = null;
        } 
    }
    
    // 会話を中断して元のシーンに戻る
    interruptConversation() {
        try {
            // イベントBGMを確実に停止（2重再生防止）
            try {
                if (this._eventHtmlBgm) {

                    this._eventHtmlBgm.pause();
                    this._eventHtmlBgm = null;
                }
            } catch (e) {
                console.warn('[ConversationScene] イベントBGM停止エラー:', e);
            }
            
            // BGMを元に戻す
            this.restoreOriginalBgm();
            
            // スプライトをクリーンアップ
            this.cleanupCharacterSprites();
            
            // 戻るボタンをクリーンアップ
            this.cleanupBackButton();
            
            // テキストアニメーションタイマーをクリーンアップ
            if (this.currentTextTimer) {
                this.currentTextTimer.destroy();
                this.currentTextTimer = null;
            }
            
            // UI要素をリセット（削除はしない）
            this.resetUI();
            
            // 会話中断イベントを発火
            this.events.emit('conversationInterrupted');
            
            // ConversationTriggerのフラグもリセット
            try {
                const mainScene = this.scene.get('MiemachiStage') || this.scene.get('TaketastageStage') || this.scene.get('JapanStage');
                if (mainScene && mainScene.conversationTrigger) {
                    mainScene.conversationTrigger.isConversationActive = false;

                }
            } catch (e) {
                console.warn('[ConversationScene] ConversationTriggerフラグリセットエラー:', e);
            }
            
            // 元のシーンに戻る（新しく作成したメソッドを使用）
            this.returnToOriginalScene();
            
        } catch (error) {
            console.error('[ConversationScene] Error in interruptConversation:', error);
            // エラーが発生しても強制的にシーンを停止
            try {
                this.returnToOriginalScene();
            } catch (stopError) {
                console.error('[ConversationScene] Error returning to original scene:', stopError);
            }
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
        // 装飾レイヤーを削除
        if (this.textboxDecoFrame) { this.textboxDecoFrame.destroy(); this.textboxDecoFrame = null; }
        if (this.textboxDecoShine) { this.textboxDecoShine.destroy(); this.textboxDecoShine = null; }
        if (this.nameboxDecoFrame) { this.nameboxDecoFrame.destroy(); this.nameboxDecoFrame = null; }
        if (this.nameboxDecoShine) { this.nameboxDecoShine.destroy(); this.nameboxDecoShine = null; }
    }

    // =========================
    // 装飾レイヤー（見た目のみ強化）
    // =========================
    createDecorationsForConversationUI() {
        this.redrawTextboxDecorations();
        this.redrawNameboxDecorations();
    }

    redrawTextboxDecorations() {
        if (!this.textbox) return;
        const w = this.textbox.displayWidth || this.textbox.width || 0;
        const h = this.textbox.displayHeight || this.textbox.height || 0;
        const left = (this.textbox.x || 0) - w / 2;
        const top = (this.textbox.y || 0) - h / 2;
        const radius = Math.max(8, Math.min(20, Math.floor(h / 3)));

        // フレーム（縁取り・角飾り）
        if (!this.textboxDecoFrame) this.textboxDecoFrame = this.add.graphics();
        const g = this.textboxDecoFrame;
        g.clear();
        // 外枠（柔らかいピンク）
        g.lineStyle(3, 0xffb7d5, 0.9);
        g.strokeRoundedRect(left - 4, top - 4, w + 8, h + 8, radius + 6);
        // 内枠（淡い水色）
        g.lineStyle(2, 0xc5d8ff, 0.9);
        g.strokeRoundedRect(left + 2, top + 2, w - 4, h - 4, Math.max(6, radius - 4));
        // 角飾り（小さな円）
        g.fillStyle(0xffe6f2, 0.95);
        const dotR = 3;
        g.fillCircle(left + 10, top + 10, dotR);
        g.fillCircle(left + w - 10, top + 10, dotR);
        g.fillCircle(left + 10, top + h - 10, dotR);
        g.fillCircle(left + w - 10, top + h - 10, dotR);

        // 上部ハイライト（光沢）
        if (!this.textboxDecoShine) this.textboxDecoShine = this.add.graphics();
        const s = this.textboxDecoShine;
        s.clear();
        s.fillStyle(0xffffff, 0.10);
        const shineH = Math.max(8, Math.floor(h * 0.22));
        s.fillRoundedRect(left + 6, top + 6, w - 12, shineH, Math.max(4, radius - 6));
    }

    redrawNameboxDecorations() {
        if (!this.namebox) return;
        const w = this.namebox.displayWidth || this.namebox.width || 0;
        const h = this.namebox.displayHeight || this.namebox.height || 0;
        const left = (this.namebox.x || 0);
        const top = (this.namebox.y || 0) - h / 2;
        const radius = Math.max(6, Math.min(14, Math.floor(h / 2)));

        // フレーム
        if (!this.nameboxDecoFrame) this.nameboxDecoFrame = this.add.graphics();
        const g = this.nameboxDecoFrame;
        g.clear();
        // 外枠（ラベンダー）
        g.lineStyle(2, 0xc8b6ff, 0.9);
        g.strokeRoundedRect(left - 6, top - 4, w + 12, h + 8, radius + 4);
        // 内枠（ピンク）
        g.lineStyle(2, 0xffb7d5, 0.9);
        g.strokeRoundedRect(left + 1, top + 1, w - 2, h - 2, Math.max(4, radius - 2));
        // サイドの小飾り
        g.fillStyle(0xffe6f2, 0.95);
        g.fillCircle(left + 6, top + h / 2, 2.5);
        g.fillCircle(left + w - 6, top + h / 2, 2.5);

        // ハイライト
        if (!this.nameboxDecoShine) this.nameboxDecoShine = this.add.graphics();
        const s = this.nameboxDecoShine;
        s.clear();
        s.fillStyle(0xffffff, 0.12);
        const shineH = Math.max(4, Math.floor(h * 0.4));
        s.fillRoundedRect(left + 4, top + 3, w - 8, shineH, Math.max(3, radius - 3));
    }

    // 会話開始
    startConversation(conversationData) {
        this.currentConversation = conversationData;
        this.currentConversationIndex = 0;
        
        // 選択肢フラグを初期化
        this._hasAnyChoices = false;
        
        // エリア名を設定
        if (this.areaName) {
            this.currentConversation.areaName = this.areaName;

        }
        
        // 会話開始イベントを発火
        this.events.emit('conversationStarted');
        
        // 現在再生中のBGMキーを覚える（会話終了後に復元するため）
        try {
            const mainScene = this.scene.get('mie_high_school') || this.scene.get('TaketastageStage') || this.scene.get('JapanStage');
            if (mainScene && mainScene.audioManager && mainScene.audioManager.bgm) {
                this._originalBgmKey = mainScene.audioManager.bgm.key;

            }
        } catch (e) {
            console.warn('[ConversationScene] 元のBGMキー取得エラー:', e);
        }
        
        // 背景とBGMの設定

        if (conversationData.background) {
            this.updateBackground(conversationData.background);
        }
        

        if (conversationData.bgm) {
            this.switchToEventBgm(conversationData.bgm);
        }

        // マップBGMの自動再開を抑制（MapSelectionStage側のリトライを止める）
        try {
            const mapScene = this.scene.get('mie_high_school') || this.scene.get('TaketastageStage') || this.scene.get('JapanStage');
            if (mapScene) {
                mapScene._suppressMapBgm = true;
                if (mapScene._bgmRetry && mapScene._bgmRetry.remove) {
                    try { mapScene._bgmRetry.remove(false); } catch (e) { /* ignore */ }
                    mapScene._bgmRetry = null;
                }
                // iOSのHTMLAudioも念のため一時停止
                try { if (mapScene._htmlBgm && !mapScene._htmlBgm.paused) mapScene._htmlBgm.pause(); } catch (e) { /* ignore */ }
            }
        } catch (e) { /* ignore */ }
        
        // 最初のダイアログを表示
        this.showDialog();
    }

    // 次の会話に進む
    nextDialog() {
        console.log('[ConversationScene] nextDialog開始:', {
            currentIndex: this.currentConversationIndex,
            totalLength: this.currentConversation.conversations.length
        });
        if (this.isTextAnimating) {
            this.completeTextAnimation();
            return;
        }
        
        // 選択肢表示中は会話を進めない
        if (this.currentChoiceButtons && this.currentChoiceButtons.length > 0) {

            return;
        }
        
        this.currentConversationIndex++;
        if (this.currentConversationIndex < this.currentConversation.conversations.length) {
            this.showDialog();
        } else {
            console.log('[ConversationScene] 会話終了、endConversation呼び出し');
            this.endConversation();
        }
    }

    // 会話表示
    showDialog() {
        console.log('[ConversationScene] showDialog開始:', {
            currentIndex: this.currentConversationIndex,
            totalLength: this.currentConversation.conversations.length
        });
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
            // 人数に応じた等間隔レイアウト
            this.layoutVisibleCharacters();
        }

        // 名前の表示（ナレーション時は非表示）
        if (isNarration) {
            this.nameText.setText('');
            if (this.namebox) this.namebox.setVisible(false);
            if (this.nameText) this.nameText.setVisible(false);
            if (this.nameboxDecoFrame) this.nameboxDecoFrame.setVisible(false);
            if (this.nameboxDecoShine) this.nameboxDecoShine.setVisible(false);
        } else {
            if (this.namebox) this.namebox.setVisible(true);
            if (this.nameText) this.nameText.setVisible(true);
            this.nameText.setText(dialog.speaker || '');
            // 名前の長さに応じて名前ボックスの幅だけを調整（高さ・位置は固定）
            if (dialog.speaker) {
                this.adjustNameboxWidth(dialog.speaker);
            }
        }
        // テキストのアニメーション表示（テキストが空の場合は非表示）
        if (dialog.text && dialog.text.trim() !== '') {
            this.animateText(dialog.text);
            // テキストボックスを表示
            if (this.textbox) {
                this.textbox.setVisible(true);
                // 枠線を復活
                this.textbox.setStrokeStyle(2, 0xFFFFFF, 1.0);
            }
            if (this.dialogText) {
                this.dialogText.setVisible(true);
            }
            // 名前ボックスも表示
            if (this.namebox) {
                this.namebox.setVisible(true);
                // 枠線を復活
                this.namebox.setStrokeStyle(2, 0x888888, 0.8);
            }
            if (this.nameText) {
                this.nameText.setVisible(true);
            }
            
            // 装飾（青とピンクの枠線）も表示
            if (this.textboxDecoFrame) {
                this.textboxDecoFrame.setVisible(true);
            }
            if (this.textboxDecoShine) {
                this.textboxDecoShine.setVisible(true);
            }
            if (this.nameboxDecoFrame) {
                this.nameboxDecoFrame.setVisible(true);
            }
            if (this.nameboxDecoShine) {
                this.nameboxDecoShine.setVisible(true);
            }
        } else {
            // テキストが空の場合はテキストボックスと名前ボックスを非表示
            if (this.textbox) {
                this.textbox.setVisible(false);
                // 枠線も削除
                this.textbox.setStrokeStyle(0, 0x000000, 0);
            }
            if (this.dialogText) {
                this.dialogText.setVisible(false);
            }
            if (this.namebox) {
                this.namebox.setVisible(false);
                // 枠線も削除
                this.namebox.setStrokeStyle(0, 0x000000, 0);
            }
            if (this.nameText) {
                this.nameText.setVisible(false);
            }
            
            // 装飾（青とピンクの枠線）も非表示
            if (this.textboxDecoFrame) {
                this.textboxDecoFrame.setVisible(false);
            }
            if (this.textboxDecoShine) {
                this.textboxDecoShine.setVisible(false);
            }
            if (this.nameboxDecoFrame) {
                this.nameboxDecoFrame.setVisible(false);
            }
            if (this.nameboxDecoShine) {
                this.nameboxDecoShine.setVisible(false);
            }
        }
        
        // 背景変更処理を追加
        if (dialog.background) {
            this.updateBackground(dialog.background);
        }
        
        // 立ち絵リセット機能を追加
        if (dialog.speaker === 'reset') {

            this.cleanupCharacterSprites();
            // リセット後にキャラクターを表示
            if (dialog.character && dialog.expression) {

                this.updateCharacterSprite(dialog.character, dialog.expression);
                if (this.characterContainer) {
                    this.characterContainer.setVisible(true);

                } else {
                    console.warn('[ConversationScene] characterContainerがnullです');
                }
            } else {
                console.warn('[ConversationScene] reset後、characterまたはexpressionが指定されていません');
            }
            // returnを削除して、SE再生処理も実行されるようにする
        }
        
        // 立ち絵の表示/非表示を制御
        if (dialog.speaker === 'narrator') {
            // narratorの場合は立ち絵を非表示（背景画像だけを表示）
            if (this.characterContainer) {
                this.characterContainer.setVisible(false);
            }
        } else if (dialog.character && dialog.expression) {
            // キャラクターと表情が指定されている場合は立ち絵を表示
            this.updateCharacterSprite(dialog.character, dialog.expression);
            if (this.characterContainer) {
                this.characterContainer.setVisible(true);
            }
        } else {
            // その他の場合は立ち絵を表示
            if (this.characterContainer) {
                this.characterContainer.setVisible(true);
            }
        }
        
        // SE再生処理を追加
        if (dialog.se) {
            this.playDialogSE(dialog.se);
        }
        
        // 選択肢処理を追加
        if (dialog.type === 'choice') {
            // 会話内に選択肢が存在することを記録
            this._hasAnyChoices = true;
            this.showChoices(dialog.choices, dialog.choiceId);
        }
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
            const spriteKey = this.resolveExistingSpriteKey(character, expression);

            if (!spriteKey) {
                console.warn('[ConversationScene] no spriteKey found, returning');
                return; // 利用可能なテクスチャがない場合は表示しない
            }
            const width = this.sys?.game?.canvas?.width || this.sys?.game?.config?.width || 800;
            const height = this.sys?.game?.canvas?.height || this.sys?.game?.config?.height || 600;
            
            // 位置は layoutVisibleCharacters で一括調整するため一旦中央付近
            let position = { x: width * 0.5, y: height * 0.4 };
            
            // 既存のキャラクターがいる場合は、テクスチャのみ変更
            if (this.characterSprites[character]) {
                const existingSprite = this.characterSprites[character];
                // テクスチャが変更されている場合のみ更新
                if (existingSprite.texture.key !== spriteKey) {
                    existingSprite.setTexture(spriteKey);
                    // テクスチャ変更時にもスケールを再計算
                    this.applyPortraitScale(existingSprite);
                }
            } else {
                // 新しいスプライトを作成（最初から正しい位置で作成）
                const sprite = this.add.image(position.x, position.y, spriteKey);
                sprite.setOrigin(0.5, 0.5);
                // 立ち絵を画面サイズに合わせて自然に収まるスケールへ
                const targetScale = this.getPortraitTargetScale(sprite.width, sprite.height);
                // フルサイズに近い場合はY位置を中央に補正（上が欠けないように）
                const scaledHeight = sprite.height * targetScale;
                if (scaledHeight >= (height * 0.95)) {
                    position = { ...position, y: height * 0.5 };
                    sprite.setPosition(position.x, position.y);
                }
                sprite.setAlpha(0);
                sprite.setScale(Math.max(0.1, targetScale * 0.9));
                this.characterContainer.add(sprite);
                this.characterSprites[character] = sprite;
                
                // 立ち絵の登場アニメーション
                this.tweens.add({
                    targets: sprite,
                    alpha: 1,
                    scaleX: targetScale,
                    scaleY: targetScale,
                    duration: 500,
                    ease: 'Power2'
                });
            }
            
            // 話していないキャラクターを少し暗くする
            this.dimOtherCharacters(character);
        }
    }

    // 利用可能なテクスチャキーを解決（希望の表情が無ければフォールバック）
    resolveExistingSpriteKey(character, preferredExpression) {

        const tryList = [];
        // まずは希望の表情
        tryList.push({ ch: character, ex: preferredExpression });
        // よく使う順でフォールバック
        const fallbacks = ['L','A','B','C','D','E','F','G','H','I','J','K','M','N','R','S'];
        fallbacks.forEach(ex => { if (ex !== preferredExpression) tryList.push({ ch: character, ex }); });
        // 若年キャラはベース名にもフォールバック（例: hirokazu_young → hirokazu）
        if (/_young$/.test(character)) {
            const base = character.replace(/_young$/, '');
            tryList.push({ ch: base, ex: preferredExpression });
            fallbacks.forEach(ex => { if (ex !== preferredExpression) tryList.push({ ch: base, ex }); });
        }
        // 実在する最初のキーを返す
        for (const { ch, ex } of tryList) {
            const key = `${ch}_${ex}`;

            if (this.textures && this.textures.exists && this.textures.exists(key)) {

                return key;
            }
        }

        return null;
    }

    // 可視スプライトを人数に応じて配置
    // 横画面: 現行の等間隔1列配置（変更なし）
    // 縦画面: 2段配置（上3 / 下3）。人数に応じて縮小率を強める
    layoutVisibleCharacters() {
        if (!this.characterSprites) return;
        const sprites = Object.values(this.characterSprites).filter(s => s && s.visible !== false);
        const count = sprites.length;
        if (count === 0) return;

        const width = this.sys?.game?.canvas?.width || this.sys?.game?.config?.width || 800;
        const height = this.sys?.game?.canvas?.height || this.sys?.game?.config?.height || 600;

        const isPortrait = height > width;

        // 縦画面: 2段レイアウト
        if (isPortrait) {
            // 表示位置（テキスト/名前ボックスは既存のままなので避ける）
            const topY = Math.floor(height * 0.32);
            const bottomY = Math.floor(height * 0.58);
            const leftMargin = width * 0.10;
            const rightMargin = width * 0.90;

            // 人数に応じた縮小係数（小さめ）
            const scaleFactor = count <= 2 ? 0.80 : (count <= 3 ? 0.75 : 0.65);

            // 下段に最大3人、その後は上段（下から増やす）
            const bottomCount = Math.min(3, count);
            const topCount = Math.max(0, count - bottomCount);

            const rowPositions = (n) => {
                if (n <= 0) return [];
                if (n === 1) return [width * 0.5];
                if (n === 2) return [width * 0.35, width * 0.65];
                // 3人は左右余白を取って均等配置
                const span = rightMargin - leftMargin;
                return [0, 1, 2].slice(0, n).map(i => leftMargin + (span * (i / (n - 1))));
            };

            const topXs = rowPositions(topCount);
            const bottomXs = rowPositions(bottomCount);

            const bottomRow = [];
            const topRow = [];
            sprites.forEach((sprite, idx) => {
                const baseScale = this.getPortraitTargetScale(sprite.width, sprite.height);
                const finalScale = baseScale * scaleFactor;
                if (idx < bottomCount) {
                    sprite.setPosition(bottomXs[idx], bottomY);
                    bottomRow.push(sprite);
                } else {
                    const j = idx - bottomCount;
                    sprite.setPosition(topXs[j], topY);
                    topRow.push(sprite);
                }
                sprite.setScale(finalScale);
            });
            // コンテナ内の描画順は子インデックスで決まるため、下段キャラを前面に移動
            try {
                bottomRow.forEach(s => {
                    try { this.characterContainer.bringToTop(s); } catch (_) { /* ignore */ }
                });
            } catch (_) { /* ignore */ }
            return;
        }

        // 横画面: 既存ロジック（等間隔で中央基準の1列配置）
        const marginLeft = width * 0.08;
        const marginRight = width * 0.92;
        const centerX = width * 0.5;

        const scales = sprites.map(s => this.getPortraitTargetScale(s.width, s.height));
        const scaledWidths = sprites.map((s, i) => s.width * scales[i]);
        const maxScaledWidth = Math.max.apply(null, scaledWidths);
        let spacing = maxScaledWidth * 1.05;
        const available = (marginRight - marginLeft);
        if (count > 1) spacing = Math.min(spacing, available / (count - 1));

        const positions = new Array(count);
        const mid = (count - 1) / 2;
        for (let i = 0; i < count; i++) {
            const offsetIndex = i - mid;
            positions[i] = centerX + offsetIndex * spacing;
        }
        const minX = marginLeft;
        const maxX = marginRight;
        const first = positions[0];
        const last = positions[count - 1];
        let shift = 0;
        if (first < minX) shift = minX - first;
        if (last > maxX) shift = Math.min(shift, maxX - last);
        if (shift !== 0) {
            for (let i = 0; i < count; i++) positions[i] += shift;
        }

        sprites.forEach((sprite, idx) => {
            const targetScale = scales[idx];
            const scaledHeight = sprite.height * targetScale;
            const yBase = scaledHeight >= (height * 0.95) ? height * 0.5 : height * 0.4;
            // 横画面時はキャラクターを少しだけ上へ（約30px）
            const y = Math.max(0, yBase - 30);
            sprite.setPosition(positions[idx], y);
            this.applyPortraitScale(sprite);
        });
    }

    // 立ち絵が画面いっぱいに収まる目標スケールを算出（拡大も許可）
    getPortraitTargetScale(textureWidth, textureHeight) {
        const width = this.sys?.game?.canvas?.width || this.sys?.game?.config?.width || 800;
        const height = this.sys?.game?.canvas?.height || this.sys?.game?.config?.height || 600;
        // 画像キャンバス全体を画面に収める（余白込み）
        const maxDisplayHeight = Math.max(1, height);
        const maxDisplayWidth = Math.max(1, width);
        const scaleByHeight = maxDisplayHeight / Math.max(1, textureHeight);
        const scaleByWidth = maxDisplayWidth / Math.max(1, textureWidth);
        const target = Math.min(scaleByHeight, scaleByWidth);
        // 要望に合わせて拡大も許可（1でクランプしない）
        return target;
    }

    // 既存スプライトに目標スケールを適用
    applyPortraitScale(sprite) {
        if (!sprite || !sprite.texture) return;
        const texWidth = sprite.width;   // 現在のテクスチャ本来の幅（スケール前）
        const texHeight = sprite.height; // 現在のテクスチャ本来の高さ（スケール前）
        const targetScale = this.getPortraitTargetScale(texWidth, texHeight);
        sprite.setScale(targetScale);
    }
    
    // 他のキャラクターを暗くする
    dimOtherCharacters(activeCharacter) {
        if (this.characterSprites) {
            Object.keys(this.characterSprites).forEach(charKey => {
                const sprite = this.characterSprites[charKey];
                if (charKey === activeCharacter) {
                    sprite.setTint(0xFFFFFF); // 通常の色
                    sprite.setAlpha(1.0); // 完全に不透明
                    // 光らせるエフェクトを追加
                    sprite.setScale(sprite.scaleX * 1.05, sprite.scaleY * 1.05); // 少し大きく
                    // 光るアニメーション
                    this.tweens.add({
                        targets: sprite,
                        alpha: 0.9,
                        duration: 800,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                } else {
                    sprite.setTint(0x666666); // より暗くする
                    sprite.setAlpha(0.6); // 半透明にする
                    sprite.setScale(sprite.scaleX / 1.05, sprite.scaleY / 1.05); // 元のサイズに戻す
                    // 光るアニメーションを停止
                    this.tweens.killTweensOf(sprite);
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
        
        // 名前テキストは名前ボックスの中心に置く（nameboxの現在位置に追従）
        const nbWidth = this.namebox?.displayWidth || 0;
        this.nameText.setPosition(this.nameboxLeftMargin + nbWidth / 2, this.namebox.y);
        // 見た目だけを再描画（レイアウトは不変）
        this.redrawNameboxDecorations && this.redrawNameboxDecorations();
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
            
            // 画面全体を確実にカバー（縦画面優先で高さフィット、横は従来通りカバー）
            this._fitConversationBackground();
            
            // 背景を最背面に移動
            this.background.setDepth(-1);
        }
    }

    // 背景画像を画面いっぱいにフィットさせる（歪みなし）
    _fitConversationBackground() {
        if (!this.background) return;
        const canvasW = this.sys?.game?.canvas?.width || this.sys?.game?.config?.width || 800;
        const canvasH = this.sys?.game?.canvas?.height || this.sys?.game?.config?.height || 600;
        // 元画像サイズ（スケール適用前）を取得
        const tex = this.background.texture;
        const src = tex && tex.getSourceImage ? tex.getSourceImage() : null;
        const imgW = (src && src.width) || this.background.width;
        const imgH = (src && src.height) || this.background.height;
        // まずスケールをリセットし、正しい比率で再計算
        this.background.setScale(1);
        const scaleY = canvasH / imgH;
        const scaleX = canvasW / imgW;
        // 常にカバー（はみ出してもOK）
        const scale = Math.max(scaleX, scaleY);
        this.background.setScale(scale);
        this.background.setPosition(canvasW / 2, canvasH / 2);
    }
    
    // イベントBGMに切り替え
    async switchToEventBgm(eventBgmKey) {


        // 元のBGMを停止
        this.stopOriginalBgm();

        // イベントBGMを再生（AudioManager経由）
        if (eventBgmKey && this.audioManager) {
            const result = await this.audioManager.playConversationBgm(eventBgmKey, undefined, true);
            if (result) {
                this._eventBgmStarted = true;
                
                // AudioManagerから現在再生中のBGMオブジェクトを取得して保存
                if (this.audioManager.bgm) {
                    this._eventHtmlBgm = this.audioManager.bgm;

                } else {
                    console.warn('[ConversationScene] AudioManagerからBGMオブジェクトが取得できません');
                }
                

            } else {
                console.warn('[ConversationScene] イベントBGM開始失敗:', eventBgmKey);
            }
        }
    }

    // 元のBGMを停止するヘルパーメソッド
    stopOriginalBgm() {
        try {
            const mainScene = this.scene.get('Stage1Scene') || this.scene.get('Stage2Scene') ||
                             this.scene.get('Stage3Scene') || this.scene.get('MiemachiStage') ||
                             this.scene.get('TaketastageStage') || this.scene.get('JapanStage');

            if (mainScene && mainScene.audioManager) {
                mainScene.audioManager.stopBgm(false);
            }

            // iOS用HTMLAudioの停止
            if (mainScene && mainScene._htmlBgm) {
                mainScene._htmlBgm.pause();
                this._pausedHtmlMapBgm = true;
            }
        } catch (error) {
            console.warn('[ConversationScene] stopOriginalBgm error:', error);
        }
    }



    // 非同期で元のBGMキーを取得
    async getOriginalBgmKeyAsync(mainScene) {
        try {
            if (mainScene && mainScene.audioManager) {
                const defaultKey = await mainScene.audioManager.getDefaultBgmKey();
                this._originalBgmKey = defaultKey;

            }
        } catch (error) {
            console.warn('[ConversationScene] 非同期BGMキー取得エラー:', error);
            // フォールバック: 基本的なBGMキー
            this._originalBgmKey = 'bgm_default';
        }
    }

    // 元のBGMに戻す（ハードコードせず、会話開始前に覚えたキーで復帰）
    async restoreOriginalBgm() {

        try {
            // まず、現在のイベントBGMを確実に停止
            try {
                // 保存されたイベントBGMを停止
                if (this._eventHtmlBgm) {

                    this._eventHtmlBgm.pause();
                    this._eventHtmlBgm = null;
                }
                
                // AudioManagerから直接現在のBGMを停止
                if (this.audioManager && this.audioManager.bgm) {

                    this.audioManager.bgm.pause();
                    this.audioManager.bgm = null;
                }
                
                if (this._eventBgmStarted) {
                    this._eventBgmStarted = false;

                }
            } catch (e) {
                console.warn('[ConversationScene] イベントBGM停止エラー:', e);
            }
            
            // 元のシーンのキーが設定されている場合は、そのシーンからBGMを復元
            if (this.originalSceneKey) {
                const sceneManager = this.scene.manager;
                if (sceneManager) {
                    const originalScene = sceneManager.getScene(this.originalSceneKey);
                    if (originalScene && originalScene.audioManager) {

                        
                        // 元のシーンのBGMを再開（正しいキーを動的取得）
                        try {
                            const resumeKey = await originalScene.audioManager.getDefaultBgmKey();
                            originalScene.audioManager.playBgm(resumeKey, undefined, true);

                        } catch (error) {
                            console.warn('[ConversationScene] BGM再開エラー:', error);
                        }
                        
                        // マップBGM抑制フラグを解除
                        try { originalScene._suppressMapBgm = false; } catch (e) { /* ignore */ }
                    }
                }
            } else {
                // フォールバック: 従来の方法
                const mainScene = this.scene.get('Stage1Scene') || this.scene.get('Stage2Scene') || this.scene.get('Stage3Scene') || this.scene.get('MiemachiStage') || this.scene.get('TaketastageStage') || this.scene.get('JapanStage') || this.scene.get('taketa_highschool') || this.scene.get('mie_high_school');
                if (mainScene && mainScene.audioManager) {
                    // マップBGMを再開
                    try { 

                        const resumeKey = await mainScene.audioManager.getDefaultBgmKey();
                        mainScene.audioManager.playBgm(resumeKey, undefined, true);
                    } catch (error) { 
                        console.warn('[ConversationScene] マップBGM再開失敗:', error);
                    }
                    
                    // マップBGM抑制フラグを解除
                    try { mainScene._suppressMapBgm = false; } catch (e) { /* ignore */ }
                }
            }
        } catch (error) {
            console.error('[ConversationScene] restoreOriginalBgm エラー:', error);
        }

    }
    
    // 会話終了
    async endConversation() {
        console.log('[ConversationScene] endConversation開始');
        try {

            
            // 会話終了イベントを発火（ローカル）
            this.events.emit('conversationEnded');

            // StageScene へ会話結果を通知し、吹き出し等を再評価してもらう
            try {
                console.log('[ConversationScene] 会話結果通知開始');
                const sceneManager = this.scene.manager;
                const originalScene = this.originalSceneKey ? sceneManager.getScene(this.originalSceneKey) : null;
                console.log('[ConversationScene] originalScene:', originalScene ? '見つかった' : '見つからない', this.originalSceneKey);

                let cleared = false;
                let hasChoices = !!this._hasAnyChoices;

                // ChoiceManagerから正解判定（存在すれば）
                if (hasChoices) {
                    try {
                        // ChoiceManagerのシングルトンインスタンスを使用
                        if (!this.choiceManager) {
                            if (window.ChoiceManager) {
                                this.choiceManager = window.ChoiceManager.getInstance();
                            } else {
                                const mod = await import('../managers/ChoiceManager.js');
                                this.choiceManager = mod.ChoiceManager.getInstance();
                            }
                        }
                        if (this.choiceManager && this.conversationId) {
                            cleared = !!this.choiceManager.isEventCleared(this.conversationId);
                            console.log('[ConversationScene] 選択肢ありイベント判定:', {
                                conversationId: this.conversationId,
                                cleared: cleared,
                                choices: this.choiceManager.choices[this.conversationId]
                            });
                        }
                    } catch (e) {
                        console.warn('[ConversationScene] ChoiceManager判定失敗:', e);
                    }
                } else {
                    cleared = true; // 選択肢なしは正解扱い
                    console.log('[ConversationScene] 選択肢なしイベント:', { conversationId: this.conversationId, cleared });
                }

                // 選択肢無しイベントのみ、完了＝緑を保存
                if (!hasChoices && this.conversationId) {
                    try { 
                        localStorage.setItem('event_completed_' + this.conversationId, 'true'); 
                    } catch (_) {
                        // localStorageの保存に失敗した場合は無視
                    }
                }

                if (originalScene && originalScene.events && this.conversationId) {
                    console.log('[ConversationScene] conversation-endedイベント発火:', {
                        eventId: this.conversationId,
                        cleared,
                        hasChoices
                    });
                    originalScene.events.emit('conversation-ended', {
                        eventId: this.conversationId,
                        cleared,
                        hasChoices
                    });
                }
            } catch (e) {
                console.warn('[ConversationScene] 会話結果通知エラー:', e);
            }

            
            // エリアを完了済みに設定
            this.markAreaAsCompleted();

            
            // BGMを元に戻す
            this.restoreOriginalBgm();
            
            // スプライトをクリーンアップ
            this.cleanupCharacterSprites();

            
            // 戻るボタンをクリーンアップ
            this.cleanupBackButton();

            
            // テキストアニメーションタイマーをクリーンアップ
            if (this.currentTextTimer) {
                this.currentTextTimer.destroy();
                this.currentTextTimer = null;
            }

            
            // UI要素をリセット（削除はしない）
            this.resetUI();

            
            // 元のシーンに戻る

            this.returnToOriginalScene();
            
        } catch (error) {
            console.error('[ConversationScene] Error in endConversation:', error);
            // エラーが発生しても強制的にシーンを停止
            try {
                this.returnToOriginalScene();
            } catch (stopError) {
                console.error('[ConversationScene] Error returning to original scene:', stopError);
            }
        }
    }

    // 元のシーンに戻る
    returnToOriginalScene() {

        
        // StageSceneの会話中フラグをリセット
        if (this.originalSceneKey === 'taketa_highschool') {
            try {
                const stageScene = this.scene.manager.getScene('taketa_highschool');
                if (stageScene && stageScene.setConversationActive) {
                    stageScene.setConversationActive(false);

                }
            } catch (e) {
                console.warn('[ConversationScene] StageSceneのフラグリセットエラー:', e);
            }
        } else if (this.originalSceneKey === 'mie_high_school') {
            try {
                const stageScene = this.scene.manager.getScene('mie_high_school');
                if (stageScene && stageScene.setConversationActive) {
                    stageScene.setConversationActive(false);

                }
            } catch (e) {
                console.warn('[ConversationScene] StageSceneのフラグリセットエラー（三重町）:', e);
            }
        }

        // 元のBGMを復元
        this.restoreOriginalBgm();
        
        // 元のシーンに戻る
        if (this.originalSceneKey) {
            try {
                // 元のシーンの状態を復元
                if (this.currentState && (this.originalSceneKey === 'taketa_highschool' || this.originalSceneKey === 'mie_high_school')) {

                    this.scene.stop();
                    this.scene.start(this.originalSceneKey, {
                        restoreState: true,
                        targetFloor: this.currentState.floor,
                        playerPosition: this.currentState.playerPosition,
                        mapKey: this.currentState.mapKey
                    });
                } else {
                    // 通常の復元
                    this.scene.stop();
                    this.scene.start(this.originalSceneKey);
                }
            } catch (error) {
                console.error('[ConversationScene] 元のシーン復元エラー:', error);
                // エラーが発生した場合は、シーンキーを直接指定して復元を試行
                this.scene.start(this.originalSceneKey);
            }
        } else {
            console.error('[ConversationScene] 元のシーンキーが設定されていません');
        }
        
        // このシーンを停止
        this.scene.stop();
    }

    // エリアを完了済みに設定
    markAreaAsCompleted() {

        try {
            // 現在の会話データからエリア名を取得
            if (this.currentConversation && this.currentConversation.areaName) {
                const areaName = this.currentConversation.areaName;
                
                // 完了状態を一時保存（ここが重要！）
                this.completedAreaName = areaName;

                
                // 元のシーンは探さない（停止されてるから）

            }
        } catch (error) {
            console.error('[ConversationScene] エリア完了設定エラー:', error);
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
    
    // 戻るボタンのクリーンアップ
    cleanupBackButton() {

    }
    
    // 画面リサイズ時の対応
    resize(gameSize) {
        const { width, height } = gameSize;
        
        // 背景のリサイズ
        if (this.background) {
            // 常に画面いっぱいをカバー
            try {
                this._fitConversationBackground();
            } catch (_) {
                this.background.setPosition(width / 2, height / 2);
                const scaleX = width / this.background.width;
                const scaleY = height / this.background.height;
                const scale = Math.max(scaleX, scaleY);
                this.background.setScale(scale);
            }
        }
        
        // テキストボックスのリサイズ（createメソッドと同じロジック）
        if (this.textbox) {
            const isPortraitNow = height > width;
            if (this.textures.exists('textbox')) {
                // 画像がある場合は位置のみ調整
                this.textbox.setPosition(width / 2, height - (isPortraitNow ? 70 : 60));
            } else {
                // 代替の四角形の場合はサイズと位置を調整
                const textboxWidth = isPortraitNow ? (width - 20) : (width - 60); // 縦: 両端10px
                const textboxHeight = isPortraitNow ? 140 : 90;
                this.textbox.setDisplaySize(textboxWidth, textboxHeight);
                this.textbox.setPosition(width / 2, height - (isPortraitNow ? 70 : 60));
                
                // ギャルゲ風の枠線を再設定
                this.textbox.setStrokeStyle(2, 0xFFFFFF, 1.0);
            }
            // 装飾の再描画（位置・サイズはUIに追従）
            this.redrawTextboxDecorations && this.redrawTextboxDecorations();
        }
        
        // 名前ボックスのリサイズ（テキストボックス上辺沿いに再配置）
        if (this.namebox) {
            if (this.textures.exists('namebox')) {
                // 画像がある場合も上辺沿いに揃える
                this._repositionNamebox(width, height);
            } else {
                // 代替の四角形の場合は幅は計算し直し、上辺沿いに揃える
                const nameboxWidth = Math.min(200, width * 0.3);
                const nameboxHeight = Math.min(30, height * 0.1);
                this.namebox.setDisplaySize(nameboxWidth, nameboxHeight);
                this._repositionNamebox(width, height);
                // ギャルゲ風の枠線を再設定
                this.namebox.setStrokeStyle(2, 0x888888, 0.8);
            }
            // 装飾の再描画
            this.redrawNameboxDecorations && this.redrawNameboxDecorations();
        }
        
        // テキストのリサイズ（createメソッドと同じロジック）
        if (this.dialogText) {
            const isPortraitNow = height > width;
            const leftPad = isPortraitNow ? 0 : 20; // 縦は左に20px寄せる → 左パディング0
            const rightPad = 20;
            const textWrapWidth = Math.min((this.textbox?.displayWidth || (width - 60)) - (leftPad + rightPad), 800);
            const fontSize = width < 600 ? '18px' : '24px';
            const _boxW = this.textbox?.displayWidth || (width - 60);
            const _boxH = this.textbox?.displayHeight || (isPortraitNow ? 140 : 120); // 横持ち時の高さを増加
            const textX0 = (this.textbox?.x || width / 2) - _boxW / 2 + leftPad;
            const textY0 = (this.textbox?.y || (height - (isPortraitNow ? 70 : 60))) - _boxH / 2 + 2;
            this.dialogText.setPosition(textX0, textY0);
            this.dialogText.setWordWrapWidth(textWrapWidth);
            this.dialogText.setFontSize(fontSize);
            // テキストシャドウは一度設定すれば保持されるが、安全に再設定
            if (this.dialogText.setShadow) this.dialogText.setShadow(2, 2, '#000000', 4, false, true);

            // マスクも追従
            try {
                if (this._textMaskGraphics) this._textMaskGraphics.destroy();
                this._textMaskGraphics = this.add.graphics();
                this._textMaskGraphics.fillStyle(0xffffff, 1);
                const maskLeft = (this.textbox?.x || width / 2) - _boxW / 2 + leftPad;
                const maskTop = textY0 - 10;
                const maskW = Math.max(1, (this.textbox?.displayWidth || (width - 60)) - (leftPad + rightPad));
                const maskH = Math.max(1, (this.textbox?.displayHeight || (isPortraitNow ? 140 : 90)) - 20);
                this._textMaskGraphics.fillRect(maskLeft, maskTop, maskW, maskH);
                const geomMask = this._textMaskGraphics.createGeometryMask();
                // マスクは対象に適用し、Graphics自体は非表示にして真っ白化を防ぐ
                this._textMaskGraphics.setVisible(false);
                this.dialogText.setMask(geomMask);
            } catch (e) { /* ignore */ }
        }
        
        // 名前テキストのリサイズ（createメソッドと同じロジック）
        if (this.nameText) {
            const nameFontSize = width < 600 ? '16px' : '20px';
            
            // 名前テキストは名前ボックスの中心に置く（現在のnamebox位置に追従）
            const nbWidth = this.namebox?.displayWidth || 0;
            this.nameText.setPosition(this.nameboxLeftMargin + nbWidth / 2, this.namebox.y);
            this.nameText.setFontSize(nameFontSize);
            if (this.nameText.setShadow) this.nameText.setShadow(1, 1, '#000000', 3, false, true);
            
            // 現在の名前がある場合は名前ボックスの幅も再調整
            if (this.nameText.text && this.nameText.text !== '') {
                this.adjustNameboxWidth(this.nameText.text);
            }
        }
        
        // 選択肢ボタンのリサイズ
        if (this.currentChoiceButtons && this.currentChoiceButtons.length > 0) {
            this.repositionChoiceButtons(width, height);
        }
        
        // キャラクター位置は現状のままで問題ないため、リサイズ時に再レイアウトしない
        // this.layoutVisibleCharacters();
    }
    
    // キャラクタースプライトの位置調整
    repositionCharacterSprites() { this.layoutVisibleCharacters(); }
    
    // 選択肢ボタンの位置調整
    repositionChoiceButtons(width, height) {
        if (!this.currentChoiceButtons || this.currentChoiceButtons.length === 0) {
            return;
        }
        
        const isPortrait = height > width;
        const choiceCount = this.currentChoiceButtons.length;
        
        // 縦向きの時は50px上に、3つ以上の選択肢の時はさらに30px上に（調整済み）
        let verticalOffset = isPortrait ? 50 : 0;
        if (choiceCount >= 3) {
            verticalOffset += 30;
        }
        
        this.currentChoiceButtons.forEach((button, index) => {
            if (button && button.setPosition) {
                const buttonX = width / 2;
                // 3つ以上の選択肢の時は、より上から開始して間隔を広げる
                let buttonY;
                if (choiceCount >= 3) {
                    buttonY = height - 250 + (index * 70) - verticalOffset; // 間隔を70pxに調整
                } else {
                    buttonY = height - 200 + (index * 60) - verticalOffset; // 通常の間隔
                }
                button.setPosition(buttonX, buttonY);
            }
        });
        

    }

    // 会話ボックス上辺に名前ボックスを揃える（縦横共通）
    _repositionNamebox(width, height) {
        try {
            const tb = this.textbox;
            if (!tb || !this.namebox) return;
            const boxH = tb.displayHeight || 90;
            const topY = (tb.y || (height - 60)) - boxH / 2;
            // 縦横でオフセットを分ける（縦は近づける）
            const isPortrait = height > width;
            const offset = isPortrait ? 20 : 20;
            const targetY = topY - offset;
            this.namebox.setPosition(this.nameboxLeftMargin, targetY);
            if (this.nameText) {
                const nbWidth = this.namebox.displayWidth || 0;
                this.nameText.setPosition(this.nameboxLeftMargin + nbWidth / 2, targetY);
            }
        } catch (_) { /* ignore */ }
    }
    
    // SE再生用のメソッド
    playDialogSE(seKey) {

        
        // 直接this.audioManagerを使用（「借りる」設計なし）
        if (this.audioManager) {

            this.audioManager.playSe(seKey);
        } else {
            console.warn('[ConversationScene] AudioManagerが見つかりません:', this.audioManager);
        }
    }
    
    // 背景操作を無効化するメソッド
    disableBackgroundInteraction() {
        // より確実な方法で背景操作を無効化
        this.input.on('pointerdown', (pointer) => {
            // 戻るボタン以外のクリック/タップを無効化
    
            
            // 選択肢ボタンがある場合は、選択肢ボタンの領域外のクリックを無効化
            if (this.currentChoiceButtons && this.currentChoiceButtons.length > 0) {

                
                // 選択肢ボタンの領域をチェック
                const isInChoiceButtonArea = this.currentChoiceButtons.some(button => {
                    if (button && button.getBounds) {
                        const bounds = button.getBounds();
                        return pointer.x >= bounds.x && 
                               pointer.x <= bounds.x + bounds.width &&
                               pointer.y >= bounds.y && 
                               pointer.y <= bounds.y + bounds.height;
                    }
                    return false;
                });
                
                // 選択肢ボタンの領域外の場合はクリックを無効化
                if (!isInChoiceButtonArea) {

                    return false; // イベントを停止
                }
            }
            
            // 戻るボタンの領域外のクリックを無効化
            const backButtonArea = { x: 50, y: 50, width: 100, height: 50 }; // 戻るボタンの概算位置
            if (pointer.x < backButtonArea.x || 
                pointer.x > backButtonArea.x + backButtonArea.width ||
                pointer.y < backButtonArea.y || 
                pointer.y > backButtonArea.y + backButtonArea.height) {
                
                // 背景クリックを無効化

                return false; // イベントを停止
            }
        });
        

    }
    
    // 選択肢を表示
    showChoices(choices, choiceId) {

        
        // 既存の選択肢ボタンをクリア
        this.clearChoiceButtons();
        
        // 選択肢の数を記録
        const totalChoices = choices.length;

        
        // 重複チェック
        if (this.currentChoiceButtons.length > 0) {
            console.warn('[ConversationScene] 警告: 選択肢ボタンが既に存在します');
            this.clearChoiceButtons();
        }
        
        choices.forEach((choice, index) => {
            const button = this.createChoiceButton(choice, choiceId, index, totalChoices);
            this.currentChoiceButtons.push(button);
        });
        

    }
    
    // 選択肢ボタンを作成
    createChoiceButton(choice, choiceId, index, totalChoices) {
        const width = this.sys?.game?.canvas?.width || this.sys?.game?.config?.width || 800;
        const height = this.sys?.game?.canvas?.height || this.sys?.game?.config?.height || 600;
        
        const isPortrait = height > width;
        
        // 選択肢の数を直接受け取る
        const choiceCount = totalChoices || 1;
        
        // 縦向きの時は50px上に、3つ以上の選択肢の時はさらに30px上に（調整済み）
        let verticalOffset = isPortrait ? 50 : 0;
        if (choiceCount >= 3) {
            verticalOffset += 30;
        }
        

        
        const buttonX = width / 2;
        // 3つ以上の選択肢の時は、より上から開始して間隔を広げる
        let buttonY;
        if (choiceCount >= 3) {
            buttonY = height - 250 + (index * 70) - verticalOffset; // 間隔を70pxに調整
        } else {
            buttonY = height - 200 + (index * 60) - verticalOffset; // 通常の間隔
        }
        
        const button = this.add.container(buttonX, buttonY);
        
        // ボタン背景（より大きく、文字が入りやすく）
        const background = this.add.graphics();
        background.fillStyle(0x2a2a2a, 0.9);
        background.fillRoundedRect(-150, -30, 300, 60, 10);
        button.add(background);
        
        // ボタンテキスト（フォントサイズを大きく、改行対応）
        const text = this.add.text(0, 0, choice.text, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            wordWrap: { width: 280, useAdvancedWrap: true },
            align: 'center'
        }).setOrigin(0.5);
        button.add(text);
        
        // インタラクティブ設定（背景に合わせて拡大）
        button.setInteractive(new Phaser.Geom.Rectangle(-150, -30, 300, 60), Phaser.Geom.Rectangle.Contains);
        
        // クリックイベント
        button.on('pointerdown', () => {
            this.handleChoice(choice, choiceId);
        });
        
        // ホバー効果（新しいサイズに合わせて更新）
        button.on('pointerover', () => {
            background.fillStyle(0x4a4a4a, 0.9);
            background.fillRoundedRect(-150, -30, 300, 60, 10);
        });
        
        button.on('pointerout', () => {
            background.fillStyle(0x2a2a2a, 0.9);
            background.fillRoundedRect(-150, -30, 300, 60, 10);
        });
        
        return button;
    }
    
    // 選択を処理
    async handleChoice(choice, choiceId) {
        console.log('[ConversationScene] handleChoice開始:', {
            conversationId: this.conversationId,
            choiceId: choiceId,
            result: choice.result
        });
        
        // 選択を保存（ChoiceManagerを使用）
        if (this.conversationId) {
            // ChoiceManagerのシングルトンインスタンスを取得
            if (!this.choiceManager) {
                if (window.ChoiceManager) {
                    this.choiceManager = window.ChoiceManager.getInstance();
                } else {
                    // フォールバック：動的インポート
                    const { ChoiceManager } = await import('./ChoiceManager.js');
                    this.choiceManager = ChoiceManager.getInstance();
                }
            }
            
            try {
                this.choiceManager.saveChoice(this.conversationId, choiceId, choice.result);
                console.log('[ConversationScene] 選択保存完了:', {
                    conversationId: this.conversationId,
                    choiceId: choiceId,
                    result: choice.result
                });
                
                // 保存後の状態を確認
                console.log('[ConversationScene] 保存後のChoiceManager状態:', this.choiceManager.choices);
            } catch (error) {
                console.error('[ConversationScene] 選択保存エラー:', error);
            }
        } else {
            console.warn('[ConversationScene] conversationIdが設定されていません');
        }
        
        // 選択肢ボタンを非表示
        this.clearChoiceButtons();
        
        // 選択に応じたメッセージを表示
        if (choice.nextMessages) {
            this.showChoiceMessages(choice.nextMessages);
        }
        
        // 選択後のメッセージを表示してから次の会話に進む
        // nextDialog()は呼び出さない（showChoiceMessagesで自動的に次の会話に進む）
    }
    
    // 選択後のメッセージを表示
    showChoiceMessages(messages) {
        // 選択後のメッセージを順番に表示してから、共通会話に進む
        this.displayChoiceMessagesSequentially(messages, 0);
    }
    
    // 選択後のメッセージを順番に表示
    displayChoiceMessagesSequentially(messages, index) {
        if (index >= messages.length) {
            // 全ての選択後メッセージが表示されたら、共通会話に進む
            this.skipToCommonDialog();
            return;
        }
        
        // 現在のメッセージを表示
        const message = messages[index];
        this.displaySingleMessage(message);
        
        // 次のメッセージを表示する準備
        this.input.once('pointerdown', () => {
            this.displayChoiceMessagesSequentially(messages, index + 1);
        });
    }
    
    // 単一メッセージを表示
    displaySingleMessage(message) {
        // 立ち絵の表示/非表示制御
        if (!message.speaker || message.character === 'narrator') {
            // ナレーション時は全立ち絵を一時的に隠す
            if (this.characterSprites) {
                Object.values(this.characterSprites).forEach(sprite => {
                    if (sprite && sprite.setVisible) {
                        sprite.setVisible(false);
                    }
                });
            }
        } else {
            // 通常発話時は全立ち絵を表示状態に戻す
            if (this.characterSprites) {
                Object.values(this.characterSprites).forEach(sprite => {
                    if (sprite && sprite.setVisible) {
                        sprite.setVisible(true);
                    }
                });
            }
            this.updateCharacterSprite(message.character, message.expression);
            this.layoutVisibleCharacters();
        }

        // 名前の表示（ナレーション時は非表示）
        if (!message.speaker || message.character === 'narrator') {
            this.nameText.setText('');
            if (this.namebox) this.namebox.setVisible(false);
            if (this.nameText) this.nameText.setVisible(false);
            if (this.nameboxDecoFrame) this.nameboxDecoFrame.setVisible(false);
            if (this.nameboxDecoShine) this.nameboxDecoShine.setVisible(false);
        } else {
            if (this.namebox) this.namebox.setVisible(true);
            if (this.nameText) this.nameText.setVisible(true);
            this.nameText.setText(message.speaker || '');
            if (message.speaker) {
                this.adjustNameboxWidth(message.speaker);
            }
        }
        
        // テキストのアニメーション表示
        this.animateText(message.text);
        
        // 背景変更処理
        if (message.background) {
            this.updateBackground(message.background);
        }
        
        // SE再生処理
        if (message.se) {
            this.playDialogSE(message.se);
        }
    }
    
    // 共通会話にスキップ
    skipToCommonDialog() {
        const currentConversations = this.currentConversation.conversations;
        let commonDialogIndex = this.currentConversationIndex;
        
        // 共通会話（選択肢後の会話）を見つける
        while (commonDialogIndex < currentConversations.length) {
            const dialog = currentConversations[commonDialogIndex];
            if (dialog.type !== 'choice' && !dialog.choiceId) {
                break;
            }
            commonDialogIndex++;
        }
        
        // 共通会話から開始
        this.currentConversationIndex = commonDialogIndex;
        this.showDialog();
    }
    
    // 選択肢ボタンをクリア
    clearChoiceButtons() {
        if (this.currentChoiceButtons) {
            this.currentChoiceButtons.forEach(button => {
                if (button && button.destroy) {
                    button.destroy();
                }
            });
        }
        this.currentChoiceButtons = [];

    }
    
} 