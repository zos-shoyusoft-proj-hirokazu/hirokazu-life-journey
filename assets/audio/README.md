# 音声ファイル配置ガイド

## フォルダ構造
```
src/assets/audio/
├── bgm/        # BGMファイル (OGG形式)
├── se/         # 効果音ファイル (WAV形式)
└── voice/      # ボイスファイル (WAV形式)
```

## ファイル仕様

### BGM（背景音楽）
- **形式**: OGG形式
- **音量**: -12dB以下を推奨
- **ループ**: 対応
- **命名規則**: `bgm_[場面名].ogg`

**例**:
- `bgm_menu.ogg` - メニュー画面BGM
- `bgm_game.ogg` - ゲーム中BGM
- `bgm_battle.ogg` - バトルシーンBGM

### SE（効果音）
- **形式**: WAV形式
- **音量**: -6dB以下を推奨
- **長さ**: 短時間（1-3秒程度）
- **命名規則**: `se_[効果名].wav`

**例**:
- `se_button.wav` - ボタンクリック音
- `se_click.wav` - カーソル移動音
- `se_success.wav` - 成功音
- `se_error.wav` - エラー音

### Voice（ボイス）
- **形式**: WAV形式
- **音量**: -6dB以下を推奨
- **長さ**: セリフの長さに応じて
- **命名規則**: `voice_[内容].wav`

**例**:
- `voice_greeting.wav` - 挨拶ボイス
- `voice_thanks.wav` - お礼ボイス
- `voice_goodbye.wav` - 別れの挨拶

## 使用方法

### 1. 音声管理クラスのインポート
```javascript
import { AudioManager } from '../managers/AudioManager.js';
```

### 2. 音声管理クラスの初期化
```javascript
// preload() 内で初期化
this.audioManager = new AudioManager(this);
```

### 3. 音声ファイルの読み込み
```javascript
// preload() 内で音声ファイルを読み込み
this.audioManager.loadSound('bgm_menu', 'assets/audio/bgm/bgm_menu.ogg');
this.audioManager.loadSound('se_button', 'assets/audio/se/se_button.wav');
this.audioManager.loadSound('voice_greeting', 'assets/audio/voice/voice_greeting.wav');
```

### 4. 音声の再生
```javascript
// BGM再生（ループ、フェードイン/アウト対応）
this.audioManager.playBgm('bgm_menu', 0.3);

// SE再生
this.audioManager.playSe('se_button');

// ボイス再生
this.audioManager.playVoice('voice_greeting');
```

### 5. 音声の制御
```javascript
// BGM停止
this.audioManager.stopBgm();

// 音量調整
this.audioManager.setBgmVolume(0.5);
this.audioManager.setSeVolume(0.7);

// ミュート
this.audioManager.muteBgm(true);
this.audioManager.muteAll(true);

// シーン終了時のクリーンアップ
this.audioManager.destroy();
```

## 実装例

詳細な実装例は `src/scenes/demoSceneWithAudio.js` を参照してください。

## 注意事項

1. **ファイルサイズ**: 音声ファイルは適度なサイズに抑えてください（BGM: 5MB以下、SE: 500KB以下推奨）
2. **ブラウザ対応**: 一部のブラウザでは自動再生が制限される場合があります
3. **音量調整**: 音声ファイルは適切な音量に調整してから配置してください
4. **メモリ管理**: 不要になった音声は適切に解放してください

## 音声ファイルの作成ツール

### 無料ツール
- **Audacity** - 音声編集・形式変換
- **LAME** - MP3からOGG変換
- **FFmpeg** - 各種形式変換

### 音声素材サイト
- **フリー音楽素材 H/MIX GALLERY**
- **魔王魂**
- **効果音ラボ**

## トラブルシューティング

### 音声が再生されない場合
1. ファイルパスが正しいか確認
2. ファイル形式が正しいか確認
3. ブラウザの開発者ツールでエラーを確認
4. 音声ファイルが破損していないか確認

### 音量が小さい/大きい場合
1. 音声ファイル自体の音量を調整
2. コード内の音量設定を調整
3. デバイスの音量設定を確認 