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
        if (!this.choices[conversationId]) {
            this.choices[conversationId] = {};
        }
        this.choices[conversationId][choiceId] = selectedOption;
        this.saveToStorage();
        console.log(`[ChoiceManager] 選択を保存: ${conversationId}.${choiceId} = ${selectedOption}`);
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
        const requiredChoices = {
            'gray_bytes': {
                'investigation_choice': 'correct',
                'trust_choice': 'correct'
            },
            'tereapo': {
                'tv_tower_choice': 'correct'
            }
            // 他の会話の正解選択も追加可能
        };
        
        for (const [convId, choices] of Object.entries(requiredChoices)) {
            for (const [choiceId, correctAnswer] of Object.entries(choices)) {
                if (this.choices[convId]?.[choiceId] !== correctAnswer) {
                    console.log(`[ChoiceManager] エンディング条件未達成: ${convId}.${choiceId}`);
                    return false;
                }
            }
        }
        
        console.log('[ChoiceManager] エンディング条件達成！');
        return true;
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
