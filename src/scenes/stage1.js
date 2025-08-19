import { MapManager } from '../managers/MapManager.js';
import { PlayerController } from '../controllers/PlayerController.js';
import { TouchControlManager } from '../controllers/TouchControlManager.js';
import { UIManager } from '../managers/UIManager.js';
import { CameraManager } from '../managers/CameraManager.js';
import { InputManager } from '../managers/InputManager.js';
import { CollisionManager } from '../managers/CollisionManager.js';
import { BehaviorManager_Stage1 } from '../data/stage1/BehaviorManager_Stage1.js'; 
import { DialogSystem } from '../managers/DialogSystem.js';
import { Stage1DialogData } from '../data/stage1/dialogs.js';
import { ConversationTrigger } from '../managers/ConversationTrigger.js';
import { ConversationScene } from '../managers/ConversationScene.js'; 
import { AudioManager } from '../managers/AudioManager.js';

export class Stage1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Stage1Scene' });
        
        // マネージャーとコントローラーの初期化
        this.mapManager = null;
        this.playerController = null;
        this.touchControlManager = null;
        this.uiManager = null;
        this.cameraManager = null;
        this.inputManager = null;
        this.collisionManager = null;
        this.behaviorManager = null; // 追加：BehaviorManagerの変数宣言
        this.dialogSystem = null;
        this.audioManager = null;
        
        // 新しい会話システム
        this.conversationTrigger = null;
        
        // パフォーマンス最適化用のフレームカウンター
        this.updateCounter = 0;
    }

    preload() {
        // マップファイルを読み込み
        this.load.tilemapTiledJSON('map', 'assets/maps/stage1.tmj');
        //マップ読み込み
        this.load.image('[A]Grass1_pipo', 'assets/maps/tilesets/stage1/[A]Grass1_pipo.png');
        this.load.image('Tilemap', 'assets/maps/tilesets/stage1/Tilemap.png');
        
        //BGM読み込み - キーを統一
        this.load.audio('bgm_nightbarth', 'assets/audio/bgm/nightbarth.mp3');
        this.load.audio('bgm_demo_chinpo', 'assets/audio/bgm/stage1/megarovania.mp3');
        
        // スプライトシート用の共通設定
        const SPRITE_CONFIG = { frameWidth: 32, frameHeight: 32 };

        // スプライトシートとして読み込み
        this.load.spritesheet('ojyama1', 'assets/characters/enemies/pipo-charachip005a.png', SPRITE_CONFIG);
        this.load.spritesheet('hanni', 'assets/characters/npcs/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('kuccoro', 'assets/characters/npcs/pipo-charachip022e.png', SPRITE_CONFIG);
        this.load.spritesheet('kuccoro1', 'assets/characters/npcs/pipo-charachip022a.png', SPRITE_CONFIG);
        this.load.spritesheet('kuccoro2', 'assets/characters/npcs/pipo-charachip022e.png', SPRITE_CONFIG);
        this.load.spritesheet('kuccoro3', 'assets/characters/npcs/pipo-charachip026.png', SPRITE_CONFIG);
        this.load.spritesheet('kuccoro4', 'assets/characters/npcs/pipo-charachip024d.png', SPRITE_CONFIG);
        
        // エラーで見つからない画像の代替読み込み
        this.load.spritesheet('enemy1', 'assets/characters/enemies/pipo-charachip005a.png', SPRITE_CONFIG);
        this.load.spritesheet('enemy2', 'assets/characters/enemies/pipo-charachip005a.png', SPRITE_CONFIG);
        this.load.spritesheet('friend1', 'assets/characters/npcs/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('friend2', 'assets/characters/npcs/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('kuccoro', 'assets/characters/npcs/pipo-charachip022a.png', SPRITE_CONFIG);

        // エラーハンドリング
        this.load.on('fileerror', () => {
            // ファイル読み込みエラー処理
        });
                
        // デバッグ用：読み込み完了を確認
        this.load.on('complete', () => {
            console.log('Stage 1: アセット読み込み完了');
        });
        
        // 新しい会話システム用の画像
        this.load.image('hirokazu_a', 'assets/characters/portraits/hirokazu_a.png');
        this.load.image('hirokazu_b', 'assets/characters/portraits/hirokazu_b.png');
        this.load.image('hirokazu_c', 'assets/characters/portraits/hirokazu_c.png');
        this.load.image('hirokazu_d', 'assets/characters/portraits/hirokazu_d.png');
        this.load.image('hirokazu_e', 'assets/characters/portraits/hirokazu_e.png');
        this.load.image('hirokazu_f', 'assets/characters/portraits/hirokazu_f.png');
        this.load.image('daichi_a', 'assets/characters/portraits/daichi_a.png');
        this.load.image('naoki_a', 'assets/characters/portraits/naoki_a.png');
        
        // 会話システム用の背景とUI要素
        this.load.image('test_1', 'assets/backgrounds/background_test.png');
        // this.load.image('textbox', 'assets/ui/textbox.png');
        // this.load.image('namebox', 'assets/ui/namebox.png');

        // SE読み込み
        this.load.audio('se_touch_stage1', 'assets/audio/se/touch_1.mp3'); 
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

            // DialogSystemを初期化（Stage1専用データを渡す）
            this.dialogSystem = new DialogSystem(this, Stage1DialogData);
            this.collisionManager.setDialogSystem(this.dialogSystem); 

            // 追加：BehaviorManager_Stage1を初期化
            this.behaviorManager = new BehaviorManager_Stage1(this);

            // マップマネージャーを初期化
            this.mapManager = new MapManager(this);
            this.mapManager.createMap();
            
            // プレイヤーコントローラーを初期化
            this.playerController = new PlayerController(this);
            this.playerController.createPlayer(100, 100);

            // 物理システムの初期化確認
            if (!this.physics) {
                console.error('Stage 1: 物理システムが初期化されていません');
                return;
            }

            // キーボード入力設定
            this.inputManager = new InputManager();
            this.inputManager.setupKeyboard(this, this.playerController);

            // タッチコントロールマネージャーを初期化
            this.touchControlManager = new TouchControlManager(this, this.playerController.player, 'se_touch_stage1');

            // UI要素を作成
            this.uiManager = new UIManager();
            this.uiManager.createUI(this);

            // カメラ設定
            this.cameraManager = new CameraManager(this);
            this.cameraManager.setupCamera(this, this.mapManager.map, this.playerController.player);

            // 当たり判定設定
            this.collisionManager.setupAllCollisions(this.playerController.player, this.mapManager);

            // デバッグ: 初期化完了を確認
            console.log('Stage 1: 初期化完了 - プレイヤー位置:', this.playerController.getPosition());
            console.log('Stage 1: 物理システム状態:', !!this.physics);
            console.log('Stage 1: 入力システム状態:', !!this.input);

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
            console.error('Stage 1: create() エラー:', error);
        }
    }

    // AudioManagerの初期化とBGM再生を分離
    initializeAudioManager() {
        try {
            // AudioManagerを初期化
            this.audioManager = new AudioManager(this);
            
            // Stage1 BGM起動ロジック
            const startStageBgm = () => {
                // 会話中はBGM再開をスキップ（イベントBGMが切れるのを防ぐ）
                if (this.scene && this.scene.manager && this.scene.manager.isActive('ConversationScene')) {
                    console.log('Stage 1: 会話中、BGM再開をスキップ');
                    return;
                }
                
                try {
                    console.log('Stage 1: BGM再生開始');
                    // 正しいキーでBGMを再生
                    const result = this.audioManager.playBgm('bgm_nightbarth');
                    if (result) {
                        console.log('Stage 1: BGM再生成功');
                    } else {
                        console.warn('Stage 1: BGM再生失敗');
                        // エラーが発生してもゲームを続行
                        console.log('Stage 1: BGM再生失敗しましたが、ゲームは続行します');
                    }
                } catch (error) {
                    console.error('Stage 1: BGM再生エラー:', error);
                    // エラーが発生してもゲームを続行
                    console.log('Stage 1: BGM再生エラーが発生しましたが、ゲームは続行します');
                }
            };

            // 音声システムのロック状態をチェック
            if (this.sound && this.sound.locked) {
                // ブラウザがロック中：解除イベント or 最初の操作で開始
                this.sound.once('unlocked', () => { 
                    console.log('Stage 1: 音声システムアンロック');
                    startStageBgm(); 
                });
                
                this.input && this.input.once && this.input.once('pointerdown', () => {
                    try { 
                        if (this.sound.context && this.sound.context.state !== 'running') {
                            this.sound.context.resume(); 
                        }
                    } catch(error) {
                        console.warn('Stage 1: 音声コンテキスト復帰エラー:', error);
                    }
                    startStageBgm();
                });
                
                // PC環境でも最初のキー操作で開始
                try { 
                    this.input && this.input.keyboard && this.input.keyboard.once('keydown', startStageBgm); 
                } catch(error) {
                    console.warn('Stage 1: キーボードイベント設定エラー:', error);
                }
            } else {
                // ロックされていなければ即時再生
                console.log('Stage 1: 音声システムは既にアンロック済み');
                startStageBgm();
            }
        } catch (error) {
            console.error('Stage 1: AudioManager初期化エラー:', error);
        }
    }

    shutdown() {
        // AudioManagerの完全なクリーンアップ（強化版）
        if (this.audioManager) {
            try {
                this.audioManager.stopAll();
                this.audioManager.destroy();
            } catch (e) {
                console.warn('Stage 1: AudioManager破棄エラー:', e);
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
            console.warn('Stage 1: 音声コンテキストリセットエラー:', e);
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
                console.warn('Stage 1: 音声システムクリーンアップエラー:', e);
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

    destroy() {
        this.shutdown();
        super.destroy();
    }

    // NPCスプライトを手動で作成
    // createNpcSprites() {
    //     // MapManagerにNPCスプライトを追加
    //     if (this.mapManager && this.mapManager.npcSprites) {
    //         // hanniスプライトを作成
    //         const hanniSprite = this.add.sprite(200, 150, 'hanni');
    //         hanniSprite.setInteractive();
    //         this.mapManager.npcSprites.set('hanni', hanniSprite);
            
    //         // kuccoroスプライトを作成
    //         const kuccoroSprite = this.add.sprite(300, 200, 'kuccoro');
    //         kuccoroSprite.setInteractive();
    //         this.mapManager.npcSprites.set('kuccoro', kuccoroSprite);
            
    //         console.log('Stage 1: NPCスプライトを作成しました');
    //     }
    // }

    // 会話イベントの設定
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
        // 既存のNPCに新しい会話データを設定
        // 例：hanniというNPCにギャルゲ風会話を設定
        const hanniSprite = this.mapManager.getNpcSprite('hanni');
        if (hanniSprite) {
            this.conversationTrigger.setupNpcClickHandler(hanniSprite, 'demo_chinpo');
        }
        
        // // 他のNPCにも会話を設定
        // const kuccoroSprite = this.mapManager.getNpcSprite('kuccoro');
        // if (kuccoroSprite) {
        //     this.conversationTrigger.setupNpcClickHandler(kuccoroSprite, 'daichi_scene');
        // }
    }

    // エリアトリガーの設定
    setupAreaTriggers() {
        // 例：特定の場所に入ると会話イベントが発生
        this.conversationTrigger.setupAreaTrigger(
            200, 200,    // x, y座標
            64, 64,      // width, height
            'after_chinpo' // 会話イベントID
        );
    }

    // 近接トリガーの設定
    setupProximityTriggers() {
        // 例：特定の座標に近づくと会話イベントが発生
        this.conversationTrigger.setupProximityTrigger(
            300, 300,    // 対象座標
            50,          // 半径
            'library_scene' // 会話イベントID
        );
    }

    update() {
        // フレームごとに更新が必要な要素のみを更新
        this.updateCounter++;
        
        // 30FPSに制限（60FPSの半分）
        if (this.updateCounter % 2 === 0) {
            // プレイヤー移動処理
            if (this.playerController && this.playerController.player) {
                this.playerController.update();
                
                // デバッグ: プレイヤーの状態を確認（60フレームごと）
                if (this.updateCounter % 120 === 0) {
                    const pos = this.playerController.getPosition();
                    console.log('Stage 1: プレイヤー位置更新 - X:', pos.x, 'Y:', pos.y);
                }
            } else {
                console.warn('Stage 1: プレイヤーコントローラーが初期化されていません');
            }
            
            // UI更新
            if (this.uiManager && this.playerController && this.playerController.player) {
                this.uiManager.updatePlayerPosition(this.playerController.player);
            }
        }
    }

    resize(gameSize) {
        const { width, height } = gameSize;
        this.cameras.resize(width, height);
    }
    
    // destroyメソッド自体を削除
    // これでPhaserのデフォルトのクリーンアップ挙動に戻す
}