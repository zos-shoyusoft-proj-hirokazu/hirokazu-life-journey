// 会話データの定義
export const conversationData = {
    // 初回出会いのイベント
    'first_meeting': {
        'background': 'school_classroom',
        'conversations': [
            {
                'speaker': '主人公',
                'character': null,
                'text': '（新しいクラスか...少し緊張するな）',
                'expression': null
            },
            {
                'speaker': 'ヒロイン',
                'character': 'heroine',
                'text': 'あ、あなたが転校生の方ですね！',
                'expression': 'happy'
            },
            {
                'speaker': '主人公',
                'character': null,
                'text': 'はい、今日からお世話になります',
                'expression': null
            },
            {
                'speaker': 'ヒロイン',
                'character': 'heroine',
                'text': '私、田中花子です。よろしくお願いします！',
                'expression': 'smile'
            },
            {
                'speaker': '主人公',
                'character': null,
                'text': 'こちらこそ。分からないことがあったら教えてください',
                'expression': null
            },
            {
                'speaker': 'ヒロイン',
                'character': 'heroine',
                'text': 'はい！何でも聞いてくださいね♪',
                'expression': 'happy'
            }
        ]
    },
    
    // 放課後のイベント
    'after_school': {
        'background': 'school_classroom',
        'conversations': [
            {
                'speaker': 'ヒロイン',
                'character': 'heroine',
                'text': 'お疲れ様です！今日の授業はどうでしたか？',
                'expression': 'normal'
            },
            {
                'speaker': '主人公',
                'character': null,
                'text': '思ったより難しかったです...',
                'expression': null
            },
            {
                'speaker': 'ヒロイン',
                'character': 'heroine',
                'text': 'そうですね。でも、慣れれば大丈夫ですよ',
                'expression': 'smile'
            },
            {
                'speaker': 'ヒロイン',
                'character': 'heroine',
                'text': '良かったら、一緒に勉強しませんか？',
                'expression': 'happy'
            },
            {
                'speaker': '主人公',
                'character': null,
                'text': '本当ですか？ありがとうございます！',
                'expression': null
            }
        ]
    },
    
    // 複数キャラクターの会話例
    'library_scene': {
        'background': 'library',
        'conversations': [
            {
                'speaker': 'ヒロイン',
                'character': 'heroine',
                'text': '図書館は静かでいいですね',
                'expression': 'normal'
            },
            {
                'speaker': '友達',
                'character': 'friend',
                'text': 'あ、二人ともいたんですね！',
                'expression': 'happy'
            },
            {
                'speaker': '主人公',
                'character': null,
                'text': '友達さん、こんにちは',
                'expression': null
            },
            {
                'speaker': '友達',
                'character': 'friend',
                'text': '一緒に勉強してるんですか？いいですね〜',
                'expression': 'smile'
            },
            {
                'speaker': 'ヒロイン',
                'character': 'heroine',
                'text': 'はい！彼、とても頑張ってるんですよ',
                'expression': 'happy'
            }
        ]
    },
    
    // 既存のNPCに対応する会話データ
    'hanni': {
        'background': 'school_classroom',
        'conversations': [
            {
                'speaker': 'ハンニ',
                'character': 'heroine',
                'text': 'こんにちは！元気にしてましたか？',
                'expression': 'happy'
            },
            {
                'speaker': '主人公',
                'character': null,
                'text': 'はい、おかげさまで。ハンニさんはいかがですか？',
                'expression': null
            },
            {
                'speaker': 'ハンニ',
                'character': 'heroine',
                'text': '私も元気です！今度一緒に冒険しませんか？',
                'expression': 'smile'
            }
        ]
    },
    
    // エリアトリガー用の会話データ
    'area_event_001': {
        'background': 'school_classroom',
        'conversations': [
            {
                'speaker': '主人公',
                'character': null,
                'text': '（この場所に何かありそうだな...）',
                'expression': null
            },
            {
                'speaker': 'ヒロイン',
                'character': 'heroine',
                'text': 'あ、そこは私の特別な場所なんです',
                'expression': 'normal'
            },
            {
                'speaker': '主人公',
                'character': null,
                'text': '特別な場所？',
                'expression': null
            },
            {
                'speaker': 'ヒロイン',
                'character': 'heroine',
                'text': 'はい、いつもここで本を読んでいるんです',
                'expression': 'smile'
            }
        ]
    }
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