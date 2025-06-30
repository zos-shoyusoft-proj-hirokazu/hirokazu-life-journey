export class CameraManager {
    setupCamera(scene, map, player) {
        // マップのサイズを取得
        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;
        
        // カメラの範囲をマップ内に制限
        scene.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        
        // プレイヤーを中心に画面が動く
        scene.cameras.main.startFollow(player);
        
        // プレイヤーの移動範囲もマップ内に制限
        scene.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    }
}