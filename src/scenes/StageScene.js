// src/scenes/StageScene.js
import { MapManager } from '../managers/MapManager.js';
import { UIManager } from '../managers/UIManager.js';
import { CameraManager } from '../managers/CameraManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { CollisionManager } from '../managers/CollisionManager.js';
import { PlayerController } from '../controllers/PlayerController.js';
import { TouchControlManager } from '../controllers/TouchControlManager.js';
import { ConversationTrigger } from '../managers/ConversationTrigger.js';
import { StageConfig } from '../config/StageConfig.js';
import { ConversationScene } from '../managers/ConversationScene.js';
import { DynamicConversationScene } from '../scenes/DynamicConversationScene.js';

export class StageScene extends Phaser.Scene {
    constructor(config) {
        super({ key: config.stageKey });
        
        // 設定を保存
        this.stageConfig = config.stageConfig;
        this.stageKey = config.stageKey;
        
        // マネージャーの初期化
        this.mapManager = null;
        this.uiManager = null;
        this.cameraManager = null;
        this.audioManager = null;
        this.conversationTrigger = null;
        
        // フロア管理
        this.currentFloor = 1;
        this.restoreState = false;
        this.targetFloor = 1;
        this.playerPosition = null;
        this.mapKey = null;
        
        // 会話中フラグ（マップシーンと同様）
        this._isInConversation = false;
    }
    
    init(data) {
        // 状態復元の設定を受け取る
        if (data && data.restoreState) {
            this.restoreState = true;
            this.targetFloor = data.targetFloor || 1;
            this.playerPosition = data.playerPosition || null;
            this.mapKey = data.mapKey || null;
            console.log('[StageScene] 状態復元設定を受け取り:', {
                restoreState: this.restoreState,
                targetFloor: this.targetFloor,
                playerPosition: this.playerPosition,
                mapKey: this.mapKey
            });
        } else {
            // 状態復元設定がない場合
            this.restoreState = false;
            this.targetFloor = 1;
            this.playerPosition = null;
            this.mapKey = null;
            console.log('[StageScene] 状態復元設定なし（通常起動）');
        }
        
        // nextFloorNumberも受け取る
        if (data && data.nextFloorNumber) {
            this.nextFloorNumber = data.nextFloorNumber;
            console.log(`[StageScene] nextFloorNumber を受け取り: ${this.nextFloorNumber}`);
        }
        
        // fromFloorNumberも受け取る
        if (data && data.fromFloorNumber) {
            this.fromFloorNumber = data.fromFloorNumber;
            console.log(`[StageScene] fromFloorNumber を受け取り: ${this.fromFloorNumber}`);
        }
    }

    preload() {
        // 設定から動的にアセットを読み込み
        const folderName = this.stageConfig.folderName;
        
        // 各フロアのマップファイルを読み込み
        this.stageConfig.floors.forEach(floor => {
            if (floor.implemented) {
                this.load.tilemapTiledJSON(floor.mapKey, `assets/maps/${folderName}/${floor.mapFileName}`);
            }
        });
        
        // タイルセット画像を動的に読み込み（実装済みフロアのものを使用）
        this.stageConfig.floors.forEach(floor => {
            if (floor.implemented) {
                floor.tilesets.forEach(tilesetKey => {
                    this.load.image(tilesetKey, `assets/maps/${folderName}/${tilesetKey}.png`);
                });
            }
        });
        
        // BGMを動的に読み込み
        if (this.stageConfig.bgm && typeof this.stageConfig.bgm === 'object') {
            Object.keys(this.stageConfig.bgm).forEach(bgmKey => {
                this.load.audio(bgmKey, this.stageConfig.bgm[bgmKey]);
            });
        }
        
        // SEを動的に読み込み
        if (this.stageConfig.se) {
            Object.keys(this.stageConfig.se).forEach(seKey => {
                this.load.audio(seKey, this.stageConfig.se[seKey]);
            });
        }
        
        // NPCスプライトを動的に読み込み
        this.loadNPCSprites();
        
        // プレイヤー用スプライトシートを読み込み
        this.load.spritesheet('player_sprite', 'assets/characters/npcs/男_ギャング.png', {
            frameWidth: 32,
            frameHeight: 32,
            spacing: 0,
            margin: 0
        });
        
        // 吹き出し用アイコンを読み込む
        this.load.image('speech_bubble', 'assets/ui/speech_bubble.png');
    }
    
