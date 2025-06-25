import Phaser from 'phaser';
import { MapManager } from '../managers/MapManager.js';
import { PlayerController } from '../controllers/PlayerController.js';
import { TouchControlManager } from '../controllers/TouchControlManager.js';

export class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        
        // マネージャーとコントローラーの初期化
        this.mapManager = null;
        this.playerController = null;
        this.touchControlManager = null;
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


        this.load.image('friend1_1', 'assets/pipo-charachip005a.png');
        this.load.image('friend2_6', 'assets/pipo-charachip007a.png');
        this.load.image('friend2_5', 'assets/pipo-charachip007a.png');
        this.load.image('friend2_4', 'assets/pipo-charachip007a.png');
        this.load.image('friend2_3', 'assets/pipo-charachip007a.png');
        this.load.image('friend2_2', 'assets/pipo-charachip007a.png');
        this.load.image('friend2_1', 'assets/pipo-charachip007a.png');
        this.load.image('kuccoro1', 'assets/pipo-charachip022e.png');
                
        // デバッグ用：読み込み完了を確認
        this.load.on('complete', () => {
            console.log('All assets loaded successfully');
        });
    }

    create() {
        // マップマネージャーを初期化
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
        this.createUI();

        // カメラ設定
        this.setupCamera();

        // キーボード入力設定
        this.setupKeyboard();

        // 当たり判定設定
        this.setupCollisions();

        console.log('=== 読み込まれた画像 ===');
        console.log('friend1 exists:', this.textures.exists('friend1'));
        console.log('friend2 exists:', this.textures.exists('friend2'));
        console.log('kuccoro exists:', this.textures.exists('kuccoro'));
    }

    createUI() {
        // タイトル表示（文字サイズを調整）
        this.add.text(400, 50, '★★★テスト中★★★bbbbb', {
            fontSize: '24px',
            fill: '#000000',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 550, '矢印キーまたはWASDで移動！マップ上を歩いてみよう！', {
            fontSize: '16px',
            fill: '#000000'
        }).setOrigin(0.5);

        // デバッグ用：座標表示
        this.playerPosText = this.add.text(10, 10, '', {
            fontSize: '16px',
            fill: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 5, y: 5 }
        });
    }

    setupCamera() {
        // マップのサイズを取得
        const mapWidth = this.mapManager.map.widthInPixels;
        const mapHeight = this.mapManager.map.heightInPixels;
        
        // カメラの範囲をマップ内に制限
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        
        // プレイヤーを中心に画面が動く
        this.cameras.main.startFollow(this.playerController.player);
        
        // プレイヤーの移動範囲もマップ内に制限
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    }

    setupKeyboard() {
        // キーボード入力設定
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // プレイヤーコントローラーにキー情報を渡す
        this.playerController.setInputKeys(this.cursors, this.wasd);
    }

    setupCollisions() {
        // 当たり判定設定
        this.mapManager.layers.forEach(layer => {
            if (layer) {
                this.physics.add.collider(this.playerController.player, layer);
            }
        });
    }

    update() {
        // プレイヤーの更新
        this.playerController.update();

        // 座標表示（デバッグ用）
        const player = this.playerController.player;
        this.playerPosText.setText(`ひろかず位置: X=${Math.round(player.x)}, Y=${Math.round(player.y)}`);
    }

    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        
        // カメラサイズを更新
        this.cameras.resize(width, height);
        
        console.log(`Game resized to: ${width}x${height}`);
    }
}