import { VisualFeedbackManager } from './VisualFeedbackManager.js';
import { taketaConversationData } from '../data/taketa/conversationData.js';
import { miemachiConversationData } from '../data/miemachi/conversationData.js';

export class AreaSelectionManager {
    constructor(scene) {
        this.scene = scene;
        this.areas = [];
        this.areaSprites = [];
        this.selectedArea = null;
        
        // インタラクション設定
        this.isInteractive = true;
        this.hoverEffect = null;
        
        // スマホ対応
        this.isMobile = this.scene.sys.game.device.input.touch;
        this.touchStartTime = 0;
        this.touchThreshold = 200; // タップ判定の閾値（ミリ秒）

        this.visualFeedback = new VisualFeedbackManager(scene);
        
        // 確認ダイアログの重複表示を防ぐためのフラグ
        this.isConfirmDialogActive = false;
        this.currentDialog = null;
    }

    setupAreas(areas) {
        // 既存のマーカーを完全に削除
        this.destroy();
        
        // スケール済みのエリアデータを直接使用
        if (areas && Array.isArray(areas)) {
            this.areas = areas.map(area => ({
                ...area,
                description: this.getAreaDescription(area.name)
            }));
            console.log('[DEBUG] setupAreas - areas:', this.areas);
        } else {
            this.areas = [];
        }
        
        // エリアマーカーを作成
        this.createAreaMarkers();
        
        // インタラクションイベントを設定
        this.setupInteractionEvents();
        

    }



    getAreaDescription(areaName) {
        // エリアの説明を取得
        const descriptions = {
            'Traial': 'トライアル',
            'Flash_land_mie': 'フラッシュランド三重',
            'oreno_koto': '俺のこと',
            'momoiro_jyogakuenn': '桃色女学院',
            'drinking_dutu': 'づつ',
            'Weeds_burn': '雑草がもえるぅぅ',
            'mie_high_school': '三重中学校',
            'raizu': 'ライズ',
            'dole': 'ドール',
            'souce': 'ソース',
            'koutaroupoteto': 'こうたろうポテト',
            // 竹田ステージのエリア説明
            'taketa_station': '竹田駅',
            'taketa_high_school': '竹田高校',
            'galaxy_water': '銀河の水',
            'udefuriojisann': 'ウデフリオジサン'
        };
        
        return descriptions[areaName] || areaName;
    }

    createAreaMarkers() {
        // 既存のマーカーをクリア
        this.areaSprites = [];
        
        console.log(`AreaSelectionManager: Creating markers for ${this.areas ? this.areas.length : 0} areas`);
        
        if (!this.areas || this.areas.length === 0) {
            console.warn('AreaSelectionManager: No areas available for marker creation');
            return;
        }
        
        // エリアマーカーを作成
                this.areas.forEach((area, index) => {
            if (area) {
                console.log(`AreaSelectionManager: Creating marker ${index + 1} for area ${area.name} at (${area.x}, ${area.y})`);
                const marker = this.createAreaMarker(area);
                if (marker) {
                    this.areaSprites.push(marker);
                }
            }
        });
        
        console.log(`AreaSelectionManager: Created ${this.areaSprites.length} markers`);
    }

