import { ChoiceManager } from '../managers/ChoiceManager.js';

// エンディングシーン
export class EndingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndingScene' });
        this.choiceManager = null;
    }

    preload() {
        console.log('[EndingScene] preload開始');
        
        // エンディング用のBGMを読み込み
        this.load.audio('ending_bgm', 'assets/audio/bgm/ending.mp3');
        
        // 読み込み完了イベントを設定
        this.load.once('complete', () => {
            console.log('[EndingScene] preload完了');
        });
        
        // 読み込みエラーイベントを設定
        this.load.on('error', (file) => {
            console.error('[EndingScene] アセット読み込みエラー:', file);
        });
        
        // 読み込みを開始
        console.log('[EndingScene] preload - this.load.start()を実行');
        this.load.start();
    }

    create() {
        console.log('[EndingScene] create開始');
        console.log('[EndingScene] 画面サイズ:', this.sys.game.canvas.width, 'x', this.sys.game.canvas.height);
        console.log('[EndingScene] ユーザーエージェント:', navigator.userAgent);
        console.log('[EndingScene] ゲームインスタンス:', window.game);
        console.log('[EndingScene] シーンマネージャー:', this.scene.manager);
        console.log('[EndingScene] 現在のシーンキー:', this.scene.key);
        console.log('[EndingScene] シーンがアクティブか:', this.scene.isActive());
        
        // ChoiceManagerを初期化
        this.choiceManager = new ChoiceManager();
        console.log('[EndingScene] ChoiceManager初期化完了');
        console.log('[EndingScene] 初期化後のchoices:', this.choiceManager.choices);
        
        // 明示的に選択データを再読み込み
        this.choiceManager.choices = this.choiceManager.loadChoices();
        console.log('[EndingScene] 再読み込み後のchoices:', this.choiceManager.choices);
        
        // 背景色を設定
        this.cameras.main.setBackgroundColor('#000000');
        console.log('[EndingScene] 背景色設定完了');
        
        // エンディングBGMを再生
        try {
            this.sound.play('ending_bgm', { loop: true, volume: 0.5 });
            console.log('[EndingScene] BGM再生開始');
        } catch (error) {
            console.error('[EndingScene] BGM再生エラー:', error);
        }
        
        // エンディングテキストを表示
        console.log('[EndingScene] showEndingContent呼び出し開始');
        this.showEndingContent();
        console.log('[EndingScene] showEndingContent呼び出し完了');
    }

    showEndingContent() {
        const width = this.sys.game.canvas.width;
        const height = this.sys.game.canvas.height;
        
        // 選択の正解率を取得
        const correctRate = this.getCorrectRate();
        
        // エンディングタイトル
        const title = this.add.text(width / 2, height / 4, 'エンディング', {
            fontSize: '48px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // エンディングメッセージ
        const message = this.add.text(width / 2, height / 2, this.getEndingMessage(), {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            wordWrap: { width: width - 100 }
        }).setOrigin(0.5);
        
        // YouTube動画ボタンはshowEndingContent内で直接表示する
        
        // ボタンコンテナ（良い選択の場合のみ）
        let buttonContainer = null; // 外側で宣言
        
        if (correctRate >= 80) {
            buttonContainer = this.add.container(width / 2, height * 3 / 4);
            
            // ボタン背景
            const background = this.add.graphics();
            background.fillStyle(0xFF6B6B, 0.9);
            background.fillRoundedRect(-120, -30, 240, 60, 10);
            buttonContainer.add(background);
            
            // ボタンテキスト
            const buttonText = this.add.text(0, 0, 'エンディング動画を見る', {
                fontSize: '18px',
                fill: '#FFFFFF',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            buttonContainer.add(buttonText);
            
            // インタラクティブ設定
            buttonContainer.setInteractive(new Phaser.Geom.Rectangle(-120, -30, 240, 60), Phaser.Geom.Rectangle.Contains);
            
            // クリックイベント
            buttonContainer.on('pointerdown', () => {
                this.showYouTubeVideo();
            });
            
            // ホバー効果
            buttonContainer.on('pointerover', () => {
                background.fillStyle(0xFF8E8E, 0.9);
                background.fillRoundedRect(-120, -30, 240, 60, 10);
            });
            
            buttonContainer.on('pointerout', () => {
                background.fillStyle(0xFF6B6B, 0.9);
                background.fillRoundedRect(-120, -30, 240, 60, 10);
            });
        } else {
            // 悪い選択の場合は「タイトルに戻る」ボタンを表示
            buttonContainer = this.add.container(width / 2, height * 3 / 4);
            
            // ボタン背景
            const background = this.add.graphics();
            background.fillStyle(0x4A90E2, 0.9);
            background.fillRoundedRect(-100, -25, 200, 50, 10);
            buttonContainer.add(background);
            
            // ボタンテキスト
            const buttonText = this.add.text(0, 0, 'タイトルに戻る', {
                fontSize: '20px',
                fill: '#FFFFFF',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            buttonContainer.add(buttonText);
            
            // インタラクティブ設定
            buttonContainer.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains);
            
            // クリックイベント
            buttonContainer.on('pointerdown', () => {
                this.returnToTitle();
            });
            
            // ホバー効果
            buttonContainer.on('pointerover', () => {
                background.fillStyle(0x5BA0F2, 0.9);
                background.fillRoundedRect(-100, -25, 200, 50, 10);
            });
            
            buttonContainer.on('pointerout', () => {
                background.fillStyle(0x4A90E2, 0.9);
                background.fillRoundedRect(-100, -25, 200, 50, 10);
            });
        }
        
        // フェードイン効果（存在する要素のみ）
        const fadeTargets = [title, message];
        if (buttonContainer) {
            fadeTargets.push(buttonContainer);
        }
        
        this.tweens.add({
            targets: fadeTargets,
            alpha: { from: 0, to: 1 },
            duration: 2000,
            ease: 'Power2'
        });
    }

    getCorrectRate() {
        // 選択肢の正解率を計算
        console.log('[EndingScene] getCorrectRate開始');
        console.log('[EndingScene] this.choiceManager:', this.choiceManager);
        console.log('[EndingScene] this.choiceManager.choices:', this.choiceManager.choices);
        
        const choices = this.choiceManager.choices;
        let totalChoices = 0;
        let correctChoices = 0;
        
        for (const conversationId in choices) {
            console.log('[EndingScene] conversationId:', conversationId);
            for (const choiceId in choices[conversationId]) {
                console.log('[EndingScene] choiceId:', choiceId, 'value:', choices[conversationId][choiceId]);
                totalChoices++;
                if (choices[conversationId][choiceId] === 'correct') {
                    correctChoices++;
                }
            }
        }
        
        const correctRate = totalChoices > 0 ? (correctChoices / totalChoices) * 100 : 0;
        console.log('[EndingScene] 正解率計算結果: 総選択数=', totalChoices, '正解数=', correctChoices, '正解率=', correctRate + '%');
        
        return correctRate;
    }

    getEndingMessage() {
        const correctRate = this.getCorrectRate();
        
        if (correctRate >= 80) {
            return '素晴らしい判断力でした！\nあなたは正しい選択を続けることができました。\nこの経験を活かして、これからも良い判断を心がけてください。\n\nおめでとうございます！特別なエンディング動画をご覧ください！';
        } else if (correctRate >= 60) {
            return '良い判断ができました！\n多くの場面で正しい選択をすることができました。\nこれからも学びを続けてください。';
        } else if (correctRate >= 40) {
            return 'まずまずの結果でした。\nいくつかの選択で改善の余地がありますが、\n学びの機会として活用してください。';
        } else {
            return '結果は思わしくありませんでしたが、\n失敗から学ぶことも大切です。\nもう一度挑戦してみてください。';
        }
    }



    showYouTubeVideo() {
        // YouTube動画を表示（オープニング動画と同じ動画を使用）
        console.log('[EndingScene] YouTube動画表示開始');
        
        // オープニング動画と同じ動画IDを使用
        const videoId = 'GiJQxEIiGwQ';
        
        console.log('[EndingScene] エンディング動画表示開始');
        
                // 直接YouTubeを開く方式に変更
        console.log('[EndingScene] 直接YouTubeを開く方式でエンディング動画を表示します');
        
        try {
            // 既存の包括的なBGM停止処理を使用
            console.log('[EndingScene] 包括的なBGM停止処理を開始');
            
            // Phaserのサウンドを停止
            this.sound.stopAll();
            
            // HTMLAudioのBGMも停止
            if (this._htmlBgm) {
                this._htmlBgm.pause();
                this._htmlBgm = null;
            }
            
            // グローバルのBGMも停止
            if (window.game && window.game.sound) {
                window.game.sound.stopAll();
            }
            
            // AudioManagerのBGMも停止
            try {
                if (window.audioManager) {
                    console.log('[EndingScene] AudioManagerのBGM停止開始');
                    if (window.audioManager.stopAll) {
                        window.audioManager.stopAll();
                    }
                    if (window.audioManager.stopBgm) {
                        window.audioManager.stopBgm();
                    }
                    console.log('[EndingScene] AudioManagerのBGM停止完了');
                }
            } catch (e) {
                console.error('[EndingScene] AudioManagerのBGM停止エラー:', e);
            }
            
            // 他のシーンのBGMも停止
            if (window.game && window.game.scene && window.game.scene.getScenes) {
                const scenes = window.game.scene.getScenes(false) || [];
                scenes.forEach(scene => {
                    try {
                        if (scene.sound && scene.sound.stopAll) {
                            scene.sound.stopAll();
                        }
                        if (scene._htmlBgm) {
                            scene._htmlBgm.pause();
                            scene._htmlBgm = null;
                        }
                        if (scene._eventHtmlBgm) {
                            scene._eventHtmlBgm.pause();
                            scene._eventHtmlBgm = null;
                        }
                    } catch (e) {
                        // ignore
                    }
                });
            }
            
            // 全国マップ（japanステージ）のBGMを特に停止
            try {
                if (window.game && window.game.scene && window.game.scene.getScene) {
                    const japanScene = window.game.scene.getScene('JapanStage');
                    if (japanScene) {
                        console.log('[EndingScene] JapanStageのBGM停止開始');
                        if (japanScene.sound && japanScene.sound.stopAll) {
                            japanScene.sound.stopAll();
                        }
                        if (japanScene._htmlBgm) {
                            japanScene._htmlBgm.pause();
                            japanScene._htmlBgm = null;
                        }
                        if (japanScene._eventHtmlBgm) {
                            japanScene._eventHtmlBgm.pause();
                            japanScene._eventHtmlBgm = null;
                        }
                        console.log('[EndingScene] JapanStageのBGM停止完了');
                    }
                }
            } catch (e) {
                console.error('[EndingScene] JapanStageのBGM停止エラー:', e);
            }
            
            // 強制的にすべての音声を停止
            try {
                // すべてのaudio要素を停止
                const allAudios = document.querySelectorAll('audio');
                console.log('[EndingScene] 検出されたaudio要素数:', allAudios.length);
                allAudios.forEach((audio, index) => {
                    console.log(`[EndingScene] audio要素${index}を停止`);
                    audio.pause();
                    audio.currentTime = 0;
                    audio.src = '';
                });
                
                // すべてのvideo要素も停止
                const allVideos = document.querySelectorAll('video');
                console.log('[EndingScene] 検出されたvideo要素数:', allVideos.length);
                allVideos.forEach((video, index) => {
                    console.log(`[EndingScene] video要素${index}を停止`);
                    video.pause();
                    video.currentTime = 0;
                });
            } catch (e) {
                console.error('[EndingScene] 音声要素停止エラー:', e);
            }
            
            console.log('[EndingScene] 包括的なBGM停止処理完了');
            
            // 新しいタブでYouTubeを直接開く
            const youtubeUrl = `https://youtu.be/${videoId}`;
            console.log('[EndingScene] YouTubeを開きます:', youtubeUrl);
            
            // 新しいタブでYouTubeを開く
            window.open(youtubeUrl, '_blank');
            
            console.log('[EndingScene] エンディング動画（YouTube）を開きました');
            
            // BGM再開は行わない（ユーザーが動画を見ている間はBGMを停止したまま）
            console.log('[EndingScene] BGMは再開しません（動画視聴中）');
            
            // 少し待ってからタイトルに戻る
            setTimeout(() => {
                console.log('[EndingScene] タイトルに戻ります');
                this.returnToTitle();
            }, 3000);
            
        } catch (error) {
            console.error('[EndingScene] YouTubeを開く際のエラー:', error);
        }
    }

    returnToTitle() {
        // BGMを確実に停止
        console.log('[EndingScene] BGM停止開始');
        
        // Phaserのサウンドを停止
        this.sound.stopAll();
        
        // HTMLAudioのBGMも停止
        if (this._htmlBgm) {
            this._htmlBgm.pause();
            this._htmlBgm = null;
        }
        
        // グローバルのBGMも停止
        if (window.game && window.game.sound) {
            window.game.sound.stopAll();
        }
        
        // AudioManagerのBGMも停止
        try {
            if (window.audioManager) {
                console.log('[EndingScene] AudioManagerのBGM停止開始');
                if (window.audioManager.stopAll) {
                    window.audioManager.stopAll();
                }
                if (window.audioManager.stopBgm) {
                    window.audioManager.stopBgm();
                }
                console.log('[EndingScene] AudioManagerのBGM停止完了');
            }
        } catch (e) {
            console.error('[EndingScene] AudioManagerのBGM停止エラー:', e);
        }
        
        // 他のシーンのBGMも停止
        if (window.game && window.game.scene && window.game.scene.getScenes) {
            const scenes = window.game.scene.getScenes(false) || [];
            scenes.forEach(scene => {
                try {
                    if (scene.sound && scene.sound.stopAll) {
                        scene.sound.stopAll();
                    }
                    if (scene._htmlBgm) {
                        scene._htmlBgm.pause();
                        scene._htmlBgm = null;
                    }
                    if (scene._eventHtmlBgm) {
                        scene._eventHtmlBgm.pause();
                        scene._eventHtmlBgm = null;
                    }
                } catch (e) {
                    // ignore
                }
            });
        }
        
        // 全国マップ（japanステージ）のBGMを特に停止
        try {
            if (window.game && window.game.scene && window.game.scene.getScene) {
                const japanScene = window.game.scene.getScene('JapanStage');
                if (japanScene) {
                    console.log('[EndingScene] JapanStageのBGM停止開始');
                    if (japanScene.sound && japanScene.sound.stopAll) {
                        japanScene.sound.stopAll();
                    }
                    if (japanScene._htmlBgm) {
                        japanScene._htmlBgm.pause();
                        japanScene._htmlBgm = null;
                    }
                    if (japanScene._eventHtmlBgm) {
                        japanScene._eventHtmlBgm.pause();
                        japanScene._eventHtmlBgm = null;
                    }
                    console.log('[EndingScene] JapanStageのBGM停止完了');
                }
            }
        } catch (e) {
            console.error('[EndingScene] JapanStageのBGM停止エラー:', e);
        }
        
        // 強制的にすべての音声を停止
        try {
            // すべてのaudio要素を停止
            const allAudios = document.querySelectorAll('audio');
            console.log('[EndingScene] 検出されたaudio要素数:', allAudios.length);
            allAudios.forEach((audio, index) => {
                console.log(`[EndingScene] audio要素${index}を停止`);
                audio.pause();
                audio.currentTime = 0;
                audio.src = '';
            });
            
            // すべてのvideo要素も停止
            const allVideos = document.querySelectorAll('video');
            console.log('[EndingScene] 検出されたvideo要素数:', allVideos.length);
            allVideos.forEach((video, index) => {
                console.log(`[EndingScene] video要素${index}を停止`);
                video.pause();
                video.currentTime = 0;
            });
        } catch (e) {
            console.error('[EndingScene] 強制停止エラー:', e);
        }
        
        console.log('[EndingScene] BGM停止完了');
        
        // メインメニュー画面に戻る
        console.log('[EndingScene] 戻る処理開始');
        
        // ローディング画面を表示
        if (window.LoadingManager) {
            window.LoadingManager.show('メインメニューに戻っています...', 50);
        }
        
        try {
            // 直接DOM操作でメインメニュー画面に遷移
            const mainMenu = document.getElementById('main-menu');
            const stageSelect = document.getElementById('stage-select');
            
            if (mainMenu && stageSelect) {
                stageSelect.style.display = 'none';
                mainMenu.style.display = 'flex';
                console.log('[EndingScene] メインメニュー画面に直接遷移しました');
                
                // BGMは再生しない（動画視聴中は静寂を保つ）
                console.log('[EndingScene] メインメニューBGMは再生しません（動画視聴中）');
                
                // ローディング画面を非表示
                setTimeout(() => {
                    if (window.LoadingManager) {
                        window.LoadingManager.updateProgress(100, '完了！');
                        setTimeout(() => {
                            window.LoadingManager.hide();
                        }, 500);
                    }
                }, 1000);
            } else {
                console.error('[EndingScene] メインメニュー要素が見つかりません');
                // フォールバック：showStageSelectを使用
                if (window.showStageSelect) {
                    window.showStageSelect();
                    console.log('[EndingScene] フォールバック：showStageSelectを使用しました');
                }
                
                // ローディング画面を非表示
                if (window.LoadingManager) {
                    window.LoadingManager.hide();
                }
            }
        } catch (error) {
            console.error('[EndingScene] メインメニュー画面への遷移エラー:', error);
            // フォールバック：showStageSelectを使用
            if (window.showStageSelect) {
                window.showStageSelect();
                console.log('[EndingScene] フォールバック：showStageSelectを使用しました');
            }
            
            // ローディング画面を非表示
            if (window.LoadingManager) {
                window.LoadingManager.hide();
            }
        }
    }
}
