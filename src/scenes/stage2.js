
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

        // BGM読み込み
        this.load.audio('bgm_pollyanna', 'assets/audio/bgm/Pollyanna.mp3');

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
            // アセット読み込み完了
        });
    }

    create() {
        this.audioManager = new AudioManager(this);
        // Stage1 と同じBGM起動ロジック（ロック時は解除イベント/最初の操作で開始）
        const startStageBgm = () => {
            try { this.audioManager.ensureAudioUnlocked && this.audioManager.ensureAudioUnlocked(); } catch(_) {}
            try { this.audioManager.playBgm('bgm_pollyanna', 0.5); } catch(_) {}
        };
        try {
            if (this.sound && this.sound.locked) {
                this.sound.once('unlocked', () => { startStageBgm(); });
                this.input && this.input.once && this.input.once('pointerdown', () => {
                    try { if (this.sound.context && this.sound.context.state !== 'running') this.sound.context.resume(); } catch(_) {}
                    startStageBgm();
                });
                // PC環境でも最初のキー操作で開始
                try { this.input && this.input.keyboard && this.input.keyboard.once('keydown', startStageBgm); } catch(_) {}
            } else {
                startStageBgm();
            }
        } catch(_) { startStageBgm(); }

        // ConversationSceneの重複登録を避ける
        try {
            const exists = this.scene.manager && this.scene.manager.keys && this.scene.manager.keys['ConversationScene'];
            if (!exists) {
                // Stage系では通常使わないが、将来の会話起動に備えて一度だけ登録
                // this.scene.add('ConversationScene', ConversationScene);
            }
        } catch (e) { /* ignore */ }
        
        // マップマネージャーを初期化
        // CollisionManagerを使った当たり判定
        this.collisionManager = new CollisionManager(this);
        this.collisionManager.setupCollisionGroups();

        // DialogSystemを初期化（Stage2専用データを渡す）
        this.dialogSystem = new DialogSystem(this, Stage2DialogData);
        this.collisionManager.setDialogSystem(this.dialogSystem); 

        // BehaviorManager_Stage2を初期化
        this.behaviorManager = new BehaviorManager_Stage2(this);

        this.mapManager = new MapManager(this);
        this.mapManager.createMap();

        // プレイヤーコントローラーを初期化
        this.playerController = new PlayerController(this);
        this.playerController.createPlayer(100, 100);

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
    }

    shutdown() {
        try { if (this.audioManager && this.audioManager.stopAll) this.audioManager.stopAll(); } catch (_) { }
        try { if (this.audioManager && this.audioManager.bgm && this.audioManager.bgm.destroy) { this.audioManager.bgm.destroy(); this.audioManager.bgm = null; } } catch (_) { }
        try { if (this.load && this.load.reset) this.load.reset(); } catch (_) { }
        try { if (this.load && this.load.removeAllListeners) this.load.removeAllListeners(); } catch (_) { }
        try { if (this.sound) this.sound.stopAll(); } catch (_) { }
    }


    update() {
        // ダイアログが表示中はプレイヤーの動きを止める
        if (this.dialogSystem && this.dialogSystem.isDialogActive()) {
            // 統一された方法で停止
            this.playerController.player.setVelocityX(0);
            this.playerController.player.setVelocityY(0);
            return;
        }
    
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
        super.destroy();
    }
}