    createAreaMarker(area) {
        // エリアマーカーを作成
        const marker = this.scene.add.container(0, 0);
        
        // マーカーに一意のIDを設定
        marker.setData('markerType', 'areaMarker');
        marker.setData('areaName', area.name);
        
        // 現在のスケールを取得
        const currentScale = this.scene.mapManager?.mapScaleX || 1;
        
        // スケールに応じてフォントサイズを調整
        const minFontSize = 10; // 最小フォントサイズ
        const fontSize = Math.max(minFontSize, Math.floor(10 * currentScale)) + 'px';
        const labelOffset = Math.max(15, 15 * currentScale);
        
        // オブジェクトの実際の範囲を取得
        const objectWidth = area.width || 100;
        const objectHeight = area.height || 100;
        const objectX = area.x;
        const objectY = area.y;
        const isEllipse = area.ellipse || false;
        const rotation = area.rotation || 0;
        

        
        // オブジェクトの回転を考慮した中心座標を計算
        // Tiledのオブジェクトは、x, yが回転前の左上座標。
        // 回転の中心をオブジェクトの中心にするために、回転後の中心座標を計算する。
        const unrotatedCenterX = objectX + objectWidth / 2;
        const unrotatedCenterY = objectY + objectHeight / 2;

        let rotatedCenterX = unrotatedCenterX;
        let rotatedCenterY = unrotatedCenterY;

        if (rotation !== 0) {
            const angleRad = rotation * Math.PI / 180;
            // 回転の中心はTiledのオブジェクトの原点 (objectX, objectY)
            // unrotatedCenterX, unrotatedCenterY を (objectX, objectY) を中心に回転させる
            const tempX = unrotatedCenterX - objectX;
            const tempY = unrotatedCenterY - objectY;

            rotatedCenterX = objectX + (tempX * Math.cos(angleRad) - tempY * Math.sin(angleRad));
            rotatedCenterY = objectY + (tempX * Math.sin(angleRad) + tempY * Math.cos(angleRad));
        }

        // 背景形状（オブジェクトの実際の範囲と形状に合わせる）
        let background;
        if (isEllipse) {
            // 楕円形オブジェクト - より透明にして光らせる
            background = this.scene.add.ellipse(rotatedCenterX, rotatedCenterY, objectWidth, objectHeight, 0x4169E1, 0.1);
        } else {
            // 矩形オブジェクト - より透明にして光らせる
            background = this.scene.add.rectangle(rotatedCenterX, rotatedCenterY, objectWidth, objectHeight, 0x4169E1, 0.1);
        }
        // 白い輪を削除
        // background.setStrokeStyle(2 * currentScale, 0xFFFFFF);
        background.setData('markerType', 'areaMarker');
        background.setData('areaName', area.name);
        
        // Phaserオブジェクトの原点を中心に設定し、回転を適用
        background.setOrigin(0.5, 0.5);
        if (rotation !== 0) {
            background.setRotation(rotation * Math.PI / 180);
        }
        
        // 淡く光らせるエフェクトを追加
        this.scene.tweens.add({
            targets: background,
            alpha: 0.3,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // テキストラベル（矩形の上部に配置）
        const label = this.scene.add.text(objectX + objectWidth/2, objectY - labelOffset, area.description, {
            fontSize: fontSize,
            fill: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 3 * currentScale, y: 1 * currentScale },
            borderRadius: 2 * currentScale
        });
        label.setOrigin(0.5, 0.5);
        label.setData('markerType', 'areaMarker');
        label.setData('areaName', area.name);
        
        // マーカーコンテナに追加
        marker.add(background);
        marker.add(label);
        
        // インタラクティブ設定
        background.setInteractive();
        background.setData('area', area);
        
        // ホバーエフェクト
        this.setupMarkerHover(background, label);
        
        // クリック/タップイベント
        this.setupMarkerClick(background);
        

        
        return marker;
    }

    setupMarkerHover(background, label) {
        // ホバーエフェクト
        background.on('pointerover', () => {
            if (!this.isMobile) {
                this.visualFeedback.showButtonHover(background, 1.2, 0xFFD700, 0.3);
                label.setStyle({ fill: '#FF0000' });
            }
        });
        
        background.on('pointerout', () => {
            if (!this.isMobile) {
                this.visualFeedback.resetButtonState(background, 1, 0x4169E1, 0.1);
                label.setStyle({ fill: '#000000' });
            }
        });
    }

    setupMarkerClick(background) {
        // クリック/タップイベント
        background.on('pointerdown', () => {
            // 確認ダイアログが表示されている場合は何もしない
            if (this.isConfirmDialogActive) {
                return;
            }
            
            if (this.isMobile) {
                this.touchStartTime = Date.now();
            }
            
            // 他のオブジェクトの色を戻す
            this.resetAllObjectColors();
            
            // オブジェクト自体を赤くする
            background.setFillStyle(0xFF0000, 0.7);
            
            // 赤く広がるエフェクトを表示（オブジェクトサイズから開始）
            const area = background.getData('area');
            const centerX = area.x + (area.width || 100) / 2;
            const centerY = area.y + (area.height || 100) / 2;
            this.visualFeedback.showObjectRipple(centerX, centerY, area.width || 100, area.height || 100, 0xFF0000);
        });
        
        background.on('pointerup', () => {
            // 確認ダイアログが表示されている場合は何もしない
            if (this.isConfirmDialogActive) {
                return;
            }
            
            const area = background.getData('area');
            
            if (this.isMobile) {
                const touchDuration = Date.now() - this.touchStartTime;
                if (touchDuration < this.touchThreshold) {
                    this.selectArea(area);
                }
            } else {
                this.selectArea(area);
            }
        });
    }

    setupInteractionEvents() {
        // 全体的なインタラクションイベントを設定
        this.scene.input.on('pointerdown', (pointer) => {
            // タップ位置の記録
            this.lastTapX = pointer.x;
            this.lastTapY = pointer.y;
        });
        
        this.scene.input.on('pointerup', (pointer) => {
            // タップ位置の変化をチェック（ドラッグ判定）
            const deltaX = Math.abs(pointer.x - this.lastTapX);
            const deltaY = Math.abs(pointer.y - this.lastTapY);
            
            if (deltaX > 10 || deltaY > 10) {
                // ドラッグと判定
                return;
            }
        });
    }

    selectArea(area) {
        try {
            if (!this.isInteractive) {
                return;
            }
            
            // 確認ダイアログが既に表示されている場合は何もしない
            if (this.isConfirmDialogActive) {
                return;
            }
            
            // 選択されたエリアを記録
            this.selectedArea = area;
            
            // 選択エフェクトを表示（確認ダイアログを含む）
            this.showSelectionEffect(area);
            
            // 音効果を再生
            this.playSelectionSound();
            
        } catch (error) {
            // エラーハンドリング
        }
    }

    showSelectionEffect(area) {
        // 選択エフェクトを表示（エフェクト削除）
        // this.visualFeedback.showSelectionEffect(area.x, area.y);
        // 確認ダイアログを表示
        this.showConfirmDialog(area);
    }

    // 全てのオブジェクトの色を戻す
    resetAllObjectColors() {
        this.areaSprites.forEach(marker => {
            // マーカーコンテナ内の背景オブジェクトを取得
            const background = marker.getAt(0); // 最初の要素（背景）
            if (background && background.setFillStyle) {
                background.setFillStyle(0x4169E1, 0.1);
            }
        });
    }

    // 選択されたオブジェクトの色を戻す
    resetSelectedObjectColor() {
        if (this.selectedArea) {
            // 選択されたエリアのマーカーを見つけて色を戻す
            this.areaSprites.forEach(marker => {
                // マーカーコンテナ内の背景オブジェクトを取得
                const background = marker.getAt(0); // 最初の要素（背景）
                if (background && background.setFillStyle) {
                    const backgroundArea = background.getData('area');
                    if (backgroundArea && backgroundArea.name === this.selectedArea.name) {
                        background.setFillStyle(0x4169E1, 0.1);
                    }
                }
            });
        }
    }

    showConfirmDialog(area) {
        // 既にダイアログが表示されている場合は何もしない
        if (this.isConfirmDialogActive) {
            return;
        }
        
        // ダイアログ表示フラグを設定
        this.isConfirmDialogActive = true;
        
        // 確認ダイアログを表示
        const dialog = this.scene.add.container(
            this.scene.cameras.main.worldView.centerX,
            this.scene.cameras.main.worldView.centerY
        );
        
        // 現在のダイアログを保存
        this.currentDialog = dialog;
        
        // 背景
        const background = this.scene.add.rectangle(0, 0, 300, 150, 0x000000, 0.8);
        background.setStrokeStyle(2, 0xFFFFFF);
        
        // テキスト
        const title = this.scene.add.text(0, -40, area.description, {
            fontSize: '18px',
            fill: '#FFFFFF',
            align: 'center'
        });
        title.setOrigin(0.5);
        
        const message = this.scene.add.text(0, -10, 'この場所に移動しますか？', {
            fontSize: '14px',
            fill: '#FFFFFF',
            align: 'center'
        });
        message.setOrigin(0.5);
        
        // ボタン
        const yesButton = this.scene.add.text(-60, 30, 'はい', {
            fontSize: '16px',
            fill: '#00FF00',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        });
        yesButton.setOrigin(0.5);
        yesButton.setInteractive();
        
        const noButton = this.scene.add.text(60, 30, 'いいえ', {
            fontSize: '16px',
            fill: '#FF0000',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        });
        noButton.setOrigin(0.5);
        noButton.setInteractive();
        
        // ダイアログにアイテムを追加
        dialog.add([background, title, message, yesButton, noButton]);
        
        // ダイアログを閉じる共通関数
        const closeDialog = () => {
            if (dialog.active) {
                dialog.destroy();
            }
            this.isConfirmDialogActive = false;
            this.currentDialog = null;
            // 選択されたオブジェクトの色を戻す（確認画面のボタンクリック時のみ）
            this.resetSelectedObjectColor();
        };
        
        // ボタンイベント
        yesButton.on('pointerdown', () => {
            closeDialog();
            this.handleAreaSelection(area);
        });
        
        noButton.on('pointerdown', () => {
            closeDialog();
        });
        
        // 自動的にダイアログを閉じる
        this.scene.time.delayedCall(5000, () => {
            if (dialog.active) {
                closeDialog();
            }
        });
    }

    handleAreaSelection(area) {
        // エリア選択後の処理
        
        // 竹田ステージと三重町ステージの会話イベントをチェック（NPCクリック時と同じ会話システムを使用）
        if (this.scene.mapConfig && this.scene.mapConfig.mapKey === 'taketa_city') {
            this.handleTaketaConversation(area);
        } else if (this.scene.mapConfig && this.scene.mapConfig.mapKey === 'bunngo_mie_city') {
            this.handleMiemachiConversation(area);
        } else {
            // 従来の処理（他のマップ用）
            this.scene.time.delayedCall(1000, () => {
                this.navigateToArea(area);
            });
        }
    }

    handleTaketaConversation(area) {
        // 竹田ステージの会話イベントを処理
        let eventId = null;
        
        // エリアのconversationIdを確認
        if (area.conversationId && area.conversationId !== null) {
            eventId = area.conversationId;
        } else {
            // エリア名に基づいて会話イベントを決定（フォールバック）
            switch (area.name) {
                case 'taketa_station':
                    eventId = 'taketa_station';
                    break;

                case 'galaxy_water':
                    eventId = 'ginnga_water';
                    break;
                case 'udefuriojisann':
                    eventId = 'arm_swinging_person';
                    break;
                default:
                    // 会話イベントがない場合は通常の移動
                    this.scene.time.delayedCall(1000, () => {
                        this.navigateToArea(area);
                    });
                    return;
            }
        }
        
        // 会話データを取得（汎用化）
        const currentMapId = this.scene.mapConfig?.mapKey || 'unknown';
        const conversationData = this.getConversationData(currentMapId, eventId);
        
        console.log('[DEBUG] handleTaketaConversation - conversationData:', conversationData);
        console.log('[DEBUG] handleTaketaConversation - this.scene.conversationTrigger:', this.scene.conversationTrigger);
        
        if (conversationData) {
            // 会話システムを開始（NPCクリック時と同じ方法）
            if (this.scene.conversationTrigger) {
                console.log('[DEBUG] startVisualNovelConversation を呼び出します');
                this.scene.conversationTrigger.startVisualNovelConversation(conversationData);
            } else {
                console.log('[ERROR] conversationTrigger が存在しません');
            }
        } else {
            console.log('[DEBUG] conversationData が見つかりませんでした');
            // 会話データがない場合は通常の移動
            this.scene.time.delayedCall(1000, () => {
                this.navigateToArea(area);
            });
        }
    }

    handleMiemachiConversation(area) {
        // 三重町ステージの会話イベントを処理
        let eventId = null;
        
        // エリアのconversationIdを確認
        if (area.conversationId && area.conversationId !== null) {
            eventId = area.conversationId;
        } else {
            // エリア名に基づいて会話イベントを決定（フォールバック）
            switch (area.name) {
                case 'oreno_koto':
                    eventId = 'oreno_koto';
                    break;
                case 'raizu':
                    eventId = 'shigaku';
                    break;
                case 'souce':
                    eventId = 'team_shoyu_drinking';
                    break;
                case 'Weeds_burn':
                    eventId = 'river_fire';
                    break;
                case 'koutaroupoteto':
                    eventId = 'koutarou_potato';
                    break;
                case 'drinking_dutu':
                    eventId = 'drink_zutsu';
                    break;
                case 'dole':
                    eventId = 'doll';
                    break;
                case 'momoiro_jyogakuenn':
                    eventId = 'annex_momo';
                    break;
                default:
                    // 会話イベントがない場合は通常の移動
                    this.scene.time.delayedCall(1000, () => {
                        this.navigateToArea(area);
                    });
                    return;
            }
        }
        
        // 会話データを取得（汎用化）
        const currentMapId = this.scene.mapConfig?.mapKey || 'unknown';
        const conversationData = this.getConversationData(currentMapId, eventId);
        
        if (conversationData) {
            // 会話システムを開始（NPCクリック時と同じ方法）
            if (this.scene.conversationTrigger) {
                this.scene.conversationTrigger.startVisualNovelConversation(conversationData);
            }
        } else {
            // 会話データがない場合は通常の移動
            this.scene.time.delayedCall(1000, () => {
                this.navigateToArea(area);
            });
        }
    }

    // 汎用的な会話データ取得関数
    getConversationData(mapId, eventId) {
        console.log('[DEBUG] getConversationData called with mapId:', mapId, 'eventId:', eventId);
        // マップIDに基づいて適切な会話データを取得
        let result;
        switch (mapId) {
            case 'bunngo_mie_city':
                result = miemachiConversationData[eventId];
                break;
            case 'taketa_city':
                result = taketaConversationData[eventId];
                break;
            default:
                // デフォルトの会話データを返す
                result = miemachiConversationData[eventId] || taketaConversationData[eventId];
        }
        console.log('[DEBUG] getConversationData result:', result);
        return result;
    }

    navigateToArea(area) {
        // 選択した場所に応じて次のマップまたはシーンに移動
        console.log('[DEBUG] navigateToArea called with area:', area);
        console.log('[DEBUG] area.scene:', area.scene);
        console.log('[DEBUG] area.sceneParam:', area.sceneParam);
        
        // エリアオブジェクトがsceneプロパティを持っている場合
        if (area.scene) {
            // startPhaserGameの場合は特別な処理
            if (area.scene === 'startPhaserGame') {
                // 現在のマップIDを動的に取得して記憶
                const currentMapId = this.scene.mapConfig?.mapKey || 'unknown';
                const stageNumber = area.sceneParam || 1;
                
                // 現在のマップに戻るための関数を設定（汎用化）
                window.returnToMap = () => {
                    console.log('[returnToMap] マップに戻る処理を開始:', currentMapId);
                    console.log('[returnToMap] 現在のマップID:', currentMapId);
                    
                    // 現在のシーンを停止してから指定されたマップを開始
                    if (window.game && window.game.scene) {
                        // すべてのシーンを停止して削除
                        window.game.scene.scenes.forEach(scene => {
                            if (scene && scene.scene) {
                                // AudioManagerの完全なクリーンアップ
                                if (scene.audioManager) {
                                    try {
                                        scene.audioManager.stopAll();
                                        scene.audioManager.destroy();
                                    } catch (error) {
                                        console.warn('[returnToMap] AudioManager cleanup error:', error);
                                    }
                                    scene.audioManager = null;
                                }
                                
                                // イベントリスナーの削除
                                if (scene.events) {
                                    scene.events.removeAllListeners();
                                }
                                
                                // シーンのshutdownメソッドを呼び出し
                                if (scene.shutdown) {
                                    scene.shutdown();
                                }
                                
                                if (scene.scene.isActive()) {
                                    scene.scene.stop();
                                }
                                scene.scene.remove();
                            }
                        });
                        
                        // グローバルな音声システムもクリーンアップ
                        if (window.game.sound) {
                            try {
                                window.game.sound.stopAll();
                                // 音声キャッシュをクリア
                                window.game.sound.removeAll();
                            } catch (error) {
                                console.warn('[returnToMap] Global sound cleanup error:', error);
                            }
                        }
                    }
                    
                    // ゲームインスタンスを完全に再初期化
                    if (window.game) {
                        window.game.destroy(true);
                        window.game = null;
                    }
                    if (window.gameInstance) {
                        window.gameInstance = null;
                    }
                    
                    // 少し遅延を入れてからマップを開始（クリーンアップ完了を待つ）
                    setTimeout(() => {
                        import('../gameController.js').then(({ startPhaserGame }) => {
                            console.log('[returnToMap] startPhaserGameを呼び出します:', currentMapId);
                            startPhaserGame(currentMapId);
                            console.log('[returnToMap] マップに戻る処理が完了しました');
                            
                            // マップ開始直後にreturnToStageSelect関数を強制設定
                            setTimeout(() => {
                                // 強制的にreturnToStageSelect関数を設定
                                window.returnToStageSelect = function() {
                                    // ゲームのクリーンアップ
                                    if (window.game) {
                                        window.game.destroy(true);
                                        window.game = null;
                                    }
                                    if (window.gameInstance) {
                                        window.gameInstance = null;
                                    }
                                    
                                    // ステージ選択画面を表示
                                    const stageSelect = document.getElementById('stage-select');
                                    const gameContainer = document.getElementById('game-container');
                                    
                                    if (stageSelect) {
                                        stageSelect.style.display = 'block';
                                    }
                                    
                                    if (gameContainer) {
                                        gameContainer.style.display = 'none';
                                    }
                                    
                                    // グローバル関数をクリア（returnToMapもクリア）
                                    window.returnToStageSelect = null;
                                    window.returnToMap = null;
                                };
                                
                            }, 500);
                            
                            // マップ開始後、ステージ選択画面に戻る機能を復活
                            setTimeout(() => {
                                // ステージ選択画面に戻る機能を再設定
                                if (typeof window.returnToStageSelect === 'undefined') {
                                    // stageSelect.jsを動的に読み込んで関数を復活
                                    import('../stageSelect.js').then(() => {
                                    });
                                }
                                
                                // より確実にステージ選択画面に戻る機能を再定義
                                window.returnToStageSelect = function() {
                                    try {
                                        if (window.game && window.game.destroy) {
                                            // すべてのシーンのAudioManagerをクリーンアップ
                                            if (window.game.scene) {
                                                window.game.scene.scenes.forEach(scene => {
                                                    if (scene && scene.audioManager) {
                                                        try {
                                                            scene.audioManager.stopAll();
                                                            scene.audioManager.destroy();
                                                        } catch (error) {
                                                            console.warn('[returnToStageSelect] AudioManager cleanup error:', error);
                                                        }
                                                        scene.audioManager = null;
                                                    }
                                                    
                                                    // イベントリスナーの削除
                                                    if (scene.events) {
                                                        scene.events.removeAllListeners();
                                                    }
                                                    
                                                    // シーンのshutdownメソッドを呼び出し
                                                    if (scene.shutdown) {
                                                        scene.shutdown();
                                                    }
                                                });
                                            }
                                            
                                            // グローバルな音声システムをクリーンアップ
                                            if (window.game.sound) {
                                                try {
                                                    window.game.sound.stopAll();
                                                    window.game.sound.removeAll();
                                                } catch (error) {
                                                    console.warn('[returnToStageSelect] Global sound cleanup error:', error);
                                                }
                                            }
                                            
                                            window.game.destroy(true);
                                            window.game = null;
                                            if (typeof window.gameInstance !== 'undefined') {
                                                window.gameInstance = null;
                                            }
                                        }
                                        
                                        // ステージ選択画面を表示
                                        const stageSelect = document.getElementById('stage-select');
                                        const gameContainer = document.getElementById('game-container');
                                        
                                        if (stageSelect) {
                                            stageSelect.style.display = 'block';
                                        } else {
                                            // フォールバック: 手動でステージ選択画面を表示
                                            const stageSelectFallback = document.getElementById('stage-select');
                                            const gameContainerFallback = document.getElementById('game-container');
                                            if (stageSelectFallback) {
                                                stageSelectFallback.style.display = 'block';
                                            }
                                            if (gameContainerFallback) {
                                                gameContainerFallback.style.display = 'none';
                                            }
                                        }
                                        
                                        if (gameContainer) {
                                            gameContainer.style.display = 'none';
                                        }
                                        
                                    } catch (error) {
                                        // エラーハンドリング
                                    }
                                };
                                
                            }, 1000);
                            
                        });
                    }, 100);
                };
                
                // 現在のシーン（マップ）を停止してからステージを開始
                console.log(`ステージ${stageNumber}を開始します... (マップ: ${currentMapId})`);
                console.log('area:', area);
                
                // ステージに移動する前に、現在のマップのConversationSceneを削除
                if (this.scene.scene.get('ConversationScene')) {
                    this.scene.scene.remove('ConversationScene');
                }
                
                this.scene.scene.stop();
                // ステージを直接開始
                import('../gameController.js').then(({ startPhaserGame }) => {
                    console.log('[DEBUG] startPhaserGameを呼び出します:', stageNumber);
                    console.log('[DEBUG] area:', area);
                    console.log('[DEBUG] area.sceneParam:', area.sceneParam);
                    startPhaserGame(stageNumber);
                });
                
            } else {
                // その他のシーンへの移動
                console.log('[DEBUG] その他のシーンへの移動:', area.scene);
                import('../gameController.js').then(({ startPhaserGame }) => {
                    console.log('[DEBUG] startPhaserGameを呼び出します:', area.scene);
                    startPhaserGame(area.scene);
                });
            }
        } else {
            // sceneプロパティがない場合は通常の移動処理
            this.scene.time.delayedCall(1000, () => {
                // デフォルトの移動処理
            });
        }
    }

    playSelectionSound() {
        // 選択音を再生
        try {
            if (this.scene.audioManager) {
                this.scene.audioManager.playSe('se_touch', 0.5);
            }
        } catch (error) {
            // 音声ファイルが見つからない場合は無視
        }
    }

    enableInteraction() {
        this.isInteractive = true;
    }

    disableInteraction() {
        this.isInteractive = false;
    }

    update() {
        // フレームごとの更新処理
        // 必要に応じて追加
    }

    // タッチイベントを処理
    handleTouchAt(worldX, worldY) {
        try {
            // タッチ位置に近いエリアを検索
            const touchedArea = this.findAreaAtPosition(worldX, worldY);
            
            if (touchedArea) {
                this.selectArea(touchedArea);
            } else {
                // 背景タッチ時のSE再生
                if (this.scene.audioManager && this.scene.mapConfig?.se?.map_touch) {
                    this.scene.audioManager.playSe('se_map_touch', 0.3);
                }
            }
            
        } catch (error) {
            console.error('AreaSelectionManager: Error in handleTouchAt:', error);
        }
    }
    
    // 指定された座標に近いエリアを検索
    findAreaAtPosition(worldX, worldY) {
        const tapRadius = 20; // タップ判定の半径（青い丸のサイズ10+余裕10）
        
        for (let area of this.areas) {
            const distance = Math.sqrt(
                Math.pow(worldX - area.x, 2) + Math.pow(worldY - area.y, 2)
            );
            
            if (distance <= tapRadius) {
                return area;
            }
        }
        
        return null;
    }
    
    // エリアリストを取得
    getAreas() {
        return this.areas;
    }
    
    // 特定のエリアを名前で検索
    findAreaByName(name) {
        return this.areas.find(area => area.name === name);
    }

    updateAreaPositions(areas) {
        // エリアマーカーの位置を更新
        if (!areas || areas.length === 0) {
            console.warn('AreaSelectionManager: No areas provided for marker update');
            return;
        }
        
        console.log(`AreaSelectionManager: Updating positions for ${areas.length} areas`);
        
        // 既存のマーカーを完全に削除
        this.destroy();
        
        // 追加のクリーンアップ：マーカー関連のオブジェクトを確実に削除
        if (this.scene && this.scene.children && this.scene.children.entries) {
            this.scene.children.entries.forEach(child => {
                if (child && (child.type === 'Container' || child.type === 'Arc' || child.type === 'Text')) {
                    // マーカー関連のオブジェクトのみ削除
                    if (child.destroy) {
                        child.destroy();
                    }
                }
            });
        }
        
        // エリアデータを更新（座標情報を含む）
        this.areas = areas.map(area => ({
            ...area,
            description: this.getAreaDescription(area.name)
        }));
        
        // 新しいマーカーを作成（エリアの数だけ作成）
        console.log(`AreaSelectionManager: Creating ${this.areas.length} markers`);
        this.createAreaMarkers();
        console.log(`AreaSelectionManager: Updated ${this.areaSprites.length} markers`);
    }

    repositionMarkers() {
        const currentScale = this.scene.mapManager?.mapScaleX || 1;
        const labelOffset = 15 * currentScale;
        
        this.areaSprites.forEach((sprite, index) => {
            if (sprite && this.areas[index]) {
                const area = this.areas[index];
                // グループ内の各要素を再配置
                sprite.children.entries.forEach(child => {
                    if (child.type === 'Arc') { // 円形マーカー
                        child.setPosition(area.x, area.y);
                        // サイズも調整
                        child.setRadius(10 * currentScale);
                        child.setStrokeStyle(2 * currentScale, 0xFFFFFF);
                    } else if (child.type === 'Text') { // テキストラベル
                        child.setPosition(area.x, area.y - labelOffset);
                        // フォントサイズも調整
                        const fontSize = Math.max(8, Math.floor(10 * currentScale)) + 'px';
                        child.setStyle({ fontSize: fontSize });
                    }
                });
            }
        });
    }
    
    destroy() {
        // 確認ダイアログを閉じる
        if (this.currentDialog && this.currentDialog.active) {
            this.currentDialog.destroy();
        }
        this.isConfirmDialogActive = false;
        this.currentDialog = null;
        
        // クリーンアップ
        if (this.areaSprites && Array.isArray(this.areaSprites)) {
            this.areaSprites.forEach(sprite => {
                if (sprite) {
                    // グループ内の各オブジェクトを個別に削除
                    if (sprite.children && sprite.children.entries) {
                        sprite.children.entries.forEach(child => {
                            if (child && child.destroy) {
                                child.destroy();
                            }
                        });
                    }
                    // グループ自体も削除
                    if (sprite.destroy) {
                        sprite.destroy();
                    }
                }
            });
        }
        
        // シーンからマーカー関連のオブジェクトを確実に削除
        if (this.scene && this.scene.children && this.scene.children.entries) {
            this.scene.children.entries.forEach(child => {
                if (child && child.getData && child.getData('markerType') === 'areaMarker') {
                    if (child.destroy) {
                        child.destroy();
                    }
                }
            });
        }
        
        // 追加のクリーンアップ：コンテナ内のオブジェクトも削除
        if (this.scene && this.scene.children && this.scene.children.entries) {
            this.scene.children.entries.forEach(child => {
                if (child && child.type === 'Container') {
                    child.each((member) => {
                        if (member && member.getData && member.getData('markerType') === 'areaMarker') {
                            if (member.destroy) {
                                member.destroy();
                            }
                        }
                    });
                }
            });
        }
        
        this.areaSprites = [];
        this.selectedArea = null;
        
        console.log('AreaSelectionManager: Destroyed all markers');
    }
}