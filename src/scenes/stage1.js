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
    }

    create() {
        try {
            // CollisionManagerを初期化
            console.log('Before creating CollisionManager');
            this.collisionManager = new CollisionManager(this);
            console.log('CollisionManager created:', this.collisionManager);
            this.collisionManager.setupCollisionGroups();

            // DialogSystemを初期化（Stage1専用データを渡す）
            console.log('Creating DialogSystem for Stage1');
            this.dialogSystem = new DialogSystem(this, Stage1DialogData);
            this.collisionManager.setDialogSystem(this.dialogSystem); 

            // 追加：BehaviorManager_Stage1を初期化
            console.log('Creating BehaviorManager_Stage1');
            this.behaviorManager = new BehaviorManager_Stage1(this);

            // マップマネージャーを初期化
            this.mapManager = new MapManager(this);
            console.log('MapManager created, calling createMap()');
            this.mapManager.createMap();
            console.log('MapManager: createMap completed');

            // プレイヤーコントローラーを初期化
            console.log('Creating PlayerController');
            this.playerController = new PlayerController(this);
            this.playerController.createPlayer(100, 100);

            // キーボード入力設定
            console.log('Setting up InputManager');
            this.inputManager = new InputManager();
            this.inputManager.setupKeyboard(this, this.playerController);

            // タッチコントロールマネージャーを初期化
            console.log('Creating TouchControlManager');
            this.touchControlManager = new TouchControlManager(this, this.playerController.player);

            // UI要素を作成
            console.log('Creating UIManager');
            this.uiManager = new UIManager();
            this.uiManager.createUI(this);

            // カメラ設定
            console.log('Setting up CameraManager');
            this.cameraManager = new CameraManager();
            this.cameraManager.setupCamera(this, this.mapManager.map, this.playerController.player);


            // 当たり判定設定
            console.log('Setting up all collisions');
            this.collisionManager.setupAllCollisions(this.playerController.player, this.mapManager);

            console.log('=== Scene creation completed ===');

        } catch (error) {
            console.error('Error during scene creation:', error);
            console.error('Stack trace:', error.stack);
        }
    }

    update() {
        try {
            if (this.dialogSystem && this.dialogSystem.isDialogActive()) {
                this.playerController.player.setVelocity(0, 0);
                return;
            }
            
            // プレイヤーの更新
            if (this.playerController) {
                this.playerController.update();
            }

            // UIManagerのupdatePlayerPositionメソッドを使用
            if (this.uiManager && this.playerController) {
                this.uiManager.updatePlayerPosition(this.playerController.player);
            }
        } catch (error) {
            console.error('Error during update:', error);
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