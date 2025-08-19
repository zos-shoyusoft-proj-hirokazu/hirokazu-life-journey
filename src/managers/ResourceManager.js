/**
 * リソース管理クラス
 * イベント時に必要なリソースのみを動的に読み込み
 * 画像、音声、キャラクター画像の管理
 */
export class ResourceManager {
    constructor() {
        this.loadedResources = new Map(); // 読み込み済みリソース
        this.loadingQueue = []; // 読み込み待ちキュー
        this.loadingStatus = 'idle'; // 読み込み状態
        this.resizeObserver = null; // リサイズ監視
        this.currentSize = { width: window.innerWidth, height: window.innerHeight };
        
        // リサイズ監視を開始
        this.initResizeObserver();
    }
    
    // リサイズ監視の初期化
    initResizeObserver() {
        // ResizeObserverが利用可能な場合
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    this.handleResize(width, height);
                    this.currentSize = { width, height };
                }
            });
            
            // body要素を監視
            this.resizeObserver.observe(document.body);
        } else {
            // フォールバック：windowのresizeイベント
            window.addEventListener('resize', () => {
                const width = window.innerWidth;
                const height = window.innerHeight;
                this.handleResize(width, height);
                this.currentSize = { width, height };
            });
        }
    }
    
    // イベントに必要なリソースを特定
    getRequiredResources(eventId, conversationData) {
        const event = conversationData[eventId];
        if (!event) return null;
        
        const resources = {
            backgrounds: new Set(),
            bgm: new Set(),
            characters: new Set(),
            soundEffects: new Set()
        };
        
        // 背景
        if (event.background) {
            resources.backgrounds.add(event.background);
        }
        
        // BGM
        if (event.bgm) {
            resources.bgm.add(event.bgm);
        }
        
        // 会話から必要なリソースを抽出
        if (event.conversations) {
            event.conversations.forEach(conversation => {
                // キャラクター
                if (conversation.character) {
                    resources.characters.add(conversation.character);
                }
                
                // 効果音
                if (conversation.se) {
                    resources.soundEffects.add(conversation.se);
                }
                
                // 背景変更
                if (conversation.background) {
                    resources.backgrounds.add(conversation.background);
                }
            });
        }
        
        // Setを配列に変換
        return {
            backgrounds: Array.from(resources.backgrounds),
            bgm: Array.from(resources.bgm),
            characters: Array.from(resources.characters),
            soundEffects: Array.from(resources.soundEffects)
        };
    }
    
    // 必要なリソースを読み込み
    async loadEventResources(eventId, conversationData) {
        const resources = this.getRequiredResources(eventId, conversationData);
        if (!resources) {
            throw new Error(`Event ${eventId} not found`);
        }
        
        this.loadingStatus = 'loading';
        
        try {
            // 並行して読み込み
            const loadPromises = [
                this.loadBackgrounds(resources.backgrounds),
                this.loadBGMFiles(resources.bgm),
                this.loadCharacters(resources.characters),
                this.loadSoundEffects(resources.soundEffects)
            ];
            
            await Promise.all(loadPromises);
            this.loadingStatus = 'completed';
            
            return true;
        } catch (error) {
            this.loadingStatus = 'error';
            console.error('Resource loading failed:', error);
            throw error;
        }
    }
    
    // 背景画像を読み込み
    async loadBackgrounds(backgroundKeys) {
        if (!backgroundKeys || backgroundKeys.length === 0) {
            return;
        }
        
        try {
            const loadPromises = backgroundKeys.map(key => this.loadBackground(key));
            await Promise.all(loadPromises);
        } catch (error) {
            console.error(`[ResourceManager] ❌ 背景画像読み込みエラー:`, error);
            throw error;
        }
    }
    
    // 個別の背景画像を読み込み
    async loadBackground(backgroundKey) {
        
        // 背景画像の読み込み処理
        const imagePath = `assets/backgrounds/${backgroundKey}.jpg`;
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.loadedResources.set(`bg_${backgroundKey}`, img);
                resolve(img);
            };
            img.onerror = () => {
                const loadError = new Error(`背景画像「${backgroundKey}」の読み込みに失敗しました`);
                console.error(`[ResourceManager] ❌ 背景画像「${backgroundKey}」読み込みエラー:`, loadError);
                reject(loadError);
            };
            img.src = imagePath;
        });
    }
    
    // BGMファイルを読み込み
    async loadBGMFiles(bgmKeys) {
        if (!bgmKeys || bgmKeys.length === 0) {
            return;
        }
        
        try {
            const loadPromises = bgmKeys.map(key => this.loadBGMFile(key));
            await Promise.all(loadPromises);
        } catch (error) {
            console.error(`[ResourceManager] ❌ BGMファイル読み込みエラー:`, error);
            throw error;
        }
    }
    
    // 個別のBGMファイルを読み込み
    async loadBGMFile(bgmKey) {
        
        // BGMファイルの読み込み処理
        const audioPath = `assets/bgm/${bgmKey}.mp3`;
        
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.loadedResources.set(`bgm_${bgmKey}`, audio);
                resolve(audio);
            };
            audio.onerror = () => {
                const loadError = new Error(`BGMファイル「${bgmKey}」の読み込みに失敗しました`);
                console.error(`[ResourceManager] ❌ BGMファイル「${bgmKey}」読み込みエラー:`, loadError);
                reject(loadError);
            };
            audio.src = audioPath;
        });
    }
    
    // キャラクター画像を読み込み
    async loadCharacters(characterKeys) {
        if (!characterKeys || characterKeys.length === 0) {
            return;
        }
        
        try {
            const loadPromises = characterKeys.map(key => this.loadCharacter(key));
            await Promise.all(loadPromises);
        } catch (error) {
            console.error(`[ResourceManager] ❌ キャラクター画像読み込みエラー:`, error);
            throw error;
        }
    }
    
    // 個別のキャラクター画像を読み込み
    async loadCharacter(characterKey) {
        
        // キャラクター画像の読み込み処理
        const imagePath = `assets/characters/${characterKey}.png`;
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.loadedResources.set(`char_${characterKey}`, img);
                resolve(img);
            };
            img.onerror = () => {
                const loadError = new Error(`キャラクター画像「${characterKey}」の読み込みに失敗しました`);
                console.error(`[ResourceManager] ❌ キャラクター画像「${characterKey}」読み込みエラー:`, loadError);
                reject(loadError);
            };
            img.src = imagePath;
        });
    }
    
    // 効果音を読み込み
    async loadSoundEffects(seKeys) {
        if (!seKeys || seKeys.length === 0) {
            return;
        }
        
        try {
            const loadPromises = seKeys.map(key => this.loadSoundEffect(key));
            await Promise.all(loadPromises);
        } catch (error) {
            console.error(`[ResourceManager] ❌ 効果音読み込みエラー:`, error);
            throw error;
        }
    }
    
    // 個別の効果音を読み込み
    async loadSoundEffect(seKey) {
        
        // 効果音の読み込み処理
        const audioPath = `assets/se/${seKey}.mp3`;
        
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.loadedResources.set(`se_${seKey}`, audio);
                resolve(audio);
            };
            audio.onerror = () => {
                const loadError = new Error(`効果音「${seKey}」の読み込みに失敗しました`);
                console.error(`[ResourceManager] ❌ 効果音「${seKey}」読み込みエラー:`, loadError);
                reject(loadError);
            };
            audio.src = audioPath;
        });
    }
    
    // リソースの取得
    getResource(type, name) {
        return this.loadedResources.get(`${type}_${name}`);
    }
    
    // 読み込み状態の取得
    getLoadingStatus() {
        return this.loadingStatus;
    }
    
    // リソースの解放
    unloadResources() {
        this.loadedResources.clear();
        this.loadingStatus = 'idle';
    }
    
    // マップ読み込み時の処理（基本データのみ、重いリソースは除外）
    async loadMapResources(mapName) {
        console.log(`マップ「${mapName}」の基本データを読み込み中...`);
        try {
            const loadPromises = [
                this.loadMapImage(mapName),           // マップ画像
                this.loadEventMarkers(mapName),       // イベントマーカー
                this.loadMapObjects(mapName),         // オブジェクト配置
                this.loadConversationText(mapName)    // 会話テキスト（画像・音声なし）
            ];
            await Promise.all(loadPromises);
            console.log(`マップ「${mapName}」の基本データ読み込み完了`);
            return true;
        } catch (error) {
            console.error(`マップ「${mapName}」の基本データ読み込みエラー:`, error);
            throw error;
        }
    }
    
    // マップ画像を読み込み
    async loadMapImage(mapName) {
        const imageUrl = `/assets/maps/${mapName}.jpg`;
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.loadedResources.set(`map_${mapName}`, img);
                resolve(img);
            };
            img.onerror = () => reject(new Error(`マップ画像読み込み失敗: ${mapName}`));
            img.src = imageUrl;
        });
    }

    // イベントマーカーを読み込み
    async loadEventMarkers(mapName) {
        // イベントマーカーの位置情報（JSONファイル）
        const markersUrl = `/assets/maps/${mapName}_markers.json`;
        
        try {
            const response = await fetch(markersUrl);
            const markers = await response.json();
            this.loadedResources.set(`markers_${mapName}`, markers);
            return markers;
        } catch (error) {
            console.warn(`イベントマーカー読み込み失敗: ${mapName}`, error);
            // マーカーがなくても動作は継続
            return [];
        }
    }

    // オブジェクト配置読み込み（軽量）
    async loadMapObjects(mapName) {
        // オブジェクトの配置情報（JSONファイル）
        const objectsUrl = `/assets/maps/${mapName}_objects.json`;
        
        try {
            const response = await fetch(objectsUrl);
            const objects = await response.json();
            this.loadedResources.set(`objects_${mapName}`, objects);
            return objects;
        } catch (error) {
            console.warn(`オブジェクト配置読み込み失敗: ${mapName}`, error);
            // オブジェクトがなくても動作は継続
            return [];
        }
    }
    
    // 会話テキスト読み込み（軽量、画像・音声なし）
    async loadConversationText(mapName) {
        // 会話データは既にJavaScriptファイルで読み込まれているので、
        // ここでは軽量なメタデータのみ読み込み
        const textUrl = `/assets/maps/${mapName}_conversations.json`;
        
        try {
            const response = await fetch(textUrl);
            const conversations = await response.json();
            this.loadedResources.set(`conversations_${mapName}`, conversations);
            return conversations;
        } catch (error) {
            console.warn(`会話テキスト読み込み失敗: ${mapName}`, error);
            // 会話データがなくても動作は継続
            return {};
        }
    }
    
    // 完全なクリーンアップ
    destroy() {
        // リソースを解放
        this.unloadResources();
        
        // リサイズ監視を停止
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        
        // イベントリスナーを削除（フォールバック用）
        window.removeEventListener('resize', this.handleResize);
    }
    
    // リサイズ時の処理
    handleResize(newWidth, newHeight) {
        // 読み込み済みの画像リソースを再描画用に更新
        this.loadedResources.forEach((resource, key) => {
            if (key.startsWith('bg_') && resource instanceof Image) {
                // 背景画像のリサイズ処理
                this.resizeImage(resource, newWidth, newHeight);
            } else if (key.startsWith('char_') && resource instanceof Image) {
                // キャラクター画像のリサイズ処理
                this.resizeCharacter(resource, newWidth, newHeight);
            }
        });
    }
    
    // 背景画像のリサイズ
    resizeImage(image, newWidth, newHeight) {
        // アスペクト比を保ちながらリサイズ
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 新しいサイズを計算
        const aspectRatio = image.width / image.height;
        let targetWidth = newWidth;
        let targetHeight = newHeight;
        
        if (newWidth / newHeight > aspectRatio) {
            targetWidth = newHeight * aspectRatio;
        } else {
            targetHeight = newWidth / aspectRatio;
        }
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // リサイズして描画
        ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
        
        // 新しい画像を作成
        const resizedImage = new Image();
        resizedImage.src = canvas.toDataURL();
        
        // 元のリソースを更新
        this.loadedResources.set(image.dataset.originalKey || 'bg_resized', resizedImage);
    }
    
    // キャラクター画像のリサイズ
    resizeCharacter(image, newWidth, newHeight) {
        // キャラクターは元のサイズを保つ（位置調整のみ）
        // 必要に応じてスケール調整
        const scale = Math.min(newWidth / 1920, newHeight / 1080); // 基準解像度
        
        if (scale !== 1) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const newCharWidth = image.width * scale;
            const newCharHeight = image.height * scale;
            
            canvas.width = newCharWidth;
            canvas.height = newCharHeight;
            
            ctx.drawImage(image, 0, 0, newCharWidth, newCharHeight);
            
            const resizedChar = new Image();
            resizedChar.src = canvas.toDataURL();
            
            this.loadedResources.set(image.dataset.originalKey || 'char_resized', resizedChar);
        }
    }
    
    // レスポンシブ対応のリソース取得
    getResponsiveResource(type, name, currentSize) {
        const resource = this.getResource(type, name);
        if (!resource) return null;
        
        // 現在の画面サイズに応じたリソースを返す
        if (currentSize && currentSize.width && currentSize.height) {
            // 必要に応じてリサイズ処理
            if (type === 'bg' || type === 'char') {
                this.handleResize(currentSize.width, currentSize.height);
            }
        }
        
        return resource;
    }
}
