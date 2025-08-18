export class UIManager {
    constructor() {
        this.playerPosText = null;
        this.backButton = null;
    }
    
    createUI(scene) {
        // タイトル表示
        scene.add.text(400, 50, '★★★テスト中★★★bbbbb', {
            fontSize: '24px',
            fill: '#000000',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        scene.add.text(400, 550, '矢印キーまたはWASDで移動！マップ上を歩いてみよう！', {
            fontSize: '16px',
            fill: '#000000'
        }).setOrigin(0.5);

        // デバッグ用：座標表示
        this.playerPosText = scene.add.text(10, 10, '', {
            fontSize: '16px',
            fill: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 5, y: 5 }
        });
        
        // 戻るボタンを作成
        this.createBackButton(scene);
    }
    
    // 戻るボタンを作成する関数
    createBackButton(scene) {
        // シーンの有効性をチェック
        if (!scene || !scene.cameras || !scene.cameras.main) {
            console.warn('UIManager: Scene or camera is not available for back button');
            return;
        }
        
        // inputシステムの有効性をチェック
        if (!scene.input) {
            console.warn('UIManager: Scene input system is not available for back button');
            return;
        }
        
        // === 戻るボタンの背景（現代風ゲームポップ） ===
        this.backButtonGraphics = scene.add.graphics();
        
        // 影を描画
        this.backButtonGraphics.fillStyle(0x000000, 0.3);
        this.backButtonGraphics.fillRoundedRect(4.5, 4.5, 155, 30, 8);
        
        // メイン背景を描画
        this.backButtonGraphics.fillStyle(0x2a2a2a, 0.95);
        this.backButtonGraphics.fillRoundedRect(2.5, 2.5, 155, 30, 8);
        
        // 光沢効果（上部）
        this.backButtonGraphics.fillStyle(0xffffff, 0.1);
        this.backButtonGraphics.fillRoundedRect(2.5, 2.5, 155, 15, 8);
        
        this.backButtonGraphics.setDepth(1000);  // 表示順序
        this.backButtonGraphics.setScrollFactor(0);  // カメラに固定
        // === クリック可能エリアの設定 ===
        this.backButtonGraphics.setInteractive(new Phaser.Geom.Rectangle(5, 5, 150, 40), Phaser.Geom.Rectangle.Contains);
        
        // === ボタンテキストの内容を動的に設定 ===
        let buttonText = '戻る';  // デフォルトテキスト
        if (scene.scene && scene.scene.key) {
            if (scene.scene.key === 'Stage1Scene' || scene.scene.key === 'Stage2Scene' || scene.scene.key === 'Stage3Scene') {
                buttonText = 'マップに戻る';  // 通常ステージ用
            } else if (scene.scene.key === 'MiemachiStage' || scene.scene.key === 'TaketastageStage' || scene.scene.key === 'JapanStage') {
                buttonText = 'ステージ選択画面';  // マップステージ用
            }
        }
        
        // === ボタンクリック時の処理 ===
        this.backButtonGraphics.on('pointerdown', (pointer, x, y, event) => {
            try { if (event && event.preventDefault) event.preventDefault(); } catch (e) { /* ignore */ }
            try { if (event && event.stopImmediatePropagation) event.stopImmediatePropagation(); } catch (e) { /* ignore */ }
            
            // シーンの種類に応じて戻る処理を分岐
            if (scene.scene?.key === 'Stage1Scene' || scene.scene?.key === 'Stage2Scene' || scene.scene?.key === 'Stage3Scene') {
                // ステージから戻る（returnToMapが優先、returnToStageSelectがフォールバック）
                // まずこのタップで音の解錠・再生やロードが走らないように全て抑止
                try { if (scene.input && scene.input.removeAllListeners) scene.input.removeAllListeners('pointerdown'); } catch(e) { /* ignore */ }
                try { if (scene.sound && scene.sound.removeAllListeners) scene.sound.removeAllListeners('unlocked'); } catch(e) { /* ignore */ }
                try { if (scene.sound && scene.sound.stopAll) scene.sound.stopAll(); } catch(e) { /* ignore */ }
                try { if (scene.audioManager && scene.audioManager.stopAll) scene.audioManager.stopAll(); } catch(e) { /* ignore */ }
                try { if (scene._htmlBgm) { scene._htmlBgm.pause(); scene._htmlBgm = null; } } catch(e) { /* ignore */ }
                try { if (scene._eventHtmlBgm) { scene._eventHtmlBgm.pause(); scene._eventHtmlBgm = null; } } catch(e) { /* ignore */ }
                try { if (scene.load && scene.load.reset) scene.load.reset(); } catch(e) { /* ignore */ }
                try { if (scene.load && scene.load.removeAllListeners) scene.load.removeAllListeners(); } catch(e) { /* ignore */ }
                try { if (scene.scene && scene.scene.get && scene.scene.get('ConversationScene')) scene.scene.remove('ConversationScene'); } catch(e) { /* ignore */ }
                
                const goBack = () => {
                    if (window.returnToMap) {
                        window.returnToMap();
                    } else if (window.returnToStageSelect) {
                        window.returnToStageSelect();
                    } else if (window.returnToMiemachi) {
                        window.returnToMiemachi();
                    } else {
                        const stageSelect = document.getElementById('stage-select');
                        const gameContainer = document.getElementById('game-container');
                        if (stageSelect) stageSelect.style.display = 'flex';
                        if (gameContainer) gameContainer.style.display = 'none';
                    }
                };
                try { requestAnimationFrame(() => setTimeout(goBack, 0)); } catch (_) { goBack(); }
            } else if (scene.scene?.key === 'MiemachiStage' || scene.scene?.key === 'TaketastageStage' || scene.scene?.key === 'JapanStage') {
                // マップからステージ選択画面に戻る
                
                // returnToMapをクリア
                window.returnToMap = null;
                // マップBGMの自動起動をこのタップで絶対に発生させない
                try { scene._suppressMapBgm = true; } catch(e) { /* ignore */ }
                try { if (scene._bgmRetry && scene._bgmRetry.remove) { scene._bgmRetry.remove(false); scene._bgmRetry = null; } } catch(e) { /* ignore */ }
                try { if (scene.input && scene.input.removeAllListeners) { scene.input.removeAllListeners('pointerdown'); } } catch(e) { /* ignore */ }
                try { if (scene._htmlBgm) { scene._htmlBgm.pause(); scene._htmlBgm = null; } } catch(e) { /* ignore */ }
                try { if (scene.audioManager && scene.audioManager.stopAll) scene.audioManager.stopAll(); } catch(e) { /* ignore */ }
                // サウンドのunlocked待ちリスナーも除去（戻るタップで解放されても発火させない）
                try { if (scene.sound && scene.sound.removeAllListeners) scene.sound.removeAllListeners('unlocked'); } catch(e) { /* ignore */ }
                
                const backToSelect = () => {
                    try {
                        if (window.returnToStageSelect) {
                            window.returnToStageSelect();
                        } else {
                            const stageSelect = document.getElementById('stage-select');
                            const gameContainer = document.getElementById('game-container');
                            if (stageSelect) stageSelect.style.display = 'flex';
                            if (gameContainer) gameContainer.style.display = 'none';
                        }
                    } catch (err) { /* ignore */ }
                };
                try { requestAnimationFrame(() => setTimeout(backToSelect, 0)); } catch (_) { backToSelect(); }
            } else {
                // その他のシーン：ステージ選択画面に戻る
                const back = () => {
                    if (window.returnToStageSelect) {
                        window.returnToStageSelect();
                    } else {
                        const stageSelect = document.getElementById('stage-select');
                        const gameContainer = document.getElementById('game-container');
                        if (stageSelect) stageSelect.style.display = 'flex';
                        if (gameContainer) gameContainer.style.display = 'none';
                    }
                };
                try { requestAnimationFrame(() => setTimeout(back, 0)); } catch (_) { back(); }
            }
        });
        
        // キーボードショートカットでも戻る機能を追加
        if (scene.input && scene.input.keyboard) {
            scene.input.keyboard.on('keydown-ESC', () => {
                if (window.returnToStageSelect) {
                    window.returnToStageSelect();
                } else {
                    // フォールバック：直接ステージ選択画面を表示
                    const stageSelect = document.getElementById('stage-select');
                    const gameContainer = document.getElementById('game-container');
                    if (stageSelect) {
                        stageSelect.style.display = 'block';
                    }
                    if (gameContainer) {
                        gameContainer.style.display = 'none';
                    }
                }
            });
        }
        
        // === ホバー効果（マウスオーバー時の色変更） ===
        this.backButtonGraphics.on('pointerover', () => {
            this.backButtonGraphics.clear();
            
            // ホバー時の影
            this.backButtonGraphics.fillStyle(0x000000, 0.4);
            this.backButtonGraphics.fillRoundedRect(4.5, 4.5, 155, 30, 8);
            
            // ホバー時のメイン背景（明るく）
            this.backButtonGraphics.fillStyle(0x3a3a3a, 0.98);
            this.backButtonGraphics.fillRoundedRect(2.5, 2.5, 155, 30, 8);
            
            // ホバー時の光沢効果（より明るく）
            this.backButtonGraphics.fillStyle(0xffffff, 0.15);
            this.backButtonGraphics.fillRoundedRect(2.5, 2.5, 155, 15, 8);
        });
        // === マウスアウト時の色戻し ===
        this.backButtonGraphics.on('pointerout', () => {
            this.backButtonGraphics.clear();
            
            // 通常時の影
            this.backButtonGraphics.fillStyle(0x000000, 0.3);
            this.backButtonGraphics.fillRoundedRect(4.5, 4.5, 155, 30, 8);
            
            // 通常時のメイン背景
            this.backButtonGraphics.fillStyle(0x2a2a2a, 0.95);
            this.backButtonGraphics.fillRoundedRect(2.5, 2.5, 155, 30, 8);
            
            // 通常時の光沢効果
            this.backButtonGraphics.fillStyle(0xffffff, 0.1);
            this.backButtonGraphics.fillRoundedRect(2.5, 2.5, 155, 15, 8);
        });
        
        // === 戻るボタンのテキスト表示 ===
        this.backButtonText = scene.add.text(80, 25, buttonText, {  // 位置(80,25)にテキスト配置
            fontSize: '18px',  // フォントサイズ
            fill: '#ffffff',  // 白色
            fontWeight: 'bold',  // 太字
            fixedHeight: 50,  // 高さ固定
            wordWrap: { width: 150 },  // 文字の折り返し
            align: 'center',  // 文字の中央揃え
            padding: { x: 10, y: 10 }  // パディング
        });
        this.backButtonText.setOrigin(0.5, 0.5);  // テキストの中心を基準に配置（上寄り）
        this.backButtonText.setScrollFactor(0);  // カメラに固定
        this.backButtonText.setDepth(1001);  // ボタンより手前に表示
        
        // 画面リサイズ時の位置調整
        scene.scale.on('resize', () => {
            if (scene && scene.cameras && scene.cameras.main && this.backButtonGraphics) {
                // 左上の位置は固定なので調整不要
            }
        });
    }
    
    updatePlayerPosition(player) {
        // プレイヤーが移動した時の情報を記録（ログは削除）
        if (!this.lastPlayerX || !this.lastPlayerY || 
            Math.abs(player.x - this.lastPlayerX) > 1 || 
            Math.abs(player.y - this.lastPlayerY) > 1) {
            this.lastPlayerX = player.x;
            this.lastPlayerY = player.y;
        }
        
        // 座標表示を両方のデバイスで表示
        if (this.playerPosText) {
            this.playerPosText.setText(`ひろかず位置: X=${Math.round(player.x)}, Y=${Math.round(player.y)}`);
        }
    }
    
    // マップステージ専用のUIを作成
    createMapUI(scene, title) {
        // タイトル表示（左下に配置）
        this.titleText = scene.add.text(5, scene.cameras.main.height - 25, title, {
            fontSize: '18px',
            fill: '#FFD700',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 12, y: 6 },
            borderRadius: 8,
            stroke: '#FF6B35',
            strokeThickness: 2,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 6,
                fill: true
            }
        }).setOrigin(0, 1);
        
        // 説明テキスト（左下に配置）
        this.instructionText = scene.add.text(5, scene.cameras.main.height - 15, '場所をタップして移動！', {
            fontSize: '14px',
            fill: '#FF6B35',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: { x: 8, y: 4 },
            borderRadius: 6,
            stroke: '#FF00FF',
            strokeThickness: 2,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#FF6B35',
                blur: 8,
                fill: true
            }
        }).setOrigin(0, 1);
        
        // 初期表示時の位置をリサイズ時と同じに調整
        this.updateMapUI({ width: scene.cameras.main.width, height: scene.cameras.main.height });
        
        // 完了状態リセットボタン（ステージ選択画面のみに表示）
        if (title === 'ステージ選択画面') {
            this.createResetButton(scene);
        }
        
        // 戻るボタンは削除 - 右上の戻るボタンのみを使用
        
        // 選択された場所の情報表示用
        this.selectedAreaText = scene.add.text(scene.cameras.main.centerX, scene.cameras.main.height - 50, '', {
            fontSize: '14px',
            fill: '#000000',
            backgroundColor: 'transparent',
            padding: { x: 8, y: 4 },
            borderRadius: 8
        }).setOrigin(0.5);
        
        // MapUI created successfully
    }

    // ゲームリセットボタンを作成
    createResetButton(scene) {
        // ゲームリセットボタン（左上に配置）
        this.resetButton = scene.add.text(10, 10, 'ゲームリセット', {
            fontSize: '14px',
            fill: '#FF0000',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: { x: 10, y: 6 },
            borderRadius: 6,
            stroke: '#FFFFFF',
            strokeThickness: 1
        }).setOrigin(0, 0);
        
        this.resetButton.setInteractive();
        this.resetButton.on('pointerdown', () => {
            // 完了状態をリセット
            if (scene.areaSelectionManager) {
                scene.areaSelectionManager.resetAllCompletions();
                console.log('完了状態をリセットしました');
            }
            
            // ステージ選択画面に戻る
            if (window.returnToStageSelect) {
                window.returnToStageSelect();
            } else {
                // フォールバック：直接ステージ選択画面を表示
                const stageSelect = document.getElementById('stage-select');
                const gameContainer = document.getElementById('game-container');
                if (stageSelect) stageSelect.style.display = 'flex';
                if (gameContainer) gameContainer.style.display = 'none';
            }
        });
        
        // ホバー効果
        this.resetButton.on('pointerover', () => {
            this.resetButton.setStyle({ backgroundColor: 'rgba(255, 0, 0, 0.9)' });
        });
        
        this.resetButton.on('pointerout', () => {
            this.resetButton.setStyle({ backgroundColor: 'rgba(0, 0, 0, 0.8)' });
        });
    }
    
    // MapUI専用の更新メソッド
    updateMapUI(gameSize) {
        // 画面サイズに応じてUI要素の位置を調整（左下に配置）
        const centerX = gameSize.width / 2;
        
        if (this.titleText) {
            this.titleText.setPosition(10, gameSize.height - 40);
        }
        
        if (this.instructionText) {
            // 説明テキストの位置を確実に左下に配置
            this.instructionText.setPosition(10, gameSize.height - 15);
            console.log(`[UIManager] 説明テキストの位置を更新: (10, ${gameSize.height - 15})`);
        }
        
        if (this.selectedAreaText) {
            this.selectedAreaText.setPosition(centerX, gameSize.height - 50);
        }
        
        // MapUI updated for size
    }
    
    // 選択されたエリアの情報を表示
    showSelectedArea(areaName, areaDescription) {
        if (this.selectedAreaText) {
            this.selectedAreaText.setText(`エリア: ${areaName}
${areaDescription}`);
        }
    }
    
    // 会話シーン用の戻るボタンを作成
    createConversationBackButton(scene) {
        // === 戻るボタンの背景（現代風ゲームポップ） ===
        this.conversationBackButtonGraphics = scene.add.graphics();
        
        // 影を描画
        this.conversationBackButtonGraphics.fillStyle(0x000000, 0.3);
        this.conversationBackButtonGraphics.fillRoundedRect(4.5, 4.5, 155, 30, 8);
        
        // メイン背景を描画
        this.conversationBackButtonGraphics.fillStyle(0x2a2a2a, 0.95);
        this.conversationBackButtonGraphics.fillRoundedRect(2.5, 2.5, 155, 30, 8);
        
        // 光沢効果（上部）
        this.conversationBackButtonGraphics.fillStyle(0xffffff, 0.1);
        this.conversationBackButtonGraphics.fillRoundedRect(2.5, 2.5, 155, 15, 8);
        
        this.conversationBackButtonGraphics.setDepth(1000);  // 表示順序
        this.conversationBackButtonGraphics.setScrollFactor(0);  // カメラに固定
        
        // === クリック可能エリアの設定 ===
        this.conversationBackButtonGraphics.setInteractive(new Phaser.Geom.Rectangle(5, 5, 150, 40), Phaser.Geom.Rectangle.Contains);
        
        // === ボタンテキストの内容を動的に設定 ===
        let buttonText = '会話を中断';  // イベント会話用のテキスト
        
        // === ボタンクリック時の処理 ===
        this.conversationBackButtonGraphics.on('pointerdown', () => {
            // 会話を中断して元のシーンに戻る
            if (scene.interruptConversation) {
                scene.interruptConversation();
            }
        });
        
        // === ホバー効果（マウスオーバー時の色変更） ===
        this.conversationBackButtonGraphics.on('pointerover', () => {
            this.conversationBackButtonGraphics.clear();
            
            // ホバー時の影
            this.conversationBackButtonGraphics.fillStyle(0x000000, 0.4);
            this.conversationBackButtonGraphics.fillRoundedRect(4.5, 4.5, 155, 30, 8);
            
            // ホバー時のメイン背景（明るく）
            this.conversationBackButtonGraphics.fillStyle(0x3a3a3a, 0.98);
            this.conversationBackButtonGraphics.fillRoundedRect(2.5, 2.5, 155, 30, 8);
            
            // ホバー時の光沢効果（より明るく）
            this.conversationBackButtonGraphics.fillStyle(0xffffff, 0.15);
            this.conversationBackButtonGraphics.fillRoundedRect(2.5, 2.5, 155, 15, 8);
        });
        
        // === マウスアウト時の色戻し ===
        this.conversationBackButtonGraphics.on('pointerout', () => {
            this.conversationBackButtonGraphics.clear();
            
            // 通常時の影
            this.conversationBackButtonGraphics.fillStyle(0x000000, 0.3);
            this.conversationBackButtonGraphics.fillRoundedRect(4.5, 4.5, 155, 30, 8);
            
            // 通常時のメイン背景
            this.conversationBackButtonGraphics.fillStyle(0x2a2a2a, 0.95);
            this.conversationBackButtonGraphics.fillRoundedRect(2.5, 2.5, 155, 30, 8);
            
            // 通常時の光沢効果
            this.conversationBackButtonGraphics.fillStyle(0xffffff, 0.1);
            this.conversationBackButtonGraphics.fillRoundedRect(2.5, 2.5, 155, 15, 8);
        });
        
        // === 戻るボタンのテキスト表示 ===
        this.conversationBackButtonText = scene.add.text(80, 25, buttonText, {  // 位置(80,25)にテキスト配置
            fontSize: '18px',  // フォントサイズ
            fill: '#ffffff',  // 白色
            fontWeight: 'bold',  // 太字
            fixedHeight: 50,  // 高さ固定
            wordWrap: { width: 150 },  // 文字の折り返し
            align: 'center',  // 文字の中央揃え
            padding: { x: 10, y: 10 }  // パディング
        });
        this.conversationBackButtonText.setOrigin(0.5, 0.5);  // テキストの中心を基準に配置（上寄り）
        this.conversationBackButtonText.setScrollFactor(0);  // カメラに固定
        this.conversationBackButtonText.setDepth(1001);  // ボタンより手前に表示
        
        // 画面リサイズ時の位置調整
        scene.scale.on('resize', () => {
            if (this.conversationBackButtonGraphics) {
                // 左上の位置は固定なので調整不要
            }
        });
    }
    
    // 会話用戻るボタンのクリーンアップ
    cleanupConversationBackButton() {
        if (this.conversationBackButtonGraphics) {
            this.conversationBackButtonGraphics.destroy();
            this.conversationBackButtonGraphics = null;
        }
        
        if (this.conversationBackButtonText) {
            this.conversationBackButtonText.destroy();
            this.conversationBackButtonText = null;
        }
    }
    
    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        try {
            const destroyIfExists = (prop) => {
                if (this[prop] && typeof this[prop].destroy === 'function') {
                    this[prop].destroy();
                    this[prop] = null;
                }
            };
            destroyIfExists('playerPosText');
            destroyIfExists('backButtonGraphics'); // 新しいプロパティを追加
            destroyIfExists('backButtonText');
            destroyIfExists('titleText');
            destroyIfExists('instructionText');
            destroyIfExists('selectedAreaText');
            destroyIfExists('resetButton');
            
            // 会話用戻るボタンのクリーンアップ
            this.cleanupConversationBackButton();
        } catch (error) {
            console.error('Error during UIManager cleanup:', error);
        }
    }
} 