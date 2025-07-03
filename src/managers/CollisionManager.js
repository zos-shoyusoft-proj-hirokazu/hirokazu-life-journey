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
        item.destroy();
    }

    startConversation(npcId) {
        // NPCをプレイヤーの方向に向かせる
        if (this.scene.playerController && this.scene.playerController.player && this.scene.mapManager) {
            const playerPos = this.scene.playerController.getPosition();
            this.scene.mapManager.makeNpcFacePlayer(npcId, playerPos.x, playerPos.y);
        }
        
        // 追加：nullチェック
        if (this.dialogSystem) {
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
        this.setupTileCollisions(player, mapManager);
        this.setupPlayerCollisions(player);
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
}