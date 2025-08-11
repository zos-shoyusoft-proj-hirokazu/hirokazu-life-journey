/**
 * PWA（Progressive Web App）のインストール処理を管理するクラス
 */
export class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }
    
    /**
     * PWAマネージャーを初期化
     */
    init() {
        console.log('PWAManager初期化開始');
        
        // イベントリスナーを登録
        this.registerEventListeners();
        
        console.log('PWAManager初期化完了');
    }
    
    /**
     * イベントリスナーを登録
     */
    registerEventListeners() {
        // beforeinstallpromptイベント
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event fired');
            
            // デフォルトの動作を防止
            e.preventDefault();
            
            // イベントを保存
            this.deferredPrompt = e;
            
            // インストールボタンを有効化
            this.enableInstallButton();
            
            // インストールバナーを表示
            this.showInstallBanner();
        });
        
        // appinstalledイベント
        window.addEventListener('appinstalled', () => {
            console.log('PWAがインストールされました');
            this.hideInstallBanner();
            this.deferredPrompt = null;
        });
        
        // DOMContentLoadedイベント
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupInstallButton();
            });
        } else {
            this.setupInstallButton();
        }
    }
    
    /**
     * インストールボタンの設定
     */
    setupInstallButton() {
        const installBtn = document.getElementById('install-btn');
        const closeBtn = document.getElementById('close-install-btn');
        
        if (installBtn) {
            // ユーザージェスチャーを確実に保持するため、直接関数を呼び出し
            installBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 即座にhandleInstallClickを呼び出し
                await this.handleInstallClick();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeInstallBanner();
            });
        }
    }
    
    /**
     * インストールボタンクリック時の処理
     */
    async handleInstallClick() {
        console.log('インストールボタンがクリックされました');
        
        if (!this.deferredPrompt) {
            console.log('deferredPromptが利用できません。PWAのインストール条件が満たされていない可能性があります。');
            return;
        }
        
        try {
            // ユーザージェスチャー内でprompt()を呼び出し
            console.log('prompt()を呼び出します...');
            await this.deferredPrompt.prompt();
            
            // ユーザーの選択を待つ
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log('インストール結果:', outcome);
            
            // プロンプトをクリア
            this.deferredPrompt = null;
            
            // インストールバナーを非表示
            this.hideInstallBanner();
            
        } catch (error) {
            console.error('インストールエラー:', error);
            this.deferredPrompt = null;
        }
    }
    
    /**
     * インストールバナーを表示
     */
    showInstallBanner() {
        const installBanner = document.getElementById('install-banner');
        if (installBanner) {
            installBanner.style.display = 'block';
            console.log('インストールバナーを表示しました');
        }
    }
    
    /**
     * インストールバナーを非表示
     */
    hideInstallBanner() {
        const installBanner = document.getElementById('install-banner');
        if (installBanner) {
            installBanner.style.display = 'none';
            console.log('インストールバナーを非表示にしました');
        }
    }
    
    /**
     * インストールバナーを閉じる
     */
    closeInstallBanner() {
        this.hideInstallBanner();
    }
    
    /**
     * インストールボタンを有効化
     */
    enableInstallButton() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.disabled = false;
            installBtn.style.opacity = '1';
            installBtn.style.cursor = 'pointer';
            console.log('インストールボタンを有効化しました');
        }
    }
}
