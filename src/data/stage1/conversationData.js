// 会話データの定義
export const conversationData = {
    // demoちんぽ
    'demo_chinpo': {
        'background': 'test_1',
        'bgm': 'bgm_demo_chinpo', // イベント専用BGM
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'おれけっこんすんだ',
                'expression': 'a'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'お前もか',
                'expression': 'a'
            },
            {
                'speaker': '河村',
                'character': 'hirokazu',
                'text': 'そんなに固くならなくてもいい',
                'expression': 'b'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': 'ちんぽかためます',
                'expression': 'a'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'やったね！',
                'expression': 'a'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': '俺の特殊能力、メタルチンコはがねのように硬いぜ★',
                'expression': 'a'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': '金玉もでかいぜ！',
                'expression': 'a'
            }
        ]
    },
    // 初回出会いのイベント
    'after_chinpo': {
        'background': 'test_1',
        'bgm': 'bgm_demo_chinpo', // ロマンチックなイベントBGM
        'conversations': [
            {
                'speaker': '河室',
                'character': 'hirokazu',
                'text': '（新しいクラスか...少し緊張するな）',
                'expression': 'e'
            },
            {
                'speaker': '河室',
                'character': 'hirokazu',
                'text': 'あ、あなたが転校生の方ですね！',
                'expression': 'f'
            },
            {
                'speaker': '河室',
                'character': 'hirokazu',
                'text': 'はい、今日からお世話になります',
                'expression': 'd'
            },
            {
                'speaker': '河室',
                'character': 'hirokazu',
                'text': '私、田中花子です。よろしくお願いします！',
                'expression': 'c'
            },
            {
                'speaker': '河室',
                'character': 'hirokazu',
                'text': 'こちらこそ。分からないことがあったら教えてください',
                'expression': 'a'
            },
            {
                'speaker': '河室',
                'character': 'hirokazu',
                'text': 'はい！何でも聞いてくださいね♪',
                'expression': 'e'
            }
        ]
    },
};

// 会話データを管理するクラス
export class ConversationManager {
    constructor() {
        this.conversations = conversationData;
        this.currentEvent = null;
    }
    
    // 会話データを取得
    getConversation(eventId) {
        return this.conversations[eventId] || null;
    }
    
    // 利用可能なイベントリストを取得
    getAvailableEvents() {
        return Object.keys(this.conversations);
    }
    
    // 新しい会話データを追加
    addConversation(eventId, conversationData) {
        this.conversations[eventId] = conversationData;
    }
    
    // 会話データを更新
    updateConversation(eventId, conversationData) {
        if (this.conversations[eventId]) {
            this.conversations[eventId] = conversationData;
            return true;
        }
        return false;
    }
} 