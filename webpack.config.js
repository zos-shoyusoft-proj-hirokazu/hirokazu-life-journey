const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: './' // GitHub Pages対応：相対パスを使用
  },
  

  

  
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  
  // パフォーマンス警告を抑制
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  
  devServer: {
    static: [
      {
        directory: path.resolve(__dirname, 'dist'),
        publicPath: '/'
      },
    ],
    client: {
      webSocketURL: {
        hostname: 'localhost',
        port: 8080,
        protocol: 'ws'
      }
    },
    port: 3000,
    host: '0.0.0.0',
    hot: true,  // HMR
    liveReload:  true,  // ライブリロード               
    watchFiles: ['src/**/*'] ,
  },

  watchOptions: {
    poll: 1000,
    ignored: /node_modules/
  } ,

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'ひろかずRPG',
      inject: true, // すべてのアセットを自動注入
      chunks: 'all' // すべてのチャンクを含める
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets' }, // ゲーム用アセットのコピー
        { from: 'src/css', to: 'css' },       // CSSファイルのコピー
        { from: 'public', to: '.' }           // PWA用ファイル（manifest.json, sw.jsなど）のコピー
      ]
    })
  ],
  mode: 'development'
};
