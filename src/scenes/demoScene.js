import { ConversationScene } from '../managers/ConversationScene.js';
import { ConversationManager } from '../data/stage1/conversationData.js';

export class DemoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DemoScene' });
    }

    preload() {
        // デモ用の簡単なボタンを作成
        this.load.image('button', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiByeD0iMTAiIGZpbGw9IiM0Mjg1RjQiLz4KPHRleHQgeD0iMTAwIiB5PSIzMCIgZmlsbD0iI0ZGRkZGRiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkNsaWNrIE1lPC90ZXh0Pgo8L3N2Zz4K');
    }

    create() {
        const { width, height } = this.sys.game.config;
        
        // タイトル
        this.add.text(width / 2, 100, 'ギャルゲ風会話システム デモ', {
            fontSize: '32px',
            fill: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 会話マネージャーを初期化
        this.conversationManager = new ConversationManager();
        
        // ConversationSceneを動的に追加
        this.scene.add('ConversationScene', ConversationScene);
        
        // 各イベントのボタンを作成
        const events = this.conversationManager.getAvailableEvents();
        
        events.forEach((eventId, index) => {
            const button = this.add.image(width / 2, 200 + index * 80, 'button');
            button.setInteractive();
            
            // ボタンのラベル
            this.add.text(width / 2, 200 + index * 80, this.getEventLabel(eventId), {
                fontSize: '18px',
                fill: '#FFFFFF',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            // ボタンクリックイベント
            button.on('pointerdown', () => {
                this.startConversation(eventId);
            });
            
            // ホバーエフェクト
            button.on('pointerover', () => {
                button.setTint(0xCCCCCC);
            });
            
            button.on('pointerout', () => {
                button.clearTint();
            });
        });
        
        // 説明文
        this.add.text(width / 2, height - 100, 'ボタンをクリックして会話を開始してください\n会話中はクリックまたはスペースキーで進行します', {
            fontSize: '16px',
            fill: '#666666',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    // イベントIDから日本語のラベルを取得
    getEventLabel(eventId) {
        const labels = {
            'first_meeting': '初回出会い',
            'after_school': '放課後',
            'library_scene': '図書館でのシーン'
        };
        return labels[eventId] || eventId;
    }
    
    // 会話を開始
    startConversation(eventId) {
        const conversationData = this.conversationManager.getConversation(eventId);
        
        if (conversationData) {
            // 会話シーンを開始
            this.scene.launch('ConversationScene');
            
            // 会話データを渡す
            const conversationScene = this.scene.get('ConversationScene');
            conversationScene.startConversation(conversationData);
            
            // 会話終了時の処理
            conversationScene.events.once('conversationEnded', () => {
                this.scene.stop('ConversationScene');
                console.log('会話が終了しました');
            });
        }
    }
} 