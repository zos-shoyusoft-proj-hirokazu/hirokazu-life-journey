
import { MapManager } from '../managers/MapManager.js';
import { PlayerController } from '../controllers/PlayerController.js';
import { TouchControlManager } from '../controllers/TouchControlManager.js';
import { UIManager } from '../managers/UIManager.js';
import { CameraManager } from '../managers/CameraManager.js';
import { InputManager } from '../managers/InputManager.js';
import { CollisionManager } from '../managers/CollisionManager.js';
import { BehaviorManager_Stage2 } from '../data/stage2/BehaviorManager_Stage2.js';
import { DialogSystem } from '../managers/DialogSystem.js';
import { Stage2DialogData } from '../data/stage2/dialogs.js';
import { ConversationTrigger } from '../managers/ConversationTrigger.js';
import { ConversationScene } from '../managers/ConversationScene.js';
import { AudioManager } from '../managers/AudioManager.js';

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
        this.behaviorManager = null;
        this.dialogSystem = null;
        this.audioManager = null;
        
        // 新しい会話システム
        this.conversationTrigger = null;
        
        // パフォーマンス最適化用のフレームカウンター
        this.updateCounter = 0;
    }

    preload() {
        // マップファイルを読み込み
        this.load.tilemapTiledJSON('map', 'assets/maps/test_map5.tmj');

        // BGM読み込み（ファイル名を正しく修正）
        this.load.audio('bgm_Pollyanna', 'assets/audio/bgm/stage2/Pollyanna.mp3');
        
        // ファイル読み込みエラーの詳細ログ
        this.load.on('fileerror', (file) => {
            console.error(`Stage 2: ファイル読み込みエラー - ${file.key}: ${file.url}`);
        });
        
        // ファイル読み込み成功のログ
        this.load.on('filecomplete', (key, type) => {
            if (key === 'bgm_Pollyanna') {
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
            // 音声ファイルの読み込み完了を待ってからAudioManagerを初期化（重複実行防止）
            let audioManagerInitialized = false;
            if (this.load.isLoading()) {
                this.load.once('complete', () => {
                    if (!audioManagerInitialized) {
                        audioManagerInitialized = true;
                        this.initializeAudioManager();
                    }
                });
            } else {
                if (!audioManagerInitialized) {
                    audioManagerInitialized = true;
                    this.initializeAudioManager();
                }
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

            // デバッグ: 画面サイズとマップサイズを確認
            console.log('Stage 2: 画面サイズ - 幅:', this.scale.width, '高さ:', this.scale.height);
            console.log('Stage 2: マップサイズ - 幅:', this.mapManager.map.widthInPixels, '高さ:', this.mapManager.map.heightInPixels);
            console.log('Stage 2: プレイヤー位置:', this.playerController.getPosition());
            console.log('Stage 2: カメラ位置 - X:', this.cameras.main.scrollX, 'Y:', this.cameras.main.scrollY);
            console.log('Stage 2: カメラズーム:', this.cameras.main.zoom);

            this.collisionManager.setupAllCollisions(this.playerController.player, this.mapManager);
            
            // デバッグ: 初期化完了を確認
            console.log('Stage 2: 初期化完了 - プレイヤー位置:', this.playerController.getPosition());
            console.log('Stage 2: 物理システム状態:', !!this.physics);
            console.log('Stage 2: 入力システム状態:', !!this.input);

            // 新しい会話システムを初期化
            this.conversationTrigger = new ConversationTrigger(this);
            
            // ConversationSceneを重複登録しない
            try {
                const exists = this.scene.manager && this.scene.manager.keys && this.scene.manager.keys['ConversationScene'];
                if (!exists) {
                    this.scene.add('ConversationScene', ConversationScene);
                }
            } catch (e) {
                // ignore
            }

            // 会話イベントを設定
            this.setupConversationEvents();
            
            // シーンシャットダウン時のクリーンアップ登録
            this.events.on('shutdown', this.shutdown, this);
            
        } catch (error) {
            console.error('Stage 2: 初期化エラー:', error);
        }
    }

    // AudioManagerの初期化とBGM再生を分離
    initializeAudioManager() {
        try {
            // AudioManagerを初期化
            this.audioManager = new AudioManager(this);
            
            // Stage2 BGM起動ロジック
            const startStageBgm = () => {
                // 会話中はBGM再開をスキップ（イベントBGMが切れるのを防ぐ）
                if (this.scene && this.scene.manager && this.scene.manager.isActive('ConversationScene')) {
                    console.log('Stage 2: 会話中、BGM再開をスキップ');
                    return;
                }
                
                try {
                    console.log('Stage 2: BGM再生開始');
                    // 正しいキーでBGMを再生
                    const result = this.audioManager.playBgm('bgm_Pollyanna', 0.5);
                    if (result) {
                        console.log('Stage 2: BGM再生成功');
                    } else {
                        console.warn('Stage 2: BGM再生失敗');
                        // エラーが発生してもゲームを続行
                        console.log('Stage 2: BGM再生失敗しましたが、ゲームは続行します');
                    }
                } catch (error) {
                    console.error('Stage 2: BGM再生エラー:', error);
                    // エラーが発生してもゲームを続行
                    console.log('Stage 2: BGM再生エラーが発生しましたが、ゲームは続行します');
                }
            };

            // 音声システムのロック状態をチェック
            if (this.sound && this.sound.locked) {
                // ブラウザがロック中：解除イベント or 最初の操作で開始
                this.sound.once('unlocked', () => { 
                    console.log('Stage 2: 音声システムアンロック');
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
                // ロックされていなければ即時再生
                console.log('Stage 2: 音声システムは既にアンロック済み');
                startStageBgm();
            }
        } catch (error) {
            console.error('Stage 2: AudioManager初期化エラー:', error);
        }
    }

    /**
     * 会話イベントを設定します。
     */
    setupConversationEvents() {
        // 1. 特定のNPCをクリックした時にギャルゲ風会話を開始
        this.setupNpcConversations();
        
        // 2. 特定のエリアに入った時にイベント発動
        this.setupAreaTriggers();
        
        // 3. 特定の座標に近づいた時にイベント発動
        this.setupProximityTriggers();
    }

    // NPCとの会話設定
    setupNpcConversations() {
        // Stage2用のNPC会話設定
        // 必要に応じてNPCスプライトを取得して会話を設定
        console.log('Stage 2: NPC会話設定完了');
    }

    // エリアトリガーの設定
    setupAreaTriggers() {
        // Stage2用のエリアトリガー設定
        console.log('Stage 2: エリアトリガー設定完了');
    }

    // 近接トリガーの設定
    setupProximityTriggers() {
        // Stage2用の近接トリガー設定
        console.log('Stage 2: 近接トリガー設定完了');
    }

    shutdown() {
        // AudioManagerの完全なクリーンアップ
        if (this.audioManager) {
            try {
                this.audioManager.stopAll();
                this.audioManager.destroy();
            } catch (e) {
                console.warn('Stage 2: AudioManager破棄エラー:', e);
            } finally {
                this.audioManager = null;
            }
        }
        
        // 音声コンテキストの完全なリセット
        try {
            if (this.sound && this.sound.context) {
                this.sound.context.close();
                this.sound.context = null;
            }
        } catch (e) {
            console.warn('Stage 2: 音声コンテキストリセットエラー:', e);
        }
        
        // グローバルな音声システムもクリーンアップ
        if (this.sound) {
            try {
                this.sound.stopAll();
                // 音声コンテキストの状態をリセット
                if (this.sound.context) {
                    this.sound.context.state = 'suspended';
                }
            } catch (e) {
                console.warn('Stage 2: 音声システムクリーンアップエラー:', e);
            }
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
        
        if (this.inputManager) {
            this.inputManager.destroy();
            this.inputManager = null;
        }
        
        if (this.collisionManager) {
            this.collisionManager.destroy();
            this.collisionManager = null;
        }
        
        if (this.behaviorManager) {
            this.behaviorManager.destroy();
            this.behaviorManager = null;
        }
        
        if (this.dialogSystem) {
            this.dialogSystem.destroy();
            this.dialogSystem = null;
        }
        
        if (this.conversationTrigger) {
            this.conversationTrigger.destroy();
            this.conversationTrigger = null;
        }
        
        // シーンシャットダウン時のクリーンアップ登録を削除
        this.events.off('shutdown', this.shutdown, this);
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