// gameController.jsをimport（バンドルに含めるため）
import './gameController.js';

// PWAマネージャーをインポート
import { PWAManager } from './managers/PWAManager.js';

// PWAマネージャーを初期化
const pwaManager = new PWAManager();

// グローバルに公開（HTMLファイルからアクセスするため）
window.pwaManager = pwaManager;

// 画面向き変更の検知（グローバル設定）
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        // ページリロードを無効化（リサイズ処理で対応）
        if (window.gameInstance && window.gameInstance.scale) {
            window.gameInstance.scale.resize(window.innerWidth, window.innerHeight);
        }
    }, 500);
});
