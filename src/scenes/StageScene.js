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
        
        // タイルセット画像を動的に読み込み（1階のものを使用）
        const firstFloor = this.stageConfig.floors[0];
        firstFloor.tilesets.forEach(tilesetKey => {
            this.load.image(tilesetKey, `assets/maps/${folderName}/${tilesetKey}.png`);
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
        try {
            // カメラマネージャーを初期化
            this.cameraManager = new CameraManager(this);
            this.cameraManager.setBackgroundColor('#87CEEB');
            
            // CollisionManagerを初期化
            this.collisionManager = new CollisionManager(this);
            this.collisionManager.setupCollisionGroups();

            // マップマネージャーを初期化
            this.mapManager = new MapManager(this);
            
            // フロア機能は後で実装（基本的なマップ表示のみ）
            // this.createFloorMap(1);
            
            // 基本的なマップ表示を直接実行
            console.log('[StageScene] 基本的なマップ表示開始');
            
            // 設定ファイルから動的にマップキーを取得
            const firstFloor = this.stageConfig.floors[0];
            console.log('[StageScene] 取得したフロア設定:', firstFloor);
            this.mapManager.currentMapKey = firstFloor.mapKey;
            console.log('[StageScene] マップキー設定:', this.mapManager.currentMapKey);
            console.log('[StageScene] 期待されるマップキー: taketa_highschool_1');
            
            this.mapManager.createMap();
            console.log('[StageScene] 基本的なマップ表示完了');
            
            // プレイヤーコントローラーを初期化
            this.playerController = new PlayerController(this);
            this.playerController.createPlayer(100, 100);
            console.log('[StageScene] プレイヤー作成完了');
            
            // プレイヤーの位置と状態を確認
            const playerPos = this.playerController.getPosition();
            console.log('[StageScene] プレイヤー位置:', playerPos);
            console.log('[StageScene] プレイヤーオブジェクト:', this.playerController.player);
            console.log('[StageScene] プレイヤーの可視性:', this.playerController.player?.visible);
            
            // タッチ操作のためのコントローラーを追加
            this.touchControlManager = new TouchControlManager(this, this.playerController.player, 'se_touch');
            console.log('[StageScene] タッチコントローラー作成完了');
            
            // カメラ設定（stage2と同じ方法）
            this.cameraManager.setupCamera(this, this.mapManager.map, this.playerController.player);
            console.log('[StageScene] カメラ設定完了（stage2と同じ方法）');
            
            // UI要素を作成
            this.uiManager = new UIManager();
            this.uiManager.createMapUI(this, this.stageConfig.stageTitle);
            
            // 戻るボタンを作成
            this.uiManager.createBackButton(this);
            
                    // フロア切り替えボタンを作成（後で実装）
        // this.createFloorButtons();
            
            // AudioManagerを初期化
            this.audioManager = new AudioManager(this);
            
            // 設定からBGMを再生
            if (this.stageConfig.bgm && this.stageConfig.bgm.map) {
                console.log('[StageScene] BGM再生開始:', this.stageConfig.bgm.map);
                
                // 前のBGMを明示的に停止（強力な方法）
                console.log('[StageScene] BGM停止処理開始');
                
                // 1. AudioManagerの停止
                this.audioManager.stopAll();
                console.log('[StageScene] AudioManager停止完了');
                
                // 2. Phaserの音声システムも直接停止
                if (this.scene.sound) {
                    try {
                        this.scene.sound.stopAll();
                        console.log('[StageScene] Phaser音声システム停止完了');
                    } catch (e) {
                        console.warn('[StageScene] Phaser音声システム停止エラー:', e);
                    }
                }
                
                // 3. iOS対応：HTMLAudioの停止（ConversationSceneと同じ方法）
                if (this._htmlBgm) {
                    try {
                        this._htmlBgm.pause();
                        console.log('[StageScene] iOS用HTMLAudio停止完了');
                    } catch (e) {
                        console.warn('[StageScene] iOS用HTMLAudio停止エラー:', e);
                    }
                }
                
                // 4. 竹田マップのBGMを直接停止
                console.log('🚨 [StageScene] 竹田マップBGM停止処理開始 🚨');
                try {
                    // 利用可能なシーン名を確認
                    try {
                        const availableScenes = this.scene.scene.manager.keys;
                        console.log('🔍 [StageScene] 利用可能なシーン:', availableScenes);
                    } catch (e) {
                        console.warn('🔍 [StageScene] シーン一覧取得エラー:', e);
                    }
                    
                    // 竹田マップのBGMを止める強化版アプローチ
                    console.log('🔍 [StageScene] 竹田マップBGM停止の強化版アプローチ開始');
                    
                    // 1. 現在のAudioManagerのBGMを強制停止
                    if (this.audioManager && this.audioManager.bgm) {
                        try {
                            this.audioManager.bgm.pause();
                            this.audioManager.bgm.stop();
                            this.audioManager.bgm = null;
                            console.log('✅ [StageScene] 現在のBGM強制停止完了 ✅');
                        } catch (e) {
                            console.warn('⚠️ [StageScene] 現在のBGM停止エラー:', e);
                        }
                    }
                    
                    // 2. AudioManager全体を停止
                    if (this.audioManager) {
                        try {
                            this.audioManager.stopAll();
                            console.log('✅ [StageScene] AudioManager全体停止完了 ✅');
                        } catch (e) {
                            console.warn('⚠️ [StageScene] AudioManager停止エラー:', e);
                        }
                    }
                    
                    // 3. Phaserの音声システム全体を停止
                    if (this.scene.sound) {
                        try {
                            this.scene.sound.stopAll();
                            console.log('✅ [StageScene] Phaser音声システム全体停止完了 ✅');
                        } catch (e) {
                            console.warn('⚠️ [StageScene] Phaser音声システム停止エラー:', e);
                        }
                    }
                    
                    console.log('✅ [StageScene] 竹田マップBGM停止完了（強化版アプローチ） ✅');
                    
                } catch (e) {
                    console.error('💥 [StageScene] 竹田マップBGM停止エラー 💥', e);
                }
                
                console.log('[StageScene] 前のBGM停止完了（全停止処理完了）');
                
                // 新しいBGMを再生
                const result = this.audioManager.playBgm('map');
                console.log('[StageScene] BGM再生結果:', result);
            } else {
                console.warn('[StageScene] BGM設定が見つかりません');
            }
            
            // タッチイベントを設定
            this.setupTouchEvents();
            
        } catch (error) {
            console.error(`Error creating ${this.stageConfig.stageTitle}:`, error);
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

    createFloorMap(floorNumber) {
        console.log(`[StageScene] createFloorMap 開始: フロア${floorNumber}`);
        
        try {
            // 現在のマップを削除
            if (this.mapManager.map) {
                console.log('[StageScene] 既存マップを削除中...');
                this.mapManager.destroy();
                console.log('[StageScene] 既存マップ削除完了');
            }
            
            // 設定からフロア情報を取得
            const floorConfig = this.stageConfig.floors.find(f => f.number === floorNumber);
            if (!floorConfig || !floorConfig.implemented) {
                console.error(`[StageScene] フロア設定が見つからないか、未実装: ${floorNumber}`);
                return;
            }
            
            console.log('[StageScene] フロア設定取得成功:', floorConfig);
            
            // MapManagerに現在のマップキーを設定
            this.mapManager.currentMapKey = floorConfig.mapKey;
            console.log('[StageScene] MapManager.currentMapKey設定完了:', this.mapManager.currentMapKey);
            
            // マップを作成
            console.log('[StageScene] MapManager.createMap呼び出し開始');
            const result = this.mapManager.createMap();
            console.log('[StageScene] MapManager.createMap呼び出し完了, result:', result);
            
            // マップを画面に合わせてスケール調整
            console.log('[StageScene] スケール調整開始');
            this.mapManager.scaleMapToScreen();
            console.log('[StageScene] スケール調整完了');
            
            // UIタイトルを更新
            if (this.uiManager) {
                this.uiManager.updateMapTitle(floorConfig.title);
                console.log('[StageScene] UIタイトル更新完了');
            }
            
            console.log('[StageScene] createFloorMap 完了');
        } catch (error) {
            console.error('[StageScene] createFloorMap エラー:', error);
        }
    }

    // フロア関連の機能は後で実装
    /*
    createFloorButtons() {
        // 設定からフロア情報を動的に取得してボタンを作成
        const buttonY = 50;
        const buttonSpacing = 80;
        
        this.floorButtons = [];
        
        this.stageConfig.floors.forEach((floor, index) => {
            const button = this.add.text(20 + buttonSpacing * index, buttonY, `${floor.number}階`, {
                fontSize: '18px',
                fill: '#ffffff',
                backgroundColor: floor.implemented ? '#333333' : '#666666',
                padding: { x: 10, y: 5 }
            });
            
            if (floor.implemented) {
                button.setInteractive();
                button.on('pointerdown', () => this.changeFloor(floor.number));
            }
            
            this.floorButtons.push(button);
        });
        
        // 現在のフロアのボタンを強調表示
        this.updateFloorButtonHighlight();
    }

    changeFloor(floorNumber) {
        if (floorNumber === this.currentFloor) return;
        
        // 設定からフロア情報を取得
        const floorConfig = this.stageConfig.floors.find(f => f.number === floorNumber);
        if (!floorConfig || !floorConfig.implemented) {
            console.log('このフロアはまだ実装されていません');
            return;
        }
        
        this.currentFloor = floorNumber;
        this.createFloorMap(floorNumber);
        this.updateFloorButtonHighlight();
        
        // SE再生
        if (this.stageConfig.se && this.stageConfig.se.se_floor_change) {
            this.audioManager.playSe('se_floor_change');
        }
    }

    updateFloorButtonHighlight() {
        this.floorButtons.forEach((button, index) => {
            const floor = this.stageConfig.floors[index];
            if (floor.number === this.currentFloor) {
                button.setBackgroundColor('#333333');
            } else {
                button.setBackgroundColor(floor.implemented ? '#666666' : '#999999');
            }
        });
    }
    */

    setupTouchEvents() {
        // タッチイベントを設定
        this.input.on('pointerdown', (pointer) => {
            this.handleTouch(pointer);
        });
        
        // スマホ向けスクロール機能を追加
        this.cameraManager.setupScrollControls();
        this.cameraManager.setupPinchZoom();
    }

    handleTouch(pointer) {
        // タッチ処理（後で実装）
        console.log('タッチ位置:', pointer.x, pointer.y);
        
        // 音声コンテキストのロック解除を確実にする
        try {
            if (this.scene.sound && this.scene.sound.context) {
                const ctx = this.scene.sound.context;
                if (ctx.state === 'suspended') {
                    ctx.resume();
                    console.log('[StageScene] 音声コンテキストを再開しました');
                }
                
                // ロック状態を解除
                if (this.scene.sound.locked) {
                    console.log('[StageScene] 音声ロックを解除中...');
                    // 無音オシレーターでロック解除
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    gain.gain.value = 0.0001;
                    osc.connect(gain).connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.05);
                    console.log('[StageScene] 音声ロック解除完了');
                }
            }
        } catch (e) {
            console.warn('[StageScene] 音声コンテキスト処理エラー:', e);
        }
    }

    update() {
        // マネージャーの更新処理
        this.cameraManager?.update();
    }

    destroy() {
        this.shutdown();
        super.destroy();
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
