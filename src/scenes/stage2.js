
import { MapManager } from '../managers/MapManager.js';
import { PlayerController } from '../controllers/PlayerController.js';
import { TouchControlManager } from '../controllers/TouchControlManager.js';
import { UIManager } from '../managers/UIManager.js';
import { CameraManager } from '../managers/CameraManager.js';
import { InputManager } from '../managers/InputManager.js';
import { CollisionManager } from '../managers/CollisionManager.js';
import { BehaviorManager_Stage2 } from '../data/stage2/BehaviorManager_Stage2.js';
import { DialogSystem } from '../managers/DialogSystem.js';  // 追加
import { Stage2DialogData } from '../data/stage2/dialogs.js';  // 追加
import { AudioManager } from '../managers/AudioManager.js';  // 追加



export class Stage2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Stage2Scene' });
        
        // マネージャーとコントローラーの初期化
        this.mapManager = null;
        this.playerController = null;
        this.touchControlManager = null;
        this.uiManager = null;
        this.cameraManager = null;
        this.inputManager = null;
        this.collisionManager = null;
        this.dialogSystem = null;  // 追加
        // グローバルAudioManagerを使用するため、個別のaudioManagerは不要
    }

    preload() {
        // マップファイルを読み込み
        this.load.tilemapTiledJSON('map', 'assets/maps/test_map5.tmj');

        // BGM読み込み（ファイル名を正しく修正）
        this.load.audio('bgm_pollyanna', 'assets/audio/bgm/stage2/Pollyanna.mp3');
        
        // ファイル読み込みエラーの詳細ログ
        this.load.on('fileerror', (file) => {
            console.error(`Stage 2: ファイル読み込みエラー - ${file.key}: ${file.url}`);
        });
        
        // ファイル読み込み成功のログ
        this.load.on('filecomplete', (key, type) => {
            if (key === 'bgm_pollyanna') {
                console.log(`Stage 2: BGMファイル読み込み成功 - ${key}: ${type}`);
            }
        });

        // マップ用のタイル
        this.load.image('GK_A2_C_autotile', 'assets/maps/tilesets/stage2/GK_A2_JC_autotile.png');
        this.load.image('Preview_RPGMakerVXAce', 'assets/maps/tilesets/stage2/Preview_RPGMakerVXAce.png');
        this.load.image('Preview', 'assets/maps/tilesets/stage2/Preview.png');
        this.load.image('GK_JC_A5_2', 'assets/maps/tilesets/stage2/GK_JC_A5_2.png');
        this.load.image('GK_JC_B_2', 'assets/maps/tilesets/stage2/GK_JC_B_2.png');
        this.load.image('Tilemap', 'assets/maps/tilesets/stage2/Tilemap.png');
        this.load.image('pipo-map001_at-kusa', 'assets/maps/tilesets/stage2/pipo-map001_at-kusa.png');


        // スプライトシート用の共通設定
        const SPRITE_CONFIG = { frameWidth: 32, frameHeight: 32 };

        // スプライトシートとして読み込み
        this.load.spritesheet('enemy1', 'assets/characters/enemies/pipo-charachip005a.png', SPRITE_CONFIG);
        this.load.spritesheet('friend2_6', 'assets/characters/npcs/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('friend2_5', 'assets/characters/npcs/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('friend2_4', 'assets/characters/npcs/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('friend2_3', 'assets/characters/npcs/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('friend2_2', 'assets/characters/npcs/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('friend2_1', 'assets/characters/npcs/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('kuccoro1', 'assets/characters/npcs/pipo-charachip022a.png', SPRITE_CONFIG);
        this.load.spritesheet('kuccoro', 'assets/characters/npcs/pipo-charachip022e.png', SPRITE_CONFIG);
        this.load.spritesheet('kuccoro2', 'assets/characters/npcs/pipo-charachip024d.png', SPRITE_CONFIG);


        // SE読み込み
        this.load.audio('se_touch_stage2', 'assets/audio/se/touch_3.mp3'); 

        // デバッグ用：読み込み完了を確認
        this.load.on('complete', () => {
            console.log('Stage 2: アセット読み込み完了');
        });
    }

    create() {
        try {
            // 音声ファイルの読み込み完了を待ってからAudioManagerを初期化
            if (this.load.isLoading()) {
                this.load.once('complete', () => {
                    this.initializeAudioManager();
                });
            } else {
                this.initializeAudioManager();
            }

            // CollisionManagerを初期化
            this.collisionManager = new CollisionManager(this);
            this.collisionManager.setupCollisionGroups();

            // DialogSystemを初期化（Stage2専用データを渡す）
            this.dialogSystem = new DialogSystem(this, Stage2DialogData);
            this.collisionManager.setDialogSystem(this.dialogSystem); 

            // BehaviorManager_Stage2を初期化
            this.behaviorManager = new BehaviorManager_Stage2(this);

            // マップマネージャーを初期化
            this.mapManager = new MapManager(this);
            this.mapManager.createMap();

            // プレイヤーコントローラーを初期化
            this.playerController = new PlayerController(this);
            this.playerController.createPlayer(100, 100);

            // 物理システムの初期化確認
            if (!this.physics) {
                console.error('Stage 2: 物理システムが初期化されていません');
                return;
            }

            // キーボード入力設定
            this.inputManager = new InputManager();
            this.inputManager.setupKeyboard(this, this.playerController);

            // タッチコントロールマネージャーを初期化
            this.touchControlManager = new TouchControlManager(this, this.playerController.player, 'se_touch_stage2');

            // UI要素を作成
            this.uiManager = new UIManager();
            this.uiManager.createUI(this);

            // カメラ設定
            this.cameraManager = new CameraManager(this);
            this.cameraManager.setupCamera(this, this.mapManager.map, this.playerController.player);

            this.collisionManager.setupAllCollisions(this.playerController.player, this.mapManager);
            
            // シーンシャットダウン時のクリーンアップ登録
            this.events.on('shutdown', this.shutdown, this);
            
        } catch (error) {
            console.error('Stage 2: 初期化エラー:', error);
        }
    }

    /**
     * AudioManagerを初期化してBGMを再生
     */
    initializeAudioManager() {
        try {
            this.audioManager = new AudioManager(this);
            
            // Stage2 BGM起動ロジック（エラーハンドリング強化）
            const startStageBgm = () => {
                try {
                    console.log('Stage 2: BGM再生開始');
                    this.audioManager.playBgm('bgm_pollyanna', 0.5);
                    console.log('Stage 2: BGM再生成功');
                } catch (error) {
                    console.error('Stage 2: BGM再生エラー:', error);
                    // フォールバック: 少し遅延して再試行
                    this.time.delayedCall(1000, () => {
                        try {
                            console.log('Stage 2: BGM再試行');
                            this.audioManager.playBgm('bgm_pollyanna', 0.5);
                        } catch (retryError) {
                            console.error('Stage 2: BGM再試行失敗:', retryError);
                        }
                    });
                }
            };
            
            try {
                if (this.sound && this.sound.locked) {
                    console.log('Stage 2: 音声ロック中、解除待機');
                    this.sound.once('unlocked', () => { 
                        console.log('Stage 2: 音声ロック解除');
                        startStageBgm(); 
                    });
                    this.input && this.input.once && this.input.once('pointerdown', () => {
                        try { 
                            if (this.sound.context && this.sound.context.state !== 'running') {
                                this.sound.context.resume(); 
                            }
                        } catch(error) {
                            console.warn('Stage 2: 音声コンテキスト復帰エラー:', error);
                        }
                        startStageBgm();
                    });
                    // PC環境でも最初のキー操作で開始
                    try { 
                        this.input && this.input.keyboard && this.input.keyboard.once('keydown', startStageBgm); 
                    } catch(error) {
                        console.warn('Stage 2: キーボードイベント設定エラー:', error);
                    }
                } else {
                    console.log('Stage 2: 音声ロックなし、即座にBGM開始');
                    startStageBgm();
                }
            } catch(error) { 
                console.error('Stage 2: 音声初期化エラー:', error);
                startStageBgm(); 
            }
            
        } catch (error) {
            console.error('Stage 2: AudioManager初期化エラー:', error);
        }
    }

    shutdown() {
        try { 
            if (this.audioManager && this.audioManager.stopAll) this.audioManager.stopAll(); 
        } catch (error) { 
            console.warn('Stage 2: AudioManager停止エラー:', error);
        }
        try { 
            if (this.audioManager && this.audioManager.bgm && this.audioManager.bgm.destroy) { 
                this.audioManager.bgm.destroy(); 
                this.audioManager.bgm = null; 
            } 
        } catch (error) { 
            console.warn('Stage 2: BGM破棄エラー:', error);
        }
        try { 
            if (this.load && this.load.reset) this.load.reset(); 
        } catch (error) { 
            console.warn('Stage 2: Loadリセットエラー:', error);
        }
        try { 
            if (this.load && this.load.removeAllListeners) this.load.removeAllListeners(); 
        } catch (error) { 
            console.warn('Stage 2: Loadリスナー削除エラー:', error);
        }
        try { 
            if (this.sound) this.sound.stopAll(); 
        } catch (error) { 
            console.warn('Stage 2: Sound停止エラー:', error);
        }
    }


    update() {
        // フレームごとに更新が必要な要素のみを更新
        this.updateCounter++;
        
        // 30FPSに制限（60FPSの半分）
        if (this.updateCounter % 2 === 0) {
            // ダイアログが表示中はプレイヤーの動きを止める
            if (this.dialogSystem && this.dialogSystem.isDialogActive()) {
                // 統一された方法で停止
                this.playerController.player.setVelocityX(0);
                this.playerController.player.setVelocityY(0);
                return;
            }
        
            // プレイヤーの更新処理
            if (this.playerController && this.playerController.player) {
                this.playerController.update();
                
                // デバッグ: プレイヤーの状態を確認（120フレームごと）
                if (this.updateCounter % 120 === 0) {
                    const pos = this.playerController.getPosition();
                    console.log('Stage 2: プレイヤー位置更新 - X:', pos.x, 'Y:', pos.y);
                }
            } else {
                console.warn('Stage 2: プレイヤーコントローラーが初期化されていません');
            }
        
            // UI更新
            if (this.uiManager && this.playerController && this.playerController.player) {
                this.uiManager.updatePlayerPosition(this.playerController.player);
            }
        }
    }

    resize(gameSize) {
        const { width, height } = gameSize;
        
        // カメラサイズを更新
        this.cameras.resize(width, height);
    }
    
    // シーン破棄時のクリーンアップ
    destroy() {
        this.shutdown();
        super.destroy();
    }
}