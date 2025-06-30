import Phaser from 'phaser';
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
    }

    preload() {
        // マップファイルを読み込み
        this.load.tilemapTiledJSON('map', 'assets/maps/test_map5.tmj');

        // マップ用のタイル
        this.load.image('GK_A2_C_autotile', 'assets/maps/tilesets/stage2/GK_A2_JC_autotile.png');
        this.load.image('Preview_RPGMakerVXAce', 'assets/maps/tilesets/stage2/Preview_RPGMakerVXAce.png');
        this.load.image('Preview', 'assets/maps/tilesets/stage2/Preview.png');
        this.load.image('GK_JC_A5_2', 'assets/maps/tilesets/stage2/GK_JC_A5_2.png');
        this.load.image('GK_JC_B_2', 'assets/maps/tilesets/stage2/GK_JC_B_2.png');
        this.load.image('tiles', 'assets/maps/tilesets/stage2/tiles.png');
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

        // デバッグ用：読み込み完了を確認
        this.load.on('complete', () => {
            console.log('All assets loaded successfully');
        });
    }

    create() {
        // マップマネージャーを初期化
        // CollisionManagerを使った当たり判定
        console.log('Before creating CollisionManager');
        this.collisionManager = new CollisionManager(this);
        console.log('CollisionManager created:', this.collisionManager);
        this.collisionManager.setupCollisionGroups();

        // DialogSystemを初期化（Stage2専用データを渡す）
        console.log('Stage2: Creating DialogSystem for Stage2');
        this.dialogSystem = new DialogSystem(this, Stage2DialogData);
        this.collisionManager.setDialogSystem(this.dialogSystem); 

        // BehaviorManager_Stage2を初期化
        console.log('Stage2: Creating BehaviorManager_Stage2');
        this.behaviorManager = new BehaviorManager_Stage2(this);

        this.mapManager = new MapManager(this);
        console.log('MapManager: placeObjectsを呼ぶ前');
        this.mapManager.createMap();
        console.log('MapManager: placeObjectsを呼んだ後');

        // プレイヤーコントローラーを初期化
        this.playerController = new PlayerController(this);
        this.playerController.createPlayer(100, 100);

        // タッチコントロールマネージャーを初期化
        this.touchControlManager = new TouchControlManager(this, this.playerController.player);

        // UI要素を作成
        this.uiManager = new UIManager();
        this.uiManager.createUI(this);

        // カメラ設定
        this.cameraManager = new CameraManager();
        this.cameraManager.setupCamera(this, this.mapManager.map, this.playerController.player);

        // キーボード入力設定
        this.inputManager = new InputManager();
        this.inputManager.setupKeyboard(this, this.playerController);

        console.log('setupCollisionGroups completed');
        this.collisionManager.setupAllCollisions(this.playerController.player, this.mapManager);


        console.log('=== 読み込まれた画像 ===');
        console.log('friend1 exists:', this.textures.exists('friend1'));
        console.log('friend2 exists:', this.textures.exists('friend2'));
        console.log('kuccoro exists:', this.textures.exists('kuccoro'));
    }


    update() {
        // ダイアログが表示中はプレイヤーの動きを止める
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
    }

    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        
        // カメラサイズを更新
        this.cameras.resize(width, height);
        
        console.log(`Game resized to: ${width}x${height}`);
    }
}