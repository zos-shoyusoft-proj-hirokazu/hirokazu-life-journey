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
        scene: []  // 空で開始（軽量化）
    };
    
    gameInstance = new Phaser.Game(config);
    
    // グローバルに公開（リサイズ処理用）
    window.gameInstance = gameInstance;
    
    console.log('Phaser Game initialized (one-time only)');
    return gameInstance;
}

// ゲーム開始関数（動的シーン読み込み）
export function startPhaserGame(stageNumber) {
    // 初回のみゲーム初期化
    const game = initializeGame();
    
    let sceneClass, sceneKey;
    switch(stageNumber) {
        case 1: sceneClass = Stage1; sceneKey = 'Stage1Scene'; break;
        case 2: sceneClass = Stage2; sceneKey = 'Stage2Scene'; break;
        case 3: sceneClass = Stage3; sceneKey = 'Stage3Scene'; break;
        case 'demo': sceneClass = DemoScene; sceneKey = 'DemoScene'; break;
        case 'stage1_enhanced': sceneClass = Stage1; sceneKey = 'Stage1Scene'; break;
        default: sceneClass = Stage1; sceneKey = 'Stage1Scene';
    }
    
    // 既存のアクティブシーンを完全に停止・削除
    const activeScenes = game.scene.getScenes(true);
    activeScenes.forEach(scene => {
        console.log(`Stopping and removing scene: ${scene.scene.key}`);
        game.scene.stop(scene.scene.key);
        // シーンを完全に削除
        if (scene.scene.key !== sceneKey) {
            game.scene.remove(scene.scene.key);
        }
    });
    
    // ConversationSceneも確実に停止・削除
    if (game.scene.getScene('ConversationScene')) {
        game.scene.stop('ConversationScene');
        game.scene.remove('ConversationScene');
    }
    
    // 少し待ってからシーンを追加（完全なクリーンアップを確保）
    setTimeout(() => {
        // シーンを動的に追加
        if (!game.scene.getScene(sceneKey)) {
            game.scene.add(sceneKey, sceneClass);
        }
        
        // シーンを開始
        game.scene.start(sceneKey);
        console.log(`Started scene: ${sceneKey} (fully cleaned)`);
    }, 50);
}

// 画面向き変更の検知（グローバル設定）
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        // ページリロードを無効化（リサイズ処理で対応）
        if (window.gameInstance && window.gameInstance.scale) {
            window.gameInstance.scale.resize(window.innerWidth, window.innerHeight);
        }
    }, 500);
});
