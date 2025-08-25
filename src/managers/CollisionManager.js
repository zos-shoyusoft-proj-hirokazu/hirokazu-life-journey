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
        
        // 移動先のフロアを決定
        let targetFloor = 1;
        if (moveId === 'move') {
            // 現在のフロアから次のフロアへ
            if (this.scene.currentFloor === 1) {
                targetFloor = 2;
            } else if (this.scene.currentFloor === 2) {
                targetFloor = 1;
            }
        }
        
        // フロア移動を実行
        this.scene.changeFloor(targetFloor);
    }

    startConversation(npcId) {
        // NPCをプレイヤーの方向に向かせる
        if (this.scene.playerController && this.scene.playerController.player && this.scene.mapManager) {
            const playerPos = this.scene.playerController.getPosition();
            this.scene.mapManager.makeNpcFacePlayer(npcId, playerPos.x, playerPos.y);
        }
        
        // ギャルゲ風の会話システムを優先
        if (this.scene.conversationTrigger) {
            this.scene.conversationTrigger.startConversation(npcId);
        } else if (this.dialogSystem) {
            // フォールバック：既存のDialogSystemを使用
            this.dialogSystem.startDialog(npcId);
        }
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
                    // NPCは重なりで会話、かつ衝突も設定
                    this.scene.physics.add.overlap(player, sprite, 
                        () => this.startConversation(objectName), null, this.scene);
                    this.scene.physics.add.collider(player, sprite);
                    console.log(`[CollisionManager] NPCの衝突判定と重なり判定を設定: ${objectName}`);
                } else if (objectType === 'move') {
                    // moveは重なりで移動のみ
                    console.log(`[CollisionManager] moveオブジェクトの衝突判定を設定: ${objectName}`);
                    console.log(`[CollisionManager] moveオブジェクトの座標: (${sprite.x}, ${sprite.y}), サイズ: ${sprite.width}x${sprite.height}`);
                    console.log(`[CollisionManager] プレイヤーの初期位置: (${player.x}, ${player.y})`);
                    console.log('[CollisionManager] moveオブジェクトの物理ボディ:', sprite.body);
                    console.log('[CollisionManager] プレイヤーの物理ボディ:', player.body);
                    console.log('[CollisionManager] moveオブジェクトにoverlapイベントを設定中...');
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