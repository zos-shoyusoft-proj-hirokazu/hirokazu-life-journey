# 詳細設計

## 1. プロジェクト構成

```markdown
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
|   |   index.js                    # メインJavaScriptファイル
|   |
|   \---assets                      # ゲーム素材
|       +---characters              # キャラクター関連
|       |   +---player              # プレイヤー
|       |   +---npcs                # NPC
|       |   +---enemies             # 敵キャラ
|       |
|       +---maps                    # マップ・地形関連
|       |   +---tilesets            # タイルセット
|       |   |   +---objects         # オブジェクト
|       |   |          xxxx.png     #素材
|       |   +---previews    # プレビュー画像
|       |   |       xxx.png
|       |   \---test_maps   # テストマップ
|       |           xxx.tmj
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

## 2. API設計

1. 利用者管理

|HTTP Method|Endpoint|説明|
|----|----|----|
|POST| /users/ |利用者登録|
|GET|/users/|利用者一覧情報取得|
|GET|/users/<user_id>|IDから利用者情報取得|
|PUT|/users/<user_id>|利用者情報編集|
|DELETE|/users/<user_id>|利用者情報削除|

2. ログイン機能

|HTTP Method|Endpoint|説明|
|----|----|----|
|POST|/auth/login|ログイン画面|
|POST|/auth/logout|ログアウト|

3. 動画管理機能

|HTTP Method|Endpoint|説明|
|----|----|----|
|POST|/video|動画アップロード|
|GET|/video/list/:video_id|動画再生|
|GET|/video/list/:year|動画一覧を取得(年)|
|DELETE|/video/:video_id|動画削除|

4. コメント管理

|HTTP Method|Endpoint|説明|
|----|----|----|
|POST|/comment/<video_id>|コメント投稿|
|GET|/comment/<video_id>/|コメント取得|
|POST|/comment/<video_id>/<comment_id>/|コメント返信|