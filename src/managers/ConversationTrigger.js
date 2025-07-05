import { ConversationManager } from '../data/stage1/conversationData.js';

export class ConversationTrigger {
    constructor(scene) {
        this.scene = scene;
        this.conversationManager = new ConversationManager();
        this.isConversationActive = false;
        this.triggeredEvents = new Set(); // 発動済みイベントを記録
    }

    // 既存のCollisionManagerのstartConversationメソッドを拡張
    startConversation(npcId) {
        console.log(`Starting conversation with ${npcId}`);
        
        // 新しいギャルゲ風システムの会話データがあるかチェック
        const conversationData = this.conversationManager.getConversation(npcId);
        
        if (conversationData) {
            // 新しいギャルゲ風会話システムを使用
            this.startVisualNovelConversation(conversationData);
        } else {
            // 既存のシンプルな会話システムを使用
            this.startSimpleDialog(npcId);
        }
    }

    // ギャルゲ風会話システムの開始
    startVisualNovelConversation(conversationData) {
        this.isConversationActive = true;
        
        // ConversationSceneを起動
        this.scene.scene.launch('ConversationScene');
        
        // シーンの準備完了を待つ
        const conversationScene = this.scene.scene.get('ConversationScene');
        
        // create()が完了するまで少し待つ
        this.scene.time.delayedCall(100, () => {
            conversationScene.startConversation(conversationData);
        });
        
        // 会話終了時の処理
        conversationScene.events.once('conversationEnded', () => {
            this.scene.scene.stop('ConversationScene');
            this.isConversationActive = false;
            console.log('Visual novel conversation ended');
        });
    }

    // 既存のシンプルな会話システム
    startSimpleDialog(npcId) {
        if (this.scene.collisionManager && this.scene.collisionManager.getDialogSystem()) {
            this.scene.collisionManager.getDialogSystem().startDialog(npcId);
        }
    }

    // NPCクリック時の処理
    setupNpcClickHandler(sprite, npcId) {
        sprite.setInteractive();
        sprite.on('pointerdown', () => {
            if (!this.isConversationActive) {
                this.startConversation(npcId);
            }
        });
    }

    // エリアトリガーの設定
    setupAreaTrigger(x, y, width, height, eventId) {
        // 透明な矩形エリアを作成
        const triggerArea = this.scene.add.rectangle(x, y, width, height, 0x000000, 0);
        triggerArea.setInteractive();
        
        // プレイヤーがエリアに入った時の処理
        this.scene.physics.add.existing(triggerArea);
        triggerArea.body.setSize(width, height);
        
        // 重複検出でイベント発動
        this.scene.physics.add.overlap(
            this.scene.playerController.player, 
            triggerArea, 
            () => {
                if (!this.isConversationActive && !this.triggeredEvents.has(eventId)) {
                    this.triggeredEvents.add(eventId); // イベントを発動済みとして記録
                    this.startConversation(eventId);
                }
            },
            null, 
            this.scene
        );
        
        return triggerArea;
    }

    // 特定の座標に近づいた時の処理
    setupProximityTrigger(targetX, targetY, radius, eventId) {
        // updateメソッドで距離をチェック
        const checkProximity = () => {
            if (this.isConversationActive || this.triggeredEvents.has(eventId)) return;
            
            const player = this.scene.playerController.player;
            const distance = Phaser.Math.Distance.Between(
                player.x, player.y, 
                targetX, targetY
            );
            
            if (distance <= radius) {
                this.triggeredEvents.add(eventId); // イベントを発動済みとして記録
                this.startConversation(eventId);
            }
        };
        
        // シーンのupdateイベントに登録
        this.scene.events.on('update', checkProximity);
        
        return checkProximity;
    }

    // 会話がアクティブかどうかを確認
    isActive() {
        return this.isConversationActive;
    }
} 