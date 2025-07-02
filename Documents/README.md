# hirokazu-life-journey
結婚式で披露するぞ！ひろかずが夜しか眠れないようなゲームを作るぞ！

## ファイルの構造
以下のファイル構造に従ってファイルを置く
```
zosusoft-prj-hirokazu/
|   .eslintrc.js            # コード品質チェックツールの設定       
|   .gitignore              # Gitで管理しないファイルの指定
|   package-lock.json       # 依存関係の詳細バージョン固定
|   package.json            # プロジェクト情報・依存関係管理
|   tree_output.txt
|   webpack.config.js       # モジュールバンドラーの設定
|
+---.devcontainer           # Docker関連
|       devcontainer.json   # リモートコンテナの設定
|       docker-compose.yml  # 開発用のDocker Compose設定  
|       Dockerfile          # 開発用のDocker Compose構成   
|
+---Documents               # 各資料関係
|       detailds.md         # 詳細設計書
|       milestone.md        # 日程  
|       README.md           # つべこべ言わず、読んどけおらぁ
|
+---node_modules            # 開発ツール・リンター系のモジュール 
|
+---src                     # ソース
|   |   index.html          # メインHTMLファイル
|   |   index.js            # メインJavaScriptファイル
|   |
|   \---assets              # ゲーム素材
|       +---characters      # キャラクター関連
|       |   +---player      # プレイヤーキャラオブジェクト素材
|       |   |       xxx.png
|       |   +---npcs        # npcオブジェクト素材
|       |   |       xxx.png 
|       |   +---enemies     # 敵キャラオブジェクト素材
|       |    　     xxx.png 
|       |
|       +---maps            # マップ・地形関連
|       |   |       xxx.tmj # tmjの配置
|       |   +---tilesets    # 地形のタイル素材
|       |   |       xxx.png 
|       |   +---tilesets    # オブジェクト素材
|       |           xxx.png
|       |
|       +---ui              # UI素材
|       |   +---menus       # メニュー
|       |   +---buttons     # ボタン
|       |   \---icons       # アイコン
|       |
|       +---effects         # エフェクト
|       |   +---particles   # パーティクル
|       |   \---animations  # アニメーション
|       |
|       \---audio           # 音声素材
|           +---bgm         # BGM
|           +---se          # 効果音
|           \---voice       # ボイス
```


### スプライトシート形式
- **サイズ**: 96×128px (32×32pxを12分割)
- **配置**: 横3×縦4のグリッド
```
[下1][下2][下3]  ← 下向き歩行アニメ
[左1][左2][左3]  ← 左向き歩行アニメ  
[右1][右2][右3]  ← 右向き歩行アニメ
[上1][上2][上3]  ← 上向き歩行アニメ
```

### AIプロンプト例　以下みたいな感じでAIで作るときは聞けばええよ、あとはまかせた
```
32x32 pixel art character sprite sheet, 96x128 pixels total, 
3 frames of walking animation for each direction (down, left, right, up), 
arranged in 3x4 grid, transparent background, 
retro game style, [キャラクター詳細を記述]
```

### ファイル命名規則
- プレイヤー: `player_hirokazu.png`
- NPC: `npc_[名前].png`
- 敵: `enemy_[種類].png`

## Tildsの設定

### 1．新しいマップを作るときの設定

#### マップ
**種類：** 長方形マップ

**タイルの出力形式：** Base64 (zlib 圧縮)

**タイルの描画順序：** 左から右、上から下

#### マップの大きさ
**固定**
マップの大きさに関してはステージごとに各人任せます！！！
- 幅：20タイル
- 高さ：20タイル
- 640 x 640 ピクセル

#### タイルの大きさ
- 幅：32 px
- 高さ：32 px

### 2.同じオブジェクトレイヤーのオブジェクトは基本同じものをそろえる
例：オブジェクトレイヤーをenemiesにしたら、enemies類のものを、オブジェクトレイヤーをitemにしたらitem類のものを配置

### 3.名前が同じもの（敵１とか敵２）とかはenemies_1、enemies_2で名前をつける
例：オブジェクトレイヤーをenemiesと付けたら、オブジェクトにはenemies_1,enemies_2で名前をつける（規則は仮）

### ゲームエンジン・ライブラリ


### 音声ファイル仕様
- **BGM**: OGG形式、ループ対応、-12dB以下
- **SE**: WAV形式、短時間、-6dB以下
- **命名**: `bgm_[場面].ogg`, `se_[効果].wav`



# 開発サーバー起動
以下を実行
npm run deploy
    →npm run buildが実行されdistフォルダにビルドファイルを作成する
    →gh-pages -d distが実行されdist/の中身がgh-pageブランチにデプロイされる

開発環境での実行
npm run dev
    →http://127.0.0.1:8080で自ブラウザで接続


### 4 git クローン手順

#### 1corsolまたは、VScodeを開く

#### 現在の場所確認
```bash
pwd
```

#### 3. 好きな場所に移動してからクローン
```bash
# プロジェクト用フォルダに移動（好みのところで）
cd C:\Users\ユーザー名\Documents\Projects
```
#### 4.クローンを実行
```bash
# その場所でクローン実行
git clone https://github.com/zos-shoyusoft-proj-hirokazu/hirokazu-life-journey.git
```
```
Username: あなたのGitHubユーザー名
Password: Personal Access Token
```
でいけるはず