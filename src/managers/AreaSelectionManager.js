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
    }

    setupAreas(tilemap) {
        // Tiledマップからエリアデータを抽出
        this.extractAreasFromTilemap(tilemap);
        
        // エリアマーカーを作成
        this.createAreaMarkers();
        
        // インタラクションイベントを設定
        this.setupInteractionEvents();
        
        console.log(`Setup ${this.areas.length} areas for selection`);
    }

    extractAreasFromTilemap(tilemap) {
        // オブジェクトレイヤーからエリアデータを抽出
        const objectLayer = tilemap.getObjectLayer('miemachi');
        
        if (objectLayer) {
            this.areas = objectLayer.objects.map(obj => ({
                id: obj.id,
                name: obj.name,
                x: obj.x,
                y: obj.y,
                width: obj.width || 32,
                height: obj.height || 32,
                type: obj.type || 'location',
                description: this.getAreaDescription(obj.name)
            }));
            
            console.log('Extracted areas:', this.areas);
        } else {
            console.warn('Object layer "miemachi" not found');
        }
    }

    getAreaDescription(areaName) {
        // エリアの説明を取得
        const descriptions = {
            'mie_high_school': '三重高等学校',
            'sumiwataru': '澄みわたる',
            'shigaku': '私学',
            'Banned_kiku': '禁止菊',
            'drinking_hope': '飲み希望',
            'Weeds_burn': '雑草燃焼',
            'katou_poteto': '加藤ポテト',
            'Tanabata_bamboo': '七夕竹',
            'bookmarket': '古本市場',
            'drink_zutu': '飲み頭痛',
            'ドール': 'ドール',
            'momoiro': 'ももいろ',
            'profile': 'プロフィール'
        };
        
        return descriptions[areaName] || areaName;
    }

    createAreaMarkers() {
        // エリアマーカーを作成
        this.areas.forEach(area => {
            const marker = this.createAreaMarker(area);
            this.areaSprites.push(marker);
        });
    }

    createAreaMarker(area) {
        // エリアマーカーを作成
        const marker = this.scene.add.group();
        
        // 背景円
        const background = this.scene.add.circle(area.x, area.y, 20, 0x4169E1, 0.7);
        background.setStrokeStyle(2, 0xFFFFFF);
        
        // テキストラベル
        const label = this.scene.add.text(area.x, area.y - 30, area.description, {
            fontSize: '12px',
            fill: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 4, y: 2 },
            borderRadius: 4
        });
        label.setOrigin(0.5);
        
        // マーカーグループに追加
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
                background.setScale(1.2);
                background.setTint(0xFFD700);
                label.setStyle({ fill: '#FF0000' });
            }
        });
        
        background.on('pointerout', () => {
            if (!this.isMobile) {
                background.setScale(1);
                background.clearTint();
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
            background.setTint(0xFF0000);
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
            background.clearTint();
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
                console.log('Drag detected, ignoring tap');
                return;
            }
        });
    }

    selectArea(area) {
        if (!this.isInteractive) return;
        
        console.log(`Area selected: ${area.name}`);
        
        // 選択されたエリアを記録
        this.selectedArea = area;
        
        // 選択エフェクトを表示
        this.showSelectionEffect(area);
        
        // 音効果を再生
        this.playSelectionSound();
        
        // 選択後の処理を実行
        this.handleAreaSelection(area);
    }

    showSelectionEffect(area) {
        // 選択エフェクトを表示
        const effect = this.scene.add.circle(area.x, area.y, 30, 0xFFFF00, 0.6);
        effect.setStrokeStyle(4, 0xFF0000);
        
        // パルスアニメーション
        this.scene.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy();
            }
        });
        
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
            this.scene.selectArea(area);
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
        console.log(`Handling selection for area: ${area.name}`);
        
        // 少し遅延を入れてから移動
        this.scene.time.delayedCall(1000, () => {
            this.scene.navigateToArea(area);
        });
    }

    playSelectionSound() {
        // 選択音を再生
        try {
            if (this.scene.audioManager) {
                this.scene.audioManager.playSe('select_sound', 0.5);
            }
        } catch (error) {
            console.log('Selection sound not available');
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
        // タッチ位置に近いエリアを検索
        const touchedArea = this.findAreaAtPosition(worldX, worldY);
        
        if (touchedArea) {
            this.selectArea(touchedArea);
        } else {
            console.log(`No area found at position: ${worldX}, ${worldY}`);
        }
    }
    
    // 指定された座標に近いエリアを検索
    findAreaAtPosition(worldX, worldY) {
        const tapRadius = 40; // タップ判定の半径
        
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
    
    // エリアマーカーを再配置
    repositionMarkers() {
        this.areaSprites.forEach((sprite, index) => {
            if (sprite && this.areas[index]) {
                const area = this.areas[index];
                // グループ内の各要素を再配置
                sprite.children.entries.forEach(child => {
                    if (child.type === 'Arc') { // 円形マーカー
                        child.setPosition(area.x, area.y);
                    } else if (child.type === 'Text') { // テキストラベル
                        child.setPosition(area.x, area.y - 30);
                    }
                });
            }
        });
    }
    
    // デバッグ用：エリア情報を表示
    debugShowAreas() {
        console.log('=== Area Selection Debug ===');
        this.areas.forEach((area, index) => {
            console.log(`Area ${index}: ${area.name} at (${area.x}, ${area.y})`);
        });
        console.log('============================');
    }
    
    destroy() {
        // クリーンアップ
        this.areaSprites.forEach(sprite => {
            if (sprite && sprite.destroy) {
                sprite.destroy();
            }
        });
        
        this.areas = [];
        this.areaSprites = [];
        this.selectedArea = null;
    }
} 