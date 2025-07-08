// 会話データの定義
export const conversationData = {
    // demoちんぽ
    'demo_chinpo': {
        'background': 'test_1',
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'kawamuro',
                'text': 'おれけっこんすんだ',
                'expression': 'A'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'お前もか',
                'expression': 'A'
            },
            {
                'speaker': '河村',
                'character': 'kawamuro',
                'text': 'そんなに固くならなくてもいい',
                'expression': 'B'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': 'ちんぽかためます',
                'expression': 'A'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'やったね！',
                'expression': 'A'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': '俺の特殊能力、メタルチンコはがねのように硬いぜ★',
                'expression': 'A'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': '金玉もでかいぜ！',
                'expression': 'A'
            }
        ]
    },
    // 初回出会いのイベント
    'after_chinpo': {
        'background': 'test_1',
        'conversations': [
            {
                'speaker': '河室',
                'character': 'kawamuro',
                'text': '（新しいクラスか...少し緊張するな）',
                'expression': 'E'
            },
            {
                'speaker': '河室',
                'character': 'heroine',
                'text': 'あ、あなたが転校生の方ですね！',
                'expression': 'F'
            },
            {
                'speaker': '河室',
                'character': 'kawamuro',
                'text': 'はい、今日からお世話になります',
                'expression': 'D'
            },
            {
                'speaker': '河室',
                'character': 'kawamuro',
                'text': '私、田中花子です。よろしくお願いします！',
                'expression': 'C'
            },
            {
                'speaker': '河室',
                'character': 'kawamuro',
                'text': 'こちらこそ。分からないことがあったら教えてください',
                'expression': 'A'
            },
            {
                'speaker': '河室',
                'character': 'kawamuro',
                'text': 'はい！何でも聞いてくださいね♪',
                'expression': 'E'
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