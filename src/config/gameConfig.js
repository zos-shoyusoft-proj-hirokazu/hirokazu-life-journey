// デバイスサイズを自動検出する関数
function getGameDimensions() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // スマホの実際のサイズをそのまま使用（アスペクト比強制なし）
    let gameWidth = windowWidth;
    let gameHeight = windowHeight;
    
    // 最小サイズを設定（小さすぎる画面への対応）
    gameWidth = Math.max(320, gameWidth);
    gameHeight = Math.max(240, gameHeight);
    
    console.log('=== Game Dimensions ===');
    console.log('Window Size:', windowWidth, 'x', windowHeight);
    console.log('Game Size:', gameWidth, 'x', gameHeight);
    
    return { width: gameWidth, height: gameHeight };
}

// 画面サイズを取得
const gameDimensions = getGameDimensions();

// ゲーム設定
export const gameConfig = {
    type: Phaser.AUTO,
    width: gameDimensions.width,
    height: gameDimensions.height,
    backgroundColor: '#87CEEB',
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT, // 画面にフィットさせる
        autoCenter: Phaser.Scale.CENTER_BOTH,
        // スマホ向けの追加設定
        expandParent: true,
        fullscreenTarget: 'game-container'
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
        antialias: false,  // スマホではアンチエイリアシング無効
        pixelArt: false,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        // WebGLの最適化
        failIfMajorPerformanceCaveat: false,
        powerPreference: 'default'
    }
};
