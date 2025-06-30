export class InputManager {
    setupKeyboard(scene, playerController) {
        // キーボード入力設定
        const cursors = scene.input.keyboard.createCursorKeys();
        const wasd = scene.input.keyboard.addKeys('W,S,A,D');
        
        // プレイヤーコントローラーにキー情報を渡す
        playerController.setInputKeys(cursors, wasd);
    }
}