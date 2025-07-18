import { AreaSelectionManager } from '../managers/AreaSelectionManager.js';
import { UIManager } from '../managers/UIManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { MapManager } from '../managers/MapManager.js';
import { CameraManager } from '../managers/CameraManager.js';
import { AreaConfig } from '../config/AreaConfig.js';
import { VisualFeedbackManager } from '../managers/VisualFeedbackManager.js';

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
        this.visualFeedbackManager = null;
        
        // スマホ対応
        this.isMobile = false;
    }

    preload() {
        // 設定ファイルから動的にアセットを読み込み
        this.load.tilemapTiledJSON(this.mapConfig.mapKey, `assets/maps/${this.mapId}/${this.mapConfig.mapKey}.tmj`);
        this.load.image(this.mapConfig.tilesetKey, `assets/maps/${this.mapId}/${this.mapConfig.tilesetKey}.png`);
        
        // UI要素とアイコン
        
        // BGMの読み込み（設定に基づいて動的に）
        this.loadBgmFiles();

        // SEの読み込み（設定に基づいて動的に）
        this.loadSeFiles();
        
        // エラーハンドリング
        this.load.on('fileerror', (file) => {
            console.warn(`File not found: ${file.key}, using fallback`);
            this.mapManager?.createFallbackImage(file.key);
        });
        
        // デバッグ用
        this.load.on('complete', () => {
        });
    }

    loadSeFiles() {
        // AreaConfigからSEを動的に読み込み
        if (this.mapConfig.se) {
            Object.keys(this.mapConfig.se).forEach(seKey => {
                this.load.audio(`se_${seKey}`, this.mapConfig.se[seKey]);
            });
        }
    }

    // BGMファイルを動的に読み込む
    loadBgmFiles() {
        
        // bgmがオブジェクト形式なら各用途ごとにロード
        if (this.mapConfig.bgm && typeof this.mapConfig.bgm === 'object') {
            Object.keys(this.mapConfig.bgm).forEach(bgmKey => {
                this.load.audio(`bgm_${bgmKey}`, this.mapConfig.bgm[bgmKey]);
            });
        }
        
        // マップ固有のイベントBGMがあれば読み込み
        if (this.mapConfig.eventBgm) {
            Object.keys(this.mapConfig.eventBgm).forEach(eventKey => {
                this.load.audio(`bgm_event_${eventKey}`, this.mapConfig.eventBgm[eventKey]);
            });
        }
    }

    create() {
        try {
            // モバイルデバイスの検出
            this.isMobile = this.sys.game.device.input.touch;
            
            // カメラマネージャーを先に初期化
            this.cameraManager = new CameraManager(this);
            this.cameraManager.setBackgroundColor('#87CEEB');
            
            // マップマネージャーを初期化
            this.mapManager = new MapManager(this);
            this.mapManager.createMap(this.mapConfig.mapKey, this.mapConfig.tilesetKey);
            
            // 初期スケールを全体表示に設定（カメラ設定より先に実行）
            this.mapManager.scaleMapToScreen();
            
            // カメラ設定
            this.cameraManager.setupCamera(this.mapManager.getMapSize());
            
            // エリア選択システムを初期化
            this.areaSelectionManager = new AreaSelectionManager(this);
            // 視覚的フィードバックマネージャーを初期化
            this.visualFeedbackManager = new VisualFeedbackManager(this);
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
            this.uiManager.createBackButton(this); // 右上の戻るボタンを追加
            
            // スケール切り替えボタンを追加
            this.createScaleToggleButton();
            
            // AudioManagerを初期化
            this.audioManager = new AudioManager(this);
            this.audioManager.playBgm('bgm_map', 0.3);
            // リサイズイベントを設定
            this.scale.on('resize', this.handleResize, this);
            // シーンシャットダウン時のクリーンアップ登録
            this.events.on('shutdown', this.shutdown, this);
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
        
        // スマホ向けスクロール機能を追加
        this.cameraManager.setupScrollControls();
        this.cameraManager.setupPinchZoom();
    }

    handleTouch(pointer) {
        try {
            // カメラの存在確認
            if (!this.cameras || !this.cameras.main) {
                console.error(`${this.mapConfig.mapTitle}: Camera not available`);
                return;
            }
            // ワールド座標に変換
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const worldX = worldPoint.x;
            const worldY = worldPoint.y;
            // エリアマネージャーに座標を渡す
            if (this.areaSelectionManager) {
                this.areaSelectionManager.handleTouchAt(worldX, worldY);
            }
            // 視覚的フィードバック
            if (this.visualFeedbackManager) {
                this.visualFeedbackManager.showTouchRipple(worldX, worldY);
            }
        } catch (error) {
            console.error(`${this.mapConfig.mapTitle}: Error in handleTouch:`, error);
        }
    }

    createScaleToggleButton() {
        // スケール切り替えボタンを作成（画面座標で固定）
        const button = this.add.text(10, 50, '拡大', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#666666',
            padding: { x: 15, y: 8 }
        });
        
        // ボタンをカメラに固定（画面座標で表示）
        button.setScrollFactor(0);
        
        button.setInteractive();
        button.on('pointerdown', () => {
            this.cameraManager.toggleMapScale();
            
            // ボタンテキストを更新
            const currentScale = this.cameraManager.scene.mapManager?.mapScaleX || this.cameraManager.currentScale;
            if (currentScale === 1.5) {
                button.setText('全体マップ表示');
            } else {
                button.setText('拡大');
            }
        });
        
        // 初期テキストを設定（全体表示から開始）
        button.setText('拡大');
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
                
                // エリア情報を再取得（extractAreaDataは呼ばず、既存のareasを使用）
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
        this.shutdown();
        super.destroy();
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