// src/scenes/StageScene.js
import { MapManager } from '../managers/MapManager.js';
import { UIManager } from '../managers/UIManager.js';
import { CameraManager } from '../managers/CameraManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { CollisionManager } from '../managers/CollisionManager.js';
import { PlayerController } from '../controllers/PlayerController.js';
import { TouchControlManager } from '../controllers/TouchControlManager.js';
import { ConversationTrigger } from '../managers/ConversationTrigger.js';
import { StageConfig } from '../config/StageConfig.js';
import { ConversationScene } from '../managers/ConversationScene.js';
import { DynamicConversationScene } from '../scenes/DynamicConversationScene.js';

export class StageScene extends Phaser.Scene {
    constructor(config) {
        super({ key: config.stageKey });
        
        // 設定を保存
        this.stageConfig = config.stageConfig;
        this.stageKey = config.stageKey;
        
        // マネージャーの初期化
        this.mapManager = null;
        this.uiManager = null;
        this.cameraManager = null;
        this.audioManager = null;
        this.conversationTrigger = null;
        
        // フロア管理
        this.currentFloor = 1;
        this.restoreState = false;
        this.targetFloor = 1;
        this.playerPosition = null;
        this.mapKey = null;
        
        // 会話中フラグ（マップシーンと同様）
        this._isInConversation = false;
    }
    
