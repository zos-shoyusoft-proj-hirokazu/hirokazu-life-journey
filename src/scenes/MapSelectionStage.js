import { AreaSelectionManager } from '../managers/AreaSelectionManager.js';
import { UIManager } from '../managers/UIManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { MapManager } from '../managers/MapManager.js';
import { CameraManager } from '../managers/CameraManager.js';
import { AreaConfig } from '../config/AreaConfig.js';
import { VisualFeedbackManager } from '../managers/VisualFeedbackManager.js';
import { ConversationTrigger } from '../managers/ConversationTrigger.js';
import { ConversationScene } from '../managers/ConversationScene.js';
import { ChoiceManager } from '../managers/ChoiceManager.js';


export class MapSelectionStage extends Phaser.Scene {
    constructor(config) {
        super({ key: config.sceneKey });
        
        // 設定を保存
        this.mapConfig = config.mapConfig;
        this.mapId = config.mapId;
        
        // マネージャーの初期化
        this.mapManager = null;
        this.areaSelectionManager = null;
        this.uiManager = null;
        this.cameraManager = null;
        this.audioManager = null;
        this.visualFeedbackManager = null;
        
        // スマホ対応
        this.isMobile = false;
        
        // 拡大ボタンの参照を保持
        this.scaleToggleButton = null;
        this.scaleToggleButtonGraphics = null;

        // BGM多重起動防止フラグ
        this._bgmStarted = false;
        // 会話中などでマップBGMを抑制するフラグ
        this._suppressMapBgm = false;
        // 自動リトライイベントのハンドル
        this._bgmRetry = null;
        // 会話中フラグ
        this._isInConversation = false;
        
        // エンディングシステム
        this.choiceManager = null;
        this.endingButton = null;
    }

    preload() {
        // 設定ファイルから動的にアセットを読み込み
        // フォルダ名とファイル名を統一
        const folderName = this.mapConfig.folderName || this.mapId;
        const mapFileName = this.mapConfig.mapFileName || this.mapConfig.mapKey;
        const tilesetFileName = this.mapConfig.tilesetFileName || this.mapConfig.tilesetKey;
        
        this.load.tilemapTiledJSON(this.mapConfig.mapKey, `assets/maps/${folderName}/${mapFileName}.tmj`);
        this.load.image(this.mapConfig.tilesetKey, `assets/maps/${folderName}/${tilesetFileName}.png`);
        
        // デバッグ用：読み込みエラーを詳細にログ出力
        this.load.on('fileerror', (file) => {
            console.error(`File not found: ${file.key}, path: ${file.url}`);
        });
        
        // ファイル読み込みの詳細ログ
        this.load.on('load', (file) => {
            console.log(`[MapSelectionStage] ファイル読み込み成功: ${file.key}, type: ${file.type}`);
        });
        
        // 読み込み進捗を表示
        this.load.on('progress', (progress) => {
            console.log(`[MapSelectionStage] 読み込み進捗: ${(progress * 100).toFixed(1)}%`);
            if (window.LoadingManager) {
                window.LoadingManager.updateProgress(progress * 100);
            }
        });
        
        this.load.on('loaderror', (file) => {
            console.error(`[MapSelectionStage] ファイル読み込みエラー: ${file.key}, error:`, file);
            // エラーが発生した場合でもローディング画面を終了
            if (window.LoadingManager) {
                console.log('[MapSelectionStage] エラー発生によりローディング画面を強制終了');
                window.LoadingManager.hide();
            }
        });
        
        // UI要素とアイコン
        
        // 最小限のリソースのみ読み込み（会話イベント用は後で動的読み込み）
        this.loadMinimalResources();
        
        // エラーハンドリング
        this.load.on('fileerror', (file) => {
            console.warn(`File not found: ${file.key}, using fallback`);
            this.mapManager?.createFallbackImage(file.key);
        });
        
        // デバッグ用
        this.load.on('complete', () => {
            console.log(`[MapSelectionStage] リソース読み込み完了: ${this.mapId}`);
            console.log(`[MapSelectionStage] マップファイル: ${this.mapConfig.mapKey}`);
            console.log(`[MapSelectionStage] タイルセット: ${this.mapConfig.tilesetKey}`);
            
            // 読み込まれたリソースの詳細を確認
            try {
                if (this.cache.tilemap && this.cache.tilemap.entries) {
                    console.log('[MapSelectionStage] 読み込まれたリソース:', this.cache.tilemap.entries);
                } else {
                    console.log('[MapSelectionStage] タイルマップキャッシュが利用できません');
                }
                
                if (this.cache.image && this.cache.image.entries) {
                    console.log('[MapSelectionStage] 読み込まれた画像:', this.cache.image.entries);
                } else {
                    console.log('[MapSelectionStage] 画像キャッシュが利用できません');
                }
            } catch (error) {
                console.warn('[MapSelectionStage] キャッシュ情報の取得に失敗:', error);
            }
            
            // ローディング画面を強制終了（デバッグ用）
            if (window.LoadingManager) {
                console.log('[MapSelectionStage] ローディング画面を強制終了');
                window.LoadingManager.updateProgress(100, '完了！');
                setTimeout(() => {
                    window.LoadingManager.hide();
                }, 500);
            }
            
            // マップ作成
            this.createMap();
        });
    }
    
