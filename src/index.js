import './stageSelect.js';

// 画面向き変更の検知（グローバル設定）
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        // ページリロードを無効化（リサイズ処理で対応）
        if (window.gameInstance && window.gameInstance.scale) {
            window.gameInstance.scale.resize(window.innerWidth, window.innerHeight);
        }
    }, 500);
});
