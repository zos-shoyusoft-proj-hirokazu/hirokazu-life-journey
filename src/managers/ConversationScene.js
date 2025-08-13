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
        // 見た目の装飾レイヤー（レイアウトは絶対に変更しない）
        this.createDecorationsForConversationUI();
        
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
        // 可読性向上のためのシャドウ（位置・サイズは不変）
        if (this.dialogText && this.dialogText.setShadow) {
            this.dialogText.setShadow(2, 2, '#000000', 4, false, true);
        }
        
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
        if (this.nameText && this.nameText.setShadow) {
            this.nameText.setShadow(1, 1, '#000000', 3, false, true);
        }
        
        // クリックでテキスト進行（多重登録防止）
        this.input.removeAllListeners('pointerdown');
        this.input.on('pointerdown', () => {
            this.nextDialog();
        });
        
        // スペースキーでも進行
        this.input.keyboard.on('keydown-SPACE', () => {
            this.nextDialog();
        });
        
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
        
        // 背景とBGMの設定
        if (conversationData.background) {
            this.updateBackground(conversationData.background);
        }
        
        if (conversationData.bgm) {
            this.switchToEventBgm(conversationData.bgm);
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
            // 装飾の可視性も同期
            if (this.nameboxDecoFrame) this.nameboxDecoFrame.setVisible(true);
            if (this.nameboxDecoShine) this.nameboxDecoShine.setVisible(true);
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
            const spriteKey = this.resolveExistingSpriteKey(character, expression);
            if (!spriteKey) {
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
                //aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
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

    // 可視スプライトを人数に応じて中央基準で左右に均等配置（1〜5人以上対応）
    layoutVisibleCharacters() {
        if (!this.characterSprites) return;
        const sprites = Object.values(this.characterSprites).filter(s => s && s.visible !== false);
        const count = sprites.length;
        if (count === 0) return;
        const width = this.sys?.game?.canvas?.width || this.sys?.game?.config?.width || 800;
        const height = this.sys?.game?.canvas?.height || this.sys?.game?.config?.height || 600;
        const marginLeft = width * 0.08;
        const marginRight = width * 0.92;
        const centerX = width * 0.5;

        // 各スプライトの見かけサイズ（スケール後）を見積もって最小間隔を決定
        const scales = sprites.map(s => this.getPortraitTargetScale(s.width, s.height));
        const scaledWidths = sprites.map((s, i) => s.width * scales[i]);
        const maxScaledWidth = Math.max.apply(null, scaledWidths);
        // 最小間隔は最大幅の約1.05倍（わずかに余白）
        let spacing = maxScaledWidth * 1.05;
        // 画面に収まるように上限を設定
        const available = (marginRight - marginLeft);
        if (count > 1) spacing = Math.min(spacing, available / (count - 1));

        // 中央から左右に広げる配置
        const positions = new Array(count);
        const mid = (count - 1) / 2;
        for (let i = 0; i < count; i++) {
            const offsetIndex = i - mid; // 負は左、正は右
            positions[i] = centerX + offsetIndex * spacing;
        }
        // 余白に収めるためのクリップ
        const minX = marginLeft;
        const maxX = marginRight;
        // 端がはみ出る場合は全体をシフト
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
            const y = scaledHeight >= (height * 0.95) ? height * 0.5 : height * 0.4;
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
        
        // 名前テキストは名前ボックスの中心に置く
        const nbWidth = this.namebox?.displayWidth || 0;
        const height = this.sys?.game?.canvas?.height || this.sys?.game?.config?.height || 600;
        this.nameText.setPosition(this.nameboxLeftMargin + nbWidth / 2, height - 130);
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
                    this._eventHtmlBgm.volume = 0.3;
                    // 1) まず直ちに再生（ユーザー操作コンテキストを活かす）
                    try {
                        const immediate = this._eventHtmlBgm.play();
                        if (immediate && typeof immediate.catch === 'function') {
                            immediate.catch(() => {});
                        }
                    } catch (e) { /* ignore */ }
                    // 2) 失敗時の保険：短い遅延後に再トライ
                    this.time.delayedCall(80, () => {
                        try {
                            if (this._eventHtmlBgm && (this._eventHtmlBgm.paused || this._eventHtmlBgm.ended)) {
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
                if (bgmKey && (!mainScene.cache.audio || !mainScene.cache.audio.exists(bgmKey))) {
                    const path = rawKey ? (mainScene.mapConfig && mainScene.mapConfig.bgm ? mainScene.mapConfig.bgm[rawKey] : undefined) : undefined;
                    if (path) {
                        mainScene.load.audio(bgmKey, path);
                        mainScene.load.once('complete', () => {
                            try { mainScene.audioManager.playBgm(bgmKey, 0.3, true); } catch (e) { /* ignore */ }
                        });
                        mainScene.load.start();
                        return;
                    }
                }
            } catch (e) { /* ignore */ }

            if (bgmKey) {
                try { mainScene.audioManager.playBgm(bgmKey, 0.3, true); } catch (e) { /* ignore */ }
            }
        }
    }

    // 元のBGMに戻す
    restoreOriginalBgm() {
        try {
            // MapSelectionStageも含めて検索
            const mainScene = this.scene.get('Stage1Scene') || this.scene.get('Stage2Scene') || this.scene.get('Stage3Scene') || this.scene.get('MiemachiStage') || this.scene.get('TaketastageStage') || this.scene.get('JapanStage');
            if (mainScene && mainScene.audioManager) {
                // iOS: イベント用HTMLAudioがあれば停止
                try { if (this._eventHtmlBgm) { this._eventHtmlBgm.pause(); this._eventHtmlBgm = null; } } catch (e) { /* ignore */ }
                mainScene.audioManager.stopBgm(false);
                const originalBgmKey = this.getOriginalBgmKey();
                if (originalBgmKey) {
                    mainScene.audioManager.playBgm(originalBgmKey, 0.3, true);
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
            // 装飾の再描画（位置・サイズはUIに追従）
            this.redrawTextboxDecorations && this.redrawTextboxDecorations();
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
            // 装飾の再描画
            this.redrawNameboxDecorations && this.redrawNameboxDecorations();
        }
        
        // テキストのリサイズ（createメソッドと同じロジック）
        if (this.dialogText) {
            const textWrapWidth = Math.min(width - 80, 600);
            const fontSize = width < 600 ? '18px' : '24px';
            
            this.dialogText.setPosition(width * 0.1 + 20, height - 80);
            this.dialogText.setWordWrapWidth(textWrapWidth);
            this.dialogText.setFontSize(fontSize);
            // テキストシャドウは一度設定すれば保持されるが、安全に再設定
            if (this.dialogText.setShadow) this.dialogText.setShadow(2, 2, '#000000', 4, false, true);
        }
        
        // 名前テキストのリサイズ（createメソッドと同じロジック）
        if (this.nameText) {
            const nameFontSize = width < 600 ? '16px' : '20px';
            
            // 名前テキストは名前ボックスの中心に置く
            const nbWidth = this.namebox?.displayWidth || 0;
            this.nameText.setPosition(this.nameboxLeftMargin + nbWidth / 2, height - 130);
            this.nameText.setFontSize(nameFontSize);
            if (this.nameText.setShadow) this.nameText.setShadow(1, 1, '#000000', 3, false, true);
            
            // 現在の名前がある場合は名前ボックスの幅も再調整
            if (this.nameText.text && this.nameText.text !== '') {
                this.adjustNameboxWidth(this.nameText.text);
            }
        }
        
        // 人数に応じた等間隔レイアウト
        this.layoutVisibleCharacters();
    }
    
    // キャラクタースプライトの位置調整
    repositionCharacterSprites() { this.layoutVisibleCharacters(); }
} 