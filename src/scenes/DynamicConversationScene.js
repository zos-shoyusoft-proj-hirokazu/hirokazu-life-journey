// 動的会話シーン
// 個別シーンの構造のみ作成（中身は後で動的に実装）

export class DynamicConversationScene extends Phaser.Scene {
    constructor() {
        super();
        this.eventId = null;
        this.resourcesLoaded = false;
        this.audioManager = null;
    }

    init(data) {
        this.eventId = data.eventId;
        console.log('[DynamicConversationScene] init called with eventId:', this.eventId);
        
        // 前回の会話データをクリア（再利用時の問題を防ぐ）
        this.conversationData = null;
        this.conversationDataLoaded = false;
        this.resourcesLoaded = false;
        this.eventConfig = null;
        
        // eventConfigを即座に設定
        this.loadEventConfig();
    }

    async loadEventConfig() {
        try {
            const { getEventConfig } = await import('../config/EventConfig.js');
            this.eventConfig = getEventConfig(this.eventId);
            console.log('[DynamicConversationScene] loadEventConfig完了, eventConfig:', this.eventConfig);
        } catch (error) {
            console.error('[DynamicConversationScene] loadEventConfigエラー:', error);
        }
    }

    async preload() {
        // 読み込み処理
        
        // リソース読み込み完了イベントを設定
        this.load.on('complete', () => {
            // リソース読み込み完了
        });
        
        this.load.on('error', (file) => {
            console.error('[DynamicConversationScene] リソース読み込みエラー:', file);
        });
        
        // eventConfigが設定されるまで待つ
        while (!this.eventConfig) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // 必要なリソースを動的に読み込み（完了を待つ）
        await this.loadRequiredResources();
    }

    // 必要なリソースを動的に読み込み
    async loadRequiredResources() {
        console.log('[DynamicConversationScene] loadRequiredResources開始, eventId:', this.eventId);
        
        // EventConfigから必要なリソースを動的に取得
        const { getRequiredResources, getEventConfig } = await import('../config/EventConfig.js');
        this.eventConfig = getEventConfig(this.eventId);
        console.log('[DynamicConversationScene] eventConfig:', this.eventConfig);
        
        const required = getRequiredResources(this.eventId);
        console.log('[DynamicConversationScene] required:', required);
        
        if (required) {
            // 背景画像
            required.backgrounds?.forEach(bg => {
                this.load.image(bg, `assets/backgrounds/miemachi_bk/${bg}.png`);
            });
            
            // キャラクター画像
            required.characters?.forEach(char => {
                this.load.image(char, `assets/characters/portraits/${char}.png`);
            });
            
            // AudioManagerを初期化
            if (required.bgm || required.se) {
                console.log('[DynamicConversationScene] AudioManager初期化開始');
                this.audioManager = new (await import('../managers/AudioManager.js')).AudioManager(this);
                console.log('[DynamicConversationScene] AudioManager初期化完了');
                
                // BGM読み込み処理を追加
                if (required.bgm) {
                    console.log('[DynamicConversationScene] BGM読み込み処理開始:', required.bgm);
                    required.bgm.forEach(bgmKey => {
                        const audioKey = `bgm_${bgmKey}`;
                        const bgmPath = `assets/audio/bgm/${bgmKey}.mp3`;
                        console.log(`[DynamicConversationScene] BGM読み込み: ${audioKey} -> ${bgmPath}`);
                        this.load.audio(audioKey, bgmPath);
                    });
                }
            }
        }
        
        // 既存のconversationDataを取得
        await this.loadConversationData();
        this.conversationDataLoaded = true;
        
        // Phaserのloaderの完了を待つ
        if (required && (required.backgrounds || required.characters || required.bgm || required.se)) {
            await new Promise(resolve => {
                this.load.on('complete', () => {
                    // 音声ファイルの読み込み完了後、loadedSoundsに追加
                    if (this.audioManager && (required.bgm || required.se)) {
                        if (required.bgm) {
                            required.bgm.forEach(bgmKey => {
                                const audioKey = `bgm_${bgmKey}`;
                                this.audioManager.loadedSounds.add(audioKey);
                            });
                        }
                        if (required.se) {
                            required.se.forEach(seKey => {
                                const audioKey = `se_${seKey}`;
                                this.audioManager.loadedSounds.add(audioKey);
                            });
                        }
                    }
                    resolve();
                });
                this.load.start();
            });
        }
        
        // リソース読み込み完了
        this.resourcesLoaded = true;
    }
    
