// デバイスサイズを自動検出する関数
function getGameDimensions() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // スマホの場合の最適なアスペクト比を計算
    const aspectRatio = 16 / 9; // または 4:3 など、お好みで調整
    
    let gameWidth, gameHeight;
    
    if (windowWidth / windowHeight > aspectRatio) {
        // 横長の場合は高さを基準にする
        gameHeight = windowHeight;
        gameWidth = gameHeight * aspectRatio;
    } else {
        // 縦長の場合は幅を基準にする
        gameWidth = windowWidth;
        gameHeight = gameWidth / aspectRatio;
    }
    
    // 最小サイズを設定（小さすぎる画面への対応）
    gameWidth = Math.max(320, gameWidth);
    gameHeight = Math.max(240, gameHeight);
    
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
        mode: Phaser.Scale.RESIZE, // 画面リサイズに対応
        autoCenter: Phaser.Scale.CENTER_BOTH,
        // スマホ向けの追加設定
        expandParent: true,
        fullscreenTarget: 'game-container'
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
};
