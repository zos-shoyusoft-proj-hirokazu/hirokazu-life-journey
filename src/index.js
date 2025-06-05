import Phaser from 'phaser';

// ゲーム設定
const config = {
    type: Phaser.AUTO,
    width: 667,
    height: 375,
    backgroundColor: '#87CEEB',
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let player;
let cursors;
let wasd;
let map;
let layers = [];

function preload() {
    // マップファイルを読み込み
    this.load.tilemapTiledJSON('map', 'assets/test_map3.tmj');
    
    // ★★★ 実際のPNGファイルを読み込み ★★★
    this.load.image('GK_A2_C_autotile', 'assets/GK_A2_C_autotile.png');
    this.load.image('GK_JC_A5_2', 'assets/GK_JC_A5_2.png');
    this.load.image('GK_JC_B_2', 'assets/GK_JC_B_2.png');
    this.load.image('tiles', 'assets/tiles.png');
    this.load.image('Tilemap', 'assets/Tilemap.png');
    
    // デバッグ用：読み込み完了を確認
    this.load.on('complete', () => {
        console.log('All assets loaded successfully');
    });
}

function create() {

    // マップ作成
    map = this.make.tilemap({ key: 'map' });

    // ★★★ 実際のタイルセット名でタイルセットを追加 ★★★
    try {
        const availableTilesets = [];
        
        // マップのサイズを取得
        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;
        // カメラの範囲をマップ内に制限（青い外側部分を非表示）
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

        
        // プレイヤーの移動範囲もマップ内に制限（下にいけない問題解決）
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        // TMJファイル内のタイルセット名に合わせて追加
        map.tilesets.forEach(tilesetData => {
            let tileset = null;
            const name = tilesetData.name;
            
            // ★★★ 全て32x32サイズに修正 ★★★
            // タイルセット名に応じて適切な画像を割り当て
            if (name.includes('GK_A2_C') || name === 'GK_A2_C_autotile') {
                tileset = map.addTilesetImage(name, 'GK_A2_C_autotile', 32, 32);
            } else if (name.includes('GK_JC_A5') || name === 'GK_JC_A5_2') {
                tileset = map.addTilesetImage(name, 'GK_JC_A5_2', 32, 32);
            } else if (name.includes('GK_JC_B') || name === 'GK_JC_B_2') {
                tileset = map.addTilesetImage(name, 'GK_JC_B_2', 32, 32);
            } else if (name === 'tiles' || name === 'tileset') {
                tileset = map.addTilesetImage(name, 'tiles', 32, 32);
            } else if (name.includes('Tilemap')) {
                tileset = map.addTilesetImage(name, 'Tilemap', 32, 32);
            } else {
                // デフォルトとしてtilesを使用
                console.warn(`Unknown tileset: ${name}, using tiles.png as fallback`);
                tileset = map.addTilesetImage(name, 'tiles', 32, 32);
            }
            
            if (tileset) {
                availableTilesets.push(tileset);
            }
        });
        // ★★★ レイヤーを作成（全てのタイルセットを渡す） ★★★
        map.layers.forEach(layerData => {
            const layer = map.createLayer(layerData.name, availableTilesets, 0, 0);
            if (layer) {
                // 基本設定
                layers.push(layer);
                layer.setDepth(-1);
                
                // 🚨 当たり判定設定
                layer.setCollisionByProperty({ collides: true });
                
                // デバッグ出力（1回だけ）
                console.log(`Layer created: ${layerData.name}`, layer);
            }
        });
    } catch (error) {
        console.error('Error creating tilesets/layers:', error);
        
        // ★★★ フォールバック：単一タイルセットで試行（32x32サイズ） ★★★
        console.log('Trying fallback with single tileset...');
        try {
            const fallbackTileset = map.addTilesetImage('tileset', 'tiles', 32, 32);
            const fallbackLayer = map.createLayer(0, fallbackTileset, 0, 0);
            if (fallbackLayer) {
                layers.push(fallbackLayer);
                fallbackLayer.setDepth(-1);
                console.log('Fallback layer created');

                // 🔥🔥🔥 【正しい位置】フォールバック用当たり判定 🔥🔥🔥
                fallbackLayer.setCollisionByProperty({ collides: true });
            }
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
        }
    }

    // タイトル表示（文字サイズを調整）
    this.add.text(400, 50, '★★★テスト中★★★bbbbb', {
        fontSize: '24px',
        fill: '#000000',
        fontWeight: 'bold'
    }).setOrigin(0.5);
    
    // プレイヤー（新郎）作成 - 物理オブジェクトとして
    player = this.physics.add.sprite(100, 100, null);
    player.setDisplaySize(30, 30);
    player.setTint(0xff0000); 

    // プレイヤーを中心に画面が動く
    this.cameras.main.startFollow(player);
    
    // プレイヤーの物理設定
    player.setCollideWorldBounds(true); // 画面端で止まる
    player.setBounce(0.2); // 少し跳ね返る

    
    // ⬇️⬇️⬇️ プレイヤーがタイルにぶつかったら止まる設定 ⬇️⬇️⬇️
    // 当たり判定設定
    layers.forEach(layer => {
        if (layer) {
            this.physics.add.collider(player, layer);
        }
    });

    // キーボード入力設定
    cursors = this.input.keyboard.createCursorKeys();
    wasd = this.input.keyboard.addKeys('W,S,A,D');


    this.add.text(400, 550, '矢印キーまたはWASDで移動！マップ上を歩いてみよう！', {
        fontSize: '16px',
        fill: '#000000'
    }).setOrigin(0.5);

    // デバッグ用：座標表示
    this.playerPosText = this.add.text(10, 10, '', {
        fontSize: '14px',
        fill: '#000000',
        backgroundColor: '#ffffff', // 背景色追加
        padding: { x: 5, y: 5 } // パディング追加
    });
}

function update() {
    // プレイヤー移動
    const speed = 300;

    // 左右移動
    if (cursors.left.isDown || wasd.A.isDown) {
        player.setVelocityX(-speed);
    } else if (cursors.right.isDown || wasd.D.isDown) {
        player.setVelocityX(speed);
    } else {
        player.setVelocityX(0);
    }

    // 上下移動
    if (cursors.up.isDown || wasd.W.isDown) {
        player.setVelocityY(-speed);
    } else if (cursors.down.isDown || wasd.S.isDown) {
        player.setVelocityY(speed);
    } else {
        player.setVelocityY(0);
    }

    // 座標表示（デバッグ用）
    this.playerPosText.setText(`ひろかず位置: X=${Math.round(player.x)}, Y=${Math.round(player.y)}`);
}

// ゲーム開始
new Phaser.Game(config);