    // 既存のBGM管理システムと直接的なBGM停止を併用
    suppressStageBGM() {
        try {
            console.log('[DynamicConversationScene] suppressStageBGM開始');
            
            // 現在のシーンマネージャーからアクティブなステージシーンを特定
            const sceneManager = this.scene.manager;
            if (sceneManager) {
                // 現在アクティブなステージシーンの_suppressMapBgmフラグを設定
                const stageScenes = ['taketa_highschool', 'miemachi_highschool', 'japan_highschool', 'Stage1Scene', 'Stage2Scene', 'Stage3Scene'];
                
                for (const sceneKey of stageScenes) {
                    try {
                        const stage = sceneManager.getScene(sceneKey);
                        if (stage && stage.scene && stage.scene.isActive()) {
                            console.log('[DynamicConversationScene]', sceneKey, 'がアクティブです');
                            
                            // 1. 既存のBGM管理システムを使用
                            if (stage._suppressMapBgm !== undefined) {
                                stage._suppressMapBgm = true;
                                console.log('[DynamicConversationScene]', sceneKey, 'の_suppressMapBgmフラグをtrueに設定');
                            }
                            
                            // 2. 直接的なBGM停止も実行
                            if (stage.audioManager) {
                                console.log('[DynamicConversationScene]', sceneKey, 'の直接BGM停止開始');
                                
                                // AudioManagerのBGMを停止（より確実に）
                                if (stage.audioManager.bgm) {
                                    console.log('[DynamicConversationScene]', sceneKey, 'のBGMオブジェクト停止');
                                    try {
                                        stage.audioManager.bgm.stop();
                                        console.log('[DynamicConversationScene]', sceneKey, 'のBGMオブジェクト停止完了');
                                    } catch (e) {
                                        console.warn('[DynamicConversationScene]', sceneKey, 'のBGMオブジェクト停止エラー:', e);
                                    }
                                } else {
                                    console.log('[DynamicConversationScene]', sceneKey, 'のBGMオブジェクトはnullです');
                                }
                                
                                // stopBGMメソッドを実行
                                if (typeof stage.audioManager.stopBgm === 'function') {
                                    console.log('[DynamicConversationScene]', sceneKey, 'のstopBgmメソッド実行');
                                    try {
                                        stage.audioManager.stopBgm();
                                        console.log('[DynamicConversationScene]', sceneKey, 'のstopBgmメソッド実行完了');
                                    } catch (e) {
                                        console.warn('[DynamicConversationScene]', sceneKey, 'のstopBgmメソッド実行エラー:', e);
                                    }
                                } else {
                                    console.log('[DynamicConversationScene]', sceneKey, 'のstopBgmメソッドが存在しません');
                                }
                                
                                // HTML5 BGMを停止（iOS用）
                                if (stage._htmlBgm) {
                                    console.log('[DynamicConversationScene]', sceneKey, 'のHTML5 BGM停止');
                                    try {
                                        stage._htmlBgm.pause();
                                        stage._htmlBgm.currentTime = 0;
                                        console.log('[DynamicConversationScene]', sceneKey, 'のHTML5 BGM停止完了');
                                    } catch (e) {
                                        console.warn('[DynamicConversationScene]', sceneKey, 'のHTML5 BGM停止エラー:', e);
                                    }
                                } else {
                                    console.log('[DynamicConversationScene]', sceneKey, 'のHTML5 BGMは存在しません');
                                }
                                
                                console.log('[DynamicConversationScene]', sceneKey, 'の直接BGM停止完了');
                            } else {
                                console.log('[DynamicConversationScene]', sceneKey, 'のaudioManagerが存在しません');
                            }
                            
                            // 3. シーンレベルのサウンド停止（削除済み）
                            // if (stage.sound) {
                            //     console.log('[DynamicConversationScene]', sceneKey, 'のシーンサウンド停止');
                            //     stage.sound.stopAll();
                            // }
                            
                            // アクティブなステージを見つけたら終了
                            break;
                        }
                    } catch (e) {
                        console.warn('[DynamicConversationScene]', sceneKey, 'の処理エラー:', e);
                    }
                }
            }
            
            console.log('[DynamicConversationScene] suppressStageBGM完了');
        } catch (error) {
            console.warn('[DynamicConversationScene] BGM抑制エラー:', error);
        }
    }

    // 既存のconversationDataを取得
    loadConversationData() {
        return new Promise((resolve) => {
            console.log('[DynamicConversationScene] loadConversationData開始');
            console.log('[DynamicConversationScene] this.eventConfig:', this.eventConfig);
            
            // エリアタイプに基づいて適切なconversationDataを取得
            const areaType = this.eventConfig?.areaType;
            console.log('[DynamicConversationScene] areaType:', areaType);
            
            if (areaType) {
                switch (areaType) {
                    case 'miemachi':
                        import('../data/miemachi/conversationData.js').then(({ miemachiConversationData }) => {
                            const conversationKey = this.eventConfig.conversationDataKey;
                            this.conversationData = miemachiConversationData[conversationKey];
                            resolve();
                        });
                        break;
                    case 'taketa':
                        import('../data/taketa/conversationData.js').then(({ taketaConversationData }) => {
                            const conversationKey = this.eventConfig.conversationDataKey;
                            console.log('[DynamicConversationScene] taketaエリアの会話データ読み込み開始');
                            console.log('[DynamicConversationScene] conversationKey:', conversationKey);
                            console.log('[DynamicConversationScene] taketaConversationData:', taketaConversationData);
                            console.log('[DynamicConversationScene] 利用可能な会話データキー:', Object.keys(taketaConversationData));
                            
                            this.conversationData = taketaConversationData[conversationKey];
                            console.log('[DynamicConversationScene] 読み込まれた会話データ:', this.conversationData);
                            
                            if (!this.conversationData) {
                                console.error(`[DynamicConversationScene] 会話データが見つかりません: ${conversationKey}`);
                            }
                            
                            resolve();
                        });
                        break;
                    case 'japan':
                        import('../data/japan/conversationData.js').then(({ japanConversationData }) => {
                            const conversationKey = this.eventConfig.conversationDataKey;
                            this.conversationData = japanConversationData[conversationKey];
                            resolve();
                        });
                        break;
                    default:
                        resolve();
                }
            } else {
                resolve();
            }
        });
    }

