import { AreaSelectionManager } from '../managers/AreaSelectionManager.js';
import { UIManager } from '../managers/UIManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { MapManager } from '../managers/MapManager.js';
import { CameraManager } from '../managers/CameraManager.js';
import { AreaConfig } from '../config/AreaConfig.js';
import { VisualFeedbackManager } from '../managers/VisualFeedbackManager.js';
import { ConversationTrigger } from '../managers/ConversationTrigger.js';
import { ConversationScene } from '../managers/ConversationScene.js';

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
        
        // 拡大ボタンの参照を保持
        this.scaleToggleButton = null;
        this.scaleToggleButtonGraphics = null;
    }

    preload() {
        // 設定ファイルから動的にアセットを読み込み
        // taketastageの場合はtaketaフォルダを使用
        const folderName = this.mapId === 'taketastage' ? 'taketa' : this.mapId;
        
        // 竹田ステージの場合はファイル名も調整
        const mapFileName = this.mapId === 'taketastage' ? 'taketa' : this.mapConfig.mapKey;
        
        this.load.tilemapTiledJSON(this.mapConfig.mapKey, `assets/maps/${folderName}/${mapFileName}.tmj`);
        this.load.image(this.mapConfig.tilesetKey, `assets/maps/${folderName}/${this.mapConfig.tilesetKey}.png`);
        
        // デバッグ用：読み込みエラーを詳細にログ出力
        this.load.on('fileerror', (file) => {
            console.error(`File not found: ${file.key}, path: ${file.url}`);
        });
        
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
            
            // 竹田ステージと三重町ステージの場合は会話システムを初期化
            if (this.mapConfig.mapKey === 'taketa' || this.mapConfig.mapKey === 'bunngo_mie_city') {
                this.conversationTrigger = new ConversationTrigger(this);
                // ConversationSceneを動的に追加
                this.scene.add('ConversationScene', ConversationScene);
            }
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
            
            // UI要素を作成
            this.uiManager = new UIManager();
            this.uiManager.createMapUI(this, this.mapConfig.mapTitle);
            
            // 少し遅延を入れてから戻るボタンを作成（シーンの初期化完了を待つ）
            this.time.delayedCall(100, () => {
                try {
                    this.uiManager.createBackButton(this); // 右上の戻るボタンを追加
                    console.log('[MapSelectionStage] 戻るボタンを作成しました');
                } catch (error) {
                    console.error('[MapSelectionStage] 戻るボタンの作成に失敗:', error);
                }
            });
            
            // タッチイベントを設定
            this.setupTouchEvents();
            
            // スケール切り替えボタンを追加
            this.createScaleToggleButton();
            
            // AudioManagerを初期化（シーンの初期化完了を待つ）
            this.time.delayedCall(200, () => {
                try {
                    this.audioManager = new AudioManager(this);
                    this.audioManager.playBgm('bgm_map', 0.3);
                    console.log('[MapSelectionStage] AudioManagerを初期化しました');
                } catch (error) {
                    console.error('[MapSelectionStage] AudioManagerの初期化に失敗:', error);
                }
            });
            // リサイズイベントを設定
            this.scale.on('resize', this.handleResize, this);
            // シーンシャットダウン時のクリーンアップ登録
            this.events.on('shutdown', this.shutdown, this);
            // デバッグ: childrenリストを詳細に出力
            console.log('Phaser children list:');
            this.children.list.forEach((child, i) => {
              console.log(
                `#${i}: type=${child.type}, x=${child.x}, y=${child.y}, width=${child.width}, height=${child.height}, fillColor=${child.fillColor}, visible=${child.visible}, name=${child.name || ''}`
              );
              // Graphicsオブジェクトの詳細情報を出力
              if (child.type === 'Graphics') {
                console.log(`  Graphics #${i} details:`, child);
              }
              // 画面中央下部付近のオブジェクトを特定
              if (child.x >= 400 && child.x <= 500 && child.y >= 400 && child.y <= 600) {
                console.log(`  *** CENTRAL BOTTOM AREA OBJECT #${i}:`, child);
              }
            });
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
        // 既存のボタンを削除
        if (this.scaleToggleButton) {
            this.scaleToggleButton.destroy();
            this.scaleToggleButton = null;
        }
        if (this.scaleToggleButtonGraphics) {
            this.scaleToggleButtonGraphics.destroy();
            this.scaleToggleButtonGraphics = null;
        }
        
        // 現代風な背景を作成
        const buttonGraphics = this.add.graphics();
        this.scaleToggleButtonGraphics = buttonGraphics;
        
        // ボタンの位置とサイズを定義
        const buttonX = 2.5;
        const buttonY = 38;
        const buttonHeight = 30;
        
        // 背景を動的に描画する関数
        const drawBackground = (text, isHover = false) => {
            buttonGraphics.clear();
            
            // テキストの長さに応じて幅を調整
            const baseWidth = 43;
            const extraWidth = text.length > 2 ? (text.length - 2) * 15 + 5 : 0;
            const totalWidth = baseWidth + extraWidth;
            
            const shadowColor = isHover ? 0x000000 : 0x000000;
            const shadowAlpha = isHover ? 0.4 : 0.3;
            const bgColor = isHover ? 0x3a3a3a : 0x2a2a2a;
            const bgAlpha = isHover ? 0.98 : 0.95;
            const glossAlpha = isHover ? 0.15 : 0.1;
            
            // 影を描画
            buttonGraphics.fillStyle(shadowColor, shadowAlpha);
            buttonGraphics.fillRoundedRect(buttonX + 2, buttonY + 2, totalWidth, buttonHeight, 8);
            
            // メイン背景を描画
            buttonGraphics.fillStyle(bgColor, bgAlpha);
            buttonGraphics.fillRoundedRect(buttonX, buttonY, totalWidth, buttonHeight, 8);
            
            // 光沢効果（上部）
            buttonGraphics.fillStyle(0xffffff, glossAlpha);
            buttonGraphics.fillRoundedRect(buttonX, buttonY, totalWidth, buttonHeight / 2, 8);
        };
        
        // 初期背景を描画
        drawBackground('拡大');
        
        buttonGraphics.setScrollFactor(0);
        buttonGraphics.setDepth(1000);
        
        // スケール切り替えボタンを作成（画面座標で固定）
        const button = this.add.text(buttonX + 5, buttonY + 5, '拡大', {
            fontSize: '16px',
            fill: '#ffffff',
            fontWeight: 'bold',
            fontFamily: 'Arial'
        });
        
        // ボタンの参照を保存
        this.scaleToggleButton = button;
        
        // ボタンをカメラに固定（画面座標で表示）
        button.setScrollFactor(0);
        button.setDepth(1002);
        
        button.setInteractive();
        button.on('pointerdown', () => {
            this.cameraManager.toggleMapScale();
            
            // ボタンテキストを更新
            const currentScale = this.cameraManager.scene.mapManager?.mapScaleX || this.cameraManager.currentScale;
            if (currentScale === 1.5) {
                button.setText('全体マップ表示');
                drawBackground('全体マップ表示');
            } else {
                button.setText('拡大');
                drawBackground('拡大');
            }
        });
        
        // ホバー効果
        button.on('pointerover', () => {
            const currentText = button.text;
            drawBackground(currentText, true);
        });
        
        button.on('pointerout', () => {
            const currentText = button.text;
            drawBackground(currentText, false);
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
            
            // 拡大ボタンを再作成（リサイズ時に位置を調整）
            this.createScaleToggleButton();
            
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
        // AudioManagerの完全なクリーンアップ
        if (this.audioManager) {
            this.audioManager.stopAll();
            this.audioManager.destroy();
            this.audioManager = null;
        }
        
        // 他のマネージャーのクリーンアップ
        if (this.mapManager) {
            this.mapManager.destroy();
            this.mapManager = null;
        }
        
        if (this.areaSelectionManager) {
            this.areaSelectionManager.destroy();
            this.areaSelectionManager = null;
        }
        
        if (this.uiManager) {
            this.uiManager.destroy();
            this.uiManager = null;
        }
        
        if (this.cameraManager) {
            this.cameraManager.destroy();
            this.cameraManager = null;
        }
        
        if (this.visualFeedbackManager) {
            this.visualFeedbackManager.destroy();
            this.visualFeedbackManager = null;
        }
        
        if (this.conversationTrigger) {
            this.conversationTrigger.destroy();
            this.conversationTrigger = null;
        }
        
        // 拡大ボタンのクリーンアップ
        if (this.scaleToggleButton) {
            this.scaleToggleButton.destroy();
            this.scaleToggleButton = null;
        }
        if (this.scaleToggleButtonGraphics) {
            this.scaleToggleButtonGraphics.destroy();
            this.scaleToggleButtonGraphics = null;
        }
        
        // グローバルな音声システムもクリーンアップ
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