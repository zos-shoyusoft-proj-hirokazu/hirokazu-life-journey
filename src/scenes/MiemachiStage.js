import { AreaSelectionManager } from '../managers/AreaSelectionManager.js';
import { TouchControlManager } from '../controllers/TouchControlManager.js';
import { UIManager } from '../managers/UIManager.js';
import { AudioManager } from '../managers/AudioManager.js';

export class MiemachiStage extends Phaser.Scene {
    constructor() {
        super({ key: 'MiemachiStage' });
        
        // マネージャーの初期化
        this.areaSelectionManager = null;
        this.touchControlManager = null;
        this.uiManager = null;
        this.cameraManager = null;
        this.audioManager = null;
        
        // マップデータ
        this.tilemap = null;
        this.areas = [];
        this.selectedArea = null;
        
        // スマホ対応
        this.isMobile = false;
        this.screenScale = 1;
    }

    preload() {
        // マップファイルを読み込み
        this.load.tilemapTiledJSON('miemachi_map', 'assets/maps/miemachi/bunngo_mie_city.tmj');
        
        // 既存のタイルセット画像を使用（stage1のものを流用）
        this.load.image('bunngooonoshimiemachi', 'assets/maps/miemachi/bunngooonoshimiemachi.png');
        
        // UI要素とアイコン
        this.load.image('area_marker', 'assets/ui/area_marker.png');
        this.load.image('selection_circle', 'assets/ui/selection_circle.png');
        this.load.image('back_button', 'assets/ui/back_button.png');
        
        // エラーハンドリング - 画像が見つからない場合の代替
        this.load.on('fileerror', (file) => {
            console.warn(`File not found: ${file.key}, using fallback`);
            // 代替画像を作成
            this.createFallbackImage(file.key);
        });
        
        // デバッグ用：読み込み完了を確認
        this.load.on('complete', () => {
            console.log('MiemachiStage assets loaded successfully');
        });
    }

    create() {
        try {
            // モバイルデバイスの検出
            this.isMobile = this.sys.game.device.input.touch;
            
            // 背景色を設定
            this.cameras.main.setBackgroundColor('#87CEEB');
            
            // マップを作成
            this.createMap();
            
            // エリア選択システムを初期化
            this.areaSelectionManager = new AreaSelectionManager(this);
            this.areaSelectionManager.setupAreas(this.tilemap);
            
            // タッチコントロールを初期化
            this.touchControlManager = new TouchControlManager(this);
            this.touchControlManager.enableAreaSelection(this.areaSelectionManager);
            
            // UI要素を作成
            this.uiManager = new UIManager();
            this.uiManager.createMapUI(this, '三重町マップ');
            
            // カメラを設定（全体マップを表示）
            this.setupCamera();
            
            // オーディオマネージャーを初期化
            this.audioManager = new AudioManager(this);
            this.audioManager.playBgm('miemachi_theme', 0.5);
            
            // リサイズイベントを設定
            this.scale.on('resize', this.handleResize, this);
            
            console.log('MiemachiStage created successfully');
            
        } catch (error) {
            console.error('Error creating MiemachiStage:', error);
            console.error('Stack trace:', error.stack);
        }
    }

    createMap() {
        // Tiledマップを作成
        this.tilemap = this.make.tilemap({ key: 'miemachi_map' });
        
        // タイルセットを追加
        const tileset = this.tilemap.addTilesetImage('bunngooonoshimiemachi', 'bunngooonoshimiemachi');
        
        // レイヤーを作成
        this.tilemap.createLayer('タイルレイヤー1', tileset);
        
        // マップサイズを取得
        this.mapWidth = this.tilemap.widthInPixels;
        this.mapHeight = this.tilemap.heightInPixels;
        
        console.log(`Map size: ${this.mapWidth}x${this.mapHeight}`);
        
        // オブジェクトレイヤーから場所データを取得
        this.extractAreaData();
    }

    extractAreaData() {
        // オブジェクトレイヤーから場所データを抽出
        const objectLayer = this.tilemap.getObjectLayer('miemachi');
        
        if (objectLayer) {
            this.areas = objectLayer.objects.map(obj => ({
                id: obj.id,
                name: obj.name,
                x: obj.x,
                y: obj.y,
                type: obj.type || 'location'
            }));
            
            console.log('Extracted areas:', this.areas);
        } else {
            console.warn('Object layer "miemachi" not found');
        }
    }

    setupCamera() {
        // カメラを設定してマップ全体を表示
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;
        
        // マップ全体が見えるようにズームを調整
        const scaleX = gameWidth / this.mapWidth;
        const scaleY = gameHeight / this.mapHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9; // 少し余白を残す
        
        this.cameras.main.setZoom(scale);
        this.cameras.main.centerOn(this.mapWidth / 2, this.mapHeight / 2);
        
        console.log(`Camera scale: ${scale}`);
    }

    createFallbackImage(key) {
        // 代替画像を動的に作成
        const graphics = this.add.graphics();
        graphics.fillStyle(0x00ff00);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture(key, 32, 32);
        graphics.destroy();
    }

    handleResize(gameSize) {
        // リサイズ時の処理
        this.setupCamera();
        
        if (this.uiManager) {
            this.uiManager.updateMapUI(gameSize);
        }
        
        console.log(`MiemachiStage resized to: ${gameSize.width}x${gameSize.height}`);
    }

    selectArea(area) {
        // エリアを選択
        this.selectedArea = area;
        
        // 選択エフェクトを表示
        this.showSelectionEffect(area);
        
        // 選択した場所に移動
        this.navigateToArea(area);
    }

    showSelectionEffect(area) {
        // 選択エフェクトを表示
        const effect = this.add.circle(area.x, area.y, 30, 0xffff00, 0.5);
        effect.setStrokeStyle(3, 0xff0000);
        
        // アニメーション
        this.tweens.add({
            targets: effect,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy();
            }
        });
    }

    navigateToArea(area) {
        // 選択した場所に応じて次のマップまたはシーンに移動
        console.log(`Navigating to area: ${area.name}`);
        
        // 場所に応じた処理
        switch (area.name) {
            case 'mie_high_school':
                this.scene.start('MieHighSchoolScene');
                break;
            case 'sumiwataru':
                this.scene.start('SumiWataruScene');
                break;
            case 'shigaku':
                this.scene.start('ShigakuScene');
                break;
            // 他の場所も同様に追加
            default:
                console.log(`Area ${area.name} not implemented yet`);
                break;
        }
    }

    update() {
        // 必要に応じて更新処理を追加
        if (this.areaSelectionManager) {
            this.areaSelectionManager.update();
        }
    }
} 