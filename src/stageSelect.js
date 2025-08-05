import { startPhaserGame } from './gameController.js';
// AudioManagerのimportは不要 - HTMLスクリプトのため

function startGame(stageNumber) {
    startPhaserGame(stageNumber); // ← ここでPhaserゲームを起動 本来は分けないといけなくて強制敵にindex.jsを読み込んでる
}



// 画面の表示/非表示を切り替える関数（安全版）
function showStageSelect() {
    const gameContainer = document.getElementById('game-container');
    const stageSelect = document.getElementById('stage-select');
    
    if (gameContainer) gameContainer.style.display = 'none';
    if (stageSelect) stageSelect.style.display = 'flex';
}

function hideStageSelect() {
    document.getElementById('stage-select').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
}

// ステージを開始する関数
function startStage(stageNumber) {
    hideStageSelect();
    startGame(stageNumber);
}

// ゲーム中からステージ選択に戻るためのグローバル関数
function returnToStageSelect() {
    if (window.game && window.game.destroy) {
        // すべてのシーンのAudioManagerをクリーンアップ
        if (window.game.scene) {
            window.game.scene.scenes.forEach(scene => {
                if (scene && scene.audioManager) {
                    scene.audioManager.stopAll();
                    scene.audioManager.destroy();
                    scene.audioManager = null;
                }
                
                // イベントリスナーの削除
                if (scene.events) {
                    scene.events.removeAllListeners();
                }
                
                // シーンのshutdownメソッドを呼び出し
                if (scene.shutdown) {
                    scene.shutdown();
                }
            });
        }
        
        // グローバルな音声システムをクリーンアップ
        if (window.game.sound) {
            window.game.sound.stopAll();
            window.game.sound.removeAll();
        }
        
        window.game.destroy(true);
        window.game = null;
        if (typeof window.gameInstance !== 'undefined') {
            window.gameInstance = null;
        }
    }
    showStageSelect();
}

// グローバルに公開
window.returnToStageSelect = returnToStageSelect;
window.showStageSelect = showStageSelect;
window.hideStageSelect = hideStageSelect;
window.startStage = startStage;

// ページ読み込み時の処理（重複実行防止）
if (!window.stageSelectInitialized) {
    window.stageSelectInitialized = true;
    
    showStageSelect();

    // ステージボタンにイベントを設定（重複防止版）
    const stage1 = document.getElementById('stage1');
    const stage2 = document.getElementById('stage2');
    const miemachi = document.getElementById('miemachi');
    const taketastage = document.getElementById('taketastage');

    if (stage1) {
        // 既存のリスナーを削除してから新しいリスナーを追加
        stage1.removeEventListener('click', stage1ClickHandler);
        stage1.addEventListener('click', stage1ClickHandler);
    }
    if (stage2) {
        stage2.removeEventListener('click', stage2ClickHandler);
        stage2.addEventListener('click', stage2ClickHandler);
    }
    if (miemachi) {
        miemachi.removeEventListener('click', miemachiClickHandler);
        miemachi.addEventListener('click', miemachiClickHandler);
    }
    if (taketastage) {
        taketastage.removeEventListener('click', taketastageClickHandler);
        taketastage.addEventListener('click', taketastageClickHandler);
    }
    
} else {
    // console.log('=== stageSelect.js すでに初期化済み（スキップ） ===');
}

// イベントハンドラーを関数として定義（重複削除のため）
function stage1ClickHandler() {
    startStage(1);
}

function stage2ClickHandler() {
    startStage(2);
}

function miemachiClickHandler() {
    startStage('miemachi');
}

function taketastageClickHandler() {
    startStage('taketa');
}
