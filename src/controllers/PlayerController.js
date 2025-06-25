export class PlayerController {
    constructor(scene) {
        this.scene = scene;
        this.player = null;
        this.cursors = null;
        this.wasd = null;
        this.speed = 300;
    }

    createPlayer(x, y) {
        // プレイヤー（新郎）作成 - 物理オブジェクトとして
        this.player = this.scene.physics.add.sprite(x, y, null);
        this.player.setDisplaySize(30, 30);
        this.player.setTint(0xff0000);

        // プレイヤーの物理設定
        this.player.setCollideWorldBounds(true); // 画面端で止まる
        this.player.setBounce(0.2); // 少し跳ね返る
    }

    setInputKeys(cursors, wasd) {
        this.cursors = cursors;
        this.wasd = wasd;
    }

    update() {
        if (!this.player || !this.cursors || !this.wasd) return;

        // 左右移動
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.setVelocityX(-this.speed);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.setVelocityX(this.speed);
        } else {
            this.player.setVelocityX(0);
        }

        // 上下移動
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.setVelocityY(-this.speed);
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.setVelocityY(this.speed);
        } else {
            this.player.setVelocityY(0);
        }
    }

    // タッチ操作用のメソッド
    setVelocity(vx, vy) {
        if (this.player) {
            this.player.setVelocity(vx, vy);
        }
    }

    getPosition() {
        return this.player ? { x: this.player.x, y: this.player.y } : { x: 0, y: 0 };
    }
}