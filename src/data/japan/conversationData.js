// 日本ステージ会話データの定義
export const japanConversationData = {
    // コンピュータエリア
    'computer': {
        'background': 'test_1',
        'bgm': 'curono',
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'ここはコンピュータエリアだぜ☆',
                'expression': 'A'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '最新のテクノロジーが集まってる場所だな',
                'expression': 'B'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'プログラミングとか、AIとか、いろんな技術があるぜ',
                'expression': 'A'
            }
        ]
    },
    
    // 故障車エリア
    'breaking_car': {
        'background': 'test_1',
        'bgm': 'curono',
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '故障した車があるな...',
                'expression': 'B'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'メンテナンスが必要だな',
                'expression': 'A'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '安全第一で修理しないとな',
                'expression': 'C'
            }
        ]
    },
    
    // 特殊詐欺エリア
    'special_scam': {
        'background': 'test_1',
        'bgm': 'curono',
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'ここは特殊詐欺について学ぶ場所だ',
                'expression': 'A'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '詐欺の手口を知って、被害を防ごう',
                'expression': 'B'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '知識は武器になるぜ☆',
                'expression': 'A'
            }
        ]
    },
    
    // 路上の噴水エリア
    'rojyounopenki': {
        'background': 'test_1',
        'bgm': 'curono',
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '路上の噴水だな',
                'expression': 'A'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '街の景観を良くしてるぜ',
                'expression': 'B'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '夏は涼しそうだな',
                'expression': 'A'
            }
        ]
    },
    
    // テレビ塔エリア
    'tereapo': {
        'background': 'test_1',
        'bgm': 'curono',
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'テレビ塔だ！',
                'expression': 'A'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '電波を送信してる重要な施設だな',
                'expression': 'B'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '街のランドマークになってるぜ☆',
                'expression': 'A'
            }
        ]
    },
    
    // グレーバイトエリア
    'gray_bytes': {
        'background': 'test_1',
        'bgm': 'curono',
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'グレーバイト...',
                'expression': 'B'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '何か秘密がありそうだな',
                'expression': 'A'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '調査してみるか？',
                'expression': 'C'
            }
        ]
    }
};

// 日本ステージ会話マネージャークラス
export class JapanConversationManager {
    constructor() {
        this.conversationData = japanConversationData;
    }

    getConversation(eventId) {
        return this.conversationData[eventId] || null;
    }

    getAvailableEvents() {
        return Object.keys(this.conversationData);
    }

    addConversation(eventId, conversationData) {
        this.conversationData[eventId] = conversationData;
    }

    updateConversation(eventId, conversationData) {
        this.conversationData[eventId] = conversationData;
    }
} 