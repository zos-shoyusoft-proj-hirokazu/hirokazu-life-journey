// 選択肢管理クラス
export class ChoiceManager {
    constructor() {
        this.choices = this.loadChoices();
        this.storageKey = 'game_choices';
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
        console.log(`[ChoiceManager] saveChoice呼び出し: conversationId=${conversationId}, choiceId=${choiceId}, selectedOption=${selectedOption}`);
        
        if (!conversationId) {
            console.error('[ChoiceManager] conversationIdが未定義です！');
            return;
        }
        
        if (!this.choices[conversationId]) {
            this.choices[conversationId] = {};
        }
        this.choices[conversationId][choiceId] = selectedOption;
        this.saveToStorage();
        console.log(`[ChoiceManager] 選択を保存: ${conversationId}.${choiceId} = ${selectedOption}`);
        console.log('[ChoiceManager] 保存後の全選択データ:', this.choices);
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
        console.log('[ChoiceManager] エンディング条件チェック開始');
        console.log('[ChoiceManager] 現在の選択データ:', this.choices);
        
        // リセット直後の場合はエンディング条件を満たさない
        if (window.__justReset) {
            console.log('[ChoiceManager] リセット直後のため、エンディング条件を満たしません');
            return false;
        }
        
        // 選択データが空の場合はエンディング条件を満たさない
        if (Object.keys(this.choices).length === 0) {
            console.log('[ChoiceManager] 選択データが空のため、エンディング条件を満たしません');
            return false;
        }
        
        // エンディング条件：何らかの選択をした場合（現在は選択データがあるかどうかのみチェック）
        
        // 代替条件：何らかの選択があればエンディングボタンを表示
        const hasAnyChoice = Object.keys(this.choices).length > 0;
        if (hasAnyChoice) {
            console.log('[ChoiceManager] 代替条件達成：何らかの選択が存在します');
            return true;
        }
        
        console.log('[ChoiceManager] 選択データがないため、エンディング条件を満たしません');
        return false;
    }
    
    // 全選択データをリセット
    resetChoices() {
        this.choices = {};
        this.saveToStorage();
        console.log('[ChoiceManager] 選択データをリセットしました');
    }
    
    // デバッグ用：全選択データを表示
    debugChoices() {
        console.log('[ChoiceManager] 現在の選択データ:', this.choices);
    }
}

// グローバルに公開（動的インポートの問題を回避）
if (typeof window !== 'undefined') {
    window.ChoiceManager = ChoiceManager;
}
