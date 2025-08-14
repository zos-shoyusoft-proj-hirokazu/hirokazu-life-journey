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
            const snd = this.scene && this.scene.sound;
            const ctx = snd && snd.context;
            if (snd && snd.locked) {
                try { if (ctx && ctx.state !== 'running') ctx.resume(); } catch(_) {}
                try {
                    if (ctx && typeof ctx.createOscillator === 'function') {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        gain.gain.value = 0.0001;
                        osc.connect(gain).connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.05);
                    }
                } catch(_) {}
            }
        } catch(_) {}
    }

    isSceneUsable() {
        try { return !!(this.scene && this.scene.sys && this.scene.sys.isActive && this.scene.sys.isActive()); } catch (_) { return false; }
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
        if (!this.isSceneUsable()) return;
        this.ensureAudioUnlocked();
        // 念のため二重再生防止：既存BGMがあれば先に停止
        if (this.bgm) {
            if (this.bgm.key === key) {
                // すでに同じBGMなら何もしない
                return;
            }
            // stopBgmのonCompleteで新しいBGMを再生
            this.stopBgm(fadeIn, () => {
                if (!this.isSceneUsable()) return;
                this.startNewBgm(key, volume, fadeIn);
            });
        } else {
            if (!this.isSceneUsable()) return;
            this.startNewBgm(key, volume, fadeIn);
        }
    }

    /**
     * 新しいBGMを開始
     * @param {string} key - BGMのキー
     * @param {number} volume - 音量
     * @param {boolean} fade - フェードイン
     */
    startNewBgm(key, volume, fadeIn) {
        if (!this.isBgmMuted) {
            if (!this.isSceneUsable()) return;
            try {
                // シーンとサウンドシステムの有効性をチェック
                if (!this.scene || !this.scene.sound) {
                    console.warn('[AudioManager] Scene or sound system is not available for BGM:', key);
                    return;
                }
                
                this.bgm = this.scene.sound.add(key, {
                    loop: true,
                    volume: fadeIn ? 0 : volume
                });
                this.bgm.play();
                if (fadeIn) {
                    this.scene.tweens.add({
                        targets: this.bgm,
                        volume: volume,
                        duration: 500
                    });
                } else {
                    this.bgm.setVolume(volume);
                }
            } catch (error) {
                console.error(`[AudioManager] BGM ${key} の再生に失敗しました:`, error);
            }
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
                
                // BGMオブジェクトの有効性をチェック
                if (!this.bgm.isPlaying && !this.bgm.isPaused) {
                    console.warn('[AudioManager] BGM is not playing or paused');
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
} 