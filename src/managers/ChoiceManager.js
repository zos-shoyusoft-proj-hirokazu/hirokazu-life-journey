// 選択肢管理クラス
export class ChoiceManager {
    constructor() {
        this.choices = this.loadChoices();
        this.storageKey = 'game_choices';
    }
    
    // シングルトンインスタンス
    static getInstance() {
        if (!ChoiceManager._instance) {
            ChoiceManager._instance = new ChoiceManager();
        }
        return ChoiceManager._instance;
    }
    
    // ローカルストレージから選択を読み込み
    loadChoices() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('選択データの読み込みエラー:', error);
            return {};
        }
    }
    
    // 選択を保存
    saveChoice(conversationId, choiceId, selectedOption) {
        console.log('[ChoiceManager] saveChoice呼び出し:', { conversationId, choiceId, selectedOption });
        if (!conversationId) {
            console.error('[ChoiceManager] conversationIdが未定義です！');
            return;
        }
        
        if (!this.choices[conversationId]) {
            this.choices[conversationId] = {};
        }
        this.choices[conversationId][choiceId] = selectedOption;
        console.log('[ChoiceManager] 保存後のchoices:', this.choices);
        this.saveToStorage();
    }
    
    // ローカルストレージに保存
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.choices));
        } catch (error) {
            console.error('選択データの保存エラー:', error);
        }
    }
    
    // 特定の選択を取得
    getChoice(conversationId, choiceId) {
        return this.choices[conversationId]?.[choiceId] || null;
    }
    
    // 特定の選択が正解かチェック
    isChoiceCorrect(conversationId, choiceId) {
        const savedChoice = this.choices[conversationId]?.[choiceId];
        return savedChoice === 'correct';
    }
    
    // エンディング条件をチェック
    checkEndingCondition() {
        // リセット直後の場合はエンディング条件を満たさない
        if (window.__justReset) {
            return false;
        }
        
        // 選択肢があるイベントのリスト（全て正解になっている必要がある）
        const choiceEvents = [
            'breaking_car',    // 日本：故障車エリア
            'wax_on',         // 竹田：ワックスを付けるイベント
            'otsuka_senpai',  // 三重：大塚先輩イベント（一生ついていきます）
            'drinking_dutu'   // 三重：ドンキの謎酒イベント（木の下にはく）
        ];
        
        // 選択肢があるイベントが全て正解になっているかチェック
        for (const eventId of choiceEvents) {
            if (!this.isEventCleared(eventId)) {
                console.log('[ChoiceManager] エンディング条件未達成:', eventId, 'が未クリア');
                return false; // 1つでも未クリアならエンディング条件を満たさない
            }
        }
        
        console.log('[ChoiceManager] エンディング条件達成: 全ての選択肢イベントがクリア済み');
        return true; // 全ての選択肢イベントがクリア済み
    }
    
    // 全選択データをリセット
    resetChoices() {
        this.choices = {};
        this.saveToStorage();
    }
    
    // デバッグ用：全選択データを表示
    debugChoices() {
        console.log('[ChoiceManager] 現在の選択データ:', this.choices);
    }
    
    // イベント(eventId)内で1つでも 'correct' が記録されていれば「達成」とみなす
    isEventCleared(eventId) {
        console.log('[ChoiceManager] isEventCleared呼び出し:', { eventId, choices: this.choices });
        const eventChoices = this.choices[eventId];
        console.log('[ChoiceManager] eventChoices:', eventChoices);
        if (!eventChoices) {
            console.log('[ChoiceManager] eventChoicesが存在しない、falseを返す');
            return false;
        }
        const values = Object.values(eventChoices);
        console.log('[ChoiceManager] eventChoicesの値:', values);
        const hasCorrect = values.some(v => v === 'correct');
        console.log('[ChoiceManager] hasCorrect:', hasCorrect);
        return hasCorrect;
    }
    
    // イベントに選択肢が存在するか（記録の有無で判断）
    hasAnyChoiceRecorded(eventId) {
        return !!this.choices[eventId] && Object.keys(this.choices[eventId]).length > 0;
    }
}

// グローバルに公開（動的インポートの問題を回避）
if (typeof window !== 'undefined') {
    window.ChoiceManager = ChoiceManager;
}
