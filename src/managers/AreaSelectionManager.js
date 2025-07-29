import { VisualFeedbackManager } from './VisualFeedbackManager.js';
import { taketaConversationData } from '../data/taketa/conversationData.js';

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
        } else {
            this.areas = [];
        }
        
        // エリアマーカーを作成
        this.createAreaMarkers();
        
        // インタラクションイベントを設定
        this.setupInteractionEvents();
        
        console.log(`AreaSelectionManager: Setup ${this.areas ? this.areas.length : 0} areas with ${this.areaSprites ? this.areaSprites.length : 0} markers`);
    }



    getAreaDescription(areaName) {
        // エリアの説明を取得
        const descriptions = {
            'mie_high_school': '三重中学校',
            'sumiwataru': '澄みわたる',
            'shigaku': '志学',
            'Banned_kiku': '出禁のキク',
            'drinking_hope': '飲みをしたいなぁ',
            'Weeds_burn': '雑草がもえるぅぅ',
            'katou_poteto': 'こうたろうポテト',
            'Tanabata_bamboo': '七夕竹',
            'bookmarket': 'ブックマーケット',
            'drink_zutu': '飲み頭痛',
            'ドール': 'ドール',
            'momoiro': '桃色',
            'profile': 'プロフィール',
            // 竹田ステージのエリア説明
            'taketa_station': '竹田駅',
            'taketa_high school': '竹田高校',
            'ginnga_water': '銀河の水',
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
        
        // スケールに応じてマーカーのサイズを調整（全体マップ時でも最小サイズを保証）
        const minCircleRadius = 10; // 最小半径
        const circleRadius = Math.max(minCircleRadius, 10 * currentScale);
        const minFontSize = 10; // 最小フォントサイズ
        const fontSize = Math.max(minFontSize, Math.floor(10 * currentScale)) + 'px';
        const labelOffset = Math.max(15, 15 * currentScale);
        
        console.log(`AreaSelectionManager: Creating marker for ${area.name} at (${area.x}, ${area.y}) with scale ${currentScale}, radius ${circleRadius}, fontSize ${fontSize}`);
        
        // 背景円
        const background = this.scene.add.circle(area.x, area.y, circleRadius, 0x4169E1, 0.7);
        background.setStrokeStyle(2 * currentScale, 0xFFFFFF);
        background.setData('markerType', 'areaMarker');
        background.setData('areaName', area.name);
        
        // テキストラベル（円の真上に配置）
        const label = this.scene.add.text(area.x, area.y - labelOffset, area.description, {
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
        
        console.log(`AreaSelectionManager: Successfully created marker for ${area.name}`);
        
        return marker;
    }

    setupMarkerHover(background, label) {
        // ホバーエフェクト
        background.on('pointerover', () => {
            if (!this.isMobile) {
                this.visualFeedback.showButtonHover(background, 1.2, 0xFFD700, 0.7);
                label.setStyle({ fill: '#FF0000' });
            }
        });
        
        background.on('pointerout', () => {
            if (!this.isMobile) {
                this.visualFeedback.resetButtonState(background, 1, 0x4169E1, 0.7);
                label.setStyle({ fill: '#000000' });
            }
        });
    }

    setupMarkerClick(background) {
        // クリック/タップイベント
        background.on('pointerdown', () => {
            if (this.isMobile) {
                this.touchStartTime = Date.now();
            }
            
            // 視覚的フィードバック
            background.setFillStyle(0xFF0000, 0.7);
            this.scene.tweens.add({
                targets: background,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 100,
                yoyo: true,
                ease: 'Power2'
            });
        });
        
        background.on('pointerup', () => {
            const area = background.getData('area');
            
            if (this.isMobile) {
                const touchDuration = Date.now() - this.touchStartTime;
                if (touchDuration < this.touchThreshold) {
                    this.selectArea(area);
                }
            } else {
                this.selectArea(area);
            }
            
            // 色を戻す
            background.setFillStyle(0x4169E1, 0.7);
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
            
            // 選択されたエリアを記録
            this.selectedArea = area;
            
            // 選択エフェクトを表示（確認ダイアログを含む）
            this.showSelectionEffect(area);
            
            // 音効果を再生
            this.playSelectionSound();
            
        } catch (error) {
            console.error('AreaSelectionManager: Error in selectArea:', error);
        }
    }

    showSelectionEffect(area) {
        // 選択エフェクトを表示
        this.visualFeedback.showSelectionEffect(area.x, area.y);
        // 確認ダイアログを表示
        this.showConfirmDialog(area);
    }

    showConfirmDialog(area) {
        // 確認ダイアログを表示
        const dialog = this.scene.add.container(
            this.scene.cameras.main.worldView.centerX,
            this.scene.cameras.main.worldView.centerY
        );
        
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
        
        // ボタンイベント
        yesButton.on('pointerdown', () => {
            dialog.destroy();
            this.handleAreaSelection(area);
        });
        
        noButton.on('pointerdown', () => {
            dialog.destroy();
        });
        
        // 自動的にダイアログを閉じる
        this.scene.time.delayedCall(5000, () => {
            if (dialog.active) {
                dialog.destroy();
            }
        });
    }

    handleAreaSelection(area) {
        // エリア選択後の処理
        
        // 竹田ステージの会話イベントをチェック（NPCクリック時と同じ会話システムを使用）
        if (this.scene.mapConfig && this.scene.mapConfig.mapKey === 'taketa') {
            this.handleTaketaConversation(area);
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
        
        // エリア名に基づいて会話イベントを決定
        switch (area.name) {
            case 'udefuriojisann':
                eventId = 'arm_swinging_person';
                break;
            case 'ginnga_water':
                eventId = 'ginga_sui';
                break;
            default:
                // 会話イベントがない場合は通常の移動
                this.scene.time.delayedCall(1000, () => {
                    this.navigateToArea(area);
                });
                return;
        }
        
        // 会話データを取得
        const conversationData = taketaConversationData[eventId];
        if (conversationData) {
            // 会話システムを開始（NPCクリック時と同じ方法）
            if (this.scene.conversationTrigger) {
                this.scene.conversationTrigger.startVisualNovelConversation(conversationData);
            } else {
                console.warn('ConversationTrigger not found in scene');
            }
        } else {
            console.warn(`Conversation data not found for event: ${eventId}`);
        }
    }

    navigateToArea(area) {
        // 選択した場所に応じて次のマップまたはシーンに移動
        
        // エリアオブジェクトがsceneプロパティを持っている場合
        if (area.scene) {
            this.scene.scene.start(area.scene);
        } else {
            // 従来の方法でフォールバック
            console.log(`Area ${area.name} not implemented yet`);
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