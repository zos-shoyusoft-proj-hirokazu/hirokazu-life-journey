
import './stageSelect.js';
import { gameConfig } from './config/gameConfig.js';

import { Stage1 } from './scenes/stage1.js';
import { Stage2 } from './scenes/stage2.js';
import { Stage3 } from './scenes/stage3.js';


// ゲーム開始関数
export function startPhaserGame(stageNumber) {
    let sceneClass;
    
    switch(stageNumber) {
        case 1: sceneClass = Stage1; break;
        case 2: sceneClass = Stage2; break;
        case 3: sceneClass = Stage3; break;
        default: sceneClass = Stage1;
    }
    
    const config = {
        ...gameConfig,
        scene: sceneClass  // ← 適切なSceneクラスを設定
    };
    
    new Phaser.Game(config);
}

// 画面向き変更の検知（グローバル設定）
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.location.reload();
    }, 100);
});