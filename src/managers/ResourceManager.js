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
        console.log(`[ResourceManager] 🔍 イベント「${eventId}」の必要リソースを解析中...`);
        
        const eventData = conversationData[eventId];
        if (!eventData) {
            console.warn(`[ResourceManager] ⚠️ イベント「${eventId}」のデータが見つかりません`);
            return { backgrounds: [], bgmFiles: [], characters: [], soundEffects: [] };
        }

        const backgrounds = new Set();
        const bgmFiles = new Set();
        const characters = new Set();
        const soundEffects = new Set();

        // 会話データからリソースを抽出
        if (eventData.conversations) {
            eventData.conversations.forEach(conv => {
                if (conv.background) backgrounds.add(conv.background);
                if (conv.bgm) bgmFiles.add(conv.bgm);
                if (conv.character) characters.add(conv.character);
                if (conv.se) soundEffects.add(conv.se);
            });
        }

        const result = {
            backgrounds: Array.from(backgrounds),
            bgmFiles: Array.from(bgmFiles),
            characters: Array.from(characters),
            soundEffects: Array.from(soundEffects)
        };

        console.log(`[ResourceManager] 📊 解析結果:`, result);
        return result;
    }
    
    // 必要なリソースを読み込み
    async loadEventResources(eventId, conversationData) {
        console.log(`[ResourceManager] 🎭 イベント「${eventId}」のリソース読み込み開始`);
        try {
            const requiredResources = this.getRequiredResources(eventId, conversationData);
            console.log(`[ResourceManager] 📋 必要なリソース:`, requiredResources);
            
            const loadPromises = [
                this.loadBackgrounds(requiredResources.backgrounds),
                this.loadBGMFiles(requiredResources.bgmFiles),
                this.loadCharacters(requiredResources.characters),
                this.loadSoundEffects(requiredResources.soundEffects)
            ];
            await Promise.all(loadPromises);
            console.log(`[ResourceManager] ✅ イベント「${eventId}」のリソース読み込み完了`);
            return true;
        } catch (error) {
            console.error(`[ResourceManager] ❌ イベント「${eventId}」のリソース読み込みエラー:`, error);
            throw error;
        }
    }
    
    // 背景画像を読み込み
    async loadBackgrounds(backgroundKeys) {
        if (!backgroundKeys || backgroundKeys.length === 0) {
            console.log(`[ResourceManager] ℹ️ 背景画像の読み込みは不要です`);
            return;
        }
        
        console.log(`[ResourceManager] 🖼️ 背景画像読み込み開始: ${backgroundKeys.join(', ')}`);
        try {
            const loadPromises = backgroundKeys.map(key => this.loadBackground(key));
            await Promise.all(loadPromises);
            console.log(`[ResourceManager] ✅ 背景画像読み込み完了: ${backgroundKeys.join(', ')}`);
        } catch (error) {
            console.error(`[ResourceManager] ❌ 背景画像読み込みエラー:`, error);
            throw error;
        }
    }
    
    // 個別の背景画像を読み込み
    async loadBackground(backgroundKey) {
        console.log(`[ResourceManager] 🖼️ 背景画像「${backgroundKey}」を読み込み中...`);
        
        // 既に読み込まれているかチェック
        if (this.loadedResources.has(`bg_${backgroundKey}`)) {
            console.log(`[ResourceManager] ℹ️ 背景画像「${backgroundKey}」は既に読み込まれています`);
            return;
        }

        // 背景画像の読み込み処理
        const imagePath = `assets/backgrounds/${backgroundKey}.jpg`;
        console.log(`[ResourceManager] 📁 背景画像パス: ${imagePath}`);
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.loadedResources.set(`bg_${backgroundKey}`, img);
                console.log(`[ResourceManager] ✅ 背景画像「${backgroundKey}」読み込み完了`);
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
            console.log(`[ResourceManager] ℹ️ BGMファイルの読み込みは不要です`);
            return;
        }
        
        console.log(`[ResourceManager] 🎵 BGMファイル読み込み開始: ${bgmKeys.join(', ')}`);
        try {
            const loadPromises = bgmKeys.map(key => this.loadBGMFile(key));
            await Promise.all(loadPromises);
            console.log(`[ResourceManager] ✅ BGMファイル読み込み完了: ${bgmKeys.join(', ')}`);
        } catch (error) {
            console.error(`[ResourceManager] ❌ BGMファイル読み込みエラー:`, error);
            throw error;
        }
    }
    
    // 個別のBGMファイルを読み込み
    async loadBGMFile(bgmKey) {
        console.log(`[ResourceManager] 🎵 BGMファイル「${bgmKey}」を読み込み中...`);
        
        // 既に読み込まれているかチェック
        if (this.loadedResources.has(`bgm_${bgmKey}`)) {
            console.log(`[ResourceManager] ℹ️ BGMファイル「${bgmKey}」は既に読み込まれています`);
            return;
        }

        // BGMファイルの読み込み処理
        const audioPath = `assets/bgm/${bgmKey}.mp3`;
        console.log(`[ResourceManager] 📁 BGMファイルパス: ${audioPath}`);
        
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.loadedResources.set(`bgm_${bgmKey}`, audio);
                console.log(`[ResourceManager] ✅ BGMファイル「${bgmKey}」読み込み完了`);
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
            console.log(`[ResourceManager] ℹ️ キャラクター画像の読み込みは不要です`);
            return;
        }
        
        console.log(`[ResourceManager] 👤 キャラクター画像読み込み開始: ${characterKeys.join(', ')}`);
        try {
            const loadPromises = characterKeys.map(key => this.loadCharacter(key));
            await Promise.all(loadPromises);
            console.log(`[ResourceManager] ✅ キャラクター画像読み込み完了: ${characterKeys.join(', ')}`);
        } catch (error) {
            console.error(`[ResourceManager] ❌ キャラクター画像読み込みエラー:`, error);
            throw error;
        }
    }
    
    // 個別のキャラクター画像を読み込み
    async loadCharacter(characterKey) {
        console.log(`[ResourceManager] 👤 キャラクター画像「${characterKey}」を読み込み中...`);
        
        // 既に読み込まれているかチェック
        if (this.loadedResources.has(`char_${characterKey}`)) {
            console.log(`[ResourceManager] ℹ️ キャラクター画像「${characterKey}」は既に読み込まれています`);
            return;
        }

        // キャラクター画像の読み込み処理
        const imagePath = `assets/characters/${characterKey}.png`;
        console.log(`[ResourceManager] 📁 キャラクター画像パス: ${imagePath}`);
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.loadedResources.set(`char_${characterKey}`, img);
                console.log(`[ResourceManager] ✅ キャラクター画像「${characterKey}」読み込み完了`);
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
            console.log(`[ResourceManager] ℹ️ 効果音の読み込みは不要です`);
            return;
        }
        
        console.log(`[ResourceManager] 🔊 効果音読み込み開始: ${seKeys.join(', ')}`);
        try {
            const loadPromises = seKeys.map(key => this.loadSoundEffect(key));
            await Promise.all(loadPromises);
            console.log(`[ResourceManager] ✅ 効果音読み込み完了: ${seKeys.join(', ')}`);
        } catch (error) {
            console.error(`[ResourceManager] ❌ 効果音読み込みエラー:`, error);
            throw error;
        }
    }
    
    // 個別の効果音を読み込み
    async loadSoundEffect(seKey) {
        console.log(`[ResourceManager] 🔊 効果音「${seKey}」を読み込み中...`);
        
        // 既に読み込まれているかチェック
        if (this.loadedResources.has(`se_${seKey}`)) {
            console.log(`[ResourceManager] ℹ️ 効果音「${seKey}」は既に読み込まれています`);
            return;
        }

        // 効果音の読み込み処理
        const audioPath = `assets/se/${seKey}.mp3`;
        console.log(`[ResourceManager] 📁 効果音パス: ${audioPath}`);
        
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.loadedResources.set(`se_${seKey}`, audio);
                console.log(`[ResourceManager] ✅ 効果音「${seKey}」読み込み完了`);
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
        console.log(`[ResourceManager] 🗺️ マップ「${mapName}」の基本データを読み込み開始`);
        
        try {
            // 並行して基本データを読み込み
            const loadPromises = [
                this.loadMapImage(mapName),           // マップ画像
                this.loadEventMarkers(mapName),       // イベントマーカー
                this.loadMapObjects(mapName),         // オブジェクト配置
                this.loadConversationText(mapName)    // 会話テキスト（画像・音声なし）
            ];
            
            await Promise.all(loadPromises);
            console.log(`[ResourceManager] ✅ マップ「${mapName}」の基本データ読み込み完了`);
            
            return true;
        } catch (error) {
            console.error(`[ResourceManager] ❌ マップ「${mapName}」の基本データ読み込みエラー:`, error);
            throw error;
        }
    }
    
    // マップ画像を読み込み
    async loadMapImage(mapName) {
        console.log(`[ResourceManager] 🗺️ マップ画像「${mapName}」を読み込み中...`);
        try {
            const imagePath = `assets/maps/${mapName}.jpg`;
            console.log(`[ResourceManager] 📁 マップ画像パス: ${imagePath}`);
            
            // ここで実際のマップ画像読み込み処理を行う
            // 仮の処理として、ログのみ出力
            const img = new Image();
            img.onload = () => {
                this.loadedResources.set(`map_${mapName}`, img);
                console.log(`[ResourceManager] ✅ マップ画像「${mapName}」読み込み完了`);
            };
            img.onerror = () => {
                console.error(`[ResourceManager] ❌ マップ画像「${mapName}」読み込みエラー:`, error);
                throw error;
            };
            img.src = imagePath;
        } catch (error) {
            console.error(`[ResourceManager] ❌ マップ画像「${mapName}」読み込みエラー:`, error);
            throw error;
        }
    }

    // イベントマーカーを読み込み
    async loadEventMarkers(mapName) {
        console.log(`[ResourceManager] 📍 イベントマーカー「${mapName}」を読み込み中...`);
        try {
            const markerPath = `assets/maps/${mapName}_markers.json`;
            console.log(`[ResourceManager] 📁 イベントマーカーパス: ${markerPath}`);
            
            // ここで実際のマーカーデータ読み込み処理を行う
            // 仮の処理として、ログのみ出力
            const response = await fetch(markerPath);
            const markers = await response.json();
            this.loadedResources.set(`markers_${mapName}`, markers);
            console.log(`[ResourceManager] ✅ イベントマーカー「${mapName}」読み込み完了`);
            return markers;
        } catch (error) {
            console.error(`[ResourceManager] ❌ イベントマーカー「${mapName}」読み込みエラー:`, error);
            throw error;
        }
    }

    // マップオブジェクトを読み込み
    async loadMapObjects(mapName) {
        console.log(`[ResourceManager] 🎯 マップオブジェクト「${mapName}」を読み込み中...`);
        try {
            const objectPath = `assets/maps/${mapName}_objects.json`;
            console.log(`[ResourceManager] 📁 マップオブジェクトパス: ${objectPath}`);
            
            // ここで実際のオブジェクトデータ読み込み処理を行う
            // 仮の処理として、ログのみ出力
            const response = await fetch(objectPath);
            const objects = await response.json();
            this.loadedResources.set(`objects_${mapName}`, objects);
            console.log(`[ResourceManager] ✅ マップオブジェクト「${mapName}」読み込み完了`);
            return objects;
        } catch (error) {
            console.error(`[ResourceManager] ❌ マップオブジェクト「${mapName}」読み込みエラー:`, error);
            throw error;
        }
    }

    // 会話テキストを読み込み
    async loadConversationText(mapName) {
        console.log(`[ResourceManager] 💬 会話テキスト「${mapName}」を読み込み中...`);
        try {
            const textPath = `assets/maps/${mapName}_conversations.json`;
            console.log(`[ResourceManager] 📁 会話テキストパス: ${textPath}`);
            
            // ここで実際の会話テキスト読み込み処理を行う
            // 仮の処理として、ログのみ出力
            const response = await fetch(textPath);
            const conversations = await response.json();
            this.loadedResources.set(`conversations_${mapName}`, conversations);
            console.log(`[ResourceManager] ✅ 会話テキスト「${mapName}」読み込み完了`);
            return conversations;
        } catch (error) {
            console.error(`[ResourceManager] ❌ 会話テキスト「${mapName}」読み込みエラー:`, error);
            throw error;
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
