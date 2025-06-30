// Stage1専用の動作制御システム
export class BehaviorManager_Stage1 {
    constructor(scene) {
        this.scene = scene;
    }

    // オブジェクトの動作を設定
    setupObjectBehavior(sprite, obj) {
        const objType = obj.type;

        switch(objType) {
            case 'npc':
                this.setupNpcBehavior(sprite, obj);
                break;
            case 'item':
                this.setupItemBehavior(sprite, obj);
                break;
            case 'enemy':
                this.setupEnemyBehavior(sprite, obj);
                break;
            default:
                // 壁などは動作なし
                break;
        }
    }

    // NPCの動作設定
    setupNpcBehavior(sprite, obj) {
        // 個別のNPC動作
        switch(obj.name) {
            case 'kuccoro1':
                this.setupKuccoro1Animation(sprite);
                break;
            case 'kuccoro2':
                this.setupKuccoro2Animation(sprite);
                break;
            case 'kuccoro3':
                this.setupKuccoro3Animation(sprite);
                break;
            case 'hanni':
                this.setupHanniAnimation(sprite);
                break;
            default:
                // デフォルトNPC動作（静止）
                break;
        }
    }

    // アイテムの動作設定
    setupItemBehavior(sprite, obj) {
        // アイテムの光るエフェクト
        this.scene.tweens.add({
            targets: sprite,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    // 敵の動作設定
    setupEnemyBehavior(sprite, obj) {
        // 個別の敵動作
        switch(obj.name) {
            case 'enemy1':
                this.setupEnemy1Animation(sprite);
                break;
            case 'enemy2':
                this.setupEnemy2Animation(sprite);
                break;
            default:
                this.setupDefaultEnemyAnimation(sprite);
                break;
        }
    }

    // === 個別アニメーション定義 ===

    // Kuccoro1のアニメーション
    setupKuccoro1Animation(sprite) {
        this.scene.tweens.add({
            targets: sprite,
            y: sprite.y + 5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // Kuccoro2のアニメーション
    setupKuccoro2Animation(sprite) {
        this.scene.tweens.add({
            targets: sprite,
            x: sprite.x + 20,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Power1'
        });
    }

    // Kuccoro3のアニメーション
    setupKuccoro3Animation(sprite) {
        this.scene.tweens.add({
            targets: sprite,
            rotation: Math.PI * 2,
            duration: 4000,
            repeat: -1,
            ease: 'Linear'
        });
    }

    // Hanniのアニメーション
    setupHanniAnimation(sprite) {
        this.scene.tweens.add({
            targets: sprite,
            scale: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // Enemy1のアニメーション
    setupEnemy1Animation(sprite) {
        this.scene.tweens.add({
            targets: sprite,
            x: sprite.x + 50,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
    }

    // Enemy2のアニメーション
    setupEnemy2Animation(sprite) {
        this.scene.tweens.add({
            targets: sprite,
            y: sprite.y + 30,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // デフォルト敵アニメーション
    setupDefaultEnemyAnimation(sprite) {
        this.scene.tweens.add({
            targets: sprite,
            x: sprite.x + 25,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Linear'
        });
    }

    // 会話開始処理
    startConversation(npcId) {
        console.log(`Starting conversation with ${npcId}`);
        // CollisionManagerの会話システムを使用
        if (this.scene.collisionManager) {
            this.scene.collisionManager.startConversation(npcId);
        }
    }
}