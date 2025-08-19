// 三重町のマップ読み込みテスト
import { MiemachiConversationManager } from './src/data/miemachi/conversationData.js';
import { ResourceManager } from './src/managers/ResourceManager.js';

async function testMiemachiLoading() {
    console.log('=== 三重町マップ読み込みテスト開始 ===');
    
    // 1. リソース管理クラスを初期化
    const resourceManager = new ResourceManager();
    console.log('ResourceManager初期化完了');
    
    // 2. 三重町会話管理クラスを初期化
    const miemachiManager = new MiemachiConversationManager();
    console.log('MiemachiConversationManager初期化完了');
    
    // 3. リソース管理クラスを設定
    miemachiManager.setResourceManager(resourceManager);
    console.log('ResourceManager設定完了');
    
    // 4. マップ読み込み開始
    console.log('\n--- マップ読み込み開始 ---');
    try {
        await miemachiManager.loadMap('miemachi');
        console.log('マップ読み込み完了！');
        
        // 5. 利用可能なイベントを確認
        const events = miemachiManager.getAvailableEvents();
        console.log('利用可能なイベント:', events);
        
    } catch (error) {
        console.error('マップ読み込みエラー:', error);
    }
    
    console.log('\n=== テスト終了 ===');
}

// テスト実行
testMiemachiLoading().catch(console.error);
