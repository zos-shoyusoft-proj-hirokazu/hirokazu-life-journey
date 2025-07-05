import './stageSelect.js';
import { gameConfig } from './config/gameConfig.js';

import { Stage1 } from './scenes/stage1.js';
import { Stage2 } from './scenes/stage2.js';
import { Stage3 } from './scenes/stage3.js';
import { DemoScene } from './scenes/demoScene.js';

// グローバルなゲームインスタンス（1つだけ）
let gameInstance = null;

// ゲーム初期化（初回のみ）
function initializeGame() {
    if (gameInstance) return gameInstance;
    
    const config = {
        ...gameConfig,
        scene: [Stage1, Stage2, Stage3, DemoScene]  // 主要シーンのみ登録
    };
    
    gameInstance = new Phaser.Game(config);
    console.log('Phaser Game initialized (one-time only)');
    return gameInstance;
}

// ゲーム開始関数（シーン切り替えのみ）
export function startPhaserGame(stageNumber) {
    // 初回のみゲーム初期化
    const game = initializeGame();
    
    let sceneKey;
    switch(stageNumber) {
        case 1: sceneKey = 'Stage1Scene'; break;
        case 2: sceneKey = 'Stage2Scene'; break;
        case 3: sceneKey = 'Stage3Scene'; break;
        case 'demo': sceneKey = 'DemoScene'; break;
        case 'stage1_enhanced': sceneKey = 'Stage1Scene'; break;
        default: sceneKey = 'Stage1Scene';
    }
    
    // 既存のアクティブシーンを停止して新しいシーンを開始
    const activeScenes = game.scene.getScenes(true); // アクティブなシーンを取得
    activeScenes.forEach(scene => {
        game.scene.stop(scene.scene.key);
    });
    game.scene.start(sceneKey);
    
    console.log(`Started scene: ${sceneKey}`);
}

// 画面向き変更の検知（グローバル設定）
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.location.reload();
    }, 100);
});