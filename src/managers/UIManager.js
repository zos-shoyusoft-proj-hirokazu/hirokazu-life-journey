export class UIManager {
    constructor() {
        this.playerPosText = null;
        this.backButton = null;
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
        
        // 戻るボタンを作成
        this.createBackButton(scene);
    }
    
    // 戻るボタンを作成する関数
    createBackButton(scene) {
        // シーンの有効性をチェック
        if (!scene || !scene.cameras || !scene.cameras.main) {
            console.warn('UIManager: Scene or camera is not available for back button');
            return;
        }
        
        // 角丸背景に修正
        this.backButtonGraphics = scene.add.graphics();
        this.backButtonGraphics.fillStyle(0x000000, 0.7);
        this.backButtonGraphics.fillRoundedRect(-45, -20, 80, 40, 5); // 指示通り
        this.backButtonGraphics.setPosition(50, 25);
        this.backButtonGraphics.setDepth(1000);
        this.backButtonGraphics.setScrollFactor(0);
        // インタラクティブ化（ヒットエリアも完全に同じ座標・サイズにする）
        this.backButtonGraphics.setInteractive(new Phaser.Geom.Rectangle(-45, -20, 80, 40), Phaser.Geom.Rectangle.Contains);
        this.backButtonGraphics.on('pointerdown', () => {
            if (window.returnToStageSelect) {
                window.returnToStageSelect();
            }
        });
        this.backButtonGraphics.on('pointerover', () => {
            this.backButtonGraphics.clear();
            this.backButtonGraphics.fillStyle(0x333333, 0.8);
            this.backButtonGraphics.fillRoundedRect(-45, -20, 80, 40, 5);
        });
        this.backButtonGraphics.on('pointerout', () => {
            this.backButtonGraphics.clear();
            this.backButtonGraphics.fillStyle(0x000000, 0.7);
            this.backButtonGraphics.fillRoundedRect(-45, -20, 80, 40, 5);
        });
        
        // 戻るボタンのテキスト
        this.backButtonText = scene.add.text(45, 34, '戻る', {
            fontSize: '16px',
            fill: '#ffffff',
            fontWeight: 'bold',
            fixedHeight: 40
        });
        this.backButtonText.setOrigin(0.5, 0.4);
        this.backButtonText.setScrollFactor(0); // カメラに固定
        this.backButtonText.setDepth(1001); // ボタンより手前に表示
        
        // 画面リサイズ時の位置調整
        scene.scale.on('resize', () => {
            if (scene && scene.cameras && scene.cameras.main && this.backButtonGraphics) {
                // 左上の位置は固定なので調整不要
            }
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
        // タイトル表示（左下に配置）
        this.titleText = scene.add.text(5, scene.cameras.main.height - 25, title, {
            fontSize: '18px',
            fill: '#FFD700',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 12, y: 6 },
            borderRadius: 8,
            stroke: '#FF6B35',
            strokeThickness: 2,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 6,
                fill: true
            }
        }).setOrigin(0, 1);
        
        // 説明テキスト（左下に配置）
        this.instructionText = scene.add.text(5, scene.cameras.main.height, '場所をタップして移動！', {
            fontSize: '14px',
            fill: '#FF6B35',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: { x: 8, y: 4 },
            borderRadius: 6,
            stroke: '#FF00FF',
            strokeThickness: 2,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#FF6B35',
                blur: 8,
                fill: true
            }
        }).setOrigin(0, 1);
        
        // 戻るボタンは削除 - 右上の戻るボタンのみを使用
        
        // 選択された場所の情報表示用
        this.selectedAreaText = scene.add.text(scene.cameras.main.centerX, scene.cameras.main.height - 50, '', {
            fontSize: '14px',
            fill: '#000000',
            backgroundColor: 'transparent',
            padding: { x: 8, y: 4 },
            borderRadius: 8
        }).setOrigin(0.5);
        
        // MapUI created successfully
    }
    
    // MapUI専用の更新メソッド
    updateMapUI(gameSize) {
        // 画面サイズに応じてUI要素の位置を調整（左下に配置）
        const centerX = gameSize.width / 2;
        
        if (this.titleText) {
            this.titleText.setPosition(10, gameSize.height - 40);
        }
        
        if (this.instructionText) {
            this.instructionText.setPosition(10, gameSize.height - 15);
        }
        
        if (this.selectedAreaText) {
            this.selectedAreaText.setPosition(centerX, gameSize.height - 50);
        }
        
        // MapUI updated for size
    }
    
    // 選択されたエリアの情報を表示
    showSelectedArea(areaName, areaDescription) {
        if (this.selectedAreaText) {
            this.selectedAreaText.setText(`エリア: ${areaName}
${areaDescription}`);
        }
    }
    
    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        try {
            const destroyIfExists = (prop) => {
                if (this[prop] && typeof this[prop].destroy === 'function') {
                    this[prop].destroy();
                    this[prop] = null;
                }
            };
            destroyIfExists('playerPosText');
            destroyIfExists('backButtonGraphics'); // 新しいプロパティを追加
            destroyIfExists('backButtonText');
            destroyIfExists('titleText');
            destroyIfExists('instructionText');
            destroyIfExists('selectedAreaText');
        } catch (error) {
            console.error('Error during UIManager cleanup:', error);
        }
    }
} 