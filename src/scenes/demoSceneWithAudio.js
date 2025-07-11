import { ConversationScene } from '../managers/ConversationScene.js';
import { ConversationManager } from '../data/stage1/conversationData.js';
import { AudioManager } from '../managers/AudioManager.js';

export class DemoSceneWithAudio extends Phaser.Scene {
    constructor() {
        super({ key: 'DemoSceneWithAudio' });
    }

    preload() {
        // デモ用の簡単なボタンを作成
        this.load.image('button', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiByeD0iMTAiIGZpbGw9IiM0Mjg1RjQiLz4KPHRleHQgeD0iMTAwIiB5PSIzMCIgZmlsbD0iI0ZGRkZGRiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkNsaWNrIE1lPC90ZXh0Pgo8L3N2Zz4K');
        
        // 音声管理クラスを初期化
        this.audioManager = new AudioManager(this);
        
        // ===== 音声ファイルの読み込み =====
        // BGM例（OGG形式）
        this.audioManager.loadSound('bgm_menu', 'assets/audio/bgm/bgm_menu.ogg');
        this.audioManager.loadSound('bgm_game', 'assets/audio/bgm/bgm_game.ogg');
        
        // SE例（WAV形式）
        this.audioManager.loadSound('se_button', 'assets/audio/se/se_button.wav');
        this.audioManager.loadSound('se_click', 'assets/audio/se/se_click.wav');
        this.audioManager.loadSound('se_success', 'assets/audio/se/se_success.wav');
        
        // ボイス例（WAV形式）
        this.audioManager.loadSound('voice_greeting', 'assets/audio/voice/voice_greeting.wav');
        this.audioManager.loadSound('voice_thanks', 'assets/audio/voice/voice_thanks.wav');
    }

    create() {
        const { width, height } = this.sys.game.canvas;
        
        // メニューBGMを開始
        this.audioManager.playBgm('bgm_menu', 0.3);
        
        // タイトル
        this.add.text(width / 2, 100, 'ギャルゲ風会話システム デモ（音声付き）', {
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
            
            // ボタンクリックイベント（音声付き）
            button.on('pointerdown', () => {
                // ボタンクリック音を再生
                this.audioManager.playSe('se_button');
                this.startConversation(eventId);
            });
            
            // ホバーエフェクト（音声付き）
            button.on('pointerover', () => {
                button.setTint(0xCCCCCC);
                // ホバー音を再生
                this.audioManager.playSe('se_click', 0.3);
            });
            
            button.on('pointerout', () => {
                button.clearTint();
            });
        });
        
        // 音声コントロールボタンを作成
        this.createAudioControls();
        
        // 説明文
        this.add.text(width / 2, height - 100, 'ボタンをクリックして会話を開始してください\n会話中はクリックまたはスペースキーで進行します', {
            fontSize: '16px',
            fill: '#666666',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    // 音声コントロールボタンを作成
    createAudioControls() {
        const { height } = this.sys.game.canvas;
        const controlsY = height - 50;
        
        // BGM音量調整ボタン
        const bgmVolumeButton = this.add.text(50, controlsY, 'BGM音量: 30%', {
            fontSize: '14px',
            fill: '#0066CC',
            backgroundColor: '#FFFFFF',
            padding: { x: 8, y: 4 }
        }).setInteractive();
        
        bgmVolumeButton.on('pointerdown', () => {
            const currentVolume = this.audioManager.bgmVolume;
            const newVolume = currentVolume >= 0.7 ? 0.1 : currentVolume + 0.2;
            this.audioManager.setBgmVolume(newVolume);
            bgmVolumeButton.setText(`BGM音量: ${Math.round(newVolume * 100)}%`);
            this.audioManager.playSe('se_click');
        });
        
        // BGMミュートボタン
        const bgmMuteButton = this.add.text(200, controlsY, 'BGMミュート', {
            fontSize: '14px',
            fill: '#CC0000',
            backgroundColor: '#FFFFFF',
            padding: { x: 8, y: 4 }
        }).setInteractive();
        
        bgmMuteButton.on('pointerdown', () => {
            this.audioManager.isBgmMuted = !this.audioManager.isBgmMuted;
            this.audioManager.muteBgm(this.audioManager.isBgmMuted);
            bgmMuteButton.setText(this.audioManager.isBgmMuted ? 'BGMミュート解除' : 'BGMミュート');
            this.audioManager.playSe('se_click');
        });
        
        // SEテストボタン
        const seTestButton = this.add.text(350, controlsY, 'SE再生テスト', {
            fontSize: '14px',
            fill: '#00CC00',
            backgroundColor: '#FFFFFF',
            padding: { x: 8, y: 4 }
        }).setInteractive();
        
        seTestButton.on('pointerdown', () => {
            this.audioManager.playSe('se_success');
        });
        
        // ボイステストボタン
        const voiceTestButton = this.add.text(500, controlsY, 'ボイス再生テスト', {
            fontSize: '14px',
            fill: '#CC6600',
            backgroundColor: '#FFFFFF',
            padding: { x: 8, y: 4 }
        }).setInteractive();
        
        voiceTestButton.on('pointerdown', () => {
            this.audioManager.playVoice('voice_greeting');
        });
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
            // ゲームBGMに切り替え
            this.audioManager.playBgm('bgm_game', 0.2);
            
            // 挨拶ボイスを再生
            this.audioManager.playVoice('voice_greeting');
            
            // 会話シーンを開始
            this.scene.launch('ConversationScene');
            
            // 会話データを渡す
            const conversationScene = this.scene.get('ConversationScene');
            conversationScene.startConversation(conversationData);
            
            // 会話終了時の処理
            conversationScene.events.once('conversationEnded', () => {
                this.scene.stop('ConversationScene');
                
                // メニューBGMに戻す
                this.audioManager.playBgm('bgm_menu', 0.3);
                
                // 感謝ボイスを再生
                this.audioManager.playVoice('voice_thanks');
                
                console.log('会話が終了しました');
            });
        }
    }
    
    // シーン終了時の処理
    shutdown() {
        // 音声リソースを解放
        if (this.audioManager) {
            this.audioManager.destroy();
        }
    }
} 