// Stage2専用の動作制御システム
export class BehaviorManager_Stage2 {
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
                this.setupItemBehavior(sprite);
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
            case 'friend2_4':
                this.setupFriend2Animation(sprite);
                break;
            case 'shopkeeper':
                this.setupShopkeeperAnimation(sprite);
                break;
            case 'guard':
                this.setupGuardAnimation(sprite);
                break;
            case 'merchant':
                this.setupMerchantAnimation(sprite);
                break;
            default:
                // デフォルトNPC動作（静止）
                break;
        }
    }

    // アイテムの動作設定
    setupItemBehavior(sprite) {
        // Stage2のアイテムは特別なエフェクト
        this.scene.tweens.add({
            targets: sprite,
            alpha: 0.5,
            scale: 1.2,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
    }

    // 敵の動作設定
    setupEnemyBehavior(sprite, obj) {
        // 個別の敵動作
        switch(obj.name) {
            case 'boss_stage2':
                this.setupBossAnimation(sprite);
                break;
            case 'strong_enemy':
                this.setupStrongEnemyAnimation(sprite);
                break;
            default:
                this.setupDefaultEnemyAnimation(sprite);
                break;
        }
    }

    // === Stage2専用アニメーション定義 ===

    // Friend2のアニメーション
    setupFriend2Animation(sprite) {
        this.scene.tweens.add({
            targets: sprite,
            alpha: 0.8,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // 店主のアニメーション
    setupShopkeeperAnimation(sprite) {
        // 店主は手を振る動作
        this.scene.tweens.add({
            targets: sprite,
            rotation: 0.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Power1'
        });
    }

    // 警備員のアニメーション
    setupGuardAnimation(sprite) {
        // 警備員は左右に歩く
        this.scene.tweens.add({
            targets: sprite,
            x: sprite.x + 40,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Linear'
        });
    }

    // 商人のアニメーション
    setupMerchantAnimation(sprite) {
        // 商人は上下に揺れる
        this.scene.tweens.add({
            targets: sprite,
            y: sprite.y + 8,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // ボスのアニメーション
    setupBossAnimation(sprite) {
        // ボスは威圧的な動き
        this.scene.tweens.add({
            targets: sprite,
            scale: 1.2,
            rotation: 0.2,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
    }

    // 強敵のアニメーション
    setupStrongEnemyAnimation(sprite) {
        // 強敵は素早く動く
        this.scene.tweens.add({
            targets: sprite,
            x: sprite.x + 60,
            y: sprite.y + 20,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Back.easeInOut'
        });
    }

    // デフォルト敵アニメーション
    setupDefaultEnemyAnimation(sprite) {
        // Stage2の敵はより激しく動く
        this.scene.tweens.add({
            targets: sprite,
            x: sprite.x + 35,
            rotation: Math.PI / 8,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
    }

    // 会話開始処理
    startConversation(npcId) {
        // CollisionManagerの会話システムを使用
        if (this.scene.collisionManager) {
            this.scene.collisionManager.startConversation(npcId);
        }
    }
}