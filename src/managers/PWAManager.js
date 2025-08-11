/**
 * PWA（Progressive Web App）のインストール処理を管理するクラス
 */
export class PWAManager {
    constructor() {
        // シングルトンパターンで確実に1つのインスタンスのみ作成
        if (PWAManager.instance) {
            return PWAManager.instance;
        }
        
        this.deferredPrompt = null;
        this.isInitialized = false;
        this.eventListenersRegistered = false;
        
        // インスタンスを保存
        PWAManager.instance = this;
        
        // 初期化
        this.init();
    }
    
    /**
     * 静的プロパティを設定
     */
    static getInstance() {
        if (!PWAManager.instance) {
            PWAManager.instance = new PWAManager();
        }
        return PWAManager.instance;
    }
    
    /**
     * PWAマネージャーを初期化
     */
    init() {
        if (this.isInitialized) {
            return;
        }
        
        console.log('PWAManager初期化開始');
        
        // イベントリスナーを一度だけ登録
        this.registerEventListeners();
        
        this.isInitialized = true;
        console.log('PWAManager初期化完了');
    }
    
    /**
     * イベントリスナーを登録（重複防止）
     */
    registerEventListeners() {
        if (this.eventListenersRegistered) {
            return;
        }
        
        // beforeinstallpromptイベント
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event fired');
            
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
        });
        
        // DOMContentLoadedイベント（一度だけ）
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupInstallButton();
            });
        } else {
            this.setupInstallButton();
        }
        
        this.eventListenersRegistered = true;
    }
    
    /**
     * インストールボタンの設定
     */
    setupInstallButton() {
        const installBtn = document.getElementById('install-btn');
        const closeBtn = document.getElementById('close-install-btn');
        
        if (installBtn) {
            // 既存のイベントリスナーを削除
            installBtn.replaceWith(installBtn.cloneNode(true));
            const newInstallBtn = document.getElementById('install-btn');
            
            newInstallBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleInstallClick();
            });
        }
        
        if (closeBtn) {
            // 既存のイベントリスナーを削除
            closeBtn.replaceWith(closeBtn.cloneNode(true));
            const newCloseBtn = document.getElementById('close-install-btn');
            
            newCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeInstallBanner();
            });
        }
    }
    
    /**
     * インストールボタンクリック時の処理
     */
    handleInstallClick() {
        console.log('インストールボタンがクリックされました');
        
        if (this.deferredPrompt) {
            try {
                // ユーザージェスチャー内でprompt()を呼び出す
                this.deferredPrompt.prompt();
                
                // ユーザーの選択を待つ
                this.deferredPrompt.userChoice.then(({ outcome }) => {
                    console.log('インストール結果:', outcome);
                    
                    // プロンプトをクリア
                    this.deferredPrompt = null;
                    
                    // インストールバナーを非表示
                    this.hideInstallBanner();
                }).catch((error) => {
                    console.error('インストールエラー:', error);
                    this.deferredPrompt = null;
                });
                
            } catch (error) {
                console.error('prompt()呼び出しエラー:', error);
                this.deferredPrompt = null;
            }
        } else {
            console.log('deferredPromptが利用できません');
        }
    }
    
    /**
     * インストールバナーを表示
     */
    showInstallBanner() {
        const installBanner = document.getElementById('install-banner');
        if (installBanner) {
            installBanner.style.display = 'block';
        }
    }
    
    /**
     * インストールバナーを非表示
     */
    hideInstallBanner() {
        const installBanner = document.getElementById('install-banner');
        if (installBanner) {
            installBanner.style.display = 'none';
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
        }
    }
}
