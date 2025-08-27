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
                    this.startConversation(obj.name);
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
        
        // moveオブジェクトの名前に含まれる数字を解析して移動先フロアを決定
        let targetFloor = 1; // デフォルト
        
        if (moveId && moveId.startsWith('move_')) {
            // move_x の形式から数字を抽出
            const floorNumber = parseInt(moveId.replace('move_', ''));
            if (!isNaN(floorNumber) && floorNumber > 0 && floorNumber <= 3) {
                targetFloor = floorNumber;
                console.log(`[CollisionManager] moveオブジェクト ${moveId} からフロア ${targetFloor} への移動を検出`);
            } else {
                console.warn(`[CollisionManager] 無効なフロア番号: ${moveId} (1-3の範囲外)`);
            }
        } else if (moveId === 'move') {
            // 従来の命名規則（後方互換性）
            if (this.scene.currentFloor === 1) {
                targetFloor = 2;
            } else if (this.scene.currentFloor === 2) {
                targetFloor = 3;
            } else if (this.scene.currentFloor === 3) {
                targetFloor = 2; // フロア3からフロア2に移動
            }
            console.log(`[CollisionManager] 従来の命名規則を使用: フロア ${this.scene.currentFloor} → ${targetFloor}`);
        } else {
            console.warn(`[CollisionManager] 不明なmoveオブジェクト: ${moveId}`);
        }
        
        // フロア移動を実行
        console.log(`[CollisionManager] (${targetFloor}) を呼び出し`);
        this.scene.changeFloor(targetFloor);
    }

    startConversation(npcId) {
        console.log(`[CollisionManager] 会話開始: ${npcId}`);
        
        // NPC名からイベントIDを取得
        const eventId = this.getEventIdFromNPCName(npcId);
        
        if (eventId) {
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
            console.warn(`[CollisionManager] ${npcId}の会話データが見つかりません`);
        }
    }

    // NPC名からイベントIDを取得するメソッドを追加
    getEventIdFromNPCName(npcName) {
        console.log(`[CollisionManager] NPC名からイベントID取得開始: ${npcName}`);
        
        const currentFloor = this.scene.stageConfig?.currentFloor;
        console.log('[CollisionManager] currentFloor:', currentFloor);
        
        if (!currentFloor || !currentFloor.npcs) {
            console.warn('[CollisionManager] currentFloorまたはnpcsが存在しません');
            return null;
        }
        
        console.log('[CollisionManager] npcs:', currentFloor.npcs);
        
        const npc = currentFloor.npcs.find(npc => npc.name === npcName);
        console.log('[CollisionManager] 見つかったNPC:', npc);
        
        const eventId = npc ? npc.eventId : null;
        console.log(`[CollisionManager] 取得されたイベントID: ${eventId}`);
        
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
        console.log('[CollisionManager] setupAllCollisions開始');
        console.log(`[CollisionManager] プレイヤー: ${player ? '存在' : 'null'}, MapManager: ${mapManager ? '存在' : 'null'}`);
        
        this.setupTileCollisions(player, mapManager);
        this.setupObjectCollisions(player, mapManager);
        this.setupPlayerCollisions(player);
        
        console.log('[CollisionManager] setupAllCollisions完了');
    }
    
    // オブジェクトレイヤーとの当たり判定
    setupObjectCollisions(player, mapManager) {
        console.log('[CollisionManager] setupObjectCollisions開始');
        
        if (mapManager && mapManager.objectGroup) {
            console.log(`[CollisionManager] objectGroup発見: ${mapManager.objectGroup.children.entries.length}個のオブジェクト`);
            
            // オブジェクトグループ内の各オブジェクトを処理
            mapManager.objectGroup.children.entries.forEach(sprite => {
                const objectType = sprite.getData('objectType');
                const objectName = sprite.getData('objectName');
                
                console.log(`[CollisionManager] オブジェクト処理: ${objectName} (${objectType})`);
                
                if (objectType === 'wall' || objectType === '壁' || objectType === 'Wall') {
                    // 壁はプレイヤーと衝突させる
                    this.scene.physics.add.collider(player, sprite);
                    console.log(`[CollisionManager] 壁の衝突判定を設定: ${objectName}`);
                } else if (objectType === 'npc') {
                    // NPCはクリックで会話開始、衝突判定も設定
                    sprite.setInteractive(); // クリック可能にする
                    sprite.on('pointerdown', () => {
                        console.log(`[CollisionManager] NPCをクリック: ${objectName}`);
                        this.startConversation(objectName);
                    });
                    this.scene.physics.add.collider(player, sprite);
                    console.log(`[CollisionManager] NPCのクリック判定と衝突判定を設定: ${objectName}`);
                } else if (objectType === 'move') {
                    // moveは重なりで移動のみ
                    console.log(`[CollisionManager] moveオブジェクトの衝突判定を設定: ${objectName}`);
                    
                    this.scene.physics.add.overlap(player, sprite, 
                        () => {
                            console.log(`[CollisionManager] moveオブジェクトに触れました: ${objectName}`);
                            this.handleMoveObject(player, sprite);
                        }, null, this.scene);
                    console.log('[CollisionManager] moveオブジェクトにoverlapイベントを設定完了');
                }
            });
            
        } else {
            console.warn('[CollisionManager] objectGroupが見つかりません');
        }
        
        console.log('[CollisionManager] setupObjectCollisions完了');
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
}