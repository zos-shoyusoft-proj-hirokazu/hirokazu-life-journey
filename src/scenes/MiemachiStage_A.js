import { AreaSelectionManager } from '../managers/AreaSelectionManager.js';
import { UIManager } from '../managers/UIManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { MapManager } from '../managers/MapManager.js';
import { CameraManager } from '../managers/CameraManager.js';

export class MiemachiStage extends Phaser.Scene {
    constructor() {
        super({ key: 'MiemachiStage' });
        
        // マネージャーの初期化
        this.mapManager = null;
        this.areaSelectionManager = null;
        this.uiManager = null;
        this.cameraManager = null;
        this.audioManager = null;
        
        // スマホ対応
        this.isMobile = false;
    }

    preload() {
        // マップファイルを読み込み
        this.load.tilemapTiledJSON('miemachi_map', 'assets/maps/miemachi/bunngo_mie_city.tmj');
        
        // タイルセット画像を読み込み
        this.load.image('bunngooonoshimiemachi', 'assets/maps/miemachi/bunngooonoshimiemachi.png');
        
        // UI要素とアイコン
        this.load.image('area_marker', 'assets/ui/area_marker.png');
        this.load.image('selection_circle', 'assets/ui/selection_circle.png');
        this.load.image('back_button', 'assets/ui/back_button.png');
        
        // エラーハンドリング - 画像が見つからない場合の代替
        this.load.on('fileerror', (file) => {
            console.warn(`File not found: ${file.key}, using fallback`);
            this.mapManager?.createFallbackImage(file.key);
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
            
            // マップマネージャーを初期化
            this.mapManager = new MapManager(this);
            this.mapManager.createMap('miemachi_map', 'bunngooonoshimiemachi');
            
            // カメラマネージャーを初期化
            this.cameraManager = new CameraManager(this);
            this.cameraManager.setBackgroundColor('#87CEEB');
            this.cameraManager.setupCamera(this.mapManager.getMapSize());
            
            // エリア選択システムを初期化
            this.areaSelectionManager = new AreaSelectionManager(this);
            this.areaSelectionManager.setupAreas(this.mapManager.getAreas());
            
            // タッチイベントを直接設定
            this.setupTouchEvents();
            
            // UI要素を作成
            this.uiManager = new UIManager();
            this.uiManager.createMapUI(this, '三重町マップ');
            
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

    setupTouchEvents() {
        // タッチイベントを直接設定
        this.input.on('pointerdown', (pointer) => {
            this.handleTouch(pointer);
        });
    }

    handleTouch(pointer) {
        try {
            console.log('MiemachiStage: Touch detected at screen:', pointer.x, pointer.y);
            
            // カメラの存在確認
            if (!this.cameras || !this.cameras.main) {
                console.error('MiemachiStage: Camera not available');
                return;
            }
            
            // ワールド座標に変換
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const worldX = worldPoint.x;
            const worldY = worldPoint.y;
            
            console.log('MiemachiStage: World coordinates:', worldX, worldY);
            
            // エリアマネージャーに座標を渡す
            if (this.areaSelectionManager) {
                this.areaSelectionManager.handleTouchAt(worldX, worldY);
            }
            
            // 視覚的フィードバック
            this.showTouchFeedback(worldX, worldY);
            
        } catch (error) {
            console.error('MiemachiStage: Error in handleTouch:', error);
        }
    }

    showTouchFeedback(worldX, worldY) {
        // タッチ位置にリップルエフェクトを表示
        const ripple = this.add.circle(worldX, worldY, 10, 0x00FF00, 0.7);
        
        // アニメーション
        this.tweens.add({
            targets: ripple,
            scaleX: 5,
            scaleY: 5,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                ripple.destroy();
            }
        });
    }

    handleResize(gameSize) {
        try {
            // マップマネージャーでリサイズ処理
            this.mapManager?.handleResize(gameSize);
            
            // カメラの再設定
            this.cameraManager?.setupCamera(this.mapManager.getMapSize());
            
            // エリアマーカーを更新
            if (this.areaSelectionManager) {
                this.areaSelectionManager.destroy();
                this.areaSelectionManager = new AreaSelectionManager(this);
                this.areaSelectionManager.setupAreas(this.mapManager.getAreas());
            }
            
            // UIの更新
            this.uiManager?.updateMapUI(gameSize);
            
            console.log(`MiemachiStage resized to: ${gameSize.width}x${gameSize.height}`);
            
        } catch (error) {
            console.error('Error handling resize:', error);
        }
    }

    update() {
        // マネージャーの更新処理
        this.areaSelectionManager?.update();
        this.cameraManager?.update();
    }

    // 旧バージョンとの互換性のため残すメソッド（将来的に削除予定）
    selectArea(area) {
        console.warn('selectArea is deprecated. Use areaSelectionManager.selectArea instead.');
        this.areaSelectionManager?.selectArea(area);
    }

    showSelectionEffect(area) {
        console.warn('showSelectionEffect is deprecated. Use areaSelectionManager.showSelectionEffect instead.');
        this.areaSelectionManager?.showSelectionEffect(area);
    }

    navigateToArea(area) {
        console.warn('navigateToArea is deprecated. Use areaSelectionManager.navigateToArea instead.');
        this.areaSelectionManager?.navigateToArea(area);
    }

    destroy() {
        // マネージャーのクリーンアップ
        this.mapManager?.destroy();
        this.areaSelectionManager?.destroy();
        this.uiManager?.destroy();
        this.cameraManager?.destroy();
        this.audioManager?.destroy();
    }
} 