    // 会話開始・終了のイベントリスナーを設定
    // TODO: 個別シーン（DynamicConversationScene）で動作するため、
    // このイベントリスナーは動作しない可能性がある
    // 修正が必要：DynamicConversationScene.jsで会話状態管理を行うべき
    setupConversationEventListeners() {
        // ConversationSceneの会話開始・終了イベントを監視
        // 注意：個別シーン内で動作するため、このイベントは受信されない可能性
        this.events.on('conversationStarted', () => {
            this._isInConversation = true;
            console.log('[MapSelectionStage] 会話開始: 他のエリアをタップできません');
        });
        
        this.events.on('conversationEnded', () => {
            this._isInConversation = false;
            console.log('[MapSelectionStage] 会話終了: 他のエリアをタップできます');
        });
        
        this.events.on('conversationInterrupted', () => {
            this._isInConversation = false;
            console.log('[MapSelectionStage] 会話中断: 他のエリアをタップできます');
        });
    }

    // エンディングボタンをチェックして表示
    checkAndShowEndingButton() {
        console.log('[MapSelectionStage] エンディングボタンの表示条件をチェック中...');
        
        // リセット直後の場合は表示しない
        if (window.__justReset) {
            console.log('[MapSelectionStage] リセット直後のため、エンディングボタンの表示をスキップします');
            return;
        }
        
        if (!this.choiceManager) {
            console.log('[MapSelectionStage] ChoiceManagerが初期化されていません');
            return;
        }
        
        // 選択データを再読み込み（ローカルストレージから最新のデータを取得）
        this.choiceManager.choices = this.choiceManager.loadChoices();
        console.log('[MapSelectionStage] 選択データを再読み込みしました');
        
        // 現在の選択データをデバッグ表示
        this.choiceManager.debugChoices();
        
        const endingConditionMet = this.choiceManager.checkEndingCondition();
        console.log('[MapSelectionStage] エンディング条件達成:', endingConditionMet);
        
        if (endingConditionMet) {
            console.log('[MapSelectionStage] エンディングボタンを表示します');
            this.showEndingButton();
        } else {
            console.log('[MapSelectionStage] エンディング条件未達成のため、ボタンを表示しません');
            console.log('[MapSelectionStage] 現在の選択データ:', this.choiceManager.choices);
        }
    }
    
