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
    // 破棄検出用フラグ（リサイズ等の安全確認用）
    try {
        gameInstance.events.on('destroy', () => {
            try {
                gameInstance.isDestroyed = true;
            } catch (e) {
                // ignore
            }
        });
    } catch (e) {
        // ignore
    }

    // iOS向け: どこでも最初のユーザー操作でWebAudioを確実に解除
    try {
        if (!window.__audioUnlockInstalled) {
            const tryResume = () => {
                try {
                    const snd = window.gameInstance && window.gameInstance.sound;
                    const ctx = snd && snd.context;
                    if (ctx) {
                        if (ctx.state !== 'running') {
                            ctx.resume().catch(() => {});
                        }
                        // 無音オシレータで更に確実にアンロック
                        try {
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            gain.gain.value = 0.0001;
                            osc.connect(gain).connect(ctx.destination);
                            osc.start();
                            osc.stop(ctx.currentTime + 0.05);
                        } catch (oscError) { /* ignore */ }
                    }
                    // 解除されたらリスナー解除
                    if (snd && !snd.locked) {
                        window.removeEventListener('pointerdown', tryResume, true);
                        window.removeEventListener('touchstart', tryResume, true);
                        window.removeEventListener('click', tryResume, true);
                    }
                } catch (resumeError) { /* ignore */ }
            };
            window.addEventListener('pointerdown', tryResume, true);
            window.addEventListener('touchstart', tryResume, true);
            window.addEventListener('click', tryResume, true);
            window.__audioUnlockInstalled = true;
        }
    } catch (stopAllError) { /* ignore */ }
    return gameInstance;
}

// ゲーム開始関数（動的シーン読み込み）
export function startPhaserGame(stageNumber) {
    // 多重起動防止（高速連打対策）
    // 起動前に残骸を掃除（直接呼ばれた場合の保険）
    try {
        if (window.game && window.game.scene && window.game.scene.getScenes) {
            const scenes = window.game.scene.getScenes(false) || [];
            for (const s of scenes) {
                try { if (s.load && s.load.reset) s.load.reset(); } catch(err) { /* ignore */ }
                try { if (s.load && s.load.removeAllListeners) s.load.removeAllListeners(); } catch(err) { /* ignore */ }
                try { if (s.sound && s.sound.stopAll) s.sound.stopAll(); } catch(err) { /* ignore */ }
                try { if (s.audioManager && s.audioManager.stopAll) s.audioManager.stopAll(); } catch(err) { /* ignore */ }
                try { if (s.scene && s.scene.isActive && s.scene.isActive()) s.scene.stop(); } catch(err) { /* ignore */ }
                try { if (s.scene && s.scene.remove) s.scene.remove(); } catch(err) { /* ignore */ }
            }
        }
    } catch(err) { /* ignore */ }
    const game = initializeGame();

    let sceneClass, sceneKey;
    switch(stageNumber) {
        case 1: sceneClass = Stage1; sceneKey = 'Stage1Scene'; break;
        case 2: sceneClass = Stage2; sceneKey = 'Stage2Scene'; break;
        case 3: sceneClass = Stage3; sceneKey = 'Stage3Scene'; break;
        case 'miemachi': sceneClass = createMapStage('miemachi', 'MiemachiStage'); sceneKey = 'MiemachiStage'; break;
        case 'taketa': sceneClass = createMapStage('taketastage', 'TaketastageStage'); sceneKey = 'TaketastageStage'; break;
        case 'japan': sceneClass = createMapStage('japan', 'JapanStage'); sceneKey = 'JapanStage'; break;

        case 'zenkoku': sceneClass = createMapStage('japan', 'JapanStage'); sceneKey = 'JapanStage'; break;
        case 'bunngo_mie_city': sceneClass = createMapStage('miemachi', 'MiemachiStage'); sceneKey = 'MiemachiStage'; break;
        case 'taketa_city': sceneClass = createMapStage('taketastage', 'TaketastageStage'); sceneKey = 'TaketastageStage'; break;

        default: 
            sceneClass = Stage1; 
            sceneKey = 'Stage1Scene';
    }
    // 追加前に全サウンド停止＆既存シーン停止（多重再生・リソース競合防止）
    try {
        if (game.sound) game.sound.stopAll();
        // 既存のアクティブシーンに対しても停止（HTMLAudio含む）
        if (game.scene && game.scene.getScenes) {
            const scenes = game.scene.getScenes(true) || [];
            scenes.forEach(s => {
                try {
                    if (s.sound && s.sound.stopAll) s.sound.stopAll();
                } catch (e) {
                    // ignore
                }
                try {
                    if (s._htmlBgm) {
                        s._htmlBgm.pause();
                        s._htmlBgm = null;
                    }
                } catch (e) {
                    // ignore
                }
                try {
                    if (s.scene && s.scene.stop) s.scene.stop(); // shutdownを発火
                } catch (e) {
                    // ignore
                }
            });
        }
    } catch (stopAllError) {
        // ignore
    }
    // 既存シーンを完全にクリーンアップしてから、新シーンを追加・起動
    // 1) すべてのシーンを停止・削除（アクティブ/非アクティブを問わず）
    try {
        const allScenes = (game.scene && (game.scene.scenes || game.scene.getScenes && game.scene.getScenes(false))) || [];
        const scenesArray = Array.isArray(allScenes) ? allScenes : [];
        scenesArray.forEach(s => {
            try { if (s && s.sound && s.sound.stopAll) s.sound.stopAll(); } catch (e) { /* ignore */ }
            try { if (s && s._htmlBgm) { s._htmlBgm.pause(); s._htmlBgm = null; } } catch (e) { /* ignore */ }
            try { if (s && s._eventHtmlBgm) { s._eventHtmlBgm.pause(); s._eventHtmlBgm = null; } } catch (e) { /* ignore */ }
            try { if (s && s.scene && s.scene.isActive && s.scene.isActive()) s.scene.stop(); } catch (e) { /* ignore */ }
            try { if (s && s.scene && s.scene.remove) s.scene.remove(); } catch (e) { /* ignore */ }
        });
    } catch (e) { /* ignore */ }
    // 2) 念のため、対象シーンキーが残っていれば削除
    try {
        if (game.scene.getScene && game.scene.getScene(sceneKey)) {
            game.scene.remove(sceneKey);
        }
        // ConversationSceneが残っている場合も削除（次のマップで再登録するため）
        if (game.scene.getScene && game.scene.getScene('ConversationScene')) {
            game.scene.remove('ConversationScene');
        }
    } catch (e) { /* ignore */ }
    game.scene.add(sceneKey, sceneClass, true);
}

// グローバル関数として公開
window.startPhaserGame = startPhaserGame; 