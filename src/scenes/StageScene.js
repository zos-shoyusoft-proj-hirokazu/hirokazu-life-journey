// src/scenes/StageScene.js
import { MapManager } from '../managers/MapManager.js';
import { UIManager } from '../managers/UIManager.js';
import { CameraManager } from '../managers/CameraManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { CollisionManager } from '../managers/CollisionManager.js';
import { PlayerController } from '../controllers/PlayerController.js';
import { TouchControlManager } from '../controllers/TouchControlManager.js';
import { StageConfig } from '../config/StageConfig.js';

export class StageScene extends Phaser.Scene {
    constructor(config) {
        super({ key: config.stageKey });
        
        // 設定を保存
        this.stageConfig = StageConfig[config.stageKey];
        if (!this.stageConfig) {
            console.error(`Stage config not found for: ${config.stageKey}`);
            return;
        }
        
        // マネージャーの初期化
        this.mapManager = null;
        this.uiManager = null;
        this.cameraManager = null;
        this.audioManager = null;
        
        // 現在のフロア
        this.currentFloor = 1;
    }

    preload() {
        // 設定から動的にアセットを読み込み
        const folderName = this.stageConfig.folderName;
        
        // 各フロアのマップファイルを読み込み
        this.stageConfig.floors.forEach(floor => {
            if (floor.implemented) {
                this.load.tilemapTiledJSON(floor.mapKey, `assets/maps/${folderName}/${floor.mapFileName}`);
            }
        });
        
        // タイルセット画像を動的に読み込み（実装済みフロアのものを使用）
        this.stageConfig.floors.forEach(floor => {
            if (floor.implemented) {
                floor.tilesets.forEach(tilesetKey => {
                    this.load.image(tilesetKey, `assets/maps/${folderName}/${tilesetKey}.png`);
                });
            }
        });
        
        // BGMを動的に読み込み
        if (this.stageConfig.bgm && typeof this.stageConfig.bgm === 'object') {
            Object.keys(this.stageConfig.bgm).forEach(bgmKey => {
                this.load.audio(bgmKey, this.stageConfig.bgm[bgmKey]);
            });
        }
        
        // SEを動的に読み込み
        if (this.stageConfig.se) {
            Object.keys(this.stageConfig.se).forEach(seKey => {
                this.load.audio(seKey, this.stageConfig.se[seKey]);
            });
        }
    }

