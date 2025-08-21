import { VisualFeedbackManager } from './VisualFeedbackManager.js';
import { taketaConversationData } from '../data/taketa/conversationData.js';
import { miemachiConversationData } from '../data/miemachi/conversationData.js';
import { japanConversationData } from '../data/japan/conversationData.js';

// 完了状態管理クラス
class EventCompletionManager {
    constructor() {
        this.storageKey = 'event_completed_';
        this.excludedAreas = [
            'mie_high_school',    // 三重中学校 - Stage1へ移動
            'taketa_high_school', // 竹田高校 - Stage2へ移動
            'taketa_station'      // 竹田駅 - 移動系
        ];
    }

    // エリアの完了状態を取得
    isAreaCompleted(areaName) {
        if (this.excludedAreas.includes(areaName)) {
            return false; // 除外エリアは常に未完了
        }
        return localStorage.getItem(this.storageKey + areaName) === 'true';
    }

    // エリアを完了済みに設定
    markAreaAsCompleted(areaName) {
        if (this.excludedAreas.includes(areaName)) {
            return; // 除外エリアは完了設定しない
        }
        localStorage.setItem(this.storageKey + areaName, 'true');
    }

    // 完了状態をリセット（デバッグ用）
    resetAllCompletions() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.storageKey)) {
                localStorage.removeItem(key);
            }
        });
    }

    // 完了済みエリアの一覧を取得
    getCompletedAreas() {
        const completed = [];
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.storageKey)) {
                const areaName = key.replace(this.storageKey, '');
                if (!this.excludedAreas.includes(areaName)) {
                    completed.push(areaName);
                }
            }
        });
        return completed;
    }
}

export class AreaSelectionManager {
    constructor(scene) {
        this.scene = scene;
        this.areas = [];
        this.areaSprites = [];
        this.selectedArea = null;
        
        // 完了状態管理マネージャーを初期化
        this.completionManager = new EventCompletionManager();
        
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
        // 強制的にクリーンアップ（既存マーカーの有無に関係なく）
        this.destroy();
        
        // 配列を確実にクリア
        this.areaSprites = [];
        
        // スケール済みのエリアデータを直接使用
        if (areas && Array.isArray(areas)) {
            this.areas = areas.map(area => ({
                ...area,
                description: this.getAreaDescription(area.name)
            }));
        } else {
            this.areas = [];
        }
        
        // エリアマーカーを作成
        this.areas.forEach((area) => {
            if (area) {
                const marker = this.createAreaMarker(area);
                if (marker) {
                    this.areaSprites.push(marker);
                }
            }
        });
        
        // インタラクションイベントを設定
        this.setupInteractionEvents();
    }



    getAreaDescription(areaName) {
        // エリアの説明を取得
        const descriptions = {
            'Trial': 'トライアル',
            'Flash_land_mie': 'フラッシュランド三重',
            'oreno_koto': '俺のこと',
            'momoiro_jyogakuenn': '２匹の狼と獲物',
            'drinking_dutu': 'づつ',
            'Weeds_burn': '雑草がもえるぅぅ',
            'mie_high_school': '三重中学校',
            'raizu': 'ライズ',
            'snack_street_night': '三重町の歓楽街',
            'souce': 'ソース',
            'koutaroupoteto': 'こうたろうポテト',
            'seven': 'セブン',
            // 竹田ステージのエリア説明
            'taketa_station': '竹田駅',
            'taketa_high_school': '竹田高校',
            'galaxy_water': '銀河の水',
            'udefuriojisann': 'ウデフリオジサン',
            'working_go_to_home_miemachi': '飲み会後三重町まで歩く',
            // 日本ステージのエリア説明
            'computer': 'エンジニア',
            'breaking_car': 'BMW',
            'special_scam': 'あやしいおじさん',
            'rojyounopenki': '路上のペンキ',
            'tereapo': 'テレアポ',
            'first_rising_sun': '初日の出',
            'arechi': '荒地',
            'gray_bytes': 'グレーバイト'
        };
        
        return descriptions[areaName] || areaName;
    }

    createAreaMarkers() {
        // 既存のマーカーをクリア
        this.areaSprites = [];
        
        if (!this.areas || this.areas.length === 0) {
            return;
        }
        
        // エリアマーカーを作成
                this.areas.forEach((area) => {
            if (area) {
                const marker = this.createAreaMarker(area);
                if (marker) {
                    this.areaSprites.push(marker);
                }
            }
        });
        
    }

