import { ConversationManager } from '../data/stage1/conversationData.js';
import { TaketaConversationManager } from '../data/taketa/conversationData.js';
import { ChoiceManager } from './ChoiceManager.js';

export class ConversationTrigger {
    constructor(scene) {
        this.scene = scene;
        
        // ステージに応じて会話データの取得先を動的に選択
        if (this.scene.scene.key === 'taketa_highschool') {
            this.conversationManager = new TaketaConversationManager();
            console.log('[ConversationTrigger] 竹田高校用の会話データマネージャーを初期化');
        } else {
            this.conversationManager = new ConversationManager();
            console.log('[ConversationTrigger] 通常の会話データマネージャーを初期化');
        }
        
        // 選択肢管理システムを初期化
        this.choiceManager = new ChoiceManager();
        
        this.isConversationActive = false;
        this.triggeredEvents = new Set(); // 発動済みイベントを記録
        this.currentConversationId = null;
        this.currentChoiceButtons = [];
        
        // デバッグ: 利用可能な会話データを確認
        console.log('[ConversationTrigger] 初期化完了');
        console.log('[ConversationTrigger] 利用可能な会話データ:', this.conversationManager.getAvailableEvents());
    }

    // NPC名からイベントIDを取得するメソッド
    getEventIdFromNPCName(npcName) {
        console.log(`[ConversationTrigger] NPC名からイベントID取得開始: ${npcName}`);
        
        // StageSceneの現在のフロア設定からNPC情報を取得
        const currentFloor = this.scene.stageConfig?.currentFloor;
        console.log('[ConversationTrigger] currentFloor:', currentFloor);
        
        if (!currentFloor || !currentFloor.npcs) {
            console.warn('[ConversationTrigger] フロア設定またはNPC設定が見つかりません');
            return null;
        }
        
        // NPC名に一致するイベントIDを検索
        const npcConfig = currentFloor.npcs.find(npc => npc.name === npcName);
        if (npcConfig) {
            console.log('[ConversationTrigger] 見つかったNPC:', npcConfig);
            return npcConfig.eventId;
        }
        
        console.warn(`[ConversationTrigger] NPC ${npcName} の設定が見つかりません`);
        return null;
    }

    // NPCクリック時の会話開始メソッド
    startConversation(eventId) {
        console.log(`[ConversationTrigger] startConversation: ${eventId}`);
        
        if (this.isConversationActive) {
            console.log('[ConversationTrigger] 既に会話中です');
            return;
        }

        this.isConversationActive = true;
        
        // StageSceneの会話中フラグを設定
        if (this.scene.setConversationActive) {
            this.scene.setConversationActive(true);
        }

        // イベントIDが直接渡されているので、そのまま使用
        if (!eventId) {
            console.error('[ConversationTrigger] イベントIDが渡されていません');
            this.isConversationActive = false;
            if (this.scene.setConversationActive) {
                this.scene.setConversationActive(false);
            }
            return;
        }

        console.log(`[ConversationTrigger] イベントID: ${eventId} で会話を開始`);
        
        // 現在の会話IDを設定
        this.currentConversationId = eventId;
        console.log('[ConversationTrigger] 会話IDを設定:', this.currentConversationId);
        
        // DynamicConversationSceneを起動
        this.scene.scene.launch('DynamicConversationScene', {
            eventId: eventId,
            originalSceneKey: this.scene.scene.key
        });
    }

