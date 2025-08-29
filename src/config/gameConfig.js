// デバイスサイズを自動検出する関数（ブラウザUI除外）
function getGameDimensions() {
    // 実際の表示可能エリアを取得（ブラウザのタブバー、アドレスバーなどを除外）
    let windowWidth, windowHeight;
    
    if (document.fullscreenElement) {
        // フルスクリーン時は screen.width/height を使用
        windowWidth = screen.width;
        windowHeight = screen.height;
    } else {
        // 通常時は window.innerHeight から更にブラウザUIを除外
        windowWidth = window.innerWidth;
        
        // ブラウザUIを考慮した実際の表示エリア高さを計算
        // visualViewportがサポートされている場合は使用
        if (window.visualViewport) {
            windowHeight = window.visualViewport.height;
        } else {
            // フォールバック: innerHeightから推定でブラウザUI分を除外
            windowHeight = window.innerHeight;
            
            // モバイルブラウザの場合は更に調整
            if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                // モバイルの場合、アドレスバーなどを考慮
                windowHeight = Math.min(window.innerHeight, window.screen.height - 100);
            }
        }
    }
    
    // 実際の画面サイズをそのまま使用（黒い部分を無くすため）
    let gameWidth = windowWidth;
    let gameHeight = windowHeight;
    
    // 最小サイズを設定（小さすぎる画面への対応）
    gameWidth = Math.max(320, gameWidth);
    gameHeight = Math.max(240, gameHeight);
    
    return { width: gameWidth, height: gameHeight };
}

// 画面サイズを取得
const gameDimensions = getGameDimensions();

// iOS判定（WebKit系ブラウザ含む）
const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);

// ゲーム設定
export const gameConfig = {
    type: Phaser.AUTO,
    width: gameDimensions.width,
    height: gameDimensions.height,
    backgroundColor: '#87CEEB',
    parent: 'game-container',
    audio: {
        // iOSではHTMLAudioを使用して挙動をタイトル画面と揃える
        disableWebAudio: isIOS,
        noAudio: false
    },
    scale: {
        mode: Phaser.Scale.RESIZE, // 画面全体を使用（黒い部分を無くす）
        autoCenter: Phaser.Scale.CENTER_BOTH,
        // 画面全体使用のための設定
        expandParent: true,
        fullscreenTarget: 'game-container',
        // リサイズ時の追加設定
        resizeCallback: function () {
            // 画面リサイズ時の処理をここで行う
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
            // スマホ最適化：物理演算の頻度を調整
            fps: 60,
            timeScale: 1,
            // 物理演算の最適化（正しい設定）
            skipQuadTree: false,
            maxEntries: 12,  // 16から12に削減
            // スマホ向け最適化
            tileBias: 16,
            forceX: false,
            overlapBias: 4
        }
    },
    // レンダリング最適化
    render: {
        antialias: true,  // アンチエイリアシング有効（画質向上）
        pixelArt: false,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        // WebGLの最適化
        failIfMajorPerformanceCaveat: false,
        powerPreference: 'default'
    }
};
