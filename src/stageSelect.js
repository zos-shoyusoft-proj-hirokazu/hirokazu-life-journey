import { startPhaserGame } from './gameController.js';
// AudioManagerのimportは不要 - HTMLスクリプトのため

function startGame(stageNumber) {
    startPhaserGame(stageNumber); // ← ここでPhaserゲームを起動 本来は分けないといけなくて強制敵にindex.jsを読み込んでる
}

// ステージデータを読み込む関数
function loadStageData(stageNumber) {
    // ここで将来的にステージデータを読み込む処理を行う
    // eslint-disable-next-line no-unused-vars
    const stage = stageNumber; // 将来的にstageNumberを使ってデータを読み込む予定
}

// 画面の表示/非表示を切り替える関数（安全版）
function showStageSelect() {
    const gameContainer = document.getElementById('game-container');
    const stageSelect = document.getElementById('stage-select');
    
    if (gameContainer) gameContainer.style.display = 'none';
    if (stageSelect) stageSelect.style.display = 'block';
}

function hideStageSelect() {
    document.getElementById('stage-select').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
}

// ステージを開始する関数
function startStage(stageNumber) {
    loadStageData(stageNumber);
    hideStageSelect();
    startGame(stageNumber);
}

// ゲーム中からステージ選択に戻るためのグローバル関数
function returnToStageSelect() {
    if (window.game && window.game.destroy) {
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

// ページ読み込み時の処理（重複実行防止）
if (!window.stageSelectInitialized) {
    window.stageSelectInitialized = true;
    
    showStageSelect();

    // ステージボタンにイベントを設定（重複防止版）
    const stage1 = document.getElementById('stage1');
    const stage2 = document.getElementById('stage2');
    const stage3 = document.getElementById('stage3');
    const miemachi = document.getElementById('miemachi');

    if (stage1) {
        // 既存のリスナーを削除してから新しいリスナーを追加
        stage1.removeEventListener('click', stage1ClickHandler);
        stage1.addEventListener('click', stage1ClickHandler);
    }
    if (stage2) {
        stage2.removeEventListener('click', stage2ClickHandler);
        stage2.addEventListener('click', stage2ClickHandler);
    }
    if (stage3) {
        stage3.removeEventListener('click', stage3ClickHandler);
        stage3.addEventListener('click', stage3ClickHandler);
    }
    if (miemachi) {
        miemachi.removeEventListener('click', miemachiClickHandler);
        miemachi.addEventListener('click', miemachiClickHandler);
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

function stage3ClickHandler() {
    startStage(3);
}

function miemachiClickHandler() {
    startStage('miemachi');
}