    createAreaMarker(area) {
        // エリアマーカーを作成
        const marker = this.scene.add.container(0, 0);
        
        // マーカーに一意のIDを設定
        marker.setData('markerType', 'areaMarker');
        marker.setData('areaName', area.name);
        marker.setData('markerId', `marker_${area.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        
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
        
        // 完了状態をチェック
        const isCompleted = this.completionManager.isAreaCompleted(area.name);
        
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
        if (isCompleted) {
            // 完了済みエリア：緑色で光らせる
            if (isEllipse) {
                background = this.scene.add.ellipse(rotatedCenterX, rotatedCenterY, objectWidth, objectHeight, 0x00FF00, 0.3);
            } else {
                background = this.scene.add.rectangle(rotatedCenterX, rotatedCenterY, objectWidth, objectHeight, 0x00FF00, 0.3);
            }
            
            // 緑色の光るエフェクトを追加
            this.scene.tweens.add({
                targets: background,
                alpha: 0.6,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        } else {
            // 未完了エリア：通常の青色
            if (isEllipse) {
                background = this.scene.add.ellipse(rotatedCenterX, rotatedCenterY, objectWidth, objectHeight, 0x4169E1, 0.1);
            } else {
                background = this.scene.add.rectangle(rotatedCenterX, rotatedCenterY, objectWidth, objectHeight, 0x4169E1, 0.1);
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
        }
        
        background.setData('markerType', 'areaMarker');
        background.setData('areaName', area.name);
        background.setData('isCompleted', isCompleted);
        
        // Phaserオブジェクトの原点を中心に設定し、回転を適用
        background.setOrigin(0.5, 0.5);
        if (rotation !== 0) {
            background.setRotation(rotation * Math.PI / 180);
        }
        
        // テキストラベル（矩形の上部に配置）
        const label = this.scene.add.text(objectX + objectWidth/2, objectY - labelOffset, area.description, {
            fontSize: fontSize,
            fill: isCompleted ? '#00AA00' : '#000000', // 完了済みは緑色
            backgroundColor: isCompleted ? '#90EE90' : '#FFFFFF', // 完了済みは薄緑色
            padding: { x: 3 * currentScale, y: 1 * currentScale },
            borderRadius: 2 * currentScale
        });
        label.setOrigin(0.5, 0.5);
        label.setData('markerType', 'areaMarker');
        label.setData('areaName', area.name);
        label.setData('isCompleted', isCompleted);
        
        // 完了済みエリアには完了マークを追加
        if (isCompleted) {
            const checkmarkSize = Math.max(8, Math.floor(12 * currentScale));
            const checkmark = this.scene.add.text(
                objectX + objectWidth/2, 
                objectY - labelOffset - checkmarkSize/2, 
                '✓', 
                {
                    fontSize: checkmarkSize + 'px',
                    fill: '#00FF00',
                    fontWeight: 'bold'
                }
            );
            checkmark.setOrigin(0.5, 0.5);
            checkmark.setData('markerType', 'areaMarker');
            checkmark.setData('areaName', area.name);
            
            // 安全なチェックを追加
            if (marker && marker.add) {
                marker.add(checkmark);
            }
        }
        
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
            
            // 会話中はクリックを無効化
            if (this.isConversationActive()) {
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
            
            // 会話中はクリックを無効化
            if (this.isConversationActive()) {
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
            // 初回タップでオーディオコンテキストを確実に解錠（マップSE対策）
            try {
                if (this.scene.sound && this.scene.sound.locked) {
                    try { if (this.scene.sound.context && this.scene.sound.context.state !== 'running') { this.scene.sound.context.resume(); } } catch(e) {
                        console.warn('[AreaSelectionManager] 音声コンテキスト復帰エラー:', e);
                    }
                    try {
                        const ctx = this.scene.sound.context;
                        if (ctx && typeof ctx.createOscillator === 'function') {
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            gain.gain.value = 0.0001;
                            osc.connect(gain).connect(ctx.destination);
                            osc.start();
                            osc.stop(ctx.currentTime + 0.05);
                        }
                    } catch(e) {
                        console.warn('[AreaSelectionManager] 無音オシレーター作成エラー:', e);
                    }
                }
            } catch(e) {
                console.warn('[AreaSelectionManager] 音声コンテキスト処理エラー:', e);
            }
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
            // 会話開始前にマップBGMの自動再開を抑制し、HTMLAudioを停止（play/pause競合回避）
            try {
                if (this.scene) {
                    this.scene._suppressMapBgm = true;
                    if (this.scene._bgmRetry && this.scene._bgmRetry.remove) {
                        try { this.scene._bgmRetry.remove(false); } catch (e) { /* ignore */ }
                        this.scene._bgmRetry = null;
                    }
                    try { if (this.scene._htmlBgm && !this.scene._htmlBgm.paused) this.scene._htmlBgm.pause(); } catch (e) { /* ignore */ }
                }
            } catch (e) { /* ignore */ }
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
        if (this.scene.mapConfig && this.scene.mapConfig.mapKey === 'taketa') {
            this.handleTaketaConversation(area);
        } else if (this.scene.mapConfig && this.scene.mapConfig.mapKey === 'miemachi') {
            this.handleMiemachiConversation(area);
        } else if (this.scene.mapConfig && this.scene.mapConfig.mapKey === 'japan') {
            this.handleJapanConversation(area);
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
                case 'working_go_to_home_miemachi':
                    eventId = 'working_go_to_home_miemachi';
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
            // DynamicConversationSceneを使用して会話システムを開始
            this.startDynamicConversation(eventId);
        } else {
            // 会話データがない場合は通常の移動
            this.scene.time.delayedCall(1000, () => {
                this.navigateToArea(area);
            });
        }
    }

    handleJapanConversation(area) {
        // 日本ステージの会話イベントを処理
        let eventId = null;
        
        // エリアのconversationIdを確認
        if (area.conversationId && area.conversationId !== null) {
            eventId = area.conversationId;
        } else {
            // エリア名に基づいて会話イベントを決定（フォールバック）
            switch (area.name) {
                case 'computer':
                    eventId = 'computer';
                    break;
                case 'breaking_car':
                    eventId = 'breaking_car';
                    break;
                case 'special_scam':
                    eventId = 'special_scam';
                    break;
                case 'rojyounopenki':
                    eventId = 'rojyounopenki';
                    break;
                case 'tereapo':
                    eventId = 'tereapo';
                    break;
                case 'first_rising_sun':
                    eventId = 'first_rising_sun';
                    break;
                case 'arechi':
                    eventId = 'arechi';
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
            // DynamicConversationSceneを使用して会話システムを開始
            this.startDynamicConversation(eventId);
        } else {
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
                    eventId = 'raizu';
                    break;
                case 'souce':
                    eventId = 'souce';
                    break;
                case 'Weeds_burn':
                    eventId = 'Weeds_burn';
                    break;
                case 'koutaroupoteto':
                    eventId = 'koutaroupoteto';
                    break;
                case 'drinking_dutu':
                    eventId = 'drinking_dutu';
                    break;
                case 'snack_street_night':
                    eventId = 'snack_street_night';
                    break;
                case 'momoiro_jyogakuenn':
                    eventId = 'momoiro_jyogakuenn';
                    break;
                case 'Flash_land_mie':
                    eventId = 'flash_land_mie';
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
            // DynamicConversationSceneを使用して会話システムを開始
            this.startDynamicConversation(eventId);
        } else {
            // 会話データがない場合は通常の移動
            this.scene.time.delayedCall(1000, () => {
                this.navigateToArea(area);
            });
        }
    }

    // DynamicConversationSceneを開始
    startDynamicConversation(eventId) {
        try {
            import('../scenes/DynamicConversationScene.js').then(({ DynamicConversationScene }) => {
                // シーンが既に存在する場合は削除
                if (this.scene.scene.get(eventId)) {
                    this.scene.scene.remove(eventId);
                }
                
                try {
                    this.scene.scene.add(eventId, DynamicConversationScene, false, { eventId: eventId });
                    
                    this.scene.time.delayedCall(300, () => {
                        try {
                            const scene = this.scene.scene.get(eventId);
                            
                            if (scene) {
                                this.scene.scene.start(eventId);
                            } else {
                                this.scene.scene.launch(eventId);
                            }
                        } catch (error) {
                            try {
                                this.scene.scene.launch(eventId);
                            } catch (launchError) {
                                console.error(`[AreaSelectionManager] シーン開始失敗: ${eventId}`, launchError);
                            }
                        }
                    });
                } catch (addError) {
                    console.error(`[AreaSelectionManager] シーン登録エラー: ${eventId}`, addError);
                }
            }).catch(error => {
                console.error(`[AreaSelectionManager] DynamicConversationScene開始エラー: ${eventId}`, error);
            });
        } catch (error) {
            console.error(`[AreaSelectionManager] DynamicConversationScene開始エラー: ${eventId}`, error);
        }
    }
    


    // 汎用的な会話データ取得関数
    getConversationData(mapId, eventId) {
        // マップIDに基づいて適切な会話データを取得
        let result;
        switch (mapId) {
            case 'miemachi':
                result = miemachiConversationData[eventId];
                break;
            case 'taketa':
                result = taketaConversationData[eventId];
                break;
            case 'japan':
                result = japanConversationData[eventId];
                break;
            default:
                // デフォルトの会話データを返す
                result = miemachiConversationData[eventId] || taketaConversationData[eventId] || japanConversationData[eventId];
        }
        return result;
    }

    navigateToArea(area) {
        
        // sceneParamがundefinedの場合は、AreaConfigから直接取得
        if (!area.sceneParam && area.name) {
            const areaConfig = this.scene.mapConfig?.areas?.find(config => config.name === area.name);
            if (areaConfig) {
                area.sceneParam = areaConfig.sceneParam;
                area.scene = areaConfig.scene;
            }
        }
        
        if (!area.scene) {
            return;
        }
        
        // startPhaserGameの場合は特別な処理
        if (area.scene === 'startPhaserGame') {
            const currentMapId = this.scene.mapConfig?.mapKey || 'unknown';
            const stageNumber = area.sceneParam || 1;
            
            // 現在のマップに戻るための関数を設定
            window.returnToMap = () => {
                // 多重起動ガード
                if (window.__navigating) return;
                window.__navigating = true;
                // すべて停止
                try { if (window.game && window.game.sound) window.game.sound.stopAll(); } catch(e){ /* ignore */ }
                try {
                    if (window.game && window.game.scene && window.game.scene.getScenes) {
                        const scenes = window.game.scene.getScenes(false) || [];
                        for (const s of scenes) {
                            try { if (s.scene && s.scene.stop) s.scene.stop(); } catch(err) { /* ignore */ }
                            try { if (s.scene && s.scene.remove) s.scene.remove(); } catch(err) { /* ignore */ }
                        }
                    }
                } catch(err){ /* ignore */ }
                try { if (window.game) window.game.destroy(true); } catch(_){ /* ignore */ }
                window.game = null; window.gameInstance = null;
                // 少し遅延してから再起動（破棄完了を待つ）
                setTimeout(() => {
                    import('../gameController.js').then(({ startPhaserGame }) => {
                        try { startPhaserGame(currentMapId); } finally { window.__navigating = false; }
                    }).catch(() => { window.__navigating = false; });
                }, 50);
            };
            
            // ステージを開始（高速連打ガード）
            
            // ステージに移動する前に、現在のマップのConversationSceneを削除
            if (this.scene.scene.get('ConversationScene')) {
                this.scene.scene.remove('ConversationScene');
            }
            
            // ローダー進行中ならキャンセルしてから停止
            try { if (this.scene.load && this.scene.load.reset) this.scene.load.reset(); } catch(e) { /* ignore */ }
            try { if (this.scene.load && this.scene.load.removeAllListeners) this.scene.load.removeAllListeners(); } catch(e) { /* ignore */ }
            try { this.scene.scene.stop(); } catch(e) { /* ignore */ }
            
            import('../gameController.js').then(({ startPhaserGame }) => {
                try { startPhaserGame(stageNumber); } catch(e) { /* ignore */ }
            });
            
        } else {
            // その他のシーンへの移動
            import('../gameController.js').then(({ startPhaserGame }) => {
                startPhaserGame(area.scene);
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
                // エリアタッチ時は会話中なら無効化
                if (this.isConversationActive()) {
                    return;
                }
                this.selectArea(touchedArea);
            } else {
                // 背景タッチ時のSE再生（会話中でも再生）
                if (this.scene.audioManager) {
                    this.scene.audioManager.playSe('se_map_touch', 0.3);
                }
            }
            
        } catch (error) {
            console.error('AreaSelectionManager: Error in handleTouchAt:', error);
        }
    }
    
    // 指定された座標に近いエリアを検索
    findAreaAtPosition(worldX, worldY) {
        // 拡大率に応じてタップ判定半径を調整
        const currentScale = this.scene.mapManager?.mapScaleX || 1;
        const tapRadius = 20 * currentScale; // 拡大率に応じて調整
        
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

    // エリアを完了済みに設定
    markAreaAsCompleted(areaName) {
        this.completionManager.markAreaAsCompleted(areaName);
        // 完了状態を視覚的に更新
        this.updateAreaCompletionDisplay(areaName);
    }

    // 完了状態の表示を更新
    updateAreaCompletionDisplay(areaName) {
        // 該当エリアのマーカーを見つけて更新
        this.areaSprites.forEach(marker => {
            if (marker && marker.getData('areaName') === areaName) {
                // より安全なチェックを追加
                if (!marker.children) {
                    // 子要素が存在しない場合は、マーカーを再作成
                    this.recreateMarker(areaName);
                    return;
                }
                
                // Phaser 3.60以降の方法で子要素を取得
                let childrenEntries = [];
                try {
                    if (marker.children.entries) {
                        childrenEntries = marker.children.entries;
                    } else if (marker.children.list) {
                        childrenEntries = marker.children.list;
                    } else if (Array.isArray(marker.children)) {
                        childrenEntries = marker.children;
                    } else {
                        console.warn(`[AreaSelectionManager] マーカーの子要素の形式が不明: ${areaName}`);
                        return;
                    }
                } catch (e) {
                    console.warn(`[AreaSelectionManager] マーカーの子要素の取得に失敗: ${areaName}`, e.message);
                    return;
                }
                
                const background = marker.getAt(0); // 背景オブジェクト
                const label = marker.getAt(1); // ラベルオブジェクト
                
                if (background && label) {
                    // 背景を緑色に変更
                    const area = background.getData('area');
                    if (area) {
                        const isEllipse = area.ellipse || false;
                        if (isEllipse) {
                            background.setFillStyle(0x00FF00, 0.3);
                        } else {
                            background.setFillStyle(0x00FF00, 0.3);
                        }
                        
                        // 緑色の光るエフェクトを追加
                        this.scene.tweens.add({
                            targets: background,
                            alpha: 0.6,
                            duration: 1500,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                        
                        background.setData('isCompleted', true);
                    }
                    
                    // ラベルを緑色に変更
                    label.setStyle({ 
                        fill: '#00AA00',
                        backgroundColor: '#90EE90'
                    });
                    label.setData('isCompleted', true);
                    
                    // 完了マークを追加
                    if (childrenEntries.length < 3) { // 完了マークがまだない場合
                        const currentScale = this.scene.mapManager?.mapScaleX || 1;
                        const checkmarkSize = Math.max(8, Math.floor(12 * currentScale));
                        
                        // エリアの中心座標を計算
                        const centerX = area.x + (area.width || 100) / 2;
                        
                        const checkmark = this.scene.add.text(
                            centerX, 
                            area.y - Math.max(15, 15 * currentScale) - checkmarkSize/2, 
                            '✓', 
                            {
                                fontSize: checkmarkSize + 'px',
                                fill: '#00FF00',
                                fontWeight: 'bold'
                            }
                        );
                        checkmark.setOrigin(0.5, 0.5);
                        checkmark.setData('markerType', 'areaMarker');
                        checkmark.setData('areaName', areaName);
                        
                        // 完了マークをマーカーに追加
                        if (marker && marker.add) {
                            marker.add(checkmark);
                        }
                    }
                }
            }
        });
    }



    // 完了済みエリアの一覧を取得
    getCompletedAreas() {
        return this.completionManager.getCompletedAreas();
    }





    // マーカーを再作成
    recreateMarker(areaName) {
        try {
            // 既存のマーカーを削除
            const existingMarker = this.areaSprites.find(marker => 
                marker && marker.getData('areaName') === areaName
            );
            if (existingMarker) {
                existingMarker.destroy();
            }
            
            // エリア情報を取得
            const area = this.areas.find(a => a.name === areaName);
            if (!area) {
                return;
            }
            
            // 新しいマーカーを作成
            const newMarker = this.createAreaMarker(area);
            if (newMarker) {
                // 完了状態を設定
                if (this.completionManager.isAreaCompleted(areaName)) {
                    this.updateAreaCompletionDisplay(areaName);
                }
            }
        } catch (error) {
            console.error(`[AreaSelectionManager] マーカー ${areaName} の再作成に失敗:`, error);
        }
    }

    // 会話中かどうかをチェック
    isConversationActive() {
        try {
            // シーンから会話状態を確認
            if (this.scene && this.scene.scene) {
                const conversationScene = this.scene.scene.get('ConversationScene');
                if (conversationScene && conversationScene.scene && conversationScene.scene.isActive()) {
                    return true;
                }
            }
            
            // 会話トリガーの状態も確認
            if (this.scene && this.scene.conversationTrigger) {
                return this.scene.conversationTrigger.isActive();
            }
            
            return false;
        } catch (error) {
            console.warn('[AreaSelectionManager] 会話状態チェックエラー:', error);
            return false;
        }
    }

    updateAreaPositions(areas) {
        // エリアマーカーの位置を更新
        if (!areas || areas.length === 0) {
            console.warn('AreaSelectionManager: No areas provided for marker update');
            return;
        }
        
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
        this.areas = areas.map(area => {
            // 元のエリアデータからsceneParam情報を取得
            const originalArea = this.areas.find(orig => orig.name === area.name);
            
            // 元のエリアデータが見つからない場合は、設定ファイルから取得
            let sceneParam = originalArea?.sceneParam;
            let scene = originalArea?.scene;
            let conversationId = originalArea?.conversationId;
            
            // 元のエリアデータにsceneParam情報がない場合は、AreaConfigから取得
            if (!sceneParam || !scene) {
                const areaConfig = this.scene.mapConfig?.areas?.find(config => config.name === area.name);
                if (areaConfig) {
                    sceneParam = areaConfig.sceneParam;
                    scene = areaConfig.scene;
                    conversationId = areaConfig.conversationId;
                }
            }
            
            const updatedArea = {
                ...area,
                sceneParam: sceneParam,
                scene: scene,
                conversationId: conversationId,
                description: this.getAreaDescription(area.name)
            };
            
            return updatedArea;
        });
        
        // 新しいマーカーを作成（エリアの数だけ作成）
        this.createAreaMarkers();
    }

    // 既存マーカーの位置のみ更新（新規作成しない）
    updateExistingMarkers(areas) {
        if (!areas || !Array.isArray(areas)) {
            console.warn('[AreaSelectionManager] updateExistingMarkers: 無効なエリアデータ');
            return;
        }
        
        // エリアデータを更新
        this.areas = areas.map(area => ({
            ...area,
            description: this.getAreaDescription(area.name)
        }));
        
        // 既存のマーカーの位置を更新
        this.areaSprites.forEach((marker, index) => {
            if (marker && this.areas[index]) {
                const area = this.areas[index];
                this.updateMarkerPosition(marker, area);
            }
        });
    }

    // 個別マーカーの位置を更新
    updateMarkerPosition(marker, area) {
        if (!marker || !area) return;
        
        const currentScale = this.scene.mapManager?.mapScaleX || 1;
        const labelOffset = Math.max(15, 15 * currentScale);
        
        // マーカー内の各要素の位置を更新
        if (marker.children && marker.children.entries) {
            marker.children.entries.forEach(child => {
                if (child && child.getData && child.getData('markerType') === 'areaMarker') {
                    if (child.type === 'Ellipse' || child.type === 'Rectangle') {
                        // 背景形状の位置を更新
                        const centerX = area.x + (area.width || 100) / 2;
                        const centerY = area.y + (area.height || 100) / 2;
                        child.setPosition(centerX, centerY);
                        
                        // サイズも更新
                        if (child.type === 'Ellipse') {
                            child.setRadius((area.width || 100) / 2, (area.height || 100) / 2);
                        } else {
                            child.setSize(area.width || 100, area.height || 100);
                        }
                    } else if (child.type === 'Text') {
                        // テキストラベルの位置を更新
                        const textX = area.x + (area.width || 100) / 2;
                        const textY = area.y - labelOffset;
                        child.setPosition(textX, textY);
                        
                        // フォントサイズも調整
                        const minFontSize = 10;
                        const fontSize = Math.max(minFontSize, Math.floor(10 * currentScale)) + 'px';
                        child.setStyle({ fontSize: fontSize });
                    }
                }
            });
        }
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
        
        // 緑色のマーカーを強制削除（最初に実行）
        this.forceRemoveGreenMarkers();
        
        // 既存のマーカー配列をクリア
        if (this.areaSprites && Array.isArray(this.areaSprites)) {
            this.areaSprites.forEach((sprite, index) => {
                if (sprite) {
                    try {
                        if (sprite.destroy) {
                            sprite.destroy();
                        }
                    } catch (e) {
                        console.warn(`[AreaSelectionManager] マーカー ${index} 削除エラー:`, e);
                    }
                }
            });
        }
        
        // シーンから直接マーカー関連オブジェクトを削除
        this.removeAllMarkerObjects();
        
        // 配列を確実にクリア
        this.areaSprites = [];
        this.selectedArea = null;
        
    }

    // シーンからすべてのマーカーオブジェクトを削除
    removeAllMarkerObjects() {
        if (!this.scene || !this.scene.children || !this.scene.children.list) return;
        
        const objectsToDestroy = [];
        // シーンの表示リスト内のすべての子要素を反復処理
        const sceneChildrenCopy = [...this.scene.children.list]; // 反復中にリストが変更されないようにコピーを使用

        sceneChildrenCopy.forEach(child => {
            // 子要素自体がエリアマーカーコンテナであるかを確認
            if (child && child.getData && child.getData('markerType') === 'areaMarker') {
                objectsToDestroy.push(child);
            } else if (child instanceof Phaser.GameObjects.Container) {
                // コンテナの場合、その子要素にエリアマーカーがあるかを確認
                child.each((grandchild) => {
                    if (grandchild && grandchild.getData && grandchild.getData('markerType') === 'areaMarker') {
                        // 子要素がエリアマーカーの場合、その親コンテナ（child）を削除リストに追加
                        // これにより、マーカー全体が削除されることを保証
                        if (!objectsToDestroy.includes(child)) { // 重複して追加しないようにチェック
                            objectsToDestroy.push(child);
                        }
                    }
                });
            }
        });

        objectsToDestroy.forEach(obj => {
            try {
                if (obj.destroy) {
                    obj.destroy();
                }
            } catch (e) {
                console.warn('[AreaSelectionManager] オブジェクト削除エラー:', e);
            }
        });
    }

    // 緑色のマーカーを強制削除
    forceRemoveGreenMarkers() {
        if (!this.scene || !this.scene.children || !this.scene.children.list) return;
        
        const greenMarkersToDestroy = [];
        const sceneChildrenCopy = [...this.scene.children.list]; // シーンの子要素のコピーを作成

        sceneChildrenCopy.forEach(child => {
            // 子要素がエリアマーカーコンテナであるかを確認
            if (child && child.getData && child.getData('markerType') === 'areaMarker') {
                let isGreenMarker = false;
                // コンテナの子要素を反復処理して緑色の要素を探す
                if (child instanceof Phaser.GameObjects.Container) {
                    child.each((grandchild) => {
                        // 緑色の背景形状をチェック
                        if (grandchild && grandchild.fillColor !== undefined) {
                            if (grandchild.fillColor === 0x00FF00 || grandchild.fillColor === 0x90EE90) {
                                isGreenMarker = true;
                            }
                        }
                        // 緑色のテキストをチェック
                        if (grandchild && grandchild.style && grandchild.style.color) {
                            const color = grandchild.style.color.toLowerCase();
                            if (color === '#00ff00' || color === '#90ee90' || color === '#00aa00') {
                                isGreenMarker = true;
                            }
                        }
                        // 緑色背景のテキストをチェック
                        if (grandchild && grandchild.style && grandchild.style.backgroundColor) {
                            const bgColor = grandchild.style.backgroundColor.toLowerCase();
                            if (bgColor === '#00ff00' || bgColor === '#90ee90' || bgColor === '#00aa00') {
                                isGreenMarker = true;
                            }
                        }
                    });
                }
                if (isGreenMarker) {
                    greenMarkersToDestroy.push(child);
                }
            }
        });
        
        // 検出された緑色マーカーコンテナを削除
        greenMarkersToDestroy.forEach(obj => {
            try {
                if (obj.destroy) {
                    obj.destroy();
                }
            } catch (e) {
                console.warn('[AreaSelectionManager] 緑色マーカーコンテナ削除エラー:', e);
            }
        });
    }
}