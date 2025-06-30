import { startPhaserGame } from './index.js';

function startGame(stageNumber) {
    console.log("ゲーム開始！");
    startPhaserGame(stageNumber); // ← ここでPhaserゲームを起動 本来は分けないといけなくて強制敵にindex.jsを読み込んでる
}

// ステージデータを読み込む関数（仮）
function loadStageData(stageNumber) {
    console.log(`ステージ ${stageNumber} のデータを読み込み中...`);
    // ここにステージデータの読み込み処理を書く
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


// ページ読み込み時の処理

showStageSelect();

// ステージボタンにイベントを設定（安全版）
const stage1 = document.getElementById('stage1');
const stage2 = document.getElementById('stage2');
const stage3 = document.getElementById('stage3');

if (stage1) stage1.addEventListener('click', () => startStage(1));
if (stage2) stage2.addEventListener('click', () => startStage(2));
if (stage3) stage3.addEventListener('click', () => startStage(3));
