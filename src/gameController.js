import { gameConfig } from './config/gameConfig.js';
import { Stage1 } from './scenes/stage1.js';
import { Stage2 } from './scenes/stage2.js';
import { Stage3 } from './scenes/stage3.js';
import { createMapStage } from './scenes/MapSelectionStage.js';
// import { StageSelectScene } from './scenes/StageSelectScene.js';

// グローバルなゲームインスタンス（1つだけ）
let gameInstance = null;

// ゲーム初期化（初回のみ）
function initializeGame() {
    if (window.game) {
        console.log('[GameInit] 既存のwindow.gameを返します');
        return window.game;
    }
    console.log('[GameInit] 新しいPhaser.Gameインスタンスを作成します');
    const config = {
        ...gameConfig,
        scene: []  // 空で開始（軽量化）
    };
    gameInstance = new Phaser.Game(config);
    window.game = gameInstance;
    window.gameInstance = gameInstance;
    return gameInstance;
}

// ゲーム開始関数（動的シーン読み込み）
export function startPhaserGame(stageNumber) {
    console.log(`[GameStart] ステージ${stageNumber}のゲームを開始`);
    const game = initializeGame();

    let sceneClass, sceneKey;
    switch(stageNumber) {
        case 1: sceneClass = Stage1; sceneKey = 'Stage1Scene'; break;
        case 2: sceneClass = Stage2; sceneKey = 'Stage2Scene'; break;
        case 3: sceneClass = Stage3; sceneKey = 'Stage3Scene'; break;
        case 'stage1_enhanced': sceneClass = Stage1; sceneKey = 'Stage1Scene'; break;
        case 'miemachi': sceneClass = createMapStage('miemachi', 'MiemachiStage'); sceneKey = 'MiemachiStage'; break;
        default: sceneClass = Stage1; sceneKey = 'Stage1Scene';
    }
    game.scene.add(sceneKey, sceneClass, true);
    console.log(`[GameStart] シーン${sceneKey}を追加・開始`);
} 