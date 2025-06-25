import Phaser from 'phaser';
import './stageSelect.js';
import { gameConfig } from './config/gameConfig.js';

// ゲーム開始関数
export function startPhaserGame() {
    new Phaser.Game(gameConfig);
}

// 画面向き変更の検知（グローバル設定）
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.location.reload();
    }, 100);
});