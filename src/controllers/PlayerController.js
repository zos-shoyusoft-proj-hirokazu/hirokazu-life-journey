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
        // nullテクスチャの代わりに、透明な1x1ピクセルのテクスチャを作成
        if (!this.scene.textures.exists('player_placeholder')) {
            this.scene.textures.addBase64('player_placeholder', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        }
        
        this.player = this.scene.physics.add.sprite(x, y, 'player_placeholder');
        this.player.setDisplaySize(30, 30);
        this.player.setTint(0xff0000);

        // プレイヤーの物理設定
        this.player.setCollideWorldBounds(true); // 画面端で止まる
        this.player.setBounce(0); // 跳ね返りを無効化（滑らかな動きのため）
        this.player.setDrag(200); // 慣性を追加して滑らかに停止
    }

    setInputKeys(cursors, wasd) {
        this.cursors = cursors;
        this.wasd = wasd;
    }

    update() {
        // 初期化チェック
        if (!this.player || !this.cursors || !this.wasd) {
            return;
        }

        let velocityX = 0;
        let velocityY = 0;

        // 左右移動
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -this.speed;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = this.speed;
        }

        // 上下移動
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -this.speed;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = this.speed;
        }

        // 実際の速度設定
        this.player.setVelocityX(velocityX);
        this.player.setVelocityY(velocityY);
    }

    // タッチ操作用のメソッド（統一された方法）
    setVelocity(vx, vy) {
        if (this.player) {
            this.player.setVelocityX(vx);
            this.player.setVelocityY(vy);
        }
    }

    getPosition() {
        return this.player ? { x: this.player.x, y: this.player.y } : { x: 0, y: 0 };
    }
}