    loadNPCSprites() {
        // StageConfigからNPCスプライトを読み込み
        if (this.stageConfig && this.stageConfig.floors) {
            this.stageConfig.floors.forEach(floor => {
                if (floor.npcs) {
                    floor.npcs.forEach(npc => {
                        if (npc.sprite) {
                            // スプライトシートとして読み込み
                            this.load.spritesheet(npc.name, `assets/characters/npcs/${npc.sprite}`, {
                                frameWidth: 32,  // 1人のキャラクターの幅
                                frameHeight: 32, // 1人のキャラクターの高さ
                                spacing: 0,
                                margin: 0
                            });
                        }
                    });
                }
            });
        }
    }
    

    
    // NPCを作成
    createNPCs() {
        if (this.stageConfig && this.stageConfig.currentFloor && this.stageConfig.currentFloor.npcs) {
            this.stageConfig.currentFloor.npcs.forEach(npc => {
                if (npc.sprite) {
                    // .tmjファイルからNPCオブジェクトデータを取得
                    const npcObjectData = this.mapManager.getNPCObjectData(npc.name);
                    
                    // スプライトを作成（npcObjectDataが存在しない場合はデフォルト位置を使用）
                    const x = npcObjectData ? npcObjectData.x : 100;
                    const y = npcObjectData ? npcObjectData.y : 100;
                    
                    const npcSprite = this.add.sprite(x, y, npc.name);
                    

                    
                    // 必要に応じてサイズを調整
                    npcSprite.setDisplaySize(32, 32);
                    
                    // 物理ボディを追加（静的なオブジェクトとして）
                    this.physics.add.existing(npcSprite);
                    npcSprite.body.setSize(32, 32);
                    npcSprite.body.setImmovable(true); // 動かないようにする
                    npcSprite.body.setCollideWorldBounds(false); // ワールド境界との衝突を無効化
                    
                    // オブジェクト情報を保存
                    npcSprite.setData('npcId', npc.name);
                    npcSprite.setData('npcType', 'npc');
                    npcSprite.setData('objectType', 'npc'); // CollisionManager用
                    npcSprite.setData('objectName', npc.name); // CollisionManager用
                    
                    // オブジェクトグループに追加
                    if (this.mapManager.objectGroup) {
                        this.mapManager.objectGroup.add(npcSprite);
                    } else {
                        console.warn('[StageScene] objectGroupが初期化されていません');
                    }
                    
                    // EventID付きNPCのみに吹き出しを表示する判定
                    if (npc.eventId) {
                        // 検索用にeventIdを保持
                        npcSprite.setData('eventId', npc.eventId);
                        // 動的インポートでChoiceManagerを取得
                        import('../managers/ChoiceManager.js').then(({ ChoiceManager }) => {
                            const choiceManager = ChoiceManager.getInstance();
                            
                            // 吹き出し表示条件：
                            // - 選択肢があるイベント → 正解('correct')が一度も記録されていなければ表示
                            // - 選択肢がないイベント → 初回完了で消したいので、'event_completed_{eventId}' を見る
                            const hasCorrect = choiceManager.isEventCleared(npc.eventId);
                            const noChoiceCompleted = localStorage.getItem('event_completed_' + npc.eventId) === 'true';
                            if (!hasCorrect && !noChoiceCompleted) {
                                this.createSpeechBubble(npc.name, npcSprite);
                            }
                        });
                    }
                    
                    // クリックイベントを設定
                    npcSprite.setInteractive();
                    npcSprite.on('pointerdown', () => {
                        // NPCをプレイヤーの方向に向ける
                        this.makeNPCLookAtPlayer(npcSprite);
                        
                        if (npc.eventId) {
                            // 会話開始
                            this.startConversation(npc.eventId);

                            // 会話終了時の吹き出し処理は常時リスナーで行うため、ここでは何もしない
                        } else {
                            if (this.dialogSystem) {
                                this.dialogSystem.startDialog(npc.name);
                            }
                        }
                    });
                    
                    // テキストラベルを追加
                    const displayName = npc.displayName || npc.name;
                    const label = this.add.text(npcSprite.x, npcSprite.y - 16, displayName, {
                        fontSize: '12px',
                        fill: '#ffffff',
                        backgroundColor: '#000000',
                        padding: { x: 2, y: 1 }
                    });
                    label.setOrigin(0.5, 1);
                    label.setDepth(1000);
                    

                }
            });
        }
    }





