import { ConversationManager } from '../data/stage1/conversationData.js';

export class ConversationTrigger {
    constructor(scene) {
        this.scene = scene;
        this.conversationManager = new ConversationManager();
        this.isConversationActive = false;
        this.triggeredEvents = new Set(); // 発動済みイベントを記録
        
        // デバッグ: 利用可能な会話データを確認
        console.log('[ConversationTrigger] 初期化完了');
        console.log('[ConversationTrigger] 利用可能な会話データ:', this.conversationManager.getAvailableEvents());
    }

    // 既存のCollisionManagerのstartConversationメソッドを拡張
    startConversation(npcId) {
        console.log(`[ConversationTrigger] 会話開始試行: ${npcId}`);
        
        // 新しいギャルゲ風システムの会話データがあるかチェック
        const conversationData = this.conversationManager.getConversation(npcId);
        
        console.log('[ConversationTrigger] 会話データ取得結果:', conversationData);
        
        if (conversationData) {
            // 新しいギャルゲ風会話システムを使用
            console.log(`[ConversationTrigger] ギャルゲ風会話開始: ${npcId}`);
            this.startVisualNovelConversation(conversationData);
        } else {
            // 既存のシンプルな会話システムを使用
            console.log(`[ConversationTrigger] シンプル会話開始: ${npcId}`);
            this.startSimpleDialog(npcId);
        }
    }

    // ギャルゲ風会話システムの開始（NPCクリック時とエリアマーカー「はい」クリック時の両方で使用）
    startVisualNovelConversation(conversationData, areaName = null) {
        // シーンの有効性をチェック
        if (!this.scene || !this.scene.scene) {
            console.warn('[ConversationTrigger] Scene is not available for conversation');
            return;
        }
        
        // 既に会話が起動中の場合は停止
        if (this.isConversationActive) {
            console.log('[ConversationTrigger] 既存の会話を停止して新しい会話を開始');
            this.scene.scene.stop('ConversationScene');
            this.isConversationActive = false;
        }
        
        // 既存のConversationSceneが存在する場合は停止
        const existingScene = this.scene.scene.get('ConversationScene');
        if (existingScene && existingScene.scene.isActive()) {
            this.scene.scene.stop('ConversationScene');
        }
        
        this.isConversationActive = true;
        
        // 会話データにエリア名を追加
        const enhancedConversationData = {
            ...conversationData,
            areaName: areaName
        };
        
        try {
            const scenePlugin = this.scene.scene;
            const cs = scenePlugin.get('ConversationScene');
            if (!cs) {
                console.error('[ConversationTrigger] ConversationScene not found');
                this.isConversationActive = false;
                return;
            }

            if (!cs.scene.isActive()) {
                // オーバーレイとして起動
                scenePlugin.launch('ConversationScene');
                // 起動直後（次フレーム）に会話開始
                this.scene.time.delayedCall(0, () => {
                    try {
                        // 最前面に
                        try { scenePlugin.bringToTop('ConversationScene'); } catch(e) { /* ignore */ }
                        cs.scene.setVisible(true);
                        cs.scene.setActive(true);
                        cs.startConversation(enhancedConversationData);
                    } catch(e) { console.error('[ConversationTrigger] start after launch error:', e); this.isConversationActive = false; }
                });
            } else {
                // 既に動作中ならそのまま開始
                try {
                    try { scenePlugin.bringToTop('ConversationScene'); } catch(e) { /* ignore */ }
                    cs.scene.setVisible(true);
                    cs.scene.setActive(true);
                    cs.startConversation(enhancedConversationData);
                } catch(e) { console.error('[ConversationTrigger] start on active error:', e); this.isConversationActive = false; }
            }

            // 会話終了時の後片付け
            try {
                cs.events.once('conversationEnded', () => {
                    try { scenePlugin.stop('ConversationScene'); } catch(e) { /* ignore */ }
                    this.isConversationActive = false;
                    console.log('[ConversationTrigger] 会話終了: isConversationActive = false');
                });
                
                // 会話中断時の後片付けも追加
                cs.events.once('conversationInterrupted', () => {
                    try { scenePlugin.stop('ConversationScene'); } catch(e) { /* ignore */ }
                    this.isConversationActive = false;
                    console.log('[ConversationTrigger] 会話中断: isConversationActive = false');
                });
            } catch(e) { /* ignore */ }
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

    // NPCクリック時の処理（エリアマーカー「はい」クリック時と同じ会話システムを使用）
    setupNpcClickHandler(sprite, npcId) {
        console.log(`[ConversationTrigger] setupNpcClickHandler: sprite=${sprite.name || 'unnamed'}, npcId=${npcId}`);
        
        sprite.setInteractive();
        sprite.on('pointerdown', () => {
            console.log(`[ConversationTrigger] NPCクリック: ${sprite.name || 'unnamed'} -> ${npcId}`);
            
            if (!this.isConversationActive) {
                this.startConversation(npcId);
            } else {
                console.log('[ConversationTrigger] 会話中、新しい会話を開始しません');
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
    
    // リソースを解放
    destroy() {
        // 会話がアクティブな場合は停止
        if (this.isConversationActive) {
            this.scene.scene.stop('ConversationScene');
            this.isConversationActive = false;
        }
        
        // イベントリスナーをクリア
        this.triggeredEvents.clear();
        
        // シーンへの参照を削除
        this.scene = null;
        
        // 会話マネージャーをクリーンアップ
        if (this.conversationManager) {
            this.conversationManager = null;
        }
    }
} 