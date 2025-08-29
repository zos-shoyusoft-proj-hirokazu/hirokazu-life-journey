import { TaketaConversationManager } from '../data/taketa/conversationData.js';
import { ChoiceManager } from './ChoiceManager.js';

export class ConversationTrigger {
    constructor(scene) {
        this.scene = scene;
        
        // ステージに応じて会話データの取得先を動的に選択
        if (this.scene.scene.key === 'taketa_highschool') {
            this.conversationManager = new TaketaConversationManager();
        } else {
            // Stage1が削除されたため、デフォルトは竹田用を使用
            this.conversationManager = new TaketaConversationManager();
        }
        
        // 選択肢管理システムを初期化
        this.choiceManager = new ChoiceManager();
        
        this.isConversationActive = false;
        this.triggeredEvents = new Set(); // 発動済みイベントを記録
        this.currentConversationId = null;
        this.currentChoiceButtons = [];
    }

    // NPC名からイベントIDを取得するメソッド
    getEventIdFromNPCName(npcName) {
        // StageSceneの現在のフロア設定からNPC情報を取得
        const currentFloor = this.scene.stageConfig?.currentFloor;
        
        if (!currentFloor || !currentFloor.npcs) {
            console.warn('[ConversationTrigger] フロア設定またはNPC設定が見つかりません');
            return null;
        }
        
        // NPC名に一致するイベントIDを検索
        const npcConfig = currentFloor.npcs.find(npc => npc.name === npcName);
        if (npcConfig) {
            return npcConfig.eventId;
        }
        
        console.warn(`[ConversationTrigger] NPC ${npcName} の設定が見つかりません`);
        return null;
    }

    // NPCクリック時の会話開始メソッド
    startConversation(eventId) {
        if (this.isConversationActive) {
            return;
        }

        // ローディング画面を表示（会話開始時）
        if (window.LoadingManager) {
            window.LoadingManager.show('会話を読み込み中...', 0);
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

        // 現在の会話IDを設定
        this.currentConversationId = eventId;
        
        // DynamicConversationSceneを起動
        this.scene.scene.launch('DynamicConversationScene', {
            eventId: eventId,
            originalSceneKey: this.scene.scene.key
        });
        
        // 会話シーンの読み込み完了を監視
        if (window.LoadingManager) {
            console.log('[ConversationTrigger] 会話ローディング監視開始');
            let checkCount = 0;
            const maxChecks = 200; // 最大20秒（100ms × 200回）
            
            const checkScene = () => {
                checkCount++;
                console.log(`[ConversationTrigger] 会話読み込みチェック ${checkCount}/${maxChecks}`);
                
                const scene = this.scene.scene.get('DynamicConversationScene');
                if (scene && scene.resourcesLoaded) {
                    console.log('[ConversationTrigger] 会話読み込み完了');
                    window.LoadingManager.updateProgress(100, '完了！');
                    setTimeout(() => {
                        window.LoadingManager.hide();
                    }, 300);
                    return;
                }
                
                // 最大チェック回数に達した場合は強制終了
                if (checkCount >= maxChecks) {
                    window.LoadingManager.hide();
                    return;
                }
                
                setTimeout(checkScene, 100);
            };
            checkScene();
        }
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
                });
                
                // 会話中断時の後片付けも追加
                cs.events.once('conversationInterrupted', () => {
                    try { scenePlugin.stop('ConversationScene'); } catch(e) { /* ignore */ }
                    this.isConversationActive = false;
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
        // 選択を保存
        this.choiceManager.saveChoice(
            this.currentConversationId, 
            choiceId, 
            choice.result
        );
        
        // 選択肢ボタンを非表示
        this.clearChoiceButtons();
        
        // 選択に応じたメッセージを表示
        if (choice.nextMessages) {
            this.showChoiceMessages(choice.nextMessages);
        }
        
        // エンディング条件をチェック
        if (this.choiceManager.checkEndingCondition()) {
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