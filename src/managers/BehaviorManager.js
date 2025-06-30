// オブジェクトの動作制御システム
export class BehaviorManager {
    constructor(scene) {
        this.scene = scene;
    }

    setupNpcInteraction(sprite, obj) {
        sprite.setInteractive();
        sprite.on('pointerdown', () => {
            this.startConversation(obj.name);
        });
        
        // キーボードでの会話開始
        sprite.setData('isNpc', true);
        sprite.setData('npcId', obj.name);
    }

    setupItemCollection(sprite, obj) {
        sprite.setData('itemId', obj.name);
        sprite.setData('itemValue', obj.properties?.value || 1);
        
        // アイテムの光るエフェクト
        this.scene.tweens.add({
            targets: sprite,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    setupEnemyBehavior(sprite, obj) {
        sprite.setData('enemyId', obj.name);
        sprite.setData('enemyLevel', obj.properties?.level || 1);
        
        // 敵の巡回AI（簡単な例）
        this.scene.tweens.add({
            targets: sprite,
            x: sprite.x + 50,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
    }

    startConversation(npcId) {
        console.log(`Starting conversation with ${npcId}`);
        // CollisionManagerの会話システムを使用
        if (this.scene.collisionManager) {
            this.scene.collisionManager.startConversation(npcId);
        }
    }
}