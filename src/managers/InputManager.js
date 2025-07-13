export class InputManager {
    constructor() {
        this.cursors = null;
        this.wasd = null;
    }
    
    setupKeyboard(scene, playerController) {
        // キーボード入力設定
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys('W,S,A,D');
        
        // プレイヤーコントローラーにキー情報を渡す
        playerController.setInputKeys(this.cursors, this.wasd);
    }
    
    destroy() {
        try {
            if (this.cursors) this.cursors = null;
            if (this.wasd) this.wasd = null;
        } catch (error) {
            console.error('Error during InputManager cleanup:', error);
        }
    }
}