    // エンディングボタンを表示
    showEndingButton() {
        const width = this.sys.game.canvas.width;
        const height = this.sys.game.canvas.height;
        
        // 右下に配置（マージン: 20px）
        const buttonWidth = 200;
        const buttonHeight = 50;
        const margin = 20;
        const x = width - buttonWidth / 2 - margin;
        const y = height - buttonHeight / 2 - margin;
        
        console.log(`[MapSelectionStage] エンディングボタン配置: x=${x}, y=${y}, 画面サイズ=${width}x${height}`);
        
        // エンディングボタンを作成
        const buttonContainer = this.add.container(x, y);
        
        // ボタン背景
        const background = this.add.graphics();
        background.fillStyle(0x8B4513, 0.9); // 茶色の背景
        background.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
        buttonContainer.add(background);
        
        // ボタンテキスト
        const text = this.add.text(0, 0, 'エンディング', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        buttonContainer.add(text);
        
        // インタラクティブ設定
        buttonContainer.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        
        // クリックイベント
        buttonContainer.on('pointerdown', () => {
            console.log('[MapSelectionStage] エンディングボタンがクリックされました');
            this.startEnding();
        });
        
        // ホバー効果
        buttonContainer.on('pointerover', () => {
            background.fillStyle(0xA0522D, 0.9); // 明るい茶色
            background.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
        });
        
        buttonContainer.on('pointerout', () => {
            background.fillStyle(0x8B4513, 0.9); // 元の茶色
            background.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
        });
        
        this.endingButton = buttonContainer;
        console.log(`[MapSelectionStage] エンディングボタンを右下に表示しました: 位置(${x}, ${y})`);
    }
    
    // エンディングを開始
    startEnding() {
        console.log('[MapSelectionStage] エンディングを開始します');
        
        // エンディング開始時にBGMを停止
        console.log('[MapSelectionStage] BGM停止開始');
        
        // 現在のシーンのBGMを停止
        if (this.sound && this.sound.stopAll) {
            this.sound.stopAll();
        }
        if (this._htmlBgm) {
            this._htmlBgm.pause();
            this._htmlBgm = null;
        }
        if (this._eventHtmlBgm) {
            this._eventHtmlBgm.pause();
            this._eventHtmlBgm = null;
        }
        
        // グローバルのサウンドを停止
        if (window.game && window.game.sound) {
            window.game.sound.stopAll();
        }
        
        // すべてのシーンのBGMを停止
        if (window.game && window.game.scene && window.game.scene.getScenes) {
            const scenes = window.game.scene.getScenes(false) || [];
            console.log('[MapSelectionStage] 全シーンのBGM停止開始');
            scenes.forEach((scene, index) => {
                try {
                    console.log(`[MapSelectionStage] シーン${index}のBGM停止:`, scene.scene?.key);
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
                    console.error(`[MapSelectionStage] シーン${index}のBGM停止エラー:`, e);
                }
            });
            console.log('[MapSelectionStage] 全シーンのBGM停止完了');
        }
        
        // AudioManagerのBGMも停止
        try {
            if (window.audioManager) {
                console.log('[MapSelectionStage] AudioManagerのBGM停止開始');
                if (window.audioManager.stopAll) {
                    window.audioManager.stopAll();
                }
                if (window.audioManager.stopBgm) {
                    window.audioManager.stopBgm();
                }
                console.log('[MapSelectionStage] AudioManagerのBGM停止完了');
            }
        } catch (e) {
            console.error('[MapSelectionStage] AudioManagerのBGM停止エラー:', e);
        }
        
        // すべてのaudio要素を強制停止
        try {
            const allAudios = document.querySelectorAll('audio');
            console.log('[MapSelectionStage] 検出されたaudio要素数:', allAudios.length);
            allAudios.forEach((audio, index) => {
                console.log(`[MapSelectionStage] audio要素${index}を停止`);
                audio.pause();
                audio.currentTime = 0;
                audio.src = '';
            });
        } catch (e) {
            console.error('[MapSelectionStage] BGM強制停止エラー:', e);
        }
        
        console.log('[MapSelectionStage] BGM停止完了');
        
        // エンディングシーンに遷移（gameController経由）
        if (window.startPhaserGame) {
            window.startPhaserGame('ending');
        } else {
            console.error('[MapSelectionStage] startPhaserGameが見つかりません');
        }
    }
    
    // 削除済み：BGMファイルを動的に読み込む（不要）
    // loadBgmFiles() {
    //     
    //     // bgmがオブジェクト形式なら各用途ごとにロード
    //     if (this.mapConfig.bgm && typeof this.mapConfig.bgm === 'object') {
    //         Object.keys(this.mapConfig.bgm).forEach(bgmKey => {
    //         this.load.audio(`bgm_${bgmKey}`, this.mapConfig.bgm[bgmKey]);
    //     });
    //     }
    //     
    //     // マップ固有のイベントBGMがあれば読み込み
    //     if (this.mapConfig.eventBgm) {
    //         Object.keys(this.mapConfig.eventBgm).forEach(eventKey => {
    //         this.load.audio(`bgm_event_${eventKey}`, this.mapConfig.eventBgm[eventKey]);
    //     });
    //     }
    // }

    // 削除済み：キャラクター画像ファイルを動的に読み込む（不要）
    // loadCharacterFiles() {
    //     // AreaConfigからキャラクター画像を動的に読み込み
    //     if (this.mapConfig.characters) {
    //         Object.keys(this.mapConfig.characters).forEach(charKey => {
    //         this.load.image(charKey, this.mapConfig.characters[charKey]);
    //     });
    //     }
    // }

    // 最小限のリソースのみ読み込み（会話イベント用は後で動的読み込み）
    loadMinimalResources() {
        // マップ表示に必要な最小限のリソースのみ
        console.log('[MapSelectionStage] 最小限リソース読み込み開始');
        
        // 基本的なSE（マップ操作用のみ）
        this.loadMapSeFiles();
        
        // マップBGM（基本の1つだけ）
        if (this.mapConfig.bgm && typeof this.mapConfig.bgm === 'object') {
            const mainBgm = Object.keys(this.mapConfig.bgm)[0]; // 最初のBGMのみ
            if (mainBgm) {
                this.load.audio(`bgm_${mainBgm}`, this.mapConfig.bgm[mainBgm]);
                console.log(`[MapSelectionStage] 基本BGM読み込み: ${mainBgm}`);
            }
        }
        
        console.log('[MapSelectionStage] 最小限リソース読み込み完了');
    }
    
    // マップ操作用のSEのみ読み込み
    loadMapSeFiles() {
        if (this.mapConfig.se) {
            // マップ操作用のSEのみ読み込み（会話イベント用は除外）
            const mapSeKeys = ['se_touch', 'se_map_touch'];
            mapSeKeys.forEach(seKey => {
                if (this.mapConfig.se[seKey]) {
                    const sePath = this.mapConfig.se[seKey];
                    console.log(`[MapSelectionStage] マップSE読み込み: ${seKey} -> ${sePath}`);
                    this.load.audio(seKey, sePath);
                }
            });
        } else {
            console.warn('[MapSelectionStage] mapConfig.se が定義されていません');
        }
    }

    // マップ作成メソッド
    createMap() {
        try {
            const IS_IOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);
            // モバイルデバイスの検出
            this.isMobile = this.sys.game.device.input.touch;
            this._isShuttingDown = false;
            
            // マップBGM抑制フラグを確実にリセット
            this._suppressMapBgm = false;
            
            // カメラマネージャーを先に初期化
            this.cameraManager = new CameraManager(this);
            this.cameraManager.setBackgroundColor('#87CEEB');
            
            // マップマネージャーを初期化
            console.log('[MapSelectionStage] マップ作成開始: mapKey=\'' + this.mapConfig.mapKey + '\', tilesetKey=\'' + this.mapConfig.tilesetKey + '\'');
            this.mapManager = new MapManager(this);
            this.mapManager.createMap(this.mapConfig.mapKey, this.mapConfig.tilesetKey);
            console.log('[MapSelectionStage] マップ作成完了');
            
            // 初期スケールを全体表示に設定（カメラ設定より先に実行）
            this.mapManager.scaleMapToScreen();
            
            // カメラ設定
            this.cameraManager.setupCamera(this.mapManager.getMapSize());
            
            // エリア選択システムを初期化
            this.areaSelectionManager = new AreaSelectionManager(this);
            // 視覚的フィードバックマネージャーを初期化
            this.visualFeedbackManager = new VisualFeedbackManager(this);
            
            // エンディングシステムを初期化
            this.choiceManager = new ChoiceManager();
            
            // 竹田ステージ、三重町ステージ、日本ステージの場合は会話システムを初期化
            if (this.mapConfig.mapKey === 'taketa' || this.mapConfig.mapKey === 'miemachi' || this.mapConfig.mapKey === 'japan') {
                this.conversationTrigger = new ConversationTrigger(this);
                // ConversationSceneを重複登録しない
                try {
                    const exists = this.scene.manager && this.scene.manager.keys && this.scene.manager.keys['ConversationScene'];
                    if (!exists) {
                        this.scene.add('ConversationScene', ConversationScene);
                    }
                } catch (e) {
                    // ignore
                }
                
                // 会話開始・終了のイベントリスナーを設定
                this.setupConversationEventListeners();
            }
            
            // 設定ファイルからエリア情報を取得し、マップエリアとマージ
            const mapAreas = this.mapManager.getAreas();
            const configAreas = this.mapConfig.areas;
            
            console.log('[MapSelectionStage] エリアデータ処理開始: mapAreas=' + (mapAreas ? mapAreas.length : 'undefined') + ', configAreas=' + (configAreas ? configAreas.length : 'undefined'));
            console.log('[MapSelectionStage] mapAreas:', mapAreas);
            console.log('[MapSelectionStage] configAreas:', configAreas);
            
            // エリア情報をマージ（座標はマップから、シーン情報は設定から）
            const mergedAreas = mapAreas.map(mapArea => {
                const configArea = configAreas.find(config => config.name === mapArea.name);
                
                return {
                    ...mapArea,
                    scene: configArea?.scene || null,
                    sceneParam: configArea?.sceneParam || null,
                    conversationId: configArea?.conversationId || null
                };
            });
            
            console.log('[MapSelectionStage] mergedAreas:', mergedAreas);
            console.log('[MapSelectionStage] マージ後のエリア数: ' + mergedAreas.length);
            
            this.areaSelectionManager.setupAreas(mergedAreas);
            
            // UI要素を作成
            this.uiManager = new UIManager();
            this.uiManager.createMapUI(this, this.mapConfig.mapTitle);
            
            // 少し遅延を入れてから戻るボタンを作成（シーンの初期化完了を待つ）
            this.time.delayedCall(100, () => {
                try {
                    this.uiManager.createBackButton(this); // 右上の戻るボタンを追加
                    console.log('[MapSelectionStage] 戻るボタンを作成しました');
                } catch (error) {
                    console.error('[MapSelectionStage] 戻るボタンの作成に失敗:', error);
                }
            });
            
            // タッチイベントを設定
            this.setupTouchEvents();
            
            // スケール切り替えボタンを追加
            this.createScaleToggleButton();
            
            // 完了状態をチェックして適用
            this.checkAndApplyCompletedAreas();
            
            // エンディングボタンを遅延表示（選択データの読み込み完了を待つ）
            // リセット直後は表示しない
            this.time.delayedCall(100, () => {
                if (!window.__justReset) {
                    this.checkAndShowEndingButton();
                } else {
                    console.log('[MapSelectionStage] リセット直後のため、エンディングボタンの表示をスキップします');
                }
            });
            
            // AudioManagerを初期化し、iOSのロックを考慮してBGMを開始
            try {
                this.audioManager = new AudioManager(this);

                const startMapBgm = () => {
                    try { if (!this.sys || !this.sys.isActive || !this.sys.isActive()) return; } catch (_) { /* ignore */ }
                    if (this._suppressMapBgm) return;
                    try {
                        // 既存のサウンドを念のため停止（二重回避）
                        try { if (this.sound && this.sound.stopAll) this.sound.stopAll(); } catch(e) { /* ignore */ }
                        try { if (this.audioManager && this.audioManager.stopAll) this.audioManager.stopAll(); } catch(e) { /* ignore */ }

                        if (IS_IOS && this.mapConfig?.bgm?.map) {
                            // iOSではHTMLAudioで直接再生（タイトルと同方式）
                            if (!this._htmlBgm) {
                                this._htmlBgm = new Audio(this.mapConfig.bgm.map);
                                this._htmlBgm.loop = true;
                                this._htmlBgm.volume = this.audioManager.bgmVolume;
                                this._htmlBgm.onended = () => { try { this._htmlBgm.currentTime = 0; const p = this._htmlBgm.play(); if (p && p.catch) p.catch(()=>{}); } catch(e) { /* ignore */ } };
                            }
                            // 既に再生中なら何もしない
                            if (!this._htmlBgm.paused && !this._htmlBgm.ended) return;
                            try { this._htmlBgm.currentTime = 0; } catch (ctError) { /* ignore */ }
                            const p = this._htmlBgm.play();
                            if (p && typeof p.then === 'function') {
                                p.then(() => { this._bgmStarted = true; }).catch(() => { this._bgmStarted = false; });
                            } else {
                                this._bgmStarted = true;
                            }
                        } else {
                            // Phaser WebAudio 側：フレーム分離後に開始（他処理と競合させない）
                            const play = () => { try { this.audioManager.playBgm('bgm_map'); this._bgmStarted = true; } catch(err) { /* ignore */ } };
                            try { this.time.delayedCall(0, play); } catch(err) { play(); }
                        }
                    } catch (e) {
                        // BGM開始に失敗してもフラグは立てない（後続の再試行を許可）
                        this._bgmStarted = false;
                    }
                };

                if (this.sound && this.sound.locked) {
                    // iOSなどでロックされている場合：unlockedで自動再生
                    this.sound.once('unlocked', () => {
                        try {
                            if (this.sound.context && this.sound.context.state !== 'running') {
                                this.sound.context.resume();
                            }
                        } catch (resumeError) {
                            // ignore
                        }
                        startMapBgm();
                    });
                    // 保険：最初のタップでも再生（unlockedが来ない場合を想定）
                    this.input.once('pointerdown', () => {
                        try {
                            if (this.sound.context && this.sound.context.state !== 'running') {
                                this.sound.context.resume();
                            }
                        } catch (resumeError) {
                            // ignore
                        }
                        // 無音オシレータを短時間鳴らして確実にアンロック
                        try {
                            const ctx = this.sound.context;
                            if (ctx && ctx.state !== 'running') ctx.resume();
                            if (ctx && typeof ctx.createOscillator === 'function') {
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                gain.gain.value = 0.0001; // 無音レベル
                                osc.connect(gain).connect(ctx.destination);
                                osc.start();
                                osc.stop(ctx.currentTime + 0.05);
                            }
                        } catch (unlockError) {
                            // ignore
                        }
                        startMapBgm();
                    });
                } else {
                    // 既に解除済みなら即再生
                    startMapBgm();
                    // 念のため、最初のタップ時にも未再生なら開始
                    this.input.once('pointerdown', () => {
                        try {
                            if (this.sound.context && this.sound.context.state !== 'running') {
                                this.sound.context.resume();
                            }
                        } catch (unlockError) {
                            // ignore
                        }
                        // 無音オシレータでアンロック保険
                        try {
                            const ctx = this.sound.context;
                            if (ctx && ctx.state !== 'running') ctx.resume();
                            if (ctx && typeof ctx.createOscillator === 'function') {
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                gain.gain.value = 0.0001;
                                osc.connect(gain).connect(ctx.destination);
                                osc.start();
                                osc.stop(ctx.currentTime + 0.05);
                            }
                        } catch (oscError) {
                            // ignore
                        }
                        if (!this.audioManager?.bgm || !this.audioManager.bgm.isPlaying) {
                            startMapBgm();
                        }
                    });
                }

                // 追加のフォールバック: 短時間のリトライ（最大3回）
                this._bgmRetry = this.time.addEvent({
                    delay: 400,
                    repeat: 2,
                    callback: () => {
                        const htmlNotPlaying = IS_IOS && this._htmlBgm ? (this._htmlBgm.paused || this._htmlBgm.ended) : false;
                        const phaserNotPlaying = !IS_IOS && (!this.audioManager?.bgm || !this.audioManager.bgm.isPlaying);
                        if (!this._suppressMapBgm && (htmlNotPlaying || phaserNotPlaying)) {
                            try {
                                if (this.sound.context && this.sound.context.state !== 'running') {
                                    this.sound.context.resume();
                                }
                            } catch (resumeError) { /* ignore */ }
                            startMapBgm();
                        }
                    }
                });
            } catch (error) {
                // エラーは無視
            }
            
            // リサイズイベントを設定
            this.scale.on('resize', this.handleResize, this);
            this._onResizeBound = true;
            
            // シーンシャットダウン時のクリーンアップ登録
            this.events.on('shutdown', () => {
                try { if (this.load && this.load.reset) this.load.reset(); } catch(e) { /* ignore */ }
                try { if (this.load && this.load.removeAllListeners) this.load.removeAllListeners(); } catch(e) { /* ignore */ }
                this.shutdown();
            }, this);
        } catch (error) {
            console.error('[MapSelectionStage] マップ作成エラー:', error);
        }
    }