    create() {
        console.log('[StageScene] === create() 開始 ===');
        console.log('[StageScene] シーンキー:', this.scene.key);
        console.log('[StageScene] ステージ設定:', this.stageConfig);
        
        try {
            // 基本的なマップ表示
            this.mapManager = new MapManager(this);
            
            // 基本的なマップ表示を直接実行
            console.log('[StageScene] 基本的なマップ表示開始');
            
            // 設定ファイルから動的にマップキーを取得
            // フロア変更から来た場合は、指定されたフロアから開始
            let targetFloor;
            if (this.nextFloorNumber) {
                targetFloor = this.stageConfig.floors.find(f => f.number === this.nextFloorNumber);
                this.currentFloor = this.nextFloorNumber;
                this.nextFloorNumber = null; // 使用後はクリア
                console.log(`[StageScene] フロア${this.currentFloor}から開始`);
            } else {
                targetFloor = this.stageConfig.floors[0];
                this.currentFloor = 1;
                console.log('[StageScene] フロア1から開始');
            }
            
            this.mapManager.currentMapKey = targetFloor.mapKey;
            
            // 衝突判定マネージャーを先に初期化
            this.collisionManager = new CollisionManager(this);
            this.collisionManager.setupCollisionGroups();
            console.log('[StageScene] CollisionManager初期化完了');
            
            // マップ作成（NPCオブジェクト作成）
            this.mapManager.createMap();
            console.log('[StageScene] 基本的なマップ表示完了');
            
            // プレイヤー作成（フロアごとの開始位置を使用）
            this.playerController = new PlayerController(this);
            const playerStartX = targetFloor.playerStartX || 100;
            const playerStartY = targetFloor.playerStartY || 100;
            this.playerController.createPlayer(playerStartX, playerStartY);
            console.log(`[StageScene] プレイヤー作成完了 - 位置: (${playerStartX}, ${playerStartY})`);
            
            // プレイヤーの位置とオブジェクトを確認
            const playerPos = this.playerController.getPosition();
            console.log('[StageScene] プレイヤー位置:', playerPos);
            console.log('[StageScene] プレイヤーオブジェクト:', this.playerController.player);
            console.log('[StageScene] プレイヤーの可視性:', this.playerController.player.visible);
            
            // タッチコントローラー作成
            this.touchControlManager = new TouchControlManager(this, this.playerController.player, 'se_touch');
            console.log('[StageScene] タッチコントローラー作成完了');
            
            // カメラ設定（stage2と同じ方法）
            this.cameraManager = new CameraManager(this);
            this.cameraManager.setBackgroundColor('#87CEEB');
            this.cameraManager.setupCamera(this, this.mapManager.map, this.playerController.player);
            console.log('[StageScene] カメラ設定完了 (stage2と同じ方法)');
            
            // UI要素を作成
            this.uiManager = new UIManager();
            this.uiManager.createMapUI(this, this.stageConfig.stageTitle);
            
            // 戻るボタンを作成
            this.uiManager.createBackButton(this);
            
            // AudioManagerを初期化
            this.audioManager = new AudioManager(this);
            
            // 竹田マップに戻るための関数を設定
            window.returnToTaketaMap = () => {
                // 竹田マップに戻る（gameController.jsを使用）
                if (window.startPhaserGame) {
                    window.startPhaserGame('taketa');
                } else {
                    console.error('startPhaserGame not found');
                }
            };
            
            // 設定からBGMを再生
            if (this.stageConfig.bgm && this.stageConfig.bgm.map) {
                // 音声コンテキストの状態を確認
                if (this.scene.sound && this.scene.sound.context) {
                    const ctx = this.scene.sound.context;
                    if (ctx.state === 'suspended') {
                        console.log('[StageScene] 音声コンテキストが一時停止状態です。ユーザーインタラクションを待っています');
                        // ユーザーインタラクションを待つ
                        this.waitForAudioContext();
                    } else {
                        this.playBGM();
                    }
                } else {
                    this.playBGM();
                }
            } else {
                console.warn('[StageScene] BGM設定が見つかりません');
            }
            
            // タッチイベントを設定
            this.setupTouchEvents();
            
            // 当たり判定の設定
            this.collisionManager.setupAllCollisions(this.playerController.player, this.mapManager);
            console.log('[StageScene] 当たり判定設定完了');
            
            console.log('[StageScene] === create() 完了 ===');
            
        } catch (error) {
            console.error('[StageScene] create() エラー:', error);
        }
    }
    
    // シーンシャットダウン時のクリーンアップ（stage1, stage2と同じ方式）
    shutdown() {
        console.log('[StageScene] shutdown() メソッド実行開始');
        
        try {
            // 音声システムのクリーンアップ
            if (this.audioManager) {
                this.audioManager.stopAll();
                console.log('[StageScene] AudioManager停止完了');
            }
            
            if (this.sound) {
                this.sound.stopAll();
                console.log('[StageScene] Phaser音声システム停止完了');
                
                // 音声コンテキストの状態をリセット
                if (this.sound.context) {
                    this.sound.context.state = 'suspended';
                    console.log('[StageScene] 音声コンテキスト状態リセット完了');
                }
            }
            
            // 音声コンテキストを完全にクリーンアップ
            if (this.sound && this.sound.context) {
                try {
                    // 音声コンテキストを閉じる
                    if (this.sound.context.close) {
                        this.sound.context.close();
                    }
                    // 音声コンテキストをnullに設定
                    this.sound.context = null;
                    console.log('[StageScene] 音声コンテキスト完全クリーンアップ完了');
                } catch (e) {
                    console.warn('[StageScene] 音声コンテキストクリーンアップエラー:', e);
                }
            }
        } catch (e) {
            console.warn('[StageScene] 音声システムクリーンアップエラー:', e);
        }
        
        // 進行中のローダーやリスナーを完全解除（破棄後の発火防止）
        try { if (this.load && this.load.reset) this.load.reset(); } catch (e) { /* ignore */ }
        try { if (this.load && this.load.removeAllListeners) this.load.removeAllListeners(); } catch (e) { /* ignore */ }
        
        // 他のマネージャーのクリーンアップ
        if (this.playerController) {
            this.playerController.destroy();
            this.playerController = null;
        }
        
        if (this.touchControlManager) {
            this.touchControlManager.destroy();
            this.touchControlManager = null;
        }
        
        if (this.uiManager) {
            this.uiManager.destroy();
            this.uiManager = null;
        }
        
        if (this.cameraManager) {
            this.cameraManager.destroy();
            this.cameraManager = null;
        }
        
        if (this.collisionManager) {
            this.collisionManager.destroy();
            this.collisionManager = null;
        }
        
        if (this.audioManager) {
            this.audioManager.destroy();
            this.audioManager = null;
        }
        
        // シーンシャットダウン時のクリーンアップ登録を削除
        this.events.off('shutdown', this.shutdown, this);
        
        console.log('[StageScene] shutdown() メソッド実行完了');
    }

