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
        // 既に会話が起動中の場合は停止
        if (this.isConversationActive) {
            this.scene.scene.stop('ConversationScene');
            this.isConversationActive = false;
        }
        
        // 既存のConversationSceneが存在する場合は停止
        const existingScene = this.scene.scene.get('ConversationScene');
        if (existingScene && existingScene.scene.isActive()) {
            this.scene.scene.stop('ConversationScene');
        }
        
        this.isConversationActive = true;
        
        try {
            // 少し待ってからConversationSceneを起動
            this.scene.time.delayedCall(100, () => {
                
                // ConversationSceneを起動（既にStage1で追加済み）
                this.scene.scene.launch('ConversationScene');
                
                // シーンの準備完了を待つ
                const conversationScene = this.scene.scene.get('ConversationScene');
                
                if (conversationScene) {
                    
                    // create()が完了するまで待つ
                    this.scene.time.delayedCall(200, () => {
                        try {
                            conversationScene.startConversation(conversationData);
                        } catch (error) {
                            console.error('[ConversationTrigger] 会話開始エラー:', error);
                            console.error('[ConversationTrigger] エラースタック:', error.stack);
                            this.isConversationActive = false;
                        }
                    });
                    
                    // 会話終了時の処理
                    conversationScene.events.once('conversationEnded', () => {
                        this.scene.scene.stop('ConversationScene');
                        this.isConversationActive = false;
                    });
                } else {
                    console.error('[ConversationTrigger] ConversationSceneの取得に失敗');
                    this.isConversationActive = false;
                }
            });
        } catch (error) {
            console.error('[ConversationTrigger] startVisualNovelConversation()でエラーが発生:', error);
            console.error('[ConversationTrigger] エラースタック:', error.stack);
            this.isConversationActive = false;
        }
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

    // エリアトリガーの設定（一度だけ）
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

    // 特定の座標に近づいた時の処理（一度だけ）
    setupProximityTrigger(targetX, targetY, radius, eventId) {
        // パフォーマンス最適化：物理的な円形トリガーエリアを作成
        const triggerArea = this.scene.add.circle(targetX, targetY, radius, 0x000000, 0);
        this.scene.physics.add.existing(triggerArea);
        triggerArea.body.setCircle(radius);
        
        // 重複検出でイベント発動（毎フレーム計算不要）
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

    // 会話がアクティブかどうかを確認
    isActive() {
        return this.isConversationActive;
    }
} 