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
//import { AudioManager } from '../managers/AudioManager.js';

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
        
        // 新しい会話システム
        this.conversationTrigger = null;
        
        // パフォーマンス最適化用のフレームカウンター
        this.updateCounter = 0;
    }

    preload() {
        // マップファイルを読み込み
        this.load.tilemapTiledJSON('map', 'assets/maps/stage1.tmj');
        
        this.load.image('[A]Grass1_pipo', 'assets/maps/tilesets/stage1/[A]Grass1_pipo.png');
        this.load.image('Tilemap', 'assets/maps/tilesets/stage1/Tilemap.png');

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
        this.load.on('fileerror', (file) => {
            console.error(`Failed to load file: ${file.key} from ${file.url}`);
        });
                
        // デバッグ用：読み込み完了を確認
        this.load.on('complete', () => {
            console.log('All assets loaded successfully');
        });
        
        // 新しい会話システム用の画像
        this.load.image('kawamuro_A', 'assets/characters/portraits/kawamuro_A.png');
        this.load.image('kawamuro_B', 'assets/characters/portraits/kawamuro_B.png');
        this.load.image('kawamuro_C', 'assets/characters/portraits/kawamuro_C.png');
        this.load.image('kawamuro_D', 'assets/characters/portraits/kawamuro_D.png');
        this.load.image('kawamuro_E', 'assets/characters/portraits/kawamuro_E.png');
        this.load.image('kawamuro_F', 'assets/characters/portraits/kawamuro_F.png');
        this.load.image('daichi_A', 'assets/characters/portraits/daichi_A.png');
        this.load.image('naoki_A', 'assets/characters/portraits/naoki_A.png');
        
        // 会話システム用の背景とUI要素
        this.load.image('test_1', 'assets/backgrounds/background_test.png');
        this.load.image('textbox', 'assets/ui/textbox.png');
        this.load.image('namebox', 'assets/ui/namebox.png');
    }

    create() {
        try {

            // メニューBGMを開始
            this.audioManager.playBgm('bgm_menu', 0.3);

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

            // キーボード入力設定
            this.inputManager = new InputManager();
            this.inputManager.setupKeyboard(this, this.playerController);

            // タッチコントロールマネージャーを初期化
            this.touchControlManager = new TouchControlManager(this, this.playerController.player);

            // UI要素を作成
            this.uiManager = new UIManager();
            this.uiManager.createUI(this);

            // カメラ設定
            this.cameraManager = new CameraManager();
            this.cameraManager.setupCamera(this, this.mapManager.map, this.playerController.player);

            // 当たり判定設定
            this.collisionManager.setupAllCollisions(this.playerController.player, this.mapManager);

            // 新しい会話システムを初期化
            this.conversationTrigger = new ConversationTrigger(this);
            
            // ConversationSceneを動的に追加
            this.scene.add('ConversationScene', ConversationScene);

            // 会話イベントを設定
            this.setupConversationEvents();

        } catch (error) {
            console.error('Error during scene creation:', error);
            console.error('Stack trace:', error.stack);
        }
    }

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
            this.playerController.update();
            
            // UI更新
            this.uiManager.updatePlayerPosition(this.playerController.player);
        }
    }

    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        
        // カメラサイズを更新
        this.cameras.resize(width, height);
        
        console.log(`Game resized to: ${width}x${height}`);
    }
}