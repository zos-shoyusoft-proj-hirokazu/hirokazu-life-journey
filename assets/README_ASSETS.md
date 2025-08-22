# アセットファイル構成

ギャルゲ風会話システムで使用するアセットファイルの構成について説明します。

## フォルダ構成

```
src/assets/
├── characters/          # キャラクター立ち絵
│   ├── heroine_happy.png
│   ├── heroine_smile.png
│   ├── heroine_normal.png
│   ├── friend_happy.png
│   ├── friend_smile.png
│   └── friend_normal.png
├── backgrounds/         # 背景画像
│   ├── school_classroom.png
│   ├── library.png
│   └── school_hallway.png
└── ui/                  # UI要素
    ├── textbox.png
    └── namebox.png
```

## 推奨画像サイズ

### キャラクター立ち絵
- **サイズ**: 400x600px
- **フォーマット**: PNG（透過対応）
- **解像度**: 72dpi
- **命名規則**: `{キャラクター名}_{表情}.png`

### 背景画像
- **サイズ**: 1920x1080px（16:9比率）
- **フォーマット**: PNG または JPG
- **解像度**: 72dpi

### UI要素
- **テキストボックス**: 800x200px
- **名前ボックス**: 250x60px
- **フォーマット**: PNG（透過対応）

## 表情の種類

各キャラクターには以下の表情を用意することを推奨します：

1. **normal** - 通常の表情
2. **happy** - 喜んでいる表情
3. **smile** - 微笑んでいる表情
4. **sad** - 悲しい表情
5. **angry** - 怒っている表情
6. **surprised** - 驚いている表情
7. **embarrassed** - 恥ずかしがっている表情

## 使用方法

```javascript
// 会話データでの使用例
{
    "speaker": "ヒロイン",
    "character": "heroine",        // キャラクター名
    "text": "こんにちは！",
    "expression": "happy"         // 表情
}
```

## 注意点

- 画像ファイル名にスペースや特殊文字を含めないでください
- 透過PNG使用時は、アンチエイリアスに注意してください
- ファイルサイズが大きくなりすぎないよう、適切な圧縮を行ってください 