    changeFloor(floorNumber) {
        if (floorNumber === this.currentFloor) return;
        
        try {
            // 設定からフロア情報を取得
            const floorConfig = this.stageConfig.floors.find(f => f.number === floorNumber);
            if (!floorConfig || !floorConfig.implemented) {
                console.error(`[StageScene] フロア設定が見つからないか、未実装: ${floorNumber}`);
                return;
            }
            
            // フロア番号を保存（Scene再起動時に使用）
            this.nextFloorNumber = floorNumber;
            
            // Scene全体を完全に再起動（これが最も確実）
            this.scene.restart();
            
        } catch (error) {
            console.error('[StageScene] フロア変更エラー:', error);
        }
    }

    // フロアボタン関連のコードを削除（moveオブジェクトで十分）
    // createFloorButtons() メソッドを削除
    // updateFloorButtonHighlight() メソッドを削除

    setupTouchEvents() {
        // タッチイベントを設定
        this.input.on('pointerdown', () => {
            this.handleTouch();
        });
        
        // スマホ向けスクロール機能を追加
        this.cameraManager.setupScrollControls();
        this.cameraManager.setupPinchZoom();
    }

    handleTouch() {
        // 基本的な音声コンテキストロック解除
        try {
            if (this.scene && this.scene.sound && this.scene.sound.context) {
                const ctx = this.scene.sound.context;
                if (ctx.state === 'suspended') {
                    ctx.resume();
                }
            }
        } catch (e) {
            console.warn('[StageScene] 音声コンテキスト処理エラー:', e);
        }
    }
    
    update() {
        // マネージャーの更新処理
        this.cameraManager?.update();
        
        // プレイヤーコントローラーの更新処理
        if (this.playerController) {
            this.playerController.update();
        }
    }

    destroy() {
        this.shutdown();
        super.destroy();
    }

    resize(gameSize) {
        const { width, height } = gameSize;
        
        // カメラサイズを更新
        this.cameras.resize(width, height);
        
        // タッチコントローラーの位置を更新
        if (this.touchControlManager) {
            this.touchControlManager.updatePosition(width, height);
        }
    }
    
    // BGM再生のヘルパーメソッド
    playBGM() {
        try {
            // 前のBGMを確実に停止
            this.audioManager.stopAll();
            if (this.scene.sound) {
                this.scene.sound.stopAll();
            }
            
            // iOS対応：HTMLAudioの停止
            if (this._htmlBgm) {
                this._htmlBgm.pause();
            }
            
            // 新しいBGMを再生
            this.audioManager.playBgm('map');
            console.log('[StageScene] BGM再生開始');
        } catch (error) {
            console.error('[StageScene] BGM再生エラー:', error);
        }
    }
    
    // 音声コンテキストの復旧を待つメソッド
    waitForAudioContext() {
        // ユーザーインタラクションを待つ
        this.input.once('pointerdown', () => {
            if (this.scene.sound && this.scene.sound.context) {
                const ctx = this.scene.sound.context;
                if (ctx.state === 'suspended') {
                    ctx.resume().then(() => {
                        console.log('[StageScene] 音声コンテキストが復旧しました');
                        this.playBGM();
                    }).catch(error => {
                        console.error('[StageScene] 音声コンテキスト復旧エラー:', error);
                    });
                } else {
                    this.playBGM();
                }
            }
        });
    }
}

// 設定ファイルベースでステージシーンを作成するヘルパー関数
export function createStageScene(stageKey) {
    const stageConfig = StageConfig[stageKey];
    if (!stageConfig) {
        console.error(`Stage config not found for: ${stageKey}`);
        return null;
    }
    
    return new StageScene({
        stageKey: stageKey,
        stageConfig: stageConfig
    });
}