    init(data) {
        // 状態復元の設定を受け取る
        if (data && data.restoreState) {
            this.restoreState = true;
            this.targetFloor = data.targetFloor || 1;
            this.playerPosition = data.playerPosition || null;
            this.mapKey = data.mapKey || null;
            console.log('[StageScene] 状態復元設定を受け取り:', {
                restoreState: this.restoreState,
                targetFloor: this.targetFloor,
                playerPosition: this.playerPosition,
                mapKey: this.mapKey
            });
        } else {
            // 状態復元設定がない場合
            this.restoreState = false;
            this.targetFloor = 1;
            this.playerPosition = null;
            this.mapKey = null;
            console.log('[StageScene] 状態復元設定なし（通常起動）');
        }
        
        // nextFloorNumberも受け取る
        if (data && data.nextFloorNumber) {
            this.nextFloorNumber = data.nextFloorNumber;
            console.log(`[StageScene] nextFloorNumber を受け取り: ${this.nextFloorNumber}`);
        }
        
        // fromFloorNumberも受け取る
        if (data && data.fromFloorNumber) {
            this.fromFloorNumber = data.fromFloorNumber;
            console.log(`[StageScene] fromFloorNumber を受け取り: ${this.fromFloorNumber}`);
        }
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
        console.log('[StageScene] デバッグ: nextFloorNumber =', this.nextFloorNumber);
        console.log('[StageScene] デバッグ: restoreState =', this.restoreState);
        
        try {
            // 基本的なマップ表示
            this.mapManager = new MapManager(this);
            
            // 基本的なマップ表示を直接実行
            console.log('[StageScene] 基本的なマップ表示開始');
            
            // 設定ファイルから動的にマップキーを取得
            // フロア変更から来た場合は、指定されたフロアから開始
            // 会話終了後の状態復元の場合は、保存された状態から開始
            let targetFloor;
            console.log('[StageScene] デバッグ: フロア判定開始');
            console.log('[StageScene] デバッグ: this.restoreState =', this.restoreState);
            console.log('[StageScene] デバッグ: this.nextFloorNumber =', this.nextFloorNumber);
            
            if (this.restoreState) {
                // 会話終了後の状態復元
                targetFloor = this.stageConfig.floors.find(f => f.number === this.targetFloor);
                this.currentFloor = this.targetFloor;
                console.log(`[StageScene] 会話終了後の状態復元: フロア${this.currentFloor}から開始`);
            } else if (this.nextFloorNumber) {
                // フロア変更から来た場合
                targetFloor = this.stageConfig.floors.find(f => f.number === this.nextFloorNumber);
                this.currentFloor = this.nextFloorNumber;
                this.nextFloorNumber = null; // 使用後はクリア
                console.log(`[StageScene] フロア変更: フロア${this.currentFloor}から開始`);
            } else {
                // 通常の開始
                targetFloor = this.stageConfig.floors[0];
                this.currentFloor = 1;
                console.log('[StageScene] 通常開始: フロア1から開始');
            }
            
            this.mapManager.currentMapKey = targetFloor.mapKey;
            
            // 現在のフロア設定をstageConfigに設定（NPC会話データ取得のため）
            this.stageConfig.currentFloor = targetFloor;
            console.log(`[StageScene] 現在のフロア設定を更新: ${targetFloor.number}階`);
            
            // デバッグ: StageConfigの内容を確認
            console.log('[StageScene] 現在のstageConfig:', this.stageConfig);
            console.log('[StageScene] 現在のフロア設定:', targetFloor);
            console.log('[StageScene] フロアのNPC設定:', targetFloor.npcs);
            
            // 衝突判定マネージャーを先に初期化
            this.collisionManager = new CollisionManager(this);
            this.collisionManager.setupCollisionGroups();
            console.log('[StageScene] CollisionManager初期化完了');
            
            // マップ作成（NPCオブジェクト作成）
            this.mapManager.createMap();
            console.log('[StageScene] 基本的なマップ表示完了');
            
            // プレイヤー作成（フロアごとの開始位置を使用、または保存された位置を復元）
            this.playerController = new PlayerController(this);
            let playerStartX, playerStartY;
            
            if (this.restoreState && this.playerPosition) {
                // 会話終了後の位置復元
                playerStartX = this.playerPosition.x;
                playerStartY = this.playerPosition.y;
                console.log(`[StageScene] 保存された位置から復元: (${playerStartX}, ${playerStartY})`);
            } else if (this.fromFloorNumber && this.fromFloorNumber !== targetFloor.number) {
                // 他のフロアから移動してきた場合
                const fromFloorKey = `fromFloor${this.fromFloorNumber}Start`;
                const fromFloorX = targetFloor[`${fromFloorKey}X`];
                const fromFloorY = targetFloor[`${fromFloorKey}Y`];
                
                console.log(`[StageScene] デバッグ: 移動元フロア${this.fromFloorNumber}からフロア${targetFloor.number}への移動`);
                console.log(`[StageScene] デバッグ: fromFloorKey = ${fromFloorKey}`);
                console.log(`[StageScene] デバッグ: fromFloorX = ${fromFloorX}, fromFloorY = ${fromFloorY}`);
                console.log('[StageScene] デバッグ: targetFloor設定 =', targetFloor);
                
                if (fromFloorX !== undefined && fromFloorY !== undefined) {
                    // 移動元フロア専用の開始位置がある場合
                    playerStartX = fromFloorX;
                    playerStartY = fromFloorY;
                    console.log(`[StageScene] フロア${this.fromFloorNumber}からフロア${targetFloor.number}に移動してきた位置: (${playerStartX}, ${playerStartY})`);
                } else {
                    // 移動元フロア専用の開始位置がない場合はデフォルト位置
                    playerStartX = targetFloor.playerStartX || 100;
                    playerStartY = targetFloor.playerStartY || 100;
                    console.log(`[StageScene] フロア${this.fromFloorNumber}からフロア${targetFloor.number}に移動（デフォルト位置）: (${playerStartX}, ${playerStartY})`);
                }
            } else {
                // フロアのデフォルト位置
                playerStartX = targetFloor.playerStartX || 100;
                playerStartY = targetFloor.playerStartY || 100;
                console.log(`[StageScene] フロアのデフォルト位置: (${playerStartX}, ${playerStartY})`);
            }
            
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
            
            // DialogSystemを初期化（竹田高校用）
            if (this.stageKey === 'taketa_highschool') {
                console.log('[StageScene] 竹田高校用DialogSystem初期化開始');
                import('../managers/DialogSystem.js').then(({ DialogSystem }) => {
                    console.log('[StageScene] DialogSystemクラス読み込み完了');
                    import('../data/taketa/dialogs.js').then(({ TaketaDialogData }) => {
                        console.log('[StageScene] TaketaDialogData読み込み完了:', TaketaDialogData);
                        this.dialogSystem = new DialogSystem(this, TaketaDialogData);
                        // 使用済み会話を管理するSetを初期化
                        this.usedConversations = new Set();
                        console.log('[StageScene] DialogSystem初期化完了（竹田高校用）');
                        console.log('[StageScene] 使用済み会話管理開始');
                        console.log('[StageScene] this.dialogSystem:', this.dialogSystem);
                        console.log('[StageScene] this.usedConversations:', this.usedConversations);
                    }).catch(error => {
                        console.error('[StageScene] TaketaDialogData読み込みエラー:', error);
                    });
                }).catch(error => {
                    console.error('[StageScene] DialogSystemクラス読み込みエラー:', error);
                });
            } else {
                console.log('[StageScene] 竹田高校以外のため、DialogSystem初期化スキップ:', this.stageKey);
            }
            
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
            
            // 会話トリガーを初期化
            this.conversationTrigger = new ConversationTrigger(this);
            console.log('[StageScene] ConversationTrigger初期化完了');
            
            // ConversationSceneを登録
            try {
                if (!this.scene.manager.keys || !this.scene.manager.keys.ConversationScene) {
                    this.scene.add('ConversationScene', ConversationScene);
                    console.log('[StageScene] ConversationScene登録完了');
                }
            } catch (e) {
                console.warn('[StageScene] ConversationScene登録エラー:', e);
            }
            
            // DynamicConversationSceneを登録
            try {
                if (!this.scene.manager.keys || !this.scene.manager.keys.DynamicConversationScene) {
                    this.scene.add('DynamicConversationScene', DynamicConversationScene);
                    console.log('[StageScene] DynamicConversationScene登録完了');
                }
            } catch (e) {
                console.warn('[StageScene] DynamicConversationScene登録エラー:', e);
            }
            
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
            // HTMLAudioのBGM停止
            if (this._htmlBgm) {
                this._htmlBgm.pause();
                this._htmlBgm.currentTime = 0;
                this._htmlBgm = null;
                console.log('[StageScene] HTMLAudio BGM停止完了');
            }
            
            // 音声システムのクリーンアップ
            if (this.audioManager) {
                this.audioManager.stopAll();
                console.log('[StageScene] AudioManager停止完了');
            }
            
            // 会話トリガーのクリーンアップ
            if (this.conversationTrigger) {
                this.conversationTrigger.destroy();
                this.conversationTrigger = null;
                console.log('[StageScene] ConversationTrigger停止完了');
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
        console.log(`[StageScene] changeFloor(${floorNumber}) メソッド開始`);
        console.log(`[StageScene] 現在のフロア: ${this.currentFloor}, 移動先フロア: ${floorNumber}`);
        
        if (floorNumber === this.currentFloor) {
            console.log(`[StageScene] 同じフロアなので移動しない: ${floorNumber}`);
            return;
        }
        
        try {
            // 設定からフロア情報を取得
            const floorConfig = this.stageConfig.floors.find(f => f.number === floorNumber);
            if (!floorConfig || !floorConfig.implemented) {
                console.error(`[StageScene] フロア設定が見つからないか、未実装: ${floorNumber}`);
                return;
            }
            
            // 状態復元の設定をクリア（moveオブジェクトでの移動時）
            this.restoreState = false;
            this.targetFloor = 1;
            this.playerPosition = null;
            this.mapKey = null;
            console.log('[StageScene] 状態復元設定をクリアしました（フロア変更時）');
            
            // フロア番号を保存（Scene再起動時に使用）
            this.nextFloorNumber = floorNumber;
            
            // シーン設定もクリア（確実にするため）
            if (this.scene.settings) {
                this.scene.settings.restoreState = false;
                this.scene.settings.targetFloor = null;
                this.scene.settings.playerPosition = null;
                this.scene.settings.mapKey = null;
            }
            
            console.log(`[StageScene] フロア${floorNumber}への移動を開始（状態復元設定クリア済み）`);
            console.log(`[StageScene] デバッグ: nextFloorNumber = ${this.nextFloorNumber}`);
            
            // 元のシーンキーで新しいシーンを開始
            console.log(`[StageScene] シーン再開始: ${this.scene.key} に nextFloorNumber: ${floorNumber} を渡す`);
            
            // 現在のシーンを停止
            this.scene.stop();
            
            // 元のシーンキーで新しいシーンを開始
            this.scene.start(this.scene.key, {
                nextFloorNumber: floorNumber,
                fromFloorNumber: this.currentFloor  // 移動元フロアを追加
            });
            
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
            
            // 現在の階のBGM設定を取得
            const currentFloorConfig = this.stageConfig.floors.find(f => f.number === this.currentFloor);
            if (currentFloorConfig && currentFloorConfig.bgm && currentFloorConfig.bgm.map) {
                // 階固有のBGMを再生
                const bgmPath = currentFloorConfig.bgm.map;
                console.log(`[StageScene] 階${this.currentFloor}のBGM再生: ${bgmPath}`);
                
                // HTMLAudioを使用してBGMを再生
                this._htmlBgm = new Audio(bgmPath);
                this._htmlBgm.loop = true;
                this._htmlBgm.volume = 0.3;
                this._htmlBgm.play().catch(error => {
                    console.error(`[StageScene] BGM再生エラー: ${bgmPath}`, error);
                    // フォールバック: デフォルトBGMを再生
                    this.audioManager.playBgm('map');
                });
            } else {
                // フォールバック: デフォルトBGMを再生
                this.audioManager.playBgm('map');
                console.log('[StageScene] デフォルトBGM再生開始');
            }
        } catch (error) {
            console.error('[StageScene] BGM再生エラー:', error);
            // エラー時もフォールバック
            this.audioManager.playBgm('map');
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

    // 会話開始時のフラグ設定
    setConversationActive(active) {
        this._isInConversation = active;
        console.log(`[StageScene] 会話中フラグを${active ? 'true' : 'false'}に設定`);
    }

    // 会話中かどうかの確認
    isConversationActive() {
        return this._isInConversation;
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
