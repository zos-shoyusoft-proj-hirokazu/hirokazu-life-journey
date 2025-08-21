/**
 * 音声管理クラス
 * BGM、SE、ボイスの再生を管理
 */
export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.bgm = null;
        this.bgmVolume = 0.3;
        this.seVolume = 0.7;
        this.voiceVolume = 0.8;
        this.isBgmMuted = false;
        this.isSeMuted = false;
        this.isVoiceMuted = false;
        
        // 音声ファイルのキー管理
        this.loadedSounds = new Set();
    }

    // WebAudioがロックされている場合に解除を試みる
    ensureAudioUnlocked() {
        try {
            // シーンとサウンドシステムの存在を厳密にチェック
            if (!this.scene) {
                console.warn('[AudioManager] シーンが存在しません');
                return false;
            }
            
            if (!this.scene.sound) {
                console.warn('[AudioManager] シーンのサウンドシステムが存在しません');
                return false;
            }
            
            const snd = this.scene.sound;
            
            // サウンドシステムの状態をチェック（stage系のマップ対応）
            if (typeof snd.locked === 'undefined') {
                console.log('[AudioManager] サウンドシステムのlockedプロパティが存在しません（stage系のマップ）');
                // stage系のマップではlockedプロパティが存在しない場合がある
                // 音声コンテキストが利用可能なら続行
                if (snd.context && snd.context.state === 'running') {
                    console.log('[AudioManager] 音声コンテキストは利用可能、続行');
                    return true;
                }
            }

            const ctx = snd.context;
            if (!ctx) {
                console.log('[AudioManager] 音声コンテキストが初期化されていません、強制再初期化を試行...');
                
                // 音声コンテキストの強制再初期化を試行
                try {
                    if (this.scene && this.scene.sound) {
                        // 既存の音声コンテキストを破棄
                        if (this.scene.sound.context) {
                            try {
                                this.scene.sound.context.close();
                            } catch (e) { /* ignore */ }
                        }
                        
                        // 新しい音声コンテキストを作成
                        try {
                            const newContext = new (window.AudioContext || window.webkitAudioContext)();
                            this.scene.sound.context = newContext;
                            console.log('[AudioManager] 新しい音声コンテキストを作成しました');
                            
                            // ユーザーインタラクションで音声コンテキストを開始
                            if (newContext.state === 'suspended') {
                                newContext.resume();
                                console.log('[AudioManager] 新しい音声コンテキストを開始しました');
                            }
                            
                            // 音声コンテキストが動作開始するまで待機
                            if (newContext.state !== 'running') {
                                newContext.onstatechange = () => {
                                    if (newContext.state === 'running') {
                                        console.log('[AudioManager] 新しい音声コンテキストが動作開始しました');
                                    }
                                };
                            }
                        } catch (e) {
                            console.warn('[AudioManager] 新しい音声コンテキスト作成エラー:', e);
                        }
                    }
                } catch (e) {
                    console.warn('[AudioManager] 音声コンテキスト強制再初期化エラー:', e);
                }
                
                return false;
            }
            
            console.log('[AudioManager] 音声コンテキスト状態:', ctx.state);
            
            // 音声がロックされている場合（無限ループ防止）
            if (snd.locked) {
                console.log('[AudioManager] 音声がロックされています、解除を試行');
                
                // 音声コンテキストの状態を強制的にrunningに設定
                try { 
                    if (ctx.state !== 'running') {
                        console.log('[AudioManager] 音声コンテキストを再開中...');
                        ctx.resume(); 
                    }
                    
                    // 音声コンテキストがrunning状態になるまで待機
                    if (ctx.state === 'suspended') {
                        console.log('[AudioManager] 音声コンテキストが停止中、強制再開を試行');
                        ctx.resume();
                    }
                } catch(error) {
                    console.warn('[AudioManager] Audio context resume error:', error);
                }
                
                // 無音のオシレーターで音声コンテキストを起動（1回のみ）
                try {
                    if (typeof ctx.createOscillator === 'function' && !this._oscillatorCreated) {
                        console.log('[AudioManager] 無音オシレーターで音声コンテキスト起動');
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        gain.gain.value = 0.0001;
                        osc.connect(gain).connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.05);
                        this._oscillatorCreated = true; // フラグを設定して重複実行を防止
                        
                        // オシレーター停止後にロック状態を再チェック
                        setTimeout(() => {
                            if (snd.locked) {
                                console.log('[AudioManager] オシレーター後もロック状態、ユーザー操作を待機中...');
                            } else {
                                console.log('[AudioManager] 音声ロックが解除されました');
                            }
                        }, 100);
                    }
                } catch(error) {
                    console.warn('[AudioManager] Oscillator creation error:', error);
                }
                
                // 強制的にロック解除を試行
                try {
                    console.log('[AudioManager] 強制ロック解除を試行...');
                    
                    // 現在の音声コンテキストを完全にクリーンアップ
                    if (ctx && typeof ctx.close === 'function') {
                        ctx.close();
                    }
                    
                    // シーンの音声システムをリセット
                    if (this.scene && this.scene.sound) {
                        // 既存の音声コンテキストを削除
                        this.scene.sound.context = null;
                        
                        // 少し待機してから新しい音声コンテキストを作成
                        setTimeout(() => {
                            try {
                                // 新しい音声コンテキストを作成
                                const newContext = new (window.AudioContext || window.webkitAudioContext)();
                                this.scene.sound.context = newContext;
                                
                                // 音声コンテキストを強制的にrunning状態に設定
                                if (newContext.state === 'suspended') {
                                    newContext.resume();
                                }
                                
                                console.log('[AudioManager] 新しい音声コンテキストを作成しました');
                                
                                // ロック状態を再チェック
                                setTimeout(() => {
                                    if (!this.scene.sound.locked) {
                                        console.log('[AudioManager] 強制ロック解除成功');
                                    } else {
                                        console.log('[AudioManager] 強制ロック解除失敗、ユーザー操作が必要');
                                    }
                                }, 300);
                            } catch (contextError) {
                                console.warn('[AudioManager] 新しい音声コンテキスト作成エラー:', contextError);
                            }
                        }, 100);
                    }
                } catch (forceError) {
                    console.warn('[AudioManager] 強制ロック解除エラー:', forceError);
                }
                
                // ロック状態の場合はfalseを返す（BGM再生を延期）
                return false;
            } else {
                console.log('[AudioManager] 音声はロックされていません');
            }
            
            return true;
        } catch(error) {
            console.warn('[AudioManager] Audio unlock error:', error);
            return false;
        }
    }

    isSceneUsable() {
        try { 
            // シンプルなチェック：シーンとサウンドシステムが存在するか
            return !!(this.scene && this.scene.sound);
        } catch (error) { 
            console.warn('[AudioManager] Scene usability check error:', error);
            return false; 
        }
    }

    /**
     * 音声ファイルを事前読み込み
     * @param {string} key - 音声のキー
     * @param {string} path - 音声ファイルのパス
     */
    loadSound(key, path) {
        if (!this.loadedSounds.has(key)) {
            this.scene.load.audio(key, path);
            this.loadedSounds.add(key);
        }
    }

    /**
     * BGMを再生
     * @param {string} key - BGMのキー
     * @param {number} volume - 音量（0-1）
     * @param {boolean} fadeIn - フェードイン/アウト
     */
    playBgm(key, volume = this.bgmVolume, fadeIn = true) {
        console.log(`[AudioManager] playBgm開始: ${key}, 音量: ${volume}`);
        
        if (!this.isSceneUsable()) {
            console.warn('[AudioManager] シーンが使用できません');
            return false;
        }
        
        // 音声コンテキストの詳細状態をログ出力
        try {
            const snd = this.scene && this.scene.sound;
            const ctx = snd && snd.context;
            console.log('[AudioManager] 音声システム状態:', {
                scene: !!this.scene,
                sound: !!snd,
                context: !!ctx,
                contextState: ctx ? ctx.state : 'undefined',
                locked: snd ? snd.locked : 'unknown'
            });
        } catch (e) {
            console.warn('[AudioManager] 音声システム状態確認エラー:', e);
        }
        
        // 音声コンテキストの初期化を確認
        if (!this.ensureAudioUnlocked()) {
            console.warn('[AudioManager] 音声コンテキストが初期化されていません、少し待機してから再試行...');
            
            // 音声コンテキストの再初期化を待機
            setTimeout(() => {
                if (this.ensureAudioUnlocked()) {
                    console.log('[AudioManager] 音声コンテキスト再初期化完了、BGM再生を再試行');
                    this.playBgm(key, volume, fadeIn);
                } else {
                    console.warn('[AudioManager] 音声コンテキスト再初期化失敗、BGM再生をスキップ');
                }
            }, 1000); // 待機時間を1秒に延長
            
            return false;
        }
        
        // 念のため二重再生防止：既存BGMがあれば先に停止
        if (this.bgm) {
            // 既存BGMの状態を厳密にチェック
            const isActuallyPlaying = this.bgm.isPlaying && this.bgm.key === key;
            
            if (isActuallyPlaying) {
                // すでに同じBGMが実際に再生中なら何もしない
                console.log(`[AudioManager] 同じBGM ${key} は実際に再生中、スキップ`);
                return true;
            } else {
                // 既存BGMが停止しているか、異なるBGMの場合は停止してから再生
                console.log(`[AudioManager] 既存BGM ${this.bgm.key} の状態: isPlaying=${this.bgm.isPlaying}, 停止してから ${key} を再生`);
                this.stopBgm(fadeIn, () => {
                    if (!this.isSceneUsable()) return;
                    this.startNewBgm(key, volume, fadeIn);
                });
                return true;
            }
        } else {
            if (!this.isSceneUsable()) return false;
            return this.startNewBgm(key, volume, fadeIn);
        }
    }

    /**
     * 新しいBGMを開始
     * @param {string} key - BGMのキー
     * @param {number} volume - 音量
     * @param {boolean} fade - フェードイン
     */
    startNewBgm(key, volume, fadeIn) {
        console.log(`[AudioManager] startNewBgm開始: ${key}, 音量: ${volume}, フェードイン: ${fadeIn}`);
        
        if (!this.isBgmMuted) {
            if (!this.isSceneUsable()) {
                console.warn('[AudioManager] シーンが使用できません');
                return;
            }
            
            try {
                // シーンとサウンドシステムの有効性をチェック
                if (!this.scene || !this.scene.sound) {
                    console.warn('[AudioManager] Scene or sound system is not available for BGM:', key);
                    return;
                }
                
                console.log(`[AudioManager] 音声ファイル追加: ${key}`);
                this.bgm = this.scene.sound.add(key, {
                    loop: true,
                    volume: fadeIn ? 0 : volume
                });
                
                // keyプロパティを明示的に設定（ConversationSceneで元のBGMキーを取得するため）
                this.bgm.key = key;
                
                console.log(`[AudioManager] BGM再生開始: ${key}`);
                
                // BGM再生の詳細ログ
                try {
                    const playResult = this.bgm.play();
                    console.log('[AudioManager] BGM再生結果:', playResult);
                    
                    // 再生状態を即座にチェック
                    if (this.bgm && this.bgm.isPlaying) {
                        console.log('[AudioManager] BGM再生状態確認: isPlaying = true');
                    } else {
                        console.warn('[AudioManager] BGM再生状態確認: isPlaying = false');
                        
                        // BGM再生が失敗した場合、オブジェクトをリセット
                        if (this.bgm && !this.bgm.isPlaying) {
                            console.warn('[AudioManager] BGM再生失敗、オブジェクトをリセット');
                            try {
                                this.bgm.destroy();
                            } catch (destroyError) {
                                console.warn('[AudioManager] BGMオブジェクト破棄エラー:', destroyError);
                            }
                            this.bgm = null;
                            // 再生失敗フラグを設定
                            this._bgmPlayFailed = true;
                            // 失敗を明確に報告
                            return false;
                        }
                    }
                    
                } catch (playError) {
                    console.error(`[AudioManager] BGM再生エラー: ${key}`, playError);
                    
                    // エラーが発生した場合もオブジェクトをリセット
                    if (this.bgm) {
                        try {
                            this.bgm.destroy();
                        } catch (destroyError) {
                            console.warn('[AudioManager] BGMオブジェクト破棄エラー:', destroyError);
                        }
                        this.bgm = null;
                    }
                    
                    // 再生失敗フラグを設定
                    this._bgmPlayFailed = true;
                    
                    throw playError;
                }
                
                if (fadeIn) {
                    console.log('[AudioManager] フェードイン開始');
                    this.scene.tweens.add({
                        targets: this.bgm,
                        volume: volume,
                        duration: 500
                    });
                } else {
                    console.log(`[AudioManager] 音量設定: ${volume}`);
                    this.bgm.setVolume(volume);
                }
                
                console.log(`[AudioManager] BGM再生完了: ${key}`);
                
                // 再生後の状態を定期的に監視
                if (this.scene && this.scene.time) {
                    this.scene.time.delayedCall(1000, () => {
                        if (this.bgm && this.bgm.isPlaying) {
                            console.log(`[AudioManager] BGM再生状態確認（1秒後）: ${key} は再生中`);
                        } else if (this.bgm) {
                            console.warn(`[AudioManager] BGM再生状態確認（1秒後）: ${key} は停止中`);
                        } else {
                            console.warn('[AudioManager] BGM再生状態確認（1秒後）: BGMオブジェクトが存在しません');
                        }
                    });
                } else {
                    console.warn('[AudioManager] シーンのタイムマネージャーが利用できません、状態監視をスキップ');
                }
                
                return true; // BGM再生成功
                
            } catch (error) {
                console.error(`[AudioManager] BGM ${key} の再生に失敗しました:`, error);
                return false; // BGM再生失敗
            }
        } else {
            console.log('[AudioManager] BGMがミュートされています');
            return false; // BGM再生失敗
        }
    }

    /**
     * BGMを停止
     * @param {boolean} fade - フェードアウト
     */
    stopBgm(fade = true, onComplete) {
        if (this.bgm) {
            try {
                if (!this.isSceneUsable()) { this.bgm = null; if (onComplete) onComplete(); return; }
                // シーンとサウンドシステムの有効性をチェック
                if (!this.scene || !this.scene.sound) {
                    console.warn('[AudioManager] Scene or sound system is not available for stopping BGM');
                    this.bgm = null;
                    if (onComplete) onComplete();
                    return;
                }
                
                // BGMオブジェクトの有効性をチェック（より柔軟に）
                // Phaserの音声オブジェクトは状態チェックが不安定な場合があるため
                const isValidBgm = this.bgm && (
                    this.bgm.isPlaying || 
                    this.bgm.isPaused || 
                    this.bgm.key || // キーが設定されている
                    this.bgm.context // 音声コンテキストが存在する
                );
                
                if (!isValidBgm) {
                    // 警告ではなく、デバッグレベルのログに変更
                    console.debug('[AudioManager] BGM object may not be in expected state, proceeding with cleanup');
                    this.bgm = null;
                    if (onComplete) onComplete();
                    return;
                }
                
                if (fade) {
                    this.scene.tweens.add({
                        targets: this.bgm,
                        volume: 0,
                        duration: 500,
                        onComplete: () => {
                            try {
                                if (this.bgm && this.bgm.isPlaying) {
                                    // 安全に停止：pause()してからstop()
                                    this.bgm.pause();
                                    this.bgm.stop();
                                }
                                this.bgm = null;

                            } catch (error) {
                                console.warn('[AudioManager] Error during BGM stop:', error);
                                this.bgm = null;
                            }
                            if (onComplete) onComplete();
                        }
                    });
                } else {
                    try {
                        if (this.bgm && this.bgm.isPlaying) {
                            // 安全に停止：pause()してからstop()
                            this.bgm.pause();
                            this.bgm.stop();
                        }
                        this.bgm = null;

                    } catch (error) {
                        console.warn('[AudioManager] Error during BGM stop:', error);
                        this.bgm = null;
                    }
                    if (onComplete) onComplete();
                }
            } catch (error) {
                console.warn('[AudioManager] Error in stopBgm:', error);
                this.bgm = null;
                if (onComplete) onComplete();
            }
        } else if (onComplete) {
            onComplete();
        }
    }

    /**
     * SEを再生
     * @param {string} key - SEのキー
     * @param {number} volume - 音量（0-1）
     */
    playSe(key, volume = this.seVolume) {
        if (!this.isSceneUsable()) return;
        this.ensureAudioUnlocked();
        if (this.isSeMuted) return;
        
        // シーンとサウンドシステムの有効性をチェック
        if (!this.scene || !this.scene.sound) {
            console.warn('[AudioManager] Scene or sound system is not available for SE:', key);
            return;
        }
        
        try {
            const se = this.scene.sound.add(key, {
                volume: volume
            });
            se.play();
            
            // 再生終了後にメモリから削除
            se.once('complete', () => {
                se.destroy();
            });
        } catch (error) {
            console.error(`SE ${key} の再生に失敗しました:`, error);
        }
    }

    /**
     * ボイスを再生
     * @param {string} key - ボイスのキー
     * @param {number} volume - 音量（0-1）
     */
    playVoice(key, volume = this.voiceVolume) {
        if (!this.isSceneUsable()) return;
        this.ensureAudioUnlocked();
        if (this.isVoiceMuted) return;
        
        // シーンとサウンドシステムの有効性をチェック
        if (!this.scene || !this.scene.sound) {
            console.warn('[AudioManager] Scene or sound system is not available for Voice:', key);
            return;
        }
        
        try {
            const voice = this.scene.sound.add(key, {
                volume: volume
            });
            voice.play();
            
            // 再生終了後にメモリから削除
            voice.once('complete', () => {
                voice.destroy();
            });
        } catch (error) {
            console.error(`Voice ${key} の再生に失敗しました:`, error);
        }
    }

    /**
     * BGMの音量を設定
     * @param {number} volume - 音量（0-1）
     */
    setBgmVolume(volume) {
        this.bgmVolume = volume;
        if (this.bgm) {
            this.bgm.setVolume(volume);
        }
    }

    /**
     * SEの音量を設定
     * @param {number} volume - 音量（0-1）
     */
    setSeVolume(volume) {
        this.seVolume = volume;
    }

    /**
     * ボイスの音量を設定
     * @param {number} volume - 音量（0-1）
     */
    setVoiceVolume(volume) {
        this.voiceVolume = volume;
    }

    /**
     * BGMをミュート/ミュート解除
     * @param {boolean} mute - ミュートするかどうか
     */
    muteBgm(mute) {
        this.isBgmMuted = mute;
        if (this.bgm) {
            this.bgm.setMute(mute);
        }
    }

    /**
     * SEをミュート/ミュート解除
     * @param {boolean} mute - ミュートするかどうか
     */
    muteSe(mute) {
        this.isSeMuted = mute;
    }

    /**
     * ボイスをミュート/ミュート解除
     * @param {boolean} mute - ミュートするかどうか
     */
    muteVoice(mute) {
        this.isVoiceMuted = mute;
    }

    /**
     * 全ての音声をミュート/ミュート解除
     * @param {boolean} mute - ミュートするかどうか
     */
    muteAll(mute) {
        this.muteBgm(mute);
        this.muteSe(mute);
        this.muteVoice(mute);
    }

    /**
     * 全ての音声を停止
     */
    stopAll() {
        try { this.stopBgm(false); } catch (e) { /* ignore */ }
        try {
            if (this.scene && this.scene.sound) {
                try { this.scene.sound.stopAll(); } catch (e) { /* ignore */ }
                try {
                    const playing = this.scene.sound.getAllPlaying ? this.scene.sound.getAllPlaying() : [];
                    (playing || []).forEach(sound => {
                        try { if (sound && sound.stop) sound.stop(); } catch (err) { /* ignore */ }
                        try { if (sound && sound.destroy) sound.destroy(); } catch (err) { /* ignore */ }
                    });
                } catch (err) { /* ignore */ }
            }
        } catch (err) { /* ignore */ }
    }

    /**
     * リソースを解放
     */
    destroy() {
        try { this.stopAll(); } catch (e) { /* ignore */ }

        // BGMの完全なクリーンアップ（存在チェック付き）
        try {
            if (this.bgm) {
                try { if (this.bgm.stop) this.bgm.stop(); } catch (err) { /* ignore */ }
                try { if (this.bgm.destroy) this.bgm.destroy(); } catch (err) { /* ignore */ }
            }
        } finally {
            this.bgm = null;
        }

        // 音声キャッシュから読み込んだ音声を削除（シーンが有効な時のみ）
        try {
            const audioCache = this.scene && this.scene.cache && this.scene.cache.audio ? this.scene.cache.audio : null;
            if (audioCache) {
                this.loadedSounds.forEach(key => {
                    try {
                        if (audioCache.exists(key)) {
                            audioCache.remove(key);
                        }
                    } catch (_) { /* ignore */ }
                });
            }
        } catch (err) { /* ignore */ }

        this.loadedSounds.clear();
        // シーンへの参照を削除
        this.scene = null;
    }

    /**
     * デフォルトBGMキーを取得
     * @returns {string} デフォルトBGMキー
     */
    async getDefaultBgmKey() {
        try {
            // 1. まず、現在再生中のBGMキーを確認
            if (this.bgm && this.bgm.key) {
                return this.bgm.key;
            }
            
            // 2. ステージ固有の設定から取得（AreaConfigから動的に）
            if (this.scene && this.scene.scene && this.scene.scene.key) {
                const sceneKey = this.scene.scene.key;
                
                // AreaConfigからステージ設定を取得
                try {
                    const { AreaConfig } = await import('../config/AreaConfig.js');
                    
                    // ステージシーンの場合
                    if (sceneKey.includes('Stage') && sceneKey !== 'MapSelectionStage') {
                        const stageNumber = sceneKey.replace('Stage', '').replace('Scene', '');
                        const stageKey = `stage${stageNumber}`;
                        
                        if (AreaConfig.stages && AreaConfig.stages[stageKey] && AreaConfig.stages[stageKey].bgm) {
                            const bgmPath = AreaConfig.stages[stageKey].bgm.map;
                            if (bgmPath) {
                                // パスからBGMキーを生成
                                const bgmKey = this.pathToBgmKey(bgmPath);
                                if (bgmKey) {
                                    return bgmKey;
                                }
                            }
                        }
                    }
                    
                    // MapSelectionStageの場合
                    if (sceneKey === 'MapSelectionStage' && this.scene.mapConfig) {
                        const bgmDict = this.scene.mapConfig.bgm;
                        if (bgmDict) {
                            if (Object.prototype.hasOwnProperty.call(bgmDict, 'map')) {
                                return 'bgm_map';
                            } else {
                                const first = Object.keys(bgmDict)[0];
                                if (first) return `bgm_${first}`;
                            }
                        }
                    }
                    
                } catch (importError) {
                    console.warn('[AudioManager] AreaConfig import error:', importError);
                }
            }
            
            // 3. mapConfigから取得（MapSelectionStage用）
            if (this.scene && this.scene.mapConfig && typeof this.scene.mapConfig.bgm === 'object') {
                const bgmDict = this.scene.mapConfig.bgm;
                if (Object.prototype.hasOwnProperty.call(bgmDict, 'map')) {
                    return 'bgm_map';
                } else {
                    const first = Object.keys(bgmDict)[0];
                    if (first) return `bgm_${first}`;
                }
            }
            
            // 4. フォールバック: 汎用的なBGMキー
            return 'bgm_default';
            
        } catch (error) {
            console.warn('[AudioManager] getDefaultBgmKey エラー:', error);
            return 'bgm_default';
        }
    }
    
    /**
     * パスからBGMキーを生成
     * @param {string} path - BGMファイルのパス
     * @returns {string} BGMキー
     */
    pathToBgmKey(path) {
        try {
            if (!path) return null;
            
            // パスからファイル名を抽出
            const fileName = path.split('/').pop();
            if (!fileName) return null;
            
            // 拡張子を除去
            const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
            
            // BGMキーを生成
            return `bgm_${nameWithoutExt}`;
            
        } catch (error) {
            console.warn('[AudioManager] pathToBgmKey エラー:', error);
            return null;
        }
    }

    /**
     * 会話用の音声ファイルを読み込み
     * @param {string} eventId - イベントID
     * @returns {Promise<boolean>} 読み込み成功フラグ
     */
    async loadConversationAudio(eventId) {
        try {
            console.log(`[AudioManager] loadConversationAudio開始: ${eventId}`);
            
            // EventConfigから必要な音楽ファイルを取得
            const { getEventConfig } = await import('../config/EventConfig.js');
            const eventConfig = getEventConfig(eventId);
            
            if (!eventConfig || !eventConfig.required) {
                console.warn(`[AudioManager] Event config not found for: ${eventId}`);
                return false;
            }
            
            const { bgm, se } = eventConfig.required;
            console.log(`[AudioManager] 必要なリソース: BGM=${bgm}, SE=${se}`);
            
            // BGMファイルの読み込み（キューに追加のみ）
            if (bgm && bgm.length > 0) {
                for (const bgmKey of bgm) {
                    const audioKey = `bgm_${bgmKey}`;
                    if (!this.loadedSounds.has(audioKey)) {
                        // パスを構築（AreaConfigから取得）
                        const bgmPath = this.getBgmPathFromAreaConfig(bgmKey);
                        if (bgmPath) {
                            this.scene.load.audio(audioKey, bgmPath);
                            console.log(`[AudioManager] BGM読み込みキュー追加: ${audioKey} -> ${bgmPath}`);
                        } else {
                            // フォールバック: 標準的なパスを試行
                            const fallbackPath = `assets/audio/bgm/${bgmKey}.mp3`;
                            this.scene.load.audio(audioKey, fallbackPath);
                            console.log(`[AudioManager] BGM読み込みキュー追加（フォールバック）: ${audioKey} -> ${fallbackPath}`);
                        }
                    } else {
                        console.log(`[AudioManager] BGM既に読み込み済み: ${audioKey}`);
                    }
                }
            }
            
            // SEファイルの読み込み（キューに追加のみ）
            if (se && se.length > 0) {
                for (const seKey of se) {
                    const audioKey = `se_${seKey}`;
                    if (!this.loadedSounds.has(audioKey)) {
                        const sePath = `assets/audio/se/${seKey}.mp3`;
                        this.scene.load.audio(audioKey, sePath);
                        console.log(`[AudioManager] SE読み込みキュー追加: ${audioKey} -> ${sePath}`);
                    } else {
                        console.log(`[AudioManager] SE既に読み込み済み: ${audioKey}`);
                    }
                }
            }
            
            console.log(`[AudioManager] loadConversationAudio完了: ${eventId}`);
            return true;
            
        } catch (error) {
            console.error('[AudioManager] loadConversationAudio error:', error);
            return false;
        }
    }

    /**
     * AreaConfigからBGMパスを取得するヘルパーメソッド
     * @param {string} bgmKey - BGMキー
     * @returns {string} BGMファイルのパス
     */
    getBgmPathFromAreaConfig(bgmKey) {
        // 標準的なパスを使用（「借りる」設計なし）
        const standardPath = `assets/audio/bgm/${bgmKey}.mp3`;
        console.log(`[AudioManager] 標準パス使用: ${bgmKey} -> ${standardPath}`);
        return standardPath;
    }

    /**
     * 会話用BGMを再生
     * @param {string} bgmKey - BGMキー（Fantasyなど、bgm_プレフィックスなし）
     * @param {number} volume - 音量（0-1）
     * @param {boolean} fadeIn - フェードイン
     * @returns {boolean} 再生成功フラグ
     */
    async playConversationBgm(bgmKey, volume = this.bgmVolume, fadeIn = true) {
        try {
            console.log(`[AudioManager] playConversationBgm開始: ${bgmKey}`);
            
            // 既存のBGMを停止
            this.stopBgm(false);
            
            // bgm_プレフィックス付きのキーを作成
            const audioKey = `bgm_${bgmKey}`;
            console.log(`[AudioManager] 音声キー: ${audioKey}`);
            console.log('[AudioManager] loadedSounds:', Array.from(this.loadedSounds));
            
            // 会話用BGMを再生
            if (this.loadedSounds.has(audioKey)) {
                console.log(`[AudioManager] 音声ファイルが見つかりました: ${audioKey}`);
                
                try {
                    // HTMLAudioを直接使用（Phaserの問題を回避）
                    const bgmPath = `assets/audio/bgm/${bgmKey}.mp3`;
                    console.log(`[AudioManager] HTMLAudioでBGM再生開始: ${bgmPath}`);
                    
                    // HTMLAudio要素を作成
                    this.bgm = new Audio(bgmPath);
                    this.bgm.loop = true;
                    this.bgm.volume = fadeIn ? 0 : volume;
                    
                    // 再生開始
                    const playPromise = this.bgm.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            console.log(`[AudioManager] HTMLAudio BGM再生成功: ${audioKey}`);
                            
                            // フェードイン処理
                            if (fadeIn) {
                                let currentVolume = 0;
                                const targetVolume = volume;
                                const fadeInterval = setInterval(() => {
                                    currentVolume += 0.02;
                                    if (currentVolume >= targetVolume) {
                                        currentVolume = targetVolume;
                                        clearInterval(fadeInterval);
                                    }
                                    this.bgm.volume = currentVolume;
                                }, 25);
                            }
                        }).catch(error => {
                            console.error(`[AudioManager] HTMLAudio BGM再生エラー: ${audioKey}`, error);
                        });
                    }
                    
                    // keyプロパティを設定（Phaserとの互換性のため）
                    this.bgm.key = audioKey;
                    
                    console.log(`[AudioManager] HTMLAudio BGM再生開始: ${audioKey}`);
                    return true;
                    
                } catch (playError) {
                    console.error(`[AudioManager] HTMLAudio BGM再生エラー詳細: ${audioKey}`, playError);
                    console.error('[AudioManager] エラータイプ:', typeof playError);
                    console.error('[AudioManager] エラーメッセージ:', playError.message);
                    console.error('[AudioManager] エラースタック:', playError.stack);
                    return false;
                }
            } else {
                console.warn(`[AudioManager] BGMファイルが読み込まれていません: ${audioKey}`);
                console.warn('[AudioManager] 利用可能な音声ファイル:', Array.from(this.loadedSounds));
                return false;
            }
            
        } catch (error) {
            console.error(`[AudioManager] playConversationBgm error: ${bgmKey}`, error);
            console.error('[AudioManager] エラースタック:', error.stack);
            return false;
        }
    }
} 