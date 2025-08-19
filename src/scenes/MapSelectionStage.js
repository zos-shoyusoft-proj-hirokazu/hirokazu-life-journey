import { AreaSelectionManager } from '../managers/AreaSelectionManager.js';
import { UIManager } from '../managers/UIManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { MapManager } from '../managers/MapManager.js';
import { CameraManager } from '../managers/CameraManager.js';
import { AreaConfig } from '../config/AreaConfig.js';
import { VisualFeedbackManager } from '../managers/VisualFeedbackManager.js';
import { ConversationTrigger } from '../managers/ConversationTrigger.js';
import { ConversationScene } from '../managers/ConversationScene.js';

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
    }

    preload() {
        console.log('[MapSelectionStage] 🗺️ マップ「' + this.mapConfig.mapTitle + '」のpreload開始');
        console.log('[MapSelectionStage] 📋 マップID: ' + this.mapId + ', マップキー: ' + this.mapConfig.mapKey);
        
        // 設定ファイルから動的にアセットを読み込み
        // taketastageの場合はtaketaフォルダを使用
        const folderName = this.mapId === 'taketastage' ? 'taketa' : this.mapId;
        
        // 竹田ステージの場合はファイル名も調整
        const mapFileName = this.mapId === 'taketastage' ? 'taketa' : this.mapConfig.mapKey;
        
        // japanステージの場合はzennkoku.pngを使用
        const tilesetFileName = this.mapId === 'japan' ? 'zennkoku' : this.mapConfig.tilesetKey;
        
        console.log('[MapSelectionStage] 📁 フォルダ名: ' + folderName + ', マップファイル: ' + mapFileName + ', タイルセット: ' + tilesetFileName);
        
        // マップファイルの読み込み
        console.log('[MapSelectionStage] 🗺️ マップファイル読み込み: ' + this.mapConfig.mapKey + ' -> assets/maps/' + folderName + '/' + mapFileName + '.tmj');
        this.load.tilemapTiledJSON(this.mapConfig.mapKey, 'assets/maps/' + folderName + '/' + mapFileName + '.tmj');
        
        // タイルセット画像の読み込み
        console.log('[MapSelectionStage] 🖼️ タイルセット画像読み込み: ' + this.mapConfig.tilesetKey + ' -> assets/maps/' + folderName + '/' + tilesetFileName + '.png');
        this.load.image(this.mapConfig.tilesetKey, 'assets/maps/' + folderName + '/' + tilesetFileName + '.png');
        
        // デバッグ用：読み込みエラーを詳細にログ出力
        this.load.on('fileerror', (file) => {
            console.error('[MapSelectionStage] ❌ ファイル読み込みエラー: ' + file.key + ', パス: ' + file.url);
        });
        
        // UI要素とアイコン
        
        // BGMの読み込み（設定に基づいて動的に）
        console.log('[MapSelectionStage] 🎵 BGMファイル読み込み開始');
        this.loadBgmFiles();

        // SEの読み込み（設定に基づいて動的に）
        console.log('[MapSelectionStage] 🔊 SEファイル読み込み開始');
        this.loadSeFiles();
        
        // キャラクター画像の読み込み（設定に基づいて動的に）
        console.log('[MapSelectionStage] 👤 キャラクター画像読み込み開始');
        this.loadCharacterFiles();
        
        // 背景画像の読み込み
        console.log('[MapSelectionStage] 🖼️ 背景画像読み込み開始');
        this.loadBackgroundFiles();
        
        // エラーハンドリング
        this.load.on('fileerror', (file) => {
            console.warn('[MapSelectionStage] ⚠️ ファイルが見つかりません: ' + file.key + ', フォールバックを使用');
            this.mapManager?.createFallbackImage(file.key);
        });
        
        // デバッグ用
        this.load.on('complete', () => {
            console.log('[MapSelectionStage] ✅ マップ「' + this.mapConfig.mapTitle + '」のpreload完了');
        });
    }

    loadSeFiles() {
        // AreaConfigからSEを動的に読み込み
        if (this.mapConfig.se) {
            console.log('[MapSelectionStage] SE読み込み開始:', this.mapConfig.se);
            Object.keys(this.mapConfig.se).forEach(seKey => {
                const sePath = this.mapConfig.se[seKey];
                const seKeyWithPrefix = `se_${seKey}`;
                console.log('[MapSelectionStage] SE読み込み:', seKeyWithPrefix, '->', sePath);
                this.load.audio(seKeyWithPrefix, sePath);
            });
        } else {
            console.warn('[MapSelectionStage] mapConfig.se が定義されていません');
        }
    }
    
    // 会話開始・終了のイベントリスナーを設定
    setupConversationEventListeners() {
        // ConversationSceneの会話開始・終了イベントを監視
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

    // BGMファイルを動的に読み込む
    loadBgmFiles() {
        
        // bgmがオブジェクト形式なら各用途ごとにロード
        if (this.mapConfig.bgm && typeof this.mapConfig.bgm === 'object') {
            Object.keys(this.mapConfig.bgm).forEach(bgmKey => {
                this.load.audio(`bgm_${bgmKey}`, this.mapConfig.bgm[bgmKey]);
            });
        }
        
        // マップ固有のイベントBGMがあれば読み込み
        if (this.mapConfig.eventBgm) {
            Object.keys(this.mapConfig.eventBgm).forEach(eventKey => {
                this.load.audio(`bgm_event_${eventKey}`, this.mapConfig.eventBgm[eventKey]);
            });
        }
    }

    // キャラクター画像ファイルを動的に読み込む
    loadCharacterFiles() {
        // AreaConfigからキャラクター画像を動的に読み込み
        if (this.mapConfig.characters) {
            Object.keys(this.mapConfig.characters).forEach(charKey => {
                this.load.image(charKey, this.mapConfig.characters[charKey]);
            });
        }
    }

    // 背景画像ファイルを動的に読み込む
    loadBackgroundFiles() {
        // AreaConfigから背景画像を動的に読み込み
        if (this.mapConfig.backgrounds) {
            Object.keys(this.mapConfig.backgrounds).forEach(bgKey => {
                this.load.image(bgKey, this.mapConfig.backgrounds[bgKey]);
            });
        }
    }

    create() {
        try {
            console.log('[MapSelectionStage] 🚀 マップ「' + this.mapConfig.mapTitle + '」のcreate開始');
            console.log('[MapSelectionStage] 📊 マップ設定:', this.mapConfig);
            
            const IS_IOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);
            // モバイルデバイスの検出
            this.isMobile = this.sys.game.device.input.touch;
            this._isShuttingDown = false;
            
            // カメラマネージャーを先に初期化
            console.log('[MapSelectionStage] 📷 カメラマネージャー初期化開始');
            this.cameraManager = new CameraManager(this);
            this.cameraManager.setBackgroundColor('#87CEEB');
            console.log('[MapSelectionStage] ✅ カメラマネージャー初期化完了');
            
            // マップマネージャーを初期化
            console.log('[MapSelectionStage] 🗺️ マップマネージャー初期化開始');
            this.mapManager = new MapManager(this);
            console.log('[MapSelectionStage] 🗺️ マップ作成開始:', this.mapConfig.mapKey, this.mapConfig.tilesetKey);
            this.mapManager.createMap(this.mapConfig.mapKey, this.mapConfig.tilesetKey);
            console.log('[MapSelectionStage] ✅ マップ作成完了');
            
            // 初期スケールを全体表示に設定（カメラ設定より先に実行）
            console.log('[MapSelectionStage] 📏 マップスケール設定開始');
            this.mapManager.scaleMapToScreen();
            console.log('[MapSelectionStage] ✅ マップスケール設定完了');
            
            // カメラ設定
            console.log('[MapSelectionStage] 📷 カメラ設定開始');
            this.cameraManager.setupCamera(this.mapManager.getMapSize());
            console.log('[MapSelectionStage] ✅ カメラ設定完了');
            
            // エリア選択システムを初期化
            console.log('[MapSelectionStage] 🎯 エリア選択システム初期化開始');
            this.areaSelectionManager = new AreaSelectionManager(this);
            console.log('[MapSelectionStage] ✅ エリア選択システム初期化完了');
            
            // 視覚的フィードバックマネージャーを初期化
            console.log('[MapSelectionStage] ✨ 視覚的フィードバックマネージャー初期化開始');
            this.visualFeedbackManager = new VisualFeedbackManager(this);
            console.log('[MapSelectionStage] ✅ 視覚的フィードバックマネージャー初期化完了');
            
            // 竹田ステージ、三重町ステージ、日本ステージの場合は会話システムを初期化
            if (this.mapConfig.mapKey === 'taketa_city' || this.mapConfig.mapKey === 'bunngo_mie_city' || this.mapConfig.mapKey === 'japan') {
                console.log('[MapSelectionStage] 💬 会話システム初期化開始');
                this.conversationTrigger = new ConversationTrigger(this);
                // ConversationSceneを重複登録しない
                try {
                    const exists = this.scene.manager && this.scene.manager.keys && this.scene.manager.keys['ConversationScene'];
                    if (!exists) {
                        console.log('[MapSelectionStage] 💬 ConversationScene追加');
                        this.scene.add('ConversationScene', ConversationScene);
                    }
                } catch (e) {
                    // ignore
                }
                
                // 会話開始・終了のイベントリスナーを設定
                console.log('[MapSelectionStage] 💬 会話イベントリスナー設定');
                this.setupConversationEventListeners();
                console.log('[MapSelectionStage] ✅ 会話システム初期化完了');
            }
            // 設定ファイルからエリア情報を取得し、マップエリアとマージ
            console.log('[MapSelectionStage] 🎯 エリア情報設定開始');
            const mapAreas = this.mapManager.getAreas();
            const configAreas = this.mapConfig.areas;
            console.log('[MapSelectionStage] 📊 マップエリア数:', mapAreas.length, '設定エリア数:', configAreas?.length || 0);
            
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
            this.areaSelectionManager.setupAreas(mergedAreas);
            console.log('[MapSelectionStage] ✅ エリア情報設定完了');
            
            // UI要素を作成
            console.log('[MapSelectionStage] 🎨 UI要素作成開始');
            this.uiManager = new UIManager();
            this.uiManager.createMapUI(this, this.mapConfig.mapTitle);
            console.log('[MapSelectionStage] ✅ UI要素作成完了');
            
            // 少し遅延を入れてから戻るボタンを作成（シーンの初期化完了を待つ）
            this.time.delayedCall(100, () => {
                try {
                    console.log('[MapSelectionStage] 🔙 戻るボタン作成開始');
                    this.uiManager.createBackButton(this); // 右上の戻るボタンを追加
                    console.log('[MapSelectionStage] ✅ 戻るボタンを作成しました');
                } catch (error) {
                    console.error('[MapSelectionStage] ❌ 戻るボタンの作成に失敗:', error);
                }
            });
            
            // タッチイベントを設定
            console.log('[MapSelectionStage] 👆 タッチイベント設定開始');
            this.setupTouchEvents();
            console.log('[MapSelectionStage] ✅ タッチイベント設定完了');
            
            // スケール切り替えボタンを追加
            console.log('[MapSelectionStage] 🔍 スケール切り替えボタン作成開始');
            this.createScaleToggleButton();
            console.log('[MapSelectionStage] ✅ スケール切り替えボタン作成完了');
            
            // AudioManagerを初期化し、iOSのロックを考慮してBGMを開始
            try {
                console.log('[MapSelectionStage] 🎵 AudioManager初期化開始');
                this.audioManager = new AudioManager(this);
                console.log('[MapSelectionStage] ✅ AudioManager初期化完了');

                const startMapBgm = () => {
                    try { if (!this.sys || !this.sys.isActive || !this.sys.isActive()) return; } catch (_) { /* ignore */ }
                    if (this._suppressMapBgm) return;
                    try {
                        console.log('[MapSelectionStage] 🎵 マップBGM開始処理');
                        // 既存のサウンドを念のため停止（二重回避）
                        try { if (this.sound && this.sound.stopAll) this.sound.stopAll(); } catch(e) { /* ignore */ }
                        try { if (this.audioManager && this.audioManager.stopAll) this.audioManager.stopAll(); } catch(e) { /* ignore */ }

                        if (IS_IOS && this.mapConfig?.bgm?.map) {
                            console.log('[MapSelectionStage] 🎵 iOS用HTMLAudio BGM開始');
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
                            console.log('[MapSelectionStage] 🎵 Phaser WebAudio BGM開始');
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
                    console.log('[MapSelectionStage] 🔒 音声システムロック中、unlocked待機');
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
                    console.log('[MapSelectionStage] 🎵 音声システム既に解除済み、BGM開始');
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
                console.error('[MapSelectionStage] ❌ AudioManager初期化エラー:', error);
            }
            // リサイズイベントを設定
            console.log('[MapSelectionStage] 📏 リサイズイベント設定開始');
            this.scale.on('resize', this.handleResize, this);
            this._onResizeBound = true;
            console.log('[MapSelectionStage] ✅ リサイズイベント設定完了');
            
            // シーンシャットダウン時のクリーンアップ登録
            this.events.on('shutdown', () => {
                try { if (this.load && this.load.reset) this.load.reset(); } catch(e) { /* ignore */ }
                try { if (this.load && this.load.removeAllListeners) this.load.removeAllListeners(); } catch(e) { /* ignore */ }
                this.shutdown();
            }, this);

            console.log('[MapSelectionStage] ✅ マップ「' + this.mapConfig.mapTitle + '」のcreate完了');

        } catch (error) {
            console.error('[MapSelectionStage] ❌ Error creating ' + this.mapConfig.mapTitle + ':', error);
            console.error('[MapSelectionStage] ❌ Stack trace:', error.stack);
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