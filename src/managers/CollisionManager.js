export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
        this.dialogSystem = null; 
        this.collisionGroups = {
            walls: null,
            npcs: null,
            items: null,
            enemies: null
        };
    }

    // DialogSystemの参照を設定するメソッドを追加
    setDialogSystem(dialogSystem) {
        this.dialogSystem = dialogSystem;
    }
    

    setupCollisionGroups() {
        // 各種グループを作成
        this.collisionGroups.walls = this.scene.physics.add.staticGroup();
        this.collisionGroups.npcs = this.scene.physics.add.staticGroup();
        this.collisionGroups.items = this.scene.physics.add.group();
        this.collisionGroups.enemies = this.scene.physics.add.group();
    }

    addObjectToCollision(sprite, obj) {
        const objType = obj.type || 'wall';
        
        // 物理ボディ
        this.scene.physics.add.existing(sprite, objType !== 'item' && objType !== 'enemy');
        
        // 当たり判定サイズを設定
        const width = obj.width || 32;
        const height = obj.height || 32;
        sprite.body.setSize(width, height);
        
        // 適切なグループに追加
        switch(objType) {
            case 'npc':
                this.collisionGroups.npcs.add(sprite);
                // NPCクラス共通設定
                sprite.setInteractive();
                sprite.on('pointerdown', () => {
                    // 会話中は新しい会話を開始しない
                    if (this.scene.isConversationActive && this.scene.isConversationActive()) {
                        console.log('[CollisionManager] 会話中のため、NPCクリックを無視します');
                        return;
                    }
                    
                    console.log(`[CollisionManager] NPCクリック: ${obj.name}`);
                    
                    // 使用済み会話かどうかを判定
                    if (this.scene.usedConversations && this.scene.usedConversations.has(obj.name)) {
                        // 使用済み → dialogを表示（おまけ）
                        if (this.scene.dialogSystem && this.scene.dialogSystem.hasDialog(obj.name)) {
                            this.scene.dialogSystem.showDialog(obj.name);
                        } else {
                            this.startConversation(obj.name);
                        }
                    } else {
                        // 未使用 → conversationDataを表示（本格的な会話イベント）
                        this.startConversation(obj.name);
                        // 使用済みにマーク
                        if (this.scene.usedConversations) {
                            this.scene.usedConversations.add(obj.name);
                        } else {
                            console.warn('[CollisionManager] usedConversationsが存在しません');
                        }
                    }
                });
                break;
            case 'move':
                this.collisionGroups.items.add(sprite);
                // 移動オブジェクト共通設定
                sprite.setData('moveId', obj.name);
                sprite.setData('moveType', obj.type);
                break;
            case 'item':
                this.collisionGroups.items.add(sprite);
                // アイテム共通設定
                sprite.setData('itemId', obj.name);
                break;
            case 'enemy':
                this.collisionGroups.enemies.add(sprite);
                // 敵共通設定
                sprite.setData('enemyId', obj.name);
                break;
            default:
                this.collisionGroups.walls.add(sprite);
        }
    }

    setupPlayerCollisions(player) {
        // 壁との衝突
        this.scene.physics.add.collider(player, this.collisionGroups.walls);
        
        // NPCとの衝突
        this.scene.physics.add.collider(player, this.collisionGroups.npcs);
        
        // アイテムとの重複（取得）
        this.scene.physics.add.overlap(player, this.collisionGroups.items, 
            this.collectItem, null, this.scene);
        
        // 敵との重複（戦闘）
        this.scene.physics.add.overlap(player, this.collisionGroups.enemies, 
            this.encounterEnemy, null, this.scene);
    }

    collectItem(player, item) {
        // moveオブジェクトの場合は移動処理
        if (item.getData('moveType') === 'move') {
            this.handleMoveObject(player, item);
        } else {
            // 通常のアイテム処理
            item.destroy();
        }
    }

    handleMoveObject(player, moveObject) {
        const moveId = moveObject.getData('moveId');
        console.log(`[CollisionManager] 移動オブジェクトに触れました: ${moveId}`);
        
        // 現在のステージの最大フロア数を取得
        const maxFloor = this.scene.stageConfig?.floors?.length || 1;
        console.log(`[CollisionManager] 現在のステージの最大フロア数: ${maxFloor}`);
        
        // moveオブジェクトの名前に含まれる数字を解析して移動先フロアを決定
        let targetFloor = 1; // デフォルト
        
        if (moveId && moveId.startsWith('move_')) {
            // move_x の形式から数字を抽出
            const floorNumber = parseInt(moveId.replace('move_', ''));
            if (!isNaN(floorNumber) && floorNumber > 0 && floorNumber <= maxFloor) {
                targetFloor = floorNumber;
                console.log(`[CollisionManager] moveオブジェクト ${moveId} からフロア ${targetFloor} への移動を検出`);
            } else {
                console.warn(`[CollisionManager] 無効なフロア番号: ${moveId} (1-${maxFloor}の範囲外)`);
                return; // 無効なフロア番号の場合は移動しない
            }
        } else if (moveId === 'move') {
            // 従来の命名規則（後方互換性）
            if (this.scene.currentFloor === 1) {
                targetFloor = 2;
            } else if (this.scene.currentFloor === 2) {
                // 2階からは1階に戻る（3階がない場合）
                targetFloor = maxFloor >= 3 ? 3 : 1;
            } else if (this.scene.currentFloor === 3) {
                targetFloor = 2; // フロア3からフロア2に移動
            }
            console.log(`[CollisionManager] 従来の命名規則を使用: フロア ${this.scene.currentFloor} → ${targetFloor}`);
        } else {
            console.warn(`[CollisionManager] 不明なmoveオブジェクト: ${moveId}`);
            return; // 不明なmoveオブジェクトの場合は移動しない
        }
        
        // フロア移動を実行
        console.log(`[CollisionManager] (${targetFloor}) を呼び出し`);
        this.scene.changeFloor(targetFloor);
    }

    startConversation(npcId) {
        console.log(`[CollisionManager] 会話開始: ${npcId}`);
        console.log(`[CollisionManager] 現在の会話中フラグ: ${this.scene.isConversationActive ? this.scene.isConversationActive() : 'undefined'}`);
        
        // NPC名からイベントIDを取得
        const eventId = this.getEventIdFromNPCName(npcId);
        
        if (eventId) {
            // eventIdがある場合 → 会話イベントを開始
            
            // NPCをプレイヤーの方向に向かせる
            if (this.scene.playerController && this.scene.playerController.player && this.scene.mapManager) {
                const playerPos = this.scene.playerController.getPosition();
                this.scene.mapManager.makeNpcFacePlayer(npcId, playerPos.x, playerPos.y);
            }
            
            // ギャルゲ風の会話システムを優先
            if (this.scene.conversationTrigger) {
                this.scene.conversationTrigger.startConversation(eventId);
            } else if (this.dialogSystem) {
                // フォールバック：既存のDialogSystemを使用
                this.dialogSystem.startDialog(eventId);
            }
        } else {
            // eventIdがない場合 → DialogSystemでダイアログを表示
            
            if (this.scene.dialogSystem && this.scene.dialogSystem.hasDialog(npcId)) {
                this.scene.dialogSystem.showDialog(npcId);
            } else {
                console.warn(`[CollisionManager] NPC ${npcId} のダイアログが見つかりません`);
            }
        }
    }

    // NPC名からイベントIDを取得するメソッドを追加
    getEventIdFromNPCName(npcName) {
        const currentFloor = this.scene.stageConfig?.currentFloor;
        
        if (!currentFloor || !currentFloor.npcs) {
            console.warn('[CollisionManager] currentFloorまたはnpcsが存在しません');
            return null;
        }
        
        const npc = currentFloor.npcs.find(npc => npc.name === npcName);
        
        if (!npc) {
            console.warn(`[CollisionManager] NPC名 "${npcName}" がフロア${currentFloor.number}で見つかりません`);
            console.log('[CollisionManager] 利用可能なNPC名:', currentFloor.npcs.map(n => n.name));
        }
        
        const eventId = npc ? npc.eventId : null;
        
        return eventId;
    }
    
    isDialogActive() {
        // 追加：nullチェック
        if (this.dialogSystem) {
            return this.dialogSystem.isDialogActive();
        }
        return false;
    }

    getDialogSystem() {
        return this.dialogSystem;
    }

    // 統合メソッド
    setupAllCollisions(player, mapManager) {
        this.setupTileCollisions(player, mapManager);
        this.setupObjectCollisions(player, mapManager);
        this.setupPlayerCollisions(player);
    }
    
    // オブジェクトレイヤーとの当たり判定
    setupObjectCollisions(player, mapManager) {
        if (mapManager && mapManager.objectGroup) {
            // オブジェクトグループ内の各オブジェクトを処理
            mapManager.objectGroup.children.entries.forEach(sprite => {
                const objectType = sprite.getData('objectType');
                const objectName = sprite.getData('objectName');
                
                if (objectType === 'wall' || objectType === '壁' || objectType === 'Wall') {
                    // 壁はプレイヤーと衝突させる
                    this.scene.physics.add.collider(player, sprite);
                } else if (objectType === 'npc') {
                    // NPCはクリックで会話開始、物理的な衝突も設定（通り抜け不可）
                    sprite.setInteractive(); // クリック可能にする
                    sprite.on('pointerdown', () => {
                        console.log(`[CollisionManager] NPCをクリック: ${objectName}`);
                        this.startConversation(objectName);
                    });
                    this.scene.physics.add.collider(player, sprite); // 物理的な衝突を設定
                } else if (objectType === 'move') {
                    // moveは重なりで移動のみ
                    
                    this.scene.physics.add.overlap(player, sprite, 
                        () => {
                            this.handleMoveObject(player, sprite);
                        }, null, this.scene);
                }
            });
            
        } else {
            console.warn('[CollisionManager] objectGroupが見つかりません');
        }
    }

    // タイルマップとの当たり判定
    setupTileCollisions(player, mapManager) {
        if (mapManager && mapManager.layers) {  // 追加：nullチェック
            mapManager.layers.forEach(layer => {
                if (layer) {
                    this.scene.physics.add.collider(player, layer);
                }
            });
        }
    }
    
    // リソースを解放
    destroy() {
        // 衝突グループをクリア
        if (this.collisionGroups) {
            Object.keys(this.collisionGroups).forEach(key => {
                if (this.collisionGroups[key]) {
                    this.collisionGroups[key].clear();
                    this.collisionGroups[key] = null;
                }
            });
            this.collisionGroups = null;
        }
        
        // DialogSystemの参照をクリア
        this.dialogSystem = null;
        
        // シーンへの参照を削除
        this.scene = null;
    }

    // NPC名から会話を開始するメソッド
    startConversationFromNPCName(npcName) {
        // 現在のフロアのNPC設定を取得
        const currentFloor = this.scene.stageConfig.currentFloor;
        if (!currentFloor || !currentFloor.npcs) {
            console.error('[CollisionManager] 現在のフロアのNPC設定が見つかりません');
            return;
        }
        
        // NPC名からeventIdを取得
        const npc = currentFloor.npcs.find(npc => npc.name === npcName);
        if (!npc) {
            console.error(`[CollisionManager] NPC名 "${npcName}" が現在のフロアで見つかりません`);
            return;
        }
        
        const eventId = npc.eventId;
        
        if (eventId) {
            // eventIdがある場合 → 会話イベントを開始
            if (this.scene.conversationTrigger) {
                this.scene.conversationTrigger.startConversation(eventId);
            } else {
                console.error('[CollisionManager] ConversationTriggerが初期化されていません');
            }
        } else {
            // eventIdがない場合 → DialogSystemでダイアログを表示
            if (this.scene.dialogSystem && this.scene.dialogSystem.hasDialog(npcName)) {
                this.scene.dialogSystem.showDialog(npcName);
            } else {
                console.warn(`[CollisionManager] NPC ${npcName} のダイアログが見つかりません`);
            }
        }
    }

    setupNpcInteraction(npc) {
        if (!npc || !npc.name) {
            console.warn('[CollisionManager] NPC設定が不完全です:', npc);
            return;
        }

        // 会話中は新しい会話を開始しない
        if (this.scene.isConversationActive && this.scene.isConversationActive()) {
            console.log('[CollisionManager] 会話中のため、NPCクリックを無視します');
            return;
        }
        
        // NPCをクリック可能にする
        npc.setInteractive();
        npc.on('pointerdown', () => {
            // 会話中は新しい会話を開始しない（二重チェック）
            if (this.scene.isConversationActive && this.scene.isConversationActive()) {
                console.log('[CollisionManager] 会話中のため、NPCクリックを無視します');
                return;
            }
            
            // 会話トリガーに処理を委譲
            if (this.scene.conversationTrigger) {
                this.scene.conversationTrigger.startConversation(npc.name);
            } else {
                console.error('[CollisionManager] ConversationTriggerが初期化されていません');
            }
        });
    }


}