    setupTouchEvents() {
        // タッチイベントを直接設定
        this.input.on('pointerdown', (pointer) => {
            this.handleTouch(pointer);
        });
        
        // スマホ向けスクロール機能を追加
        this.cameraManager.setupScrollControls();
        this.cameraManager.setupPinchZoom();
    }

    handleTouch(pointer) {
        try {
            // 会話中は他のエリアをタップできない
            if (this._isInConversation) {
                console.log('[MapSelectionStage] 会話中は他のエリアをタップできません');
                return;
            }
            
            // iOS等で初回タップ時にオーディオを確実に解除
            if (this.sound && this.sound.locked) {
                try {
                    if (this.sound.context && this.sound.context.state !== 'running') {
                        this.sound.context.resume();
                    }
                } catch (resumeError) {
                    // ignore
                }
                // 無音オシレータでアンロックをより確実に
                try {
                    const ctx = this.sound.context;
                    if (ctx && ctx.state !== 'running') ctx.resume();
                    if (ctx && typeof ctx.createOscillator === 'function') {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        gain.gain.value = 0.0001;
                        osc.connect(gain).connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.05);
                    }
                } catch (oscError) {
                    // ignore
                }
            }
            // カメラの存在確認
            if (!this.cameras || !this.cameras.main) {
                console.error(`${this.mapConfig.mapTitle}: Camera not available`);
                return;
            }
            // ワールド座標に変換
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const worldX = worldPoint.x;
            const worldY = worldPoint.y;
            // エリアマネージャーに座標を渡す
            if (this.areaSelectionManager) {
                this.areaSelectionManager.handleTouchAt(worldX, worldY);
            }
            // 視覚的フィードバック
            if (this.visualFeedbackManager) {
                this.visualFeedbackManager.showTouchRipple(worldX, worldY);
            }
        } catch (error) {
            console.error(`${this.mapConfig.mapTitle}: Error in handleTouch:`, error);
        }
    }

    createScaleToggleButton() {
        if (this._isShuttingDown || !this.sys || !this.sys.isActive || !this.add) return;
        // 既存のボタンを削除
        if (this.scaleToggleButton) {
            this.scaleToggleButton.destroy();
            this.scaleToggleButton = null;
        }
        if (this.scaleToggleButtonGraphics) {
            this.scaleToggleButtonGraphics.destroy();
            this.scaleToggleButtonGraphics = null;
        }
        
        // 現代風な背景を作成
        const buttonGraphics = this.add.graphics();
        this.scaleToggleButtonGraphics = buttonGraphics;
        
        // ボタンの位置とサイズを定義
        const buttonX = 2.5;
        const buttonY = 38;
        const buttonHeight = 30;
        
        // 背景を動的に描画する関数
        const drawBackground = (text, isHover = false) => {
            buttonGraphics.clear();
            
            // テキストの長さに応じて幅を調整
            const baseWidth = 43;
            const extraWidth = text.length > 2 ? (text.length - 2) * 15 + 5 : 0;
            const totalWidth = baseWidth + extraWidth;
            
            const shadowColor = isHover ? 0x000000 : 0x000000;
            const shadowAlpha = isHover ? 0.4 : 0.3;
            const bgColor = isHover ? 0x3a3a3a : 0x2a2a2a;
            const bgAlpha = isHover ? 0.98 : 0.95;
            const glossAlpha = isHover ? 0.15 : 0.1;
            
            // 影を描画
            buttonGraphics.fillStyle(shadowColor, shadowAlpha);
            buttonGraphics.fillRoundedRect(buttonX + 2, buttonY + 2, totalWidth, buttonHeight, 8);
            
            // メイン背景を描画
            buttonGraphics.fillStyle(bgColor, bgAlpha);
            buttonGraphics.fillRoundedRect(buttonX, buttonY, totalWidth, buttonHeight, 8);
            
            // 光沢効果（上部）
            buttonGraphics.fillStyle(0xffffff, glossAlpha);
            buttonGraphics.fillRoundedRect(buttonX, buttonY, totalWidth, buttonHeight / 2, 8);
        };
        
        // 初期背景を描画
        drawBackground('拡大');
        
        buttonGraphics.setScrollFactor(0);
        buttonGraphics.setDepth(1000);
        
        // スケール切り替えボタンを作成（画面座標で固定）
        const button = this.add.text(buttonX + 5, buttonY + 5, '拡大', {
            fontSize: '16px',
            fill: '#ffffff',
            fontWeight: 'bold',
            fontFamily: 'Arial'
        });
        
        // ボタンの参照を保存
        this.scaleToggleButton = button;
        
        // ボタンをカメラに固定（画面座標で表示）
        button.setScrollFactor(0);
        button.setDepth(1002);
        
        button.setInteractive();
        button.on('pointerdown', () => {
            this.cameraManager.toggleMapScale();
            
            // ボタンテキストを更新
            const currentScale = this.cameraManager.scene.mapManager?.mapScaleX || this.cameraManager.currentScale;
            if (currentScale === 1.5) {
                button.setText('全体マップ表示');
                drawBackground('全体マップ表示');
            } else {
                button.setText('拡大');
                drawBackground('拡大');
            }
        });
        
        // ホバー効果
        button.on('pointerover', () => {
            const currentText = button.text;
            drawBackground(currentText, true);
        });
        
        button.on('pointerout', () => {
            const currentText = button.text;
            drawBackground(currentText, false);
        });
        
        // 初期テキストを設定（全体表示から開始）
        button.setText('拡大');
    }

    handleResize(gameSize) {
        try {
            if (this._isShuttingDown || !this.sys || !this.sys.isActive) return;
            if (!this.cameras || !this.cameras.main) return;
            if (!this.mapManager) return;
            // マップマネージャーでリサイズ処理
            this.mapManager?.handleResize(gameSize);
            
            // カメラの再設定
            if (this.cameraManager && this.mapManager) {
                this.cameraManager.setupCamera(this.mapManager.getMapSize());
            }
            
            // エリアマーカーを更新
            if (this.areaSelectionManager) {
                this.areaSelectionManager.destroy();
                this.areaSelectionManager = new AreaSelectionManager(this);
                
                // エリア情報を再取得（extractAreaDataは呼ばず、既存のareasを使用）
                const mapAreas = this.mapManager.getAreas();
                const configAreas = this.mapConfig.areas;
                const mergedAreas = mapAreas.map(mapArea => {
                    const configArea = configAreas.find(config => config.name === mapArea.name);
                    return {
                        ...mapArea,
                        scene: configArea?.scene || null
                    };
                });
                
                this.areaSelectionManager.setupAreas(mergedAreas);
            }
            
            // UIの更新
            this.uiManager?.updateMapUI(gameSize);
            
            // 拡大ボタンを再作成（リサイズ時に位置を調整）
            this.createScaleToggleButton();
            
        } catch (error) {
            console.error('Error handling resize:', error);
        }
    }

    update() {
        // マネージャーの更新処理
        this.areaSelectionManager?.update();
        this.cameraManager?.update();
    }

    // 完了状態をチェックして適用
    checkAndApplyCompletedAreas() {
        try {
            // ConversationSceneが存在するかチェック
            const conversationScene = this.scene.manager.getScene('ConversationScene');
            if (conversationScene && conversationScene.completedAreaName) {
                const completedAreaName = conversationScene.completedAreaName;
                console.log(`[MapSelectionStage] 完了状態を適用: ${completedAreaName}`);
                
                // 完了状態を適用
                this.areaSelectionManager.markAreaAsCompleted(completedAreaName);
                
                // 完了状態をクリア
                conversationScene.completedAreaName = null;
                console.log(`[MapSelectionStage] 完了状態をクリア: ${completedAreaName}`);
            }
        } catch (error) {
            console.error('[MapSelectionStage] 完了状態適用エラー:', error);
        }
    }

    destroy() {
        this.shutdown();
        super.destroy();
    }

    shutdown() {
        this._isShuttingDown = true;
        // AudioManagerの完全なクリーンアップ
        if (this.audioManager) {
            this.audioManager.stopAll();
            this.audioManager.destroy();
            this.audioManager = null;
        }
        // iOS用HTMLAudioの停止
        if (this._htmlBgm) {
            try {
                this._htmlBgm.pause();
            } catch (pauseError) {
                // ignore
            }
            this._htmlBgm = null;
        }

        // 多重起動フラグを解除
        this._bgmStarted = false;
        
        // 他のマネージャーのクリーンアップ
        if (this.mapManager) {
            this.mapManager.destroy();
            this.mapManager = null;
        }
        
        if (this.areaSelectionManager) {
            this.areaSelectionManager.destroy();
            this.areaSelectionManager = null;
        }
        
        if (this.uiManager) {
            this.uiManager.destroy();
            this.uiManager = null;
        }
        
        if (this.cameraManager) {
            this.cameraManager.destroy();
            this.cameraManager = null;
        }
        
        if (this.visualFeedbackManager) {
            this.visualFeedbackManager.destroy();
            this.visualFeedbackManager = null;
        }
        
        if (this.conversationTrigger) {
            this.conversationTrigger.destroy();
            this.conversationTrigger = null;
        }
        
        // 拡大ボタンのクリーンアップ
        if (this.scaleToggleButton) {
            this.scaleToggleButton.destroy();
            this.scaleToggleButton = null;
        }
        if (this.scaleToggleButtonGraphics) {
            this.scaleToggleButtonGraphics.destroy();
            this.scaleToggleButtonGraphics = null;
        }
        
        // グローバルな音声システムもクリーンアップ（多重対策）
        try {
            if (this.sound && this.sound.stopAll) this.sound.stopAll();
        } catch (stopAllError) { /* ignore */ }

        // リサイズイベント解除
        try {
            if (this._onResizeBound && this.scale && this.scale.off) {
                this.scale.off('resize', this.handleResize, this);
            }
        } catch (e) { /* ignore */ }
        this._onResizeBound = false;
    }
}

// 設定ファイルベースでマップシーンを作成するヘルパー関数
export function createMapStage(mapId, sceneKey) {
    const mapConfig = AreaConfig[mapId];
    if (!mapConfig) {
        console.error(`Map config not found for: ${mapId}`);
        return null;
    }
    
    return new MapSelectionStage({
        sceneKey: sceneKey,
        mapConfig: mapConfig,
        mapId: mapId
    });
} 