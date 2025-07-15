import { MapManager } from '../managers/MapManager.js';
import { PlayerController } from '../controllers/PlayerController.js';
import { TouchControlManager } from '../controllers/TouchControlManager.js';
import { UIManager } from '../managers/UIManager.js';
import { CameraManager } from '../managers/CameraManager.js';
import { InputManager } from '../managers/InputManager.js';
import { CollisionManager } from '../managers/CollisionManager.js';
import { AudioManager } from '../managers/AudioManager.js';



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
        this.audioManager = null;
        this.updateCounter = 0;
    }

    preload() {
        // マップファイルを読み込み
        this.load.tilemapTiledJSON('map', 'assets/test_map5.tmj');
        
        // BGM読み込み
        this.load.audio('bgm_stage3', 'assets/audio/bgm/stage1/kessen_diaruga.mp3');

        // SE読み込み
        this.load.audio('se_touch_stage3', 'assets/audio/se/touch_6.mp3'); 
        
        // // マップ用のタイル
        // this.load.image('GK_A2_C_autotile', 'assets/GK_A2_JC_autotile.png');
        // this.load.image('Preview_RPGMakerVXAce', 'assets/Preview_RPGMakerVXAce.png');
        // this.load.image('Preview', 'assets/Preview.png');
        // this.load.image('GK_JC_A5_2', 'assets/GK_JC_A5_2.png');
        // this.load.image('GK_JC_B_2', 'assets/GK_JC_B_2.png');
        // this.load.image('tiles', 'assets/tiles.png');
        // this.load.image('Tilemap', 'assets/Tilemap.png');
        // this.load.image('pipo-map001_at-kusa', 'assets/pipo-map001_at-kusa.png');

        // // NPC画像を読み込み
        // const SPRITE_CONFIG = { frameWidth: 32, frameHeight: 32 };
        // this.load.spritesheet('friend1', 'assets/characters/npcs/pipo-charachip007a.png', SPRITE_CONFIG);
        // this.load.spritesheet('friend2', 'assets/characters/npcs/pipo-charachip007e.png', SPRITE_CONFIG);
        // this.load.spritesheet('kuccoro', 'assets/characters/npcs/pipo-charachip022a.png', SPRITE_CONFIG);

        // デバッグ用：読み込み完了を確認
        this.load.on('complete', () => {
            // アセット読み込み完了
        });
    }

    create() {
        // AudioManagerを初期化
        this.audioManager = new AudioManager(this);
        this.audioManager.playBgm('bgm_stage3', 0.3);
        
        // マップマネージャーを初期化
        // CollisionManagerを使った当たり判定
        this.collisionManager = new CollisionManager(this);
        this.collisionManager.setupCollisionGroups();
        
        this.mapManager = new MapManager(this);
        this.mapManager.createMap();

        // プレイヤーコントローラーを初期化
        this.playerController = new PlayerController(this);
        this.playerController.createPlayer(100, 100);

        // タッチコントロールマネージャーを初期化
        this.touchControlManager = new TouchControlManager(this, this.playerController.player, 'se_touch_stage3');

        // UI要素を作成
        this.uiManager = new UIManager();
        this.uiManager.createUI(this);

        // カメラ設定
        this.cameraManager = new CameraManager(this);
        this.cameraManager.setupCamera(this, this.mapManager.map, this.playerController.player);

        // キーボード入力設定
        this.inputManager = new InputManager();
        this.inputManager.setupKeyboard(this, this.playerController);

        this.collisionManager.setupAllCollisions(this.playerController.player, this.mapManager);
        // シーンシャットダウン時のクリーンアップ登録
        this.events.on('shutdown', this.shutdown, this);
    }

    shutdown() {
        if (this.audioManager && this.audioManager.stopAll) {
            this.audioManager.stopAll();
            if (this.audioManager.bgm && this.audioManager.bgm.destroy) {
                this.audioManager.bgm.destroy();
                this.audioManager.bgm = null;
            }
        }
        if (this.sound) {
            this.sound.stopAll();
        }
    }

    update() {
        // プレイヤーの更新
        if (this.playerController) {
            this.playerController.update();
        }

        // スマホ最適化：UI更新を60FPSから30FPSに制限
        if (!this.updateCounter) this.updateCounter = 0;
        this.updateCounter++;
        
        if (this.updateCounter % 2 === 0) {  // 2フレームに1回実行
            if (this.uiManager && this.playerController) {
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
        // MapManagerのクリーンアップ
        if (this.mapManager && this.mapManager.destroy) {
            this.mapManager.destroy();
        }
        
        // AudioManagerのクリーンアップ
        if (this.audioManager && this.audioManager.destroy) {
            this.audioManager.destroy();
        }
        
        // その他のマネージャーのクリーンアップ
        if (this.touchControlManager && this.touchControlManager.destroy) {
            this.touchControlManager.destroy();
        }
        
        if (this.collisionManager && this.collisionManager.destroy) {
            this.collisionManager.destroy();
        }
        
        if (this.dialogSystem && this.dialogSystem.destroy) {
            this.dialogSystem.destroy();
        }
        
        // 親クラスのdestroy()を呼び出し
        super.destroy();
    }
}