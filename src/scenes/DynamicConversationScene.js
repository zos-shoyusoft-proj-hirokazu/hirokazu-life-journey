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
        
        // 必要なリソースを動的に読み込み（完了を待つ）
        await this.loadRequiredResources();
    }

    // 必要なリソースを動的に読み込み
    async loadRequiredResources() {
        // EventConfigから必要なリソースを動的に取得
        const { getRequiredResources, getEventConfig } = await import('../config/EventConfig.js');
        this.eventConfig = getEventConfig(this.eventId);
        const required = getRequiredResources(this.eventId);
        
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
                this.audioManager = new (await import('../managers/AudioManager.js')).AudioManager(this);
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

    // 既存のconversationDataを取得
    loadConversationData() {
        return new Promise((resolve) => {
            // エリアタイプに基づいて適切なconversationDataを取得
            const areaType = this.eventConfig?.areaType;
            
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
                            this.conversationData = taketaConversationData[conversationKey];
                            resolve();
                        });
                        break;
                    case 'japan':
                        import('../data/japan/conversationData.js').then(({ japanConversationData }) => {
                            const conversationKey = this.eventConfig.eventConfig.conversationDataKey;
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
        
        // リソース読み込み完了後、既存のConversationSceneを開始
        
        // 元のシーンのキーを取得（areaTypeに基づいて決定）
        let originalSceneKey = 'MiemachiStage'; // デフォルト
        
        if (this.eventConfig && this.eventConfig.areaType) {
            switch (this.eventConfig.areaType) {
                case 'miemachi':
                    originalSceneKey = 'MiemachiStage';
                    break;
                case 'taketa':
                    originalSceneKey = 'TaketastageStage';
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
        
        this.scene.launch('ConversationScene', { 
            conversationId: this.eventId,
            eventConfig: this.eventConfig,
            conversations: this.conversationData,  // 既存のconversationDataを渡す
            audioManager: this.audioManager,  // 取得したaudioManagerを渡す
            originalSceneKey: originalSceneKey,  // 元のシーンキーをそのまま渡す
            areaName: areaName  // エリア名を追加
        });
        
        // 会話シーンを最前面に表示
        this.scene.bringToTop('ConversationScene');
        
        // DynamicConversationScene自体を停止（MiemachiStageは停止しない）
        this.scene.stop();
    }
}
