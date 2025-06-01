import Phaser from 'phaser';

// ゲーム設定
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    parent: 'game-container',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

function preload() {
    // 一時的にシンプルな四角形でキャラクター作成
    this.add.rectangle(50, 50, 40, 40, 0xff0000);
}

function create() {
    // タイトル表示
    this.add.text(400, 100, 'ひろかずの大冒険RPG', {
        fontSize: '32px',
        fill: '#000000'
    }).setOrigin(0.5);

    // プレイヤー（新郎）作成
    this.player = this.add.rectangle(100, 300, 40, 40, 0x00ff00);
    
    // 開始メッセージ
    this.add.text(400, 500, 'スペースキーでスタート！', {
        fontSize: '24px',
        fill: '#000000'
    }).setOrigin(0.5);
}

function update() {
    // ゲームループ（後で実装）
}

// ゲーム開始 - gameを削除
new Phaser.Game(config);