    create() {
        // 作成処理
        
        // リソース読み込みとconversationData読み込みが完了しているかチェック
        if (!this.resourcesLoaded || !this.conversationDataLoaded) {
            // 100ms後に再チェック
            this.time.delayedCall(100, () => {
                this.create();
            });
            return;
        }
        
        // 既存のBGM管理システムを使用（_suppressMapBgmフラグ）
        console.log('[DynamicConversationScene] BGM管理システム開始');
        this.suppressStageBGM();
        console.log('[DynamicConversationScene] BGM管理システム完了');
        
        // リソース読み込み完了後、既存のConversationSceneを開始
        
        // 元のシーンのキーを取得（areaTypeに基づいて決定）
        let originalSceneKey = 'MiemachiStage'; // デフォルト
        let currentState = null; // 現在の状態を保存
        
        if (this.eventConfig && this.eventConfig.areaType) {
            switch (this.eventConfig.areaType) {
                case 'miemachi':
                    originalSceneKey = 'MiemachiStage';
                    break;
                case 'taketa':
                    // エリア名で判定して適切なシーンに戻る
                    if (this.eventConfig.areaName === 'taketa_high_school' || 
                        this.eventConfig.areaName === 'classroom') {
                        originalSceneKey = 'taketa_highschool'; // 竹田高校内
                        
                        // 竹田高校内の場合のみ、現在の詳細な状態を取得
                        try {
                            const stage = this.scene.manager.getScene('taketa_highschool');
                            if (stage) {
                                currentState = {
                                    floor: stage.currentFloor || 1,
                                    playerPosition: stage.playerController ? stage.playerController.getPosition() : { x: 100, y: 100 },
                                    mapKey: stage.mapManager ? stage.mapManager.currentMapKey : 'taketa_highschool_1'
                                };
                                console.log('[DynamicConversationScene] 竹田高校内の状態を取得:', currentState);
                            }
                        } catch (e) {
                            console.warn('[DynamicConversationScene] 状態取得エラー:', e);
                        }
                    } else {
                        // 竹田マップの場合は TaketastageStage に戻る（状態保存不要）
                        originalSceneKey = 'TaketastageStage';
                        currentState = null; // 状態保存をクリア
                        console.log('[DynamicConversationScene] 竹田マップに戻ります（状態保存なし）:', this.eventConfig.areaName);
                    }
                    break;
                case 'japan':
                    originalSceneKey = 'JapanStage';
                    break;
                default:
                    originalSceneKey = 'MiemachiStage';
            }
        }
        
        // エリア名を取得（EventConfigのareaNameを優先、フォールバックでeventId）
        const areaName = this.eventConfig?.areaName || this.eventId;
        
        // デバッグログを追加
        console.log('[DynamicConversationScene] ConversationScene起動時のデータ:');
        console.log('[DynamicConversationScene] conversationId:', this.eventId);
        console.log('[DynamicConversationScene] eventConfig:', this.eventConfig);
        console.log('[DynamicConversationScene] conversations:', this.conversationData);
        console.log('[DynamicConversationScene] audioManager:', this.audioManager);
        console.log('[DynamicConversationScene] originalSceneKey:', originalSceneKey);
        console.log('[DynamicConversationScene] areaName:', areaName);
        
        this.scene.launch('ConversationScene', { 
            conversationId: this.eventId,
            eventConfig: this.eventConfig,
            conversations: this.conversationData,  // 既存のconversationDataを渡す
            audioManager: this.audioManager,  // 取得したaudioManagerを渡す
            originalSceneKey: originalSceneKey,  // 元のシーンキーをそのまま渡す
            areaName: areaName,  // エリア名を追加
            currentState: currentState  // 現在の状態を追加
        });
        
        // 会話シーンを最前面に表示
        this.scene.bringToTop('ConversationScene');
        
        // DynamicConversationScene自体を停止（MiemachiStageは停止しない）
        this.scene.stop();
    }
}
