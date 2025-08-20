// 動的会話シーン
// 個別シーンの構造のみ作成（中身は後で動的に実装）

export class DynamicConversationScene extends Phaser.Scene {
    constructor() {
        super();
        this.eventId = null;
        this.resourcesLoaded = false;
    }

    init(data) {
        this.eventId = data.eventId;
        console.log(`[DynamicConversationScene] init called with eventId: ${this.eventId}`);
    }

    preload() {
        // 読み込み処理
        console.log(`[DynamicConversationScene] preload started for event: ${this.eventId}`);
        
        // リソース読み込み完了イベントを設定
        this.load.on('complete', () => {
            console.log(`[DynamicConversationScene] リソース読み込み完了: ${this.eventId}`);
            console.log('[DynamicConversationScene] 読み込まれたリソース:', this.cache.texture?.entries || 'texture cache not available');
            this.resourcesLoaded = true;
        });
        
        this.load.on('error', (file) => {
            console.error('[DynamicConversationScene] リソース読み込みエラー:', file);
        });
        
        // 必要なリソースを動的に読み込み
        this.loadRequiredResources();
    }

    // 必要なリソースを動的に読み込み
    loadRequiredResources() {
        // EventConfigから必要なリソースを動的に取得
        import('../config/EventConfig.js').then(({ getRequiredResources, getEventConfig }) => {
            this.eventConfig = getEventConfig(this.eventId);
            const required = getRequiredResources(this.eventId);
            
            console.log('[DynamicConversationScene] eventConfig:', this.eventConfig);
            console.log('[DynamicConversationScene] required resources:', required);
            
            if (required) {
                // 背景画像
                console.log('[DynamicConversationScene] 背景画像読み込み開始');
                required.backgrounds?.forEach(bg => {
                    console.log(`[DynamicConversationScene] 背景画像読み込み: ${bg} -> assets/backgrounds/miemachi_bk/${bg}.png`);
                    this.load.image(bg, `assets/backgrounds/miemachi_bk/${bg}.png`);
                });
                
                // キャラクター画像
                required.characters?.forEach(char => {
                    this.load.image(char, `assets/characters/portraits/${char}.png`);
                });
                
                // BGM
                required.bgm?.forEach(bgm => {
                    this.load.audio(`bgm_${bgm}`, `assets/audio/bgm/${bgm}.mp3`);
                });
                
                // SE
                required.se?.forEach(se => {
                    this.load.audio(`se_${se}`, `assets/audio/se/${se}.mp3`);
                });
            }
            
            // 既存のconversationDataを取得
            this.loadConversationData().then(() => {
                // conversationDataの読み込み完了
                this.conversationDataLoaded = true;
                
                // conversationData読み込み完了後にリソース読み込みを開始
                this.load.start();
            });
        });
    }

    // 既存のconversationDataを取得
    loadConversationData() {
        return new Promise((resolve) => {
            console.log(`[DynamicConversationScene] loadConversationData開始: eventId=${this.eventId}`);
            console.log('[DynamicConversationScene] eventConfig:', this.eventConfig);
            
            // エリアタイプに基づいて適切なconversationDataを取得
            const areaType = this.eventConfig?.areaType;
            console.log(`[DynamicConversationScene] areaType: ${areaType}`);
            
            if (areaType) {
                switch (areaType) {
                    case 'miemachi':
                        console.log('[DynamicConversationScene] miemachiのconversationDataを読み込み中...');
                        import('../data/miemachi/conversationData.js').then(({ miemachiConversationData }) => {
                            const conversationKey = this.eventConfig.conversationDataKey;
                            console.log(`[DynamicConversationScene] conversationKey: ${conversationKey}`);
                            console.log('[DynamicConversationScene] miemachiConversationData:', miemachiConversationData);
                            this.conversationData = miemachiConversationData[conversationKey];
                            console.log('[DynamicConversationScene] 設定されたconversationData:', this.conversationData);
                            resolve();
                        });
                        break;
                    case 'taketa':
                        console.log('[DynamicConversationScene] taketaのconversationDataを読み込み中...');
                        import('../data/taketa/conversationData.js').then(({ taketaConversationData }) => {
                            const conversationKey = this.eventConfig.conversationDataKey;
                            console.log(`[DynamicConversationScene] conversationKey: ${conversationKey}`);
                            this.conversationData = taketaConversationData[conversationKey];
                            console.log('[DynamicConversationScene] 設定されたconversationData:', this.conversationData);
                            resolve();
                        });
                        break;
                    case 'japan':
                        console.log('[DynamicConversationScene] japanのconversationDataを読み込み中...');
                        import('../data/japan/conversationData.js').then(({ japanConversationData }) => {
                            const conversationKey = this.eventConfig.conversationDataKey;
                            console.log(`[DynamicConversationScene] conversationKey: ${conversationKey}`);
                            this.conversationData = japanConversationData[conversationKey];
                            console.log('[DynamicConversationScene] 設定されたconversationData:', this.conversationData);
                            resolve();
                        });
                        break;
                    default:
                        console.log(`[DynamicConversationScene] 不明なareaType: ${areaType}`);
                        resolve();
                }
            } else {
                console.log('[DynamicConversationScene] areaTypeが設定されていません');
                resolve();
            }
        });
    }

    create() {
        // 作成処理
        console.log(`[DynamicConversationScene] create started for event: ${this.eventId}`);
        
        // リソース読み込みとconversationData読み込みが完了していない場合は待機
        if (!this.resourcesLoaded || !this.conversationDataLoaded) {
            console.log(`[DynamicConversationScene] リソース読み込み待機中: ${this.eventId}`);
            // 100ms後に再チェック
            this.time.delayedCall(100, () => {
                this.create();
            });
            return;
        }
        
        // リソース読み込み完了後、既存のConversationSceneを開始
        console.log(`[DynamicConversationScene] ConversationScene開始: ${this.eventId}`);
        this.scene.start('ConversationScene', { 
            conversationId: this.eventId,
            eventConfig: this.eventConfig,
            conversations: this.conversationData  // 既存のconversationDataを渡す
        });
    }
}
