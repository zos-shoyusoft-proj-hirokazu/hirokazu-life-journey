import { UIManager } from './UIManager.js';

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
    }

    init(data) {
        // start() から渡された会話データを保持
        this._pendingConversation = data && data.conversationData ? data.conversationData : null;
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
        
        // 背景を設定（デフォルトは透明な背景）
        try { this.cameras?.main?.setBackgroundColor('#000000'); } catch(_) { /* ignore */ }
        this.background = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5);
        this.background.setOrigin(0.5, 0.5);
        
        // 立ち絵用のコンテナ
        this.characterContainer = this.add.container(0, 0);
        
        // UIManagerから戻るボタンを作成
        this.uiManager = new UIManager();
        this.uiManager.createConversationBackButton(this);
        
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
        const textWrapWidth = Math.min((this.textbox?.displayWidth || (width - 60)) - (leftPad + rightPad), 600); // ボックス内幅基準
        const fontSize = width < 600 ? '18px' : '24px'; // スマホでは小さいフォント
        // テキストはテキストボックスの左上から少し内側に配置
        const _boxW = this.textbox?.displayWidth || (width - 60);
        const _boxH = this.textbox?.displayHeight || (isPortrait ? 140 : 90);
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
                    console.log('[ConversationScene] イベントBGMを停止');
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
                const mainScene = this.scene.get('Stage1Scene') || this.scene.get('Stage2Scene') || this.scene.get('Stage3Scene') || this.scene.get('MiemachiStage') || this.scene.get('TaketastageStage') || this.scene.get('JapanStage');
                if (mainScene && mainScene.conversationTrigger) {
                    mainScene.conversationTrigger.isConversationActive = false;
                    console.log('[ConversationScene] ConversationTriggerのフラグをリセット');
                }
            } catch (e) {
                console.warn('[ConversationScene] ConversationTriggerフラグリセットエラー:', e);
            }
            
            // 元のシーンに戻る
            this.scene.stop();
            
        } catch (error) {
            console.error('[ConversationScene] Error in interruptConversation:', error);
            // エラーが発生しても強制的にシーンを停止
            try {
                this.scene.stop();
            } catch (stopError) {
                console.error('[ConversationScene] Error stopping scene:', stopError);
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
        console.log('[ConversationScene] 💬 会話開始');
        console.log('[ConversationScene] 📋 会話データ:', conversationData);
        
        this.currentConversation = conversationData;
        this.currentConversationIndex = 0;
        
        // 会話開始イベントを発火
        this.events.emit('conversationStarted');
        
        // 現在再生中のBGMキーを覚える（会話終了後に復元するため）
        try {
            const mainScene = this.scene.get('Stage1Scene') || this.scene.get('Stage2Scene') || this.scene.get('Stage3Scene') || this.scene.get('MiemachiStage') || this.scene.get('TaketastageStage') || this.scene.get('JapanStage');
            if (mainScene && mainScene.audioManager && mainScene.audioManager.bgm) {
                this._originalBgmKey = mainScene.audioManager.bgm.key;
                console.log('[ConversationScene] 🎵 元のBGMキーを記憶: ' + this._originalBgmKey);
            }
        } catch (e) {
            console.warn('[ConversationScene] ⚠️ 元のBGMキー取得エラー:', e);
        }
        
        // 背景とBGMの設定
        if (conversationData.background) {
            console.log('[ConversationScene] 🖼️ 背景画像設定開始:', conversationData.background);
            this.updateBackground(conversationData.background);
            console.log('[ConversationScene] ✅ 背景画像設定完了');
        }
        
        if (conversationData.bgm) {
            console.log('[ConversationScene] 🎵 イベントBGM設定開始:', conversationData.bgm);
            this.switchToEventBgm(conversationData.bgm);
            console.log('[ConversationScene] ✅ イベントBGM設定完了');
        }

        // マップBGMの自動再開を抑制（MapSelectionStage側のリトライを止める）
        try {
            const mapScene = this.scene.get('MiemachiStage') || this.scene.get('TaketastageStage') || this.scene.get('JapanStage');
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
        console.log('[ConversationScene] 💬 最初のダイアログ表示開始');
        this.showDialog();
        console.log('[ConversationScene] ✅ 会話開始完了');
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
        console.log('[ConversationScene] 💬 ダイアログ表示開始:', this.currentConversationIndex + 1, '/', this.currentConversation.conversations.length);
        console.log('[ConversationScene] 📝 ダイアログ内容:', dialog);
        
        // ナレーション判定：speaker未指定 or characterがnarrator
        const isNarration = !dialog.speaker || dialog.character === 'narrator';
        console.log('[ConversationScene] 📢 ナレーション判定:', isNarration);

        // 立ち絵の表示/非表示制御
        if (isNarration) {
            console.log('[ConversationScene] 👤 ナレーション時: 全立ち絵を非表示');
            // ナレーション時は全立ち絵を一時的に隠す
            if (this.characterSprites) {
                Object.values(this.characterSprites).forEach(sprite => {
                    if (sprite && sprite.setVisible) {
                        sprite.setVisible(false);
                    }
                });
            }
        } else {
            console.log('[ConversationScene] 👤 通常発話時: 立ち絵表示処理開始');
            // 通常発話時は全立ち絵を表示状態に戻す（以降のdim処理は既存ロジックに委譲）
            if (this.characterSprites) {
                Object.values(this.characterSprites).forEach(sprite => {
                    if (sprite && sprite.setVisible) {
                        sprite.setVisible(true);
                    }
                });
            }
            console.log('[ConversationScene] 👤 キャラクター立ち絵更新:', dialog.character, '表情:', dialog.expression);
            this.updateCharacterSprite(dialog.character, dialog.expression);
            // 人数に応じた等間隔レイアウト
            console.log('[ConversationScene] 👤 立ち絵レイアウト調整開始');
            this.layoutVisibleCharacters();
            console.log('[ConversationScene] ✅ 立ち絵レイアウト調整完了');
        }

        // 名前の表示（ナレーション時は非表示）
        if (isNarration) {
            console.log('[ConversationScene] 📛 ナレーション時: 名前ボックス非表示');
            this.nameText.setText('');
            if (this.namebox) this.namebox.setVisible(false);
            if (this.nameText) this.nameText.setVisible(false);
            if (this.nameboxDecoFrame) this.nameboxDecoFrame.setVisible(false);
            if (this.nameboxDecoShine) this.nameboxDecoShine.setVisible(false);
        } else {
            console.log('[ConversationScene] 📛 通常発話時: 名前ボックス表示:', dialog.speaker);
            if (this.namebox) this.namebox.setVisible(true);
            if (this.nameText) this.nameText.setVisible(true);
            this.nameText.setText(dialog.speaker || '');
            // 名前の長さに応じて名前ボックスの幅だけを調整（高さ・位置は固定）
            if (dialog.speaker) {
                console.log('[ConversationScene] 📛 名前ボックス幅調整開始:', dialog.speaker);
                this.adjustNameboxWidth(dialog.speaker);
                console.log('[ConversationScene] ✅ 名前ボックス幅調整完了');
            }
            // 装飾の可視性も同期
            if (this.nameboxDecoFrame) this.nameboxDecoFrame.setVisible(true);
            if (this.nameboxDecoShine) this.nameboxDecoShine.setVisible(true);
        }
        // テキストのアニメーション表示
        this.animateText(dialog.text);
        
        // 背景変更処理を追加
        if (dialog.background) {
            this.updateBackground(dialog.background);
        }
        
        // SE再生処理を追加
        if (dialog.se) {
            this.playDialogSE(dialog.se);
        }
    }

    // 立ち絵の更新
    updateCharacterSprite(character, expression) {
        console.log('[ConversationScene] 👤 立ち絵更新開始:', character, '表情:', expression);
        
        if (!this.characterSprites) {
            this.characterSprites = {};
            console.log('[ConversationScene] 👤 立ち絵スプライト配列初期化');
        }
        
        // characterContainerが初期化されていない場合は何もしない
        if (!this.characterContainer) {
            console.warn('[ConversationScene] ⚠️ characterContainer is not initialized yet');
            return;
        }
        
        if (character && expression) {
            console.log('[ConversationScene] 👤 テクスチャキー解決開始:', character, expression);
            const spriteKey = this.resolveExistingSpriteKey(character, expression);
            console.log('[ConversationScene] 👤 解決されたテクスチャキー:', spriteKey);
            
            if (!spriteKey) {
                console.warn('[ConversationScene] ⚠️ 利用可能なテクスチャがないため表示しません:', character, expression);
                return; // 利用可能なテクスチャがない場合は表示しない
            }
            
            const width = this.sys?.game?.canvas?.width || this.sys?.game?.config?.width || 800;
            const height = this.sys?.game?.canvas?.height || this.sys?.game?.config?.height || 600;
            console.log('[ConversationScene] 📏 画面サイズ:', width, 'x', height);
            
            // 位置は layoutVisibleCharacters で一括調整するため一旦中央付近
            let position = { x: width * 0.5, y: height * 0.4 };
            console.log('[ConversationScene] 📍 初期位置:', position);
            
            // 既存のキャラクターがいる場合は、テクスチャのみ変更
            if (this.characterSprites[character]) {
                console.log('[ConversationScene] 👤 既存キャラクター更新:', character);
                const existingSprite = this.characterSprites[character];
                // テクスチャが変更されている場合のみ更新
                if (existingSprite.texture.key !== spriteKey) {
                    console.log('[ConversationScene] 👤 テクスチャ変更:', existingSprite.texture.key, '→', spriteKey);
                    existingSprite.setTexture(spriteKey);
                    // テクスチャ変更時にもスケールを再計算
                    this.applyPortraitScale(existingSprite);
                    console.log('[ConversationScene] ✅ 既存キャラクター更新完了');
                } else {
                    console.log('[ConversationScene] ℹ️ テクスチャ変更なし、既存のまま');
                }
            } else {
                console.log('[ConversationScene] 👤 新規キャラクター作成:', character);
                // 新しいスプライトを作成（最初から正しい位置で作成）
                const sprite = this.add.image(position.x, position.y, spriteKey);
                sprite.setOrigin(0.5, 0.5);
                console.log('[ConversationScene] 👤 スプライト作成完了:', spriteKey);
                
                // 立ち絵を画面サイズに合わせて自然に収まるスケールへ
                const targetScale = this.getPortraitTargetScale(sprite.width, sprite.height);
                console.log('[ConversationScene] 📏 目標スケール:', targetScale, '元サイズ:', sprite.width, 'x', sprite.height);
                
                // フルサイズに近い場合はY位置を中央に補正（上が欠けないように）
                const scaledHeight = sprite.height * targetScale;
                if (scaledHeight >= (height * 0.95)) {
                    position = { ...position, y: height * 0.5 };
                    sprite.setPosition(position.x, position.y);
                    console.log('[ConversationScene] 📍 位置補正完了:', position);
                }
                
                sprite.setAlpha(0);
                sprite.setScale(Math.max(0.1, targetScale * 0.9));
                this.characterContainer.add(sprite);
                this.characterSprites[character] = sprite;
                console.log('[ConversationScene] 👤 キャラクターコンテナに追加完了');
                
                // 立ち絵の登場アニメーション
                console.log('[ConversationScene] 🎬 立ち絵登場アニメーション開始');
                this.tweens.add({
                    targets: sprite,
                    alpha: 1,
                    scaleX: targetScale,
                    scaleY: targetScale,
                    duration: 500,
                    ease: 'Power2'
                });
                console.log('[ConversationScene] ✅ 新規キャラクター作成完了');
            }
            
            // 話していないキャラクターを少し暗くする
            console.log('[ConversationScene] 👤 他キャラクター暗転処理開始');
            this.dimOtherCharacters(character);
            console.log('[ConversationScene] ✅ 立ち絵更新完了');
        } else {
            console.log('[ConversationScene] ℹ️ キャラクターまたは表情が指定されていません');
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
    
    // イベント用BGMに切り替え
    switchToEventBgm(eventBgmKey) {
        // MapSelectionStageも含めて検索
        const mainScene = this.scene.get('Stage1Scene') || this.scene.get('Stage2Scene') || this.scene.get('Stage3Scene') || this.scene.get('MiemachiStage') || this.scene.get('TaketastageStage') || this.scene.get('JapanStage');

        if (mainScene && mainScene.audioManager) {
            // もともと鳴っていたBGMキーを覚えておき、ハードコーディングを排除
            try {
                this._originalBgmKey = (mainScene.audioManager.bgm && mainScene.audioManager.bgm.key) ? mainScene.audioManager.bgm.key : null;
                
                // 元のBGMキーが取得できない場合は、ステージの設定から動的に取得
                if (!this._originalBgmKey) {
                    this.getOriginalBgmKeyAsync(mainScene);
                } else {
                    console.log(`[ConversationScene] 元のBGMキーを保存: ${this._originalBgmKey}`);
                }
            } catch (_) { 
                this._originalBgmKey = null; 
                // エラー時もフォールバック
                this.getOriginalBgmKeyAsync(mainScene);
            }
            
            // イベントBGM再生開始フラグを設定
            this._eventBgmStarted = false;
            
            // iOSでMapSelectionStageがHTMLAudio（_htmlBgm）を使用している場合は一時停止
            try {
                if (mainScene._htmlBgm && !mainScene._htmlBgm.paused) {
                    mainScene._htmlBgm.pause();
                    try { mainScene._htmlBgm.currentTime = 0; } catch (e) { /* ignore */ }
                    this._pausedHtmlMapBgm = true;
                }
            } catch (e) { /* ignore */ }

            // 既存Phaser BGMもいったん停止
            try { mainScene.audioManager.stopBgm(false); } catch (e) { /* ignore */ }

            this.originalBgm = mainScene.audioManager.bgm;
            let rawKey = eventBgmKey ? (eventBgmKey.startsWith('bgm_') ? eventBgmKey.replace(/^bgm_/, '') : eventBgmKey) : null;

            // Fallback: bgm未指定、またはキーがAreaConfigに存在しない場合は、そのマップのmap BGMまたは先頭キーにフォールバック
            const bgmDict = (mainScene.mapConfig && typeof mainScene.mapConfig.bgm === 'object') ? mainScene.mapConfig.bgm : null;
            const hasPathFor = (key) => !!(bgmDict && key && Object.prototype.hasOwnProperty.call(bgmDict, key) && bgmDict[key]);
            if (!rawKey || !hasPathFor(rawKey)) {
                if (hasPathFor('map')) {
                    rawKey = 'map';
                } else if (bgmDict) {
                    const keys = Object.keys(bgmDict);
                    if (keys.length > 0) rawKey = keys[0];
                }
            }
            const bgmKey = rawKey ? `bgm_${rawKey}` : null;

            // HTMLAudioでイベントを再生（全プラットフォーム、競合回避のため）
            try {
                if (this._eventHtmlBgm) {
                    try { this._eventHtmlBgm.pause(); } catch (e) { /* ignore */ }
                    this._eventHtmlBgm = null;
                }
                const path = rawKey ? (mainScene.mapConfig && mainScene.mapConfig.bgm ? (mainScene.mapConfig.bgm[rawKey] || '') : '') : '';
                if (path) {
                    this._eventHtmlBgm = new Audio(path);
                    this._eventHtmlBgm.loop = true;
                    this._eventHtmlBgm.volume = this.audioManager.bgmVolume;
                    
                    // イベントBGM再生開始
                    this._eventBgmStarted = true;
                    console.log(`[ConversationScene] イベントBGM開始: ${path}`);
                    
                    // 自動再生がブロックされても例外を握りつぶし、次のユーザー操作で再試行
                    // 1) まず直ちに再生（ユーザー操作コンテキストを活かす）
                        try {
                            if (this.sys && this.sys.isActive && this.sys.isActive()) {
                                const immediate = this._eventHtmlBgm.play();
                                if (immediate && typeof immediate.catch === 'function') {
                                    immediate.catch(() => {});
                                }
                            }
                        } catch (e) { /* ignore */ }
                    // 2) 失敗時の保険：短い遅延後に再トライ
                    this.time.delayedCall(80, () => {
                        try {
                            if (this.sys && this.sys.isActive && this.sys.isActive() && this._eventHtmlBgm && (this._eventHtmlBgm.paused || this._eventHtmlBgm.ended)) {
                                const p2 = this._eventHtmlBgm.play();
                                if (p2 && typeof p2.catch === 'function') p2.catch(() => {});
                            }
                        } catch (e) { /* ignore */ }
                    });
                    // 3) 次のタップでもう一度試す（iOSの厳格なユーザーアクティベーション対策）
                    try {
                        this.input.once('pointerdown', () => {
                            try {
                                if (this._eventHtmlBgm && (this._eventHtmlBgm.paused || this._eventHtmlBgm.ended)) {
                                    const p3 = this._eventHtmlBgm.play();
                                    if (p3 && typeof p3.catch === 'function') p3.catch(() => {});
                                }
                            } catch (e) { /* ignore */ }
                        });
                    } catch (e) { /* ignore */ }
                    return;
                }
            } catch (e) { /* ignore */ }

            // フォールバック: WebAudio（Phaser）で再生（パス不明時のみ）
            // 未ロードの場合は動的ロード（AreaConfigからパスを取得）
            try {
                if (bgmKey && mainScene.load && mainScene.cache && mainScene.cache.audio && !mainScene.cache.audio.exists(bgmKey)) {
                    const path = rawKey ? (mainScene.mapConfig && mainScene.mapConfig.bgm ? mainScene.mapConfig.bgm[rawKey] : undefined) : undefined;
                    if (path) {
                        try {
                            mainScene.load.audio(bgmKey, path);
                            mainScene.load.once('complete', () => {
                                try { 
                                    mainScene.audioManager.playBgm(bgmKey, undefined, true); 
                                    this._eventBgmStarted = true;
                                    console.log(`[ConversationScene] イベントBGM開始 (Phaser): ${bgmKey}`);
                                } catch (e) { /* ignore */ }
                            });
                            mainScene.load.start();
                        } catch (e) { /* ignore */ }
                        return;
                    }
                }
            } catch (e) { /* ignore */ }

                if (bgmKey) {
                    try { 
                        if (mainScene && mainScene.audioManager) {
                            mainScene.audioManager.playBgm(bgmKey, undefined, true);
                            this._eventBgmStarted = true;
                            console.log(`[ConversationScene] イベントBGM開始 (Phaser): ${bgmKey}`);
                        }
                    } catch (e) { /* ignore */ }
                }
        }
    }

    // 非同期で元のBGMキーを取得
    async getOriginalBgmKeyAsync(mainScene) {
        try {
            if (mainScene && mainScene.audioManager) {
                const defaultKey = await mainScene.audioManager.getDefaultBgmKey();
                this._originalBgmKey = defaultKey;
                console.log(`[ConversationScene] 元のBGMキーを保存（非同期）: ${this._originalBgmKey}`);
            }
        } catch (error) {
            console.warn('[ConversationScene] 非同期BGMキー取得エラー:', error);
            // フォールバック: 基本的なBGMキー
            this._originalBgmKey = 'bgm_default';
        }
    }

    // 元のBGMに戻す（ハードコードせず、会話開始前に覚えたキーで復帰）
    restoreOriginalBgm() {
        try {
            // MapSelectionStageも含めて検索
            const mainScene = this.scene.get('Stage1Scene') || this.scene.get('Stage2Scene') || this.scene.get('Stage3Scene') || this.scene.get('MiemachiStage') || this.scene.get('TaketastageStage') || this.scene.get('JapanStage');
            if (mainScene && mainScene.audioManager) {
                // イベントBGMを確実に停止（2重再生防止）
                try {
                    if (this._eventHtmlBgm) {
                        console.log('[ConversationScene] restoreOriginalBgm: イベントBGMを停止');
                        this._eventHtmlBgm.pause();
                        this._eventHtmlBgm = null;
                    }
                } catch (e) {
                    console.warn('[ConversationScene] イベントBGM停止エラー:', e);
                }
                
                // イベントBGMが正常に再生されている場合は、pause()しない（AbortError防止）
                if (this._eventBgmStarted && this._eventHtmlBgm && !this._eventHtmlBgm.paused) {
                    console.log('[ConversationScene] イベントBGM再生中、pause()をスキップ');
                    // イベントBGMを停止する代わりに、音量を徐々に下げる
                    try {
                        this._eventHtmlBgm.volume = 0.1;
                        this.time.delayedCall(500, () => {
                            try {
                                if (this._eventHtmlBgm) {
                                    this._eventHtmlBgm.pause();
                                    this._eventHtmlBgm = null;
                                }
                            } catch (e) { /* ignore */ }
                        });
                    } catch (e) { /* ignore */ }
                } else {
                    // iOS: イベント用HTMLAudioがあれば停止
                    try { if (this._eventHtmlBgm) { this._eventHtmlBgm.pause(); this._eventHtmlBgm = null; } } catch (e) { /* ignore */ }
                }
                
                mainScene.audioManager.stopBgm(false);
                
                let keyToPlay = this._originalBgmKey;
                
                // もし覚えていなければ、MapやSceneの設定から推測
                if (!keyToPlay) {
                    try {
                        // 基本的なBGMキーを使用
                        keyToPlay = 'bgm_default';
                    } catch (_) { /* ignore */ }
                }
                
                if (keyToPlay) {
                    try { 
                        console.log(`[ConversationScene] 元のBGMを復元: ${keyToPlay}`);
                        
                        // 音声コンテキストを確実に復活させる
                        if (mainScene.sound && mainScene.sound.context) {
                            if (mainScene.sound.context.state === 'suspended') {
                                console.log('[ConversationScene] 音声コンテキストを再開中...');
                                mainScene.sound.context.resume();
                            }
                            
                            // 音声コンテキストが確実に動作するまで待機
                            if (mainScene.sound.context.state !== 'running') {
                                console.log('[ConversationScene] 音声コンテキストの状態を待機中...');
                                mainScene.sound.context.onstatechange = () => {
                                    if (mainScene.sound.context.state === 'running') {
                                        console.log('[ConversationScene] 音声コンテキストが動作開始、BGM再生を実行');
                                        mainScene.audioManager.playBgm(keyToPlay, undefined, true);
                                    }
                                };
                            } else {
                                // 音声コンテキストが既に動作中なら即座にBGM再生
                                mainScene.audioManager.playBgm(keyToPlay, undefined, true);
                            }
                        } else {
                            // 音声コンテキストが存在しない場合は直接BGM再生を試行
                            console.warn('[ConversationScene] 音声コンテキストが存在しません、直接BGM再生を試行');
                            mainScene.audioManager.playBgm(keyToPlay, undefined, true);
                        }
                        
                    } catch (error) { 
                        console.warn(`[ConversationScene] BGM復元失敗: ${keyToPlay}`, error);
                    }
                }
                
                // iOSでHTMLAudioを使っていた場合は再開（会話終了でマップBGMに戻す）
                try {
                    if (this._pausedHtmlMapBgm && mainScene._htmlBgm) {
                        try { mainScene._htmlBgm.currentTime = 0; } catch (e) { /* ignore */ }
                        const p = mainScene._htmlBgm.play();
                        if (p && typeof p.catch === 'function') p.catch(() => {});
                        this._pausedHtmlMapBgm = false;
                    }
                } catch (e) { /* ignore */ }
                
                // マップBGM抑制フラグを解除
                try { mainScene._suppressMapBgm = false; } catch (e) { /* ignore */ }
                
                // イベントBGM再生フラグをリセット
                this._eventBgmStarted = false;
            }
        } catch (error) {
            console.error('[ConversationScene] restoreOriginalBgm エラー:', error);
        }
    }
    
    // 会話終了
    endConversation() {
        try {
            // 会話終了イベントを発火
            this.events.emit('conversationEnded');
            
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

    // エリアを完了済みに設定
    markAreaAsCompleted() {
        try {
            // 現在の会話データからエリア名を取得
            if (this.currentConversation && this.currentConversation.areaName) {
                const areaName = this.currentConversation.areaName;
                
                // より安全なシーン取得方法
                const sceneManager = this.scene.manager;
                if (!sceneManager) {
                    console.warn('[ConversationScene] シーンマネージャーが利用できません');
                    return;
                }
                
                // 利用可能なシーンを確認
                const availableScenes = ['MiemachiStage', 'TaketastageStage', 'JapanStage'];
                let originalScene = null;
                
                for (const sceneKey of availableScenes) {
                    try {
                        const scene = sceneManager.getScene(sceneKey);
                        if (scene && scene.areaSelectionManager) {
                            originalScene = scene;
                            break;
                        }
                    } catch (e) {
                        // シーンが存在しない場合はスキップ
                    }
                }
                
                if (originalScene && originalScene.areaSelectionManager) {
                    // エリアを完了済みに設定
                    originalScene.areaSelectionManager.markAreaAsCompleted(areaName);
                    console.log(`[ConversationScene] エリア ${areaName} を完了済みに設定しました`);
                    
                    // 現在アクティブなシーンも更新（即座に緑色に光らせるため）
                    try {
                        // Phaser 3.60以降の方法
                        if (this.scene.manager.getActiveScene) {
                            const activeScene = this.scene.manager.getScene(this.scene.manager.getActiveScene());
                            if (activeScene && activeScene.areaSelectionManager) {
                                activeScene.areaSelectionManager.markAreaAsCompleted(areaName);
                                console.log(`[ConversationScene] アクティブシーンのエリア ${areaName} も更新しました`);
                            }
                        }
                    } catch (e) {
                        console.log('[ConversationScene] アクティブシーンの取得に失敗（無視）:', e.message);
                    }
                    
                    // さらに、現在のシーンがMapSelectionStageの場合、直接更新（単一実行に簡素化）
                    if (this.scene && this.scene.areaSelectionManager) {
                        this.scene.areaSelectionManager.markAreaAsCompleted(areaName);
                        console.log(`[ConversationScene] 現在シーンのエリア ${areaName} も更新しました`);
                    }
                } else {
                    console.warn(`[ConversationScene] エリア完了設定に必要なシーンが見つかりません: ${areaName}`);
                }
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
        if (this.uiManager) {
            this.uiManager.cleanupConversationBackButton();
            this.uiManager = null;
        }
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
            const textWrapWidth = Math.min((this.textbox?.displayWidth || (width - 60)) - (leftPad + rightPad), 600);
            const fontSize = width < 600 ? '18px' : '24px';
            const _boxW = this.textbox?.displayWidth || (width - 60);
            const _boxH = this.textbox?.displayHeight || (isPortraitNow ? 140 : 90);
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
        
        // キャラクター位置は現状のままで問題ないため、リサイズ時に再レイアウトしない
        // this.layoutVisibleCharacters();
    }
    
    // キャラクタースプライトの位置調整
    repositionCharacterSprites() { this.layoutVisibleCharacters(); }

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
        console.log('[ConversationScene] SE再生を試行:', seKey);
        
        // MapSelectionStageのaudioManagerを取得
        const mapStage = this.scene.get('MiemachiStage') || this.scene.get('TaketastageStage') || this.scene.get('JapanStage');
        
        if (mapStage && mapStage.audioManager) {
            console.log('[ConversationScene] AudioManager発見、SE再生:', `se_${seKey}`);
            mapStage.audioManager.playSe(`se_${seKey}`);
        } else {
            console.warn('[ConversationScene] AudioManagerが見つかりません:', mapStage);
        }
    }
} 