    // ギャルゲ風会話システムの開始（NPCクリック時とエリアマーカー「はい」クリック時の両方で使用）
    startVisualNovelConversation(conversationData, areaName = null, eventId = null) {
        // シーンの有効性をチェック
        if (!this.scene || !this.scene.scene) {
            console.warn('[ConversationTrigger] Scene is not available for conversation');
            return;
        }
        
        // 現在の会話IDを設定
        this.currentConversationId = eventId || areaName;
        console.log('[ConversationTrigger] 会話IDを設定:', this.currentConversationId);
        
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
                // conversationDataの構造を確認
                console.log('[ConversationTrigger] conversationData構造確認:');
                console.log('[ConversationTrigger] conversationData:', conversationData);
                console.log('[ConversationTrigger] conversationData.eventId:', conversationData.eventId);
                console.log('[ConversationTrigger] conversationData.id:', conversationData.id);
                console.log('[ConversationTrigger] conversationDataの全プロパティ:', Object.keys(conversationData));
                
                // DynamicConversationSceneを起動（会話処理はDynamicConversationSceneに任せる）
                // eventIdパラメータを使用（conversationDataにはeventIdプロパティがない）
                this.scene.scene.launch('DynamicConversationScene', { eventId: eventId });
                // DynamicConversationScene起動後は、ConversationSceneの処理は行わない
                return;
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
    
    // 選択肢を表示
    showChoices(choices, choiceId) {
        console.log('[ConversationTrigger] 選択肢を表示:', choices);
        console.log('[ConversationTrigger] 選択肢ID:', choiceId);
        console.log('[ConversationTrigger] 現在の会話ID:', this.currentConversationId);
        console.log('[ConversationTrigger] 選択肢の数:', choices.length);
        
        // 既存の選択肢ボタンをクリア
        this.clearChoiceButtons();
        
        choices.forEach((choice, index) => {
            const button = this.createChoiceButton(choice, choiceId, index);
            this.currentChoiceButtons.push(button);
        });
    }
    
    // 選択肢ボタンを作成
    createChoiceButton(choice, choiceId, index) {
        const buttonX = this.scene.cameras.main.centerX;
        const buttonY = this.scene.cameras.main.centerY + 100 + (index * 60);
        
        const button = this.scene.add.container(buttonX, buttonY);
        
        // ボタン背景
        const background = this.scene.add.graphics();
        background.fillStyle(0x2a2a2a, 0.9);
        background.fillRoundedRect(-100, -25, 200, 50, 8);
        button.add(background);
        
        // ボタンテキスト
        const text = this.scene.add.text(0, 0, choice.text, {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        button.add(text);
        
        // インタラクティブ設定
        button.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains);
        
        // クリックイベント
        button.on('pointerdown', () => {
            this.handleChoice(choice, choiceId);
        });
        
        // ホバー効果
        button.on('pointerover', () => {
            background.fillStyle(0x4a4a4a, 0.9);
            background.fillRoundedRect(-100, -25, 200, 50, 8);
        });
        
        button.on('pointerout', () => {
            background.fillStyle(0x2a2a2a, 0.9);
            background.fillRoundedRect(-100, -25, 200, 50, 8);
        });
        
        return button;
    }
    
    // 選択を処理
    handleChoice(choice, choiceId) {
        console.log('[ConversationTrigger] 選択:', choice.id, choice.result);
        console.log('[ConversationTrigger] 会話ID:', this.currentConversationId);
        console.log('[ConversationTrigger] 選択肢ID:', choiceId);
        
        // 選択を保存
        this.choiceManager.saveChoice(
            this.currentConversationId, 
            choiceId, 
            choice.result
        );
        
        // 保存後の選択データを確認
        console.log('[ConversationTrigger] 保存後の選択データ:', this.choiceManager.choices);
        
        // 選択肢ボタンを非表示
        this.clearChoiceButtons();
        
        // 選択に応じたメッセージを表示
        if (choice.nextMessages) {
            this.showChoiceMessages(choice.nextMessages);
        }
        
        // エンディング条件をチェック
        if (this.choiceManager.checkEndingCondition()) {
            console.log('[ConversationTrigger] エンディング条件達成！');
            // エンディングフラグを設定（後でエンディングボタン表示に使用）
            this.scene.endingUnlocked = true;
        }
    }
    
    // 選択後のメッセージを表示
    showChoiceMessages(messages) {
        // DynamicConversationSceneに選択後のメッセージを渡す
        if (this.scene.scene.isActive('DynamicConversationScene')) {
            const conversationScene = this.scene.scene.get('DynamicConversationScene');
            if (conversationScene && conversationScene.showMessages) {
                conversationScene.showMessages(messages);
            }
        }
    }
    
    // 選択肢ボタンをクリア
    clearChoiceButtons() {
        this.currentChoiceButtons.forEach(button => {
            if (button && button.destroy) {
                button.destroy();
            }
        });
        this.currentChoiceButtons = [];
    }
    
    // エンディング条件をチェック
    checkEndingCondition() {
        return this.choiceManager.checkEndingCondition();
    }
} 