    // 吹き出しをNPCの上に出す
    createSpeechBubble(npcName, npcSprite) {
        console.log('[StageScene] createSpeechBubble呼び出し:', { npcName, npcSpriteName: npcSprite.getData('objectName') });
        const bubble = this.add.image(npcSprite.x, npcSprite.y - 28, 'speech_bubble');
        bubble.setScale(0.6);
        bubble.setDepth(1001);
        bubble.setData('npcName', npcName);
        bubble.setData('bubbleType', 'speech');
        console.log('[StageScene] 吹き出し作成完了:', { npcName, bubbleId: bubble.getData('npcName') });

        // ふわふわアニメ
        this.tweens.add({
            targets: bubble,
            y: bubble.y - 4,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        return bubble;
    }

    removeSpeechBubbleByNpcName(npcName) {
        console.log('[StageScene] removeSpeechBubbleByNpcName開始:', npcName);
        let found = false;
        let deletedCount = 0;
        // 削除前の吹き出し一覧を確認
        const bubblesBefore = this.children.list
            .filter(child => child?.getData && child.getData('bubbleType') === 'speech')
            .map(child => ({ npcName: child.getData('npcName'), exists: !!child, active: child.active }));
        console.log('[StageScene] 削除前の吹き出し一覧:', bubblesBefore);
        
        this.children.list.forEach(child => {
            if (child?.getData && child.getData('bubbleType') === 'speech' && child.getData('npcName') === npcName) {
                console.log('[StageScene] 吹き出し削除対象発見:', npcName, 'child:', child);
                console.log('[StageScene] 削除前のchild状態:', { active: child.active, visible: child.visible, destroyed: child.destroyed });
                // より確実な削除処理
                child.setVisible(false);
                child.setActive(false);
                child.removeFromDisplayList();
                child.destroy();
                found = true;
                deletedCount++;
                console.log('[StageScene] 削除後のchild状態:', { active: child.active, visible: child.visible, destroyed: child.destroyed });
            }
        });
        
        // 削除後の吹き出し一覧を確認
        const bubblesAfter = this.children.list
            .filter(child => child?.getData && child.getData('bubbleType') === 'speech')
            .map(child => ({ npcName: child.getData('npcName'), exists: !!child, active: child.active }));
        console.log('[StageScene] 削除後の吹き出し一覧:', bubblesAfter);
        console.log('[StageScene] 削除された吹き出し数:', deletedCount);
        if (!found) {
            console.log('[StageScene] 削除対象の吹き出しが見つかりませんでした:', npcName);
            console.log('[StageScene] 現在の吹き出し一覧:', this.children.list
                .filter(child => child?.getData && child.getData('bubbleType') === 'speech')
                .map(child => ({ npcName: child.getData('npcName'), exists: !!child })));
        }
        
        // 削除処理完了後の最終確認
        setTimeout(() => {
            const finalBubbles = this.children.list
                .filter(child => child?.getData && child.getData('bubbleType') === 'speech')
                .map(child => ({ npcName: child.getData('npcName'), exists: !!child, active: child.active }));
            console.log('[StageScene] 削除処理完了後の最終吹き出し一覧:', finalBubbles);
        }, 100);
    }

    // 会話開始メソッド
    startConversation(eventId) {
        if (this._isInConversation) {
            console.log('[StageScene] 既に会話中です');
            return;
        }
        
        console.log(`[StageScene] 会話開始: ${eventId}`);
        this._isInConversation = true;
        
        // DynamicConversationSceneを起動
        this.scene.launch('DynamicConversationScene', {
            eventId: eventId,
            originalSceneKey: this.scene.key
        });
    }


    create() {
        try {
            console.log('[StageScene] create() 開始');
            console.log('[StageScene] this.stageKey:', this.stageKey);
            console.log('[StageScene] this.stageConfig:', this.stageConfig);
            console.log('[StageScene] this.stageConfig.stageKey:', this.stageConfig.stageKey);
            console.log('[StageScene] this.stageKey === this.stageConfig.stageKey:', this.stageKey === this.stageConfig.stageKey);
            
            // 基本的なマップ表示
            this.mapManager = new MapManager(this);
            
            // 設定ファイルから動的にマップキーを取得
            // フロア変更から来た場合は、指定されたフロアから開始
            // 会話終了後の状態復元の場合は、保存された状態から開始
            let targetFloor;
            
            if (this.restoreState) {
                // 会話終了後の状態復元
                targetFloor = this.stageConfig.floors.find(f => f.number === this.targetFloor);
                this.currentFloor = this.targetFloor;
            } else if (this.nextFloorNumber) {
                // フロア変更から来た場合
                targetFloor = this.stageConfig.floors.find(f => f.number === this.nextFloorNumber);
                this.currentFloor = this.nextFloorNumber;
                this.nextFloorNumber = null; // 使用後はクリア
            } else {
                // 通常の開始
                targetFloor = this.stageConfig.floors[0];
                this.currentFloor = 1;
            }
            
            this.mapManager.currentMapKey = targetFloor.mapKey;
            
            // 現在のフロア設定をstageConfigに設定（NPC会話データ取得のため）
            this.stageConfig.currentFloor = targetFloor;
            
            // 衝突判定マネージャーを先に初期化
            this.collisionManager = new CollisionManager(this);
            this.collisionManager.setupCollisionGroups();
            
            // マップ作成（NPCオブジェクト作成）
            this.mapManager.createMap();
            
            // プレイヤー作成（フロアごとの開始位置を使用、または保存された位置を復元）
            this.playerController = new PlayerController(this);
            let playerStartX, playerStartY;
            
            if (this.restoreState && this.playerPosition) {
                // 会話終了後の位置復元
                playerStartX = this.playerPosition.x;
                playerStartY = this.playerPosition.y;
            } else if (this.fromFloorNumber && this.fromFloorNumber !== targetFloor.number) {
                // 他のフロアから移動してきた場合
                const fromFloorKey = `fromFloor${this.fromFloorNumber}Start`;
                const fromFloorX = targetFloor[`${fromFloorKey}X`];
                const fromFloorY = targetFloor[`${fromFloorKey}Y`];
                
                if (fromFloorX !== undefined && fromFloorY !== undefined) {
                    // 移動元フロア専用の開始位置がある場合
                    playerStartX = fromFloorX;
                    playerStartY = fromFloorY;
                } else {
                    // 移動元フロア専用の開始位置がない場合はデフォルト位置
                    playerStartX = targetFloor.playerStartX || 100;
                    playerStartY = targetFloor.playerStartY || 100;
                }
            } else {
                // フロアのデフォルト位置
                playerStartX = targetFloor.playerStartX || 100;
                playerStartY = targetFloor.playerStartY || 100;
            }
            
            this.playerController.createPlayer(playerStartX, playerStartY);
            
            // NPCを作成（プレイヤー作成後）
            this.createNPCs();

            // 会話終了の通知を常時受け取り、吹き出しを再評価
            try { 
                if (this._onConversationEndedBound) {
                    console.log('[StageScene] 既存のイベントリスナーを削除');
                    this.events.off('conversation-ended', this._onConversationEndedBound); 
                }
            } catch (_) {
                // イベントリスナーの削除に失敗した場合は無視
            }
            console.log('[StageScene] conversation-endedイベントリスナー設定');
            this._onConversationEndedBound = (payload) => {
                console.log('[StageScene] _onConversationEndedBound実行回数カウント');
                console.log('[StageScene] conversation-ended受信:', payload);
                const { eventId, cleared } = payload || {};
                if (!eventId) return;
                // 対応NPCを検索
                const npcSprite = this.children.list.find(child => child?.getData && child.getData('npcType') === 'npc' && child.getData('eventId') === eventId);
                console.log('[StageScene] 対応NPC検索結果:', npcSprite ? '見つかった' : '見つからない', eventId);
                if (!npcSprite) return;
                // NPCの表示名を正しく取得（createNPCsで設定された名前）
                // objectNameとnpcNameの両方を確認
                const objectName = npcSprite.getData('objectName');
                const npcName = npcSprite.getData('npcName') || objectName;
                console.log('[StageScene] NPC名の詳細:', { objectName, npcName });
                console.log('[StageScene] NPC名:', npcName, 'cleared:', cleared);
                
                // 選択肢ありイベントの場合はclearedをチェック
                // 選択肢なしイベントの場合はlocalStorageのevent_completedフラグをチェック
                const noChoiceCompleted = localStorage.getItem('event_completed_' + eventId) === 'true';
                const shouldRemoveBubble = cleared || noChoiceCompleted;
                
                console.log('[StageScene] 吹き出し削除判定:', { 
                    cleared, 
                    noChoiceCompleted, 
                    shouldRemoveBubble 
                });
                
                if (shouldRemoveBubble) {
                    console.log('[StageScene] 吹き出し削除実行:', npcName);
                    this.removeSpeechBubbleByNpcName(npcName);
                    console.log('[StageScene] removeSpeechBubbleByNpcName呼び出し完了');
                } else {
                    console.log('[StageScene] 吹き出し作成実行:', npcName);
                    this.createSpeechBubble(npcName, npcSprite);
                }
            };
            this.events.on('conversation-ended', this._onConversationEndedBound);
            
            // タッチコントローラー作成
            this.touchControlManager = new TouchControlManager(this, this.playerController, 'se_touch');
            
            // カメラ設定（stage2と同じ方法）
            this.cameraManager = new CameraManager(this);
            this.cameraManager.setBackgroundColor('#87CEEB');
            this.cameraManager.setupCamera(this, this.mapManager.map, this.playerController.player);
            

            
            // DialogSystemを初期化（竹田高校・三重中学校用）
            console.log('[StageScene] 現在のstageKey:', this.stageKey);
            console.log('[StageScene] stageKey === taketa_highschool:', this.stageKey === 'taketa_highschool');
            console.log('[StageScene] stageKey === mie_high_school:', this.stageKey === 'mie_high_school');
            
            if (this.stageKey === 'taketa_highschool') {
                console.log('[StageScene] 竹田高校用DialogSystem初期化開始');
                import('../managers/DialogSystem.js').then(({ DialogSystem }) => {
                    console.log('[StageScene] DialogSystemクラス読み込み完了');
                    import('../data/taketa/dialogs.js').then(({ TaketaDialogData }) => {
                        console.log('[StageScene] TaketaDialogData読み込み完了:', TaketaDialogData);
                        this.dialogSystem = new DialogSystem(this, TaketaDialogData);
                        // 使用済み会話を管理するSetを初期化
                        this.usedConversations = new Set();
                        console.log('[StageScene] DialogSystem初期化完了（竹田高校用）');
                        console.log('[StageScene] 使用済み会話管理開始');
                        console.log('[StageScene] this.dialogSystem:', this.dialogSystem);
                        console.log('[StageScene] this.usedConversations:', this.usedConversations);
                        
                        // DialogSystem初期化後、CollisionManagerに参照を設定
                        if (this.collisionManager) {
                            this.collisionManager.setDialogSystem(this.dialogSystem);
                            console.log('[StageScene] CollisionManagerにDialogSystem参照を設定完了（竹田高校用）');
                        }
                    }).catch(error => {
                        console.error('[StageScene] TaketaDialogData読み込みエラー:', error);
                    });
                }).catch(error => {
                    console.error('[StageScene] DialogSystemクラス読み込みエラー:', error);
                });
            } else if (this.stageKey === 'mie_high_school') {
                console.log('[StageScene] 三重中学校用DialogSystem初期化開始');
                console.log('[StageScene] mie_high_school 条件に一致しました！');
                import('../managers/DialogSystem.js').then(({ DialogSystem }) => {
                    console.log('[StageScene] DialogSystemクラス読み込み完了');
                    import('../data/miemachi/dialogs.js').then(({ Stage1DialogData }) => {
                        console.log('[StageScene] Stage1DialogData読み込み完了:', Stage1DialogData);
                        console.log('[StageScene] Stage1DialogDataの内容:', Stage1DialogData);
                        this.dialogSystem = new DialogSystem(this, Stage1DialogData);
                        // 使用済み会話を管理するSetを初期化
                        this.usedConversations = new Set();
                        console.log('[StageScene] DialogSystem初期化完了（三重中学校用）');
                        console.log('[StageScene] 使用済み会話管理開始');
                        console.log('[StageScene] this.dialogSystem:', this.dialogSystem);
                        console.log('[StageScene] this.usedConversations:', this.usedConversations);
                        
                        // DialogSystem初期化後、CollisionManagerに参照を設定
                        if (this.collisionManager) {
                            this.collisionManager.setDialogSystem(this.dialogSystem);
                            console.log('[StageScene] CollisionManagerにDialogSystem参照を設定完了（三重中学校用）');
                        }
                    }).catch(error => {
                        console.error('[StageScene] Stage1DialogData読み込みエラー:', error);
                        console.error('[StageScene] エラーの詳細:', error.message);
                    });
                }).catch(error => {
                    console.error('[StageScene] DialogSystemクラス読み込みエラー:', error);
                    console.error('[StageScene] エラーの詳細:', error.message);
                });
            } else {
                console.log('[StageScene] 竹田高校・三重中学校以外のため、DialogSystem初期化スキップ:', this.stageKey);
                console.log('[StageScene] スキップされたstageKeyの詳細:', this.stageKey);
            }
            
            // AudioManagerを初期化
            this.audioManager = new AudioManager(this);

            
            // 竹田マップに戻るための関数を設定
            window.returnToTaketaMap = () => {
                // 竹田マップに戻る（gameController.jsを使用）
                if (window.startPhaserGame) {
                    window.startPhaserGame('taketa');
                } else {
                    console.error('startPhaserGame not found');
                }
            };
            
            // 三重町マップに戻るための関数を設定
            window.returnToMiemachiMap = () => {
                // 三重町マップに戻る（gameController.jsを使用）
                if (window.startPhaserGame) {
                    window.startPhaserGame('miemachi');
                } else {
                    console.error('startPhaserGame not found');
                }
            };
            
            // 設定からBGMを再生
            if (this.stageConfig.bgm && this.stageConfig.bgm.map) {
                // 音声コンテキストの状態を確認
                if (this.scene.sound && this.scene.sound.context) {
                    const ctx = this.scene.sound.context;
                    if (ctx.state === 'suspended') {
                        console.log('[StageScene] 音声コンテキストが一時停止状態です。ユーザーインタラクションを待っています');
                        // ユーザーインタラクションを待つ
                        this.waitForAudioContext();
                    } else {
                        this.playBGM();
                    }
                } else {
                    this.playBGM();
                }
            } else {
                console.warn('[StageScene] BGM設定が見つかりません');
            }
            
            // タッチイベントを設定
            this.setupTouchEvents();
            
            // 会話トリガーを初期化
            this.conversationTrigger = new ConversationTrigger(this);
            
            // ConversationSceneを登録
            try {
                if (!this.scene.manager.keys || !this.scene.manager.keys.ConversationScene) {
                    this.scene.add('ConversationScene', ConversationScene);
                }
            } catch (e) {
                console.warn('[StageScene] ConversationScene登録エラー:', e);
            }
            
            // DynamicConversationSceneを登録
            try {
                if (!this.scene.manager.keys || !this.scene.manager.keys.DynamicConversationScene) {
                    this.scene.add('DynamicConversationScene', DynamicConversationScene);
                }
            } catch (e) {
                console.warn('[StageScene] DynamicConversationScene登録エラー:', e);
            }
            
            // 当たり判定の設定
            this.collisionManager.setupAllCollisions(this.playerController.player, this.mapManager);
            
            // UIManagerを初期化して戻るボタンを作成
            this.uiManager = new UIManager();
            this.uiManager.createUI(this);
            
        } catch (error) {
            console.error('[StageScene] create() エラー:', error);
        }
    }
    
    // シーンシャットダウン時のクリーンアップ（stage1, stage2と同じ方式）
    shutdown() {
        try {
            // HTMLAudioのBGM停止
            if (this._htmlBgm) {
                this._htmlBgm.pause();
                this._htmlBgm.currentTime = 0;
                this._htmlBgm = null;
            }
            
            // 音声システムのクリーンアップ
            if (this.audioManager) {
                this.audioManager.stopAll();
            }
            
            // 会話トリガーのクリーンアップ
            if (this.conversationTrigger) {
                this.conversationTrigger.destroy();
                this.conversationTrigger = null;
            }
            
            if (this.sound) {
                this.sound.stopAll();
                
                // 音声コンテキストの状態をリセット
                if (this.sound.context) {
                    this.sound.context.state = 'suspended';
                }
            }
            
            // 音声コンテキストを完全にクリーンアップ
            if (this.sound && this.sound.context) {
                try {
                    // 音声コンテキストを閉じる
                    if (this.sound.context.close) {
                        this.sound.context.close();
                    }
                    // 音声コンテキストをnullに設定
                    this.sound.context = null;
                } catch (e) {
                    console.warn('[StageScene] 音声コンテキストクリーンアップエラー:', e);
                }
            }
        } catch (e) {
            console.warn('[StageScene] 音声システムクリーンアップエラー:', e);
        }
        
        // 進行中のローダーやリスナーを完全解除（破棄後の発火防止）
        try { if (this.load && this.load.reset) this.load.reset(); } catch (e) { /* ignore */ }
        try { if (this.load && this.load.removeAllListeners) this.load.removeAllListeners(); } catch (e) { /* ignore */ }
        
        // 他のマネージャーのクリーンアップ
        if (this.playerController) {
            this.playerController.destroy();
            this.playerController = null;
        }
        
        if (this.touchControlManager) {
            this.touchControlManager.destroy();
            this.touchControlManager = null;
        }
        

        
        if (this.cameraManager) {
            this.cameraManager.destroy();
            this.cameraManager = null;
        }
        
        if (this.collisionManager) {
            this.collisionManager.destroy();
            this.collisionManager = null;
        }
        
        if (this.audioManager) {
            this.audioManager.destroy();
            this.audioManager = null;
        }
        
        // シーンシャットダウン時のクリーンアップ登録を削除
        this.events.off('shutdown', this.shutdown, this);
    }

    changeFloor(floorNumber) {
        if (floorNumber === this.currentFloor) {
            return;
        }
        
        try {
            // 設定からフロア情報を取得
            const floorConfig = this.stageConfig.floors.find(f => f.number === floorNumber);
            if (!floorConfig || !floorConfig.implemented) {
                console.error(`[StageScene] フロア設定が見つからないか、未実装: ${floorNumber}`);
                return;
            }
            
            // 状態復元の設定をクリア（moveオブジェクトでの移動時）
            this.restoreState = false;
            this.targetFloor = 1;
            this.playerPosition = null;
            this.mapKey = null;
            console.log('[StageScene] 状態復元設定をクリアしました（フロア変更時）');
            
            // フロア番号を保存（Scene再起動時に使用）
            this.nextFloorNumber = floorNumber;
            
            // シーン設定もクリア（確実にするため）
            if (this.scene.settings) {
                this.scene.settings.restoreState = false;
                this.scene.settings.targetFloor = null;
                this.scene.settings.playerPosition = null;
                this.scene.settings.mapKey = null;
            }
            
            // 現在のシーンを停止
            this.scene.stop();
            
            // 元のシーンキーで新しいシーンを開始
            this.scene.start(this.scene.key, {
                nextFloorNumber: floorNumber,
                fromFloorNumber: this.currentFloor  // 移動元フロアを追加
            });
            
        } catch (error) {
            console.error('[StageScene] フロア変更エラー:', error);
        }
    }

    // フロアボタン関連のコードを削除（moveオブジェクトで十分）
    // createFloorButtons() メソッドを削除
    // updateFloorButtonHighlight() メソッドを削除

    setupTouchEvents() {
        // タッチイベントを設定
        this.input.on('pointerdown', () => {
            this.handleTouch();
        });
        
        // スマホ向けスクロール機能を追加
        this.cameraManager.setupScrollControls();
        this.cameraManager.setupPinchZoom();
    }

    handleTouch() {
        // 基本的な音声コンテキストロック解除
        try {
            if (this.scene && this.scene.sound && this.scene.sound.context) {
                const ctx = this.scene.sound.context;
                if (ctx.state === 'suspended') {
                    ctx.resume();
                }
            }
        } catch (e) {
            console.warn('[StageScene] 音声コンテキスト処理エラー:', e);
        }
    }
    
    update() {
        // マネージャーの更新処理
        this.cameraManager?.update();
        
        // プレイヤーコントローラーの更新処理
        if (this.playerController) {
            this.playerController.update();
        }
    }

    destroy() {
        this.shutdown();
        super.destroy();
    }



    resize(gameSize) {
        const { width, height } = gameSize;
        
        // カメラサイズを更新
        this.cameras.resize(width, height);
        
        // タッチコントローラーの位置を更新
        if (this.touchControlManager) {
            this.touchControlManager.updatePosition(width, height);
        }
    }
    
    // BGM再生のヘルパーメソッド
    playBGM() {
        try {
            // 前のBGMを確実に停止
            this.audioManager.stopAll();
            if (this.scene.sound) {
                this.scene.sound.stopAll();
            }
            
            // iOS対応：HTMLAudioの停止
            if (this._htmlBgm) {
                this._htmlBgm.pause();
            }
            
            // 現在の階のBGM設定を取得
            const currentFloorConfig = this.stageConfig.floors.find(f => f.number === this.currentFloor);
            if (currentFloorConfig && currentFloorConfig.bgm && currentFloorConfig.bgm.map) {
                // 階固有のBGMを再生
                const bgmPath = currentFloorConfig.bgm.map;
                
                // HTMLAudioを使用してBGMを再生
                this._htmlBgm = new Audio(bgmPath);
                this._htmlBgm.loop = true;
                this._htmlBgm.volume = 0.3;
                this._htmlBgm.play().catch(error => {
                    console.error(`[StageScene] BGM再生エラー: ${bgmPath}`, error);
                    // フォールバック: デフォルトBGMを再生
                    this.audioManager.playBgm('map');
                });
            } else {
                // フォールバック: デフォルトBGMを再生
                this.audioManager.playBgm('map');
            }
        } catch (error) {
            console.error('[StageScene] BGM再生エラー:', error);
            // エラー時もフォールバック
            this.audioManager.playBgm('map');
        }
    }
    
    // 音声コンテキストの復旧を待つメソッド
    waitForAudioContext() {
        // ユーザーインタラクションを待つ
        this.input.once('pointerdown', () => {
            if (this.scene.sound && this.scene.sound.context) {
                const ctx = this.scene.sound.context;
                if (ctx.state === 'suspended') {
                    ctx.resume().then(() => {
                        this.playBGM();
                    }).catch(error => {
                        console.error('[StageScene] 音声コンテキスト復旧エラー:', error);
                    });
                } else {
                    this.playBGM();
                }
            }
        });
    }

    // 会話開始時のフラグ設定
    setConversationActive(active) {
        this._isInConversation = active;
    }

    // 会話中かどうかの確認
    isConversationActive() {
        return this._isInConversation;
    }
    
    // NPCをプレイヤーの方向に向ける
    makeNPCLookAtPlayer(npcSprite) {
        if (!this.playerController || !this.playerController.player) {
            return;
        }
        
        const player = this.playerController.player;
        const npc = npcSprite;
        
        // プレイヤーとNPCの位置関係を計算
        const deltaX = player.x - npc.x;
        const deltaY = player.y - npc.y;
        
        // 距離を計算
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 0) {
            // 正規化された方向ベクトル
            const normalizedX = deltaX / distance;
            const normalizedY = deltaY / distance;
            
            // 方向に応じてフレームを設定
            if (Math.abs(normalizedY) > Math.abs(normalizedX)) {
                // 上下方向が優先
                if (normalizedY < 0) {
                    // プレイヤーが上にいる（NPCは上向き）
                    npc.setFrame(9); // 上向きフレーム
                } else {
                    // プレイヤーが下にいる（NPCは下向き）
                    npc.setFrame(0); // 下向きフレーム
                }
            } else {
                // 左右方向が優先
                if (normalizedX < 0) {
                    // プレイヤーが左にいる（NPCは左向き）
                    npc.setFrame(3); // 左向きフレーム
                } else {
                    // プレイヤーが右にいる（NPCは右向き）
                    npc.setFrame(6); // 右向きフレーム
                }
            }
        }
    }
    

}

// 設定ファイルベースでステージシーンを作成するヘルパー関数
export function createStageScene(stageKey) {
    const stageConfig = StageConfig[stageKey];
    if (!stageConfig) {
        console.error(`Stage config not found for: ${stageKey}`);
        return null;
    }
    
    return new StageScene({
        stageKey: stageKey,
        stageConfig: stageConfig
    });
}
