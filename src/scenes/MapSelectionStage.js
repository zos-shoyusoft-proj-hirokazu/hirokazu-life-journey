import { AreaSelectionManager } from '../managers/AreaSelectionManager.js';
import { UIManager } from '../managers/UIManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { MapManager } from '../managers/MapManager.js';
import { CameraManager } from '../managers/CameraManager.js';
import { AreaConfig } from '../config/AreaConfig.js';

export class MapSelectionStage extends Phaser.Scene {
    constructor(config) {
        super({ key: config.sceneKey });
        
        // 設定を保存
        this.mapConfig = config.mapConfig;
        this.mapId = config.mapId;
        
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
        // 設定ファイルから動的にアセットを読み込み
        this.load.tilemapTiledJSON(this.mapConfig.mapKey, `assets/maps/${this.mapId}/${this.mapConfig.mapKey}.tmj`);
        this.load.image(this.mapConfig.tilesetKey, `assets/maps/${this.mapId}/${this.mapConfig.tilesetKey}.png`);
        
        // UI要素とアイコン
        this.load.image('area_marker', 'assets/ui/area_marker.png');
        this.load.image('selection_circle', 'assets/ui/selection_circle.png');
        this.load.image('back_button', 'assets/ui/back_button.png');
        
        // エラーハンドリング
        this.load.on('fileerror', (file) => {
            console.warn(`File not found: ${file.key}, using fallback`);
            this.mapManager?.createFallbackImage(file.key);
        });
        
        // デバッグ用
        this.load.on('complete', () => {
            console.log(`${this.mapConfig.mapTitle} assets loaded successfully`);
        });
    }

    create() {
        try {
            // モバイルデバイスの検出
            this.isMobile = this.sys.game.device.input.touch;
            
            // マップマネージャーを初期化
            this.mapManager = new MapManager(this);
            this.mapManager.createMap(this.mapConfig.mapKey, this.mapConfig.tilesetKey);
            
            // カメラマネージャーを初期化
            this.cameraManager = new CameraManager(this);
            this.cameraManager.setBackgroundColor('#87CEEB');
            this.cameraManager.setupCamera(this.mapManager.getMapSize());
            
            // エリア選択システムを初期化
            this.areaSelectionManager = new AreaSelectionManager(this);
            
            // 設定ファイルからエリア情報を取得し、マップエリアとマージ
            const mapAreas = this.mapManager.getAreas();
            const configAreas = this.mapConfig.areas;
            
            // エリア情報をマージ（座標はマップから、シーン情報は設定から）
            const mergedAreas = mapAreas.map(mapArea => {
                const configArea = configAreas.find(config => config.name === mapArea.name);
                return {
                    ...mapArea,
                    scene: configArea?.scene || null
                };
            });
            
            this.areaSelectionManager.setupAreas(mergedAreas);
            
            // タッチイベントを直接設定
            this.setupTouchEvents();
            
            // UI要素を作成
            this.uiManager = new UIManager();
            this.uiManager.createMapUI(this, this.mapConfig.mapTitle);
            
            // オーディオマネージャーを初期化
            this.audioManager = new AudioManager(this);
            this.audioManager.playBgm(`${this.mapId}_theme`, 0.5);
            
            // リサイズイベントを設定
            this.scale.on('resize', this.handleResize, this);
            
            console.log(`${this.mapConfig.mapTitle} created successfully`);
            
        } catch (error) {
            console.error(`Error creating ${this.mapConfig.mapTitle}:`, error);
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
            console.log(`${this.mapConfig.mapTitle}: Touch detected at screen:`, pointer.x, pointer.y);
            
            // カメラの存在確認
            if (!this.cameras || !this.cameras.main) {
                console.error(`${this.mapConfig.mapTitle}: Camera not available`);
                return;
            }
            
            // ワールド座標に変換
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const worldX = worldPoint.x;
            const worldY = worldPoint.y;
            
            console.log(`${this.mapConfig.mapTitle}: World coordinates:`, worldX, worldY);
            
            // エリアマネージャーに座標を渡す
            if (this.areaSelectionManager) {
                this.areaSelectionManager.handleTouchAt(worldX, worldY);
            }
            
            // 視覚的フィードバック
            this.showTouchFeedback(worldX, worldY);
            
        } catch (error) {
            console.error(`${this.mapConfig.mapTitle}: Error in handleTouch:`, error);
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
                
                // エリア情報を再取得
                const mapAreas = this.mapManager.getAreas();
                const configAreas = this.mapConfig.areas;
                const mergedAreas = mapAreas.map(mapArea => {
                    const configArea = configAreas.find(config => config.name === mapArea.name);
                    return {
                        ...mapArea,
                        scene: configArea?.scene || null
                    };
                });
                
                this.areaSelectionManager.setupAreas(mergedAreas);
            }
            
            // UIの更新
            this.uiManager?.updateMapUI(gameSize);
            
            console.log(`${this.mapConfig.mapTitle} resized to: ${gameSize.width}x${gameSize.height}`);
            
        } catch (error) {
            console.error('Error handling resize:', error);
        }
    }

    update() {
        // マネージャーの更新処理
        this.areaSelectionManager?.update();
        this.cameraManager?.update();
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

// 設定ファイルベースでマップシーンを作成するヘルパー関数
export function createMapStage(mapId, sceneKey) {
    const mapConfig = AreaConfig[mapId];
    if (!mapConfig) {
        console.error(`Map config not found for: ${mapId}`);
        return null;
    }
    
    return new MapSelectionStage({
        sceneKey: sceneKey,
        mapConfig: mapConfig,
        mapId: mapId
    });
} 