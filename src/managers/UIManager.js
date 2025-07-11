export class UIManager {
    constructor() {
        this.playerPosText = null;
    }
    
    createUI(scene) {
        // タイトル表示
        scene.add.text(400, 50, '★★★テスト中★★★bbbbb', {
            fontSize: '24px',
            fill: '#000000',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        scene.add.text(400, 550, '矢印キーまたはWASDで移動！マップ上を歩いてみよう！', {
            fontSize: '16px',
            fill: '#000000'
        }).setOrigin(0.5);

        // デバッグ用：座標表示
        this.playerPosText = scene.add.text(10, 10, '', {
            fontSize: '16px',
            fill: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 5, y: 5 }
        });
    }
    
    updatePlayerPosition(player) {
        // プレイヤーが移動した時の情報を記録（ログは削除）
        if (!this.lastPlayerX || !this.lastPlayerY || 
            Math.abs(player.x - this.lastPlayerX) > 1 || 
            Math.abs(player.y - this.lastPlayerY) > 1) {
            this.lastPlayerX = player.x;
            this.lastPlayerY = player.y;
        }
        
        // 座標表示を両方のデバイスで表示
        if (this.playerPosText) {
            this.playerPosText.setText(`ひろかず位置: X=${Math.round(player.x)}, Y=${Math.round(player.y)}`);
        }
    }
    
    // マップステージ専用のUIを作成
    createMapUI(scene, title) {
        // タイトル表示
        this.titleText = scene.add.text(scene.cameras.main.centerX, 50, title, {
            fontSize: '24px',
            fill: '#000000',
            fontWeight: 'bold',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            borderRadius: 10
        }).setOrigin(0.5);
        
        // 説明テキスト
        this.instructionText = scene.add.text(scene.cameras.main.centerX, 100, '場所をタップして移動！', {
            fontSize: '16px',
            fill: '#333333',
            backgroundColor: '#FFFFFF',
            padding: { x: 8, y: 4 },
            borderRadius: 8
        }).setOrigin(0.5);
        
        // 戻るボタン
        this.backButton = scene.add.text(50, 50, '← 戻る', {
            fontSize: '16px',
            fill: '#FFFFFF',
            backgroundColor: '#FF4444',
            padding: { x: 10, y: 5 },
            borderRadius: 8
        }).setOrigin(0.5);
        
        // 戻るボタンのインタラクション
        this.backButton.setInteractive();
        this.backButton.on('pointerdown', () => {
            // ステージ選択画面に戻る
            scene.scene.start('MenuScene');
        });
        
        // ホバーエフェクト（PC用）
        this.backButton.on('pointerover', () => {
            this.backButton.setStyle({ backgroundColor: '#FF6666' });
        });
        
        this.backButton.on('pointerout', () => {
            this.backButton.setStyle({ backgroundColor: '#FF4444' });
        });
        
        // 選択された場所の情報表示用
        this.selectedAreaText = scene.add.text(scene.cameras.main.centerX, scene.cameras.main.height - 50, '', {
            fontSize: '14px',
            fill: '#000000',
            backgroundColor: '#FFFF99',
            padding: { x: 8, y: 4 },
            borderRadius: 8
        }).setOrigin(0.5);
        
        console.log('MapUI created successfully');
    }
    
    // MapUI専用の更新メソッド
    updateMapUI(gameSize) {
        // 画面サイズに応じてUI要素の位置を調整
        const centerX = gameSize.width / 2;
        
        if (this.titleText) {
            this.titleText.setPosition(centerX, 50);
        }
        
        if (this.instructionText) {
            this.instructionText.setPosition(centerX, 100);
        }
        
        if (this.selectedAreaText) {
            this.selectedAreaText.setPosition(centerX, gameSize.height - 50);
        }
        
        console.log(`MapUI updated for size: ${gameSize.width}x${gameSize.height}`);
    }
    
    // 選択されたエリアの情報を表示
    showSelectedArea(areaName, areaDescription) {
        if (this.selectedAreaText) {
            this.selectedAreaText.setText(`選択: ${areaDescription}`);
        }
    }
    
    // 選択されたエリアの情報を非表示
    hideSelectedArea() {
        if (this.selectedAreaText) {
            this.selectedAreaText.setText('');
        }
    }
    
    // モバイル判定
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}