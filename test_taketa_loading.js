// 竹田のマップ読み込みテスト
import { TaketaConversationManager } from './src/data/taketa/conversationData.js';
import { ResourceManager } from './src/managers/ResourceManager.js';

async function testTaketaLoading() {
    console.log('=== 竹田マップ読み込みテスト開始 ===');
    
    // 1. リソース管理クラスを初期化
    const resourceManager = new ResourceManager();
    console.log('ResourceManager初期化完了');
    
    // 2. 竹田会話管理クラスを初期化
    const taketaManager = new TaketaConversationManager();
    console.log('TaketaConversationManager初期化完了');
    
    // 3. リソース管理クラスを設定
    taketaManager.setResourceManager(resourceManager);
    console.log('ResourceManager設定完了');
    
    // 4. マップ読み込み開始
    console.log('\n--- マップ読み込み開始 ---');
    try {
        await taketaManager.loadMap('taketa');
        console.log('マップ読み込み完了！');
        
        // 5. 利用可能なイベントを確認
        const events = taketaManager.getAvailableEvents();
        console.log('利用可能なイベント:', events);
        
    } catch (error) {
        console.error('マップ読み込みエラー:', error);
    }
    
    console.log('\n=== テスト終了 ===');
}

// テスト実行
testTaketaLoading().catch(console.error);
