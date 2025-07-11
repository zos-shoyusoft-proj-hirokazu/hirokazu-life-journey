import { MapManager } from '../managers/MapManager.js';
import { PlayerController } from '../controllers/PlayerController.js';
import { TouchControlManager } from '../controllers/TouchControlManager.js';
import { UIManager } from '../managers/UIManager.js';
import { CameraManager } from '../managers/CameraManager.js';
import { InputManager } from '../managers/InputManager.js';
import { CollisionManager } from '../managers/CollisionManager.js';



export class Stage3 extends Phaser.Scene {
    constructor() {
        super({ key: 'Stage3Scene' });
        
        // マネージャーとコントローラーの初期化
        this.mapManager = null;
        this.playerController = null;
        this.touchControlManager = null;
        this.uiManager = null;
        this.cameraManager = null;
        this.inputManager = null;
        this.collisionManager = null;
    }

    preload() {
        // マップファイルを読み込み
        this.load.tilemapTiledJSON('map', 'assets/test_map5.tmj');
        
        // マップ用のタイル
        this.load.image('GK_A2_C_autotile', 'assets/GK_A2_JC_autotile.png');
        this.load.image('Preview_RPGMakerVXAce', 'assets/Preview_RPGMakerVXAce.png');
        this.load.image('Preview', 'assets/Preview.png');
        this.load.image('GK_JC_A5_2', 'assets/GK_JC_A5_2.png');
        this.load.image('GK_JC_B_2', 'assets/GK_JC_B_2.png');
        this.load.image('tiles', 'assets/tiles.png');
        this.load.image('Tilemap', 'assets/Tilemap.png');
        this.load.image('pipo-map001_at-kusa', 'assets/pipo-map001_at-kusa.png');


        // スプライトシート用の共通設定
        const SPRITE_CONFIG = { frameWidth: 32, frameHeight: 32 };

        // スプライトシートとして読み込み
        this.load.spritesheet('enemy1', 'assets/pipo-charachip005a.png', SPRITE_CONFIG);
        this.load.spritesheet('friend2_6', 'assets/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('friend2_5', 'assets/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('friend2_4', 'assets/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('friend2_3', 'assets/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('friend2_2', 'assets/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('friend2_1', 'assets/pipo-charachip007a.png', SPRITE_CONFIG);
        this.load.spritesheet('kuccoro1', 'assets/pipo-charachip022a.png', SPRITE_CONFIG);
        this.load.spritesheet('kuccoro', 'assets/pipo-charachip022e.png', SPRITE_CONFIG);
        this.load.spritesheet('kuccoro2', 'assets/pipo-charachip024d.png', SPRITE_CONFIG);
                
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
        this.cameraManager = new CameraManager(this);
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
        // プレイヤーの更新
        this.playerController.update();

        // スマホ最適化：UI更新を60FPSから30FPSに制限
        if (!this.updateCounter) this.updateCounter = 0;
        this.updateCounter++;
        
        if (this.updateCounter % 2 === 0) {  // 2フレームに1回実行
            if (this.uiManager) {
                this.uiManager.updatePlayerPosition(this.playerController.player);
            }
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