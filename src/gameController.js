import { gameConfig } from './config/gameConfig.js';
import { Stage1 } from './scenes/stage1.js';
import { Stage2 } from './scenes/stage2.js';
import { Stage3 } from './scenes/stage3.js';
import { createMapStage } from './scenes/MapSelectionStage.js';

// グローバルなゲームインスタンス（1つだけ）
let gameInstance = null;

// ゲーム初期化（初回のみ）
function initializeGame() {
    if (window.game) {
        return window.game;
    }
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
    console.log('[startPhaserGame] 開始:', stageNumber);
    const game = initializeGame();

    let sceneClass, sceneKey;
    switch(stageNumber) {
        case 1: sceneClass = Stage1; sceneKey = 'Stage1Scene'; break;
        case 2: sceneClass = Stage2; sceneKey = 'Stage2Scene'; break;
        case 3: sceneClass = Stage3; sceneKey = 'Stage3Scene'; break;
        case 'miemachi': sceneClass = createMapStage('miemachi', 'MiemachiStage'); sceneKey = 'MiemachiStage'; break;
        case 'taketa': sceneClass = createMapStage('taketastage', 'TaketastageStage'); sceneKey = 'TaketastageStage'; break;

        case 'bunngo_mie_city': sceneClass = createMapStage('miemachi', 'MiemachiStage'); sceneKey = 'MiemachiStage'; break;
        case 'taketa_city': sceneClass = createMapStage('taketastage', 'TaketastageStage'); sceneKey = 'TaketastageStage'; break;

        default: 
            console.log('[DEBUG] gameController: 未定義のシーン:', stageNumber, '→ Stage1に飛ぶ');
            sceneClass = Stage1; 
            sceneKey = 'Stage1Scene';
    }
    console.log('[startPhaserGame] シーンを追加:', sceneKey);
    game.scene.add(sceneKey, sceneClass, true);
} 