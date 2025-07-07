const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
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
        port: 8080, // ←ホスト側のポートに合わせる
        protocol: 'ws'
      }
    },
    port: 3000,
    host: '0.0.0.0',
    hot: true,
    liveReload: true,                     
    watchFiles: ['src/**/*'] ,
  },

  watchOptions: {
    poll: 1000,
    ignored: /node_modules/
  } ,

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'ひろかずRPG'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets' }, // ゲーム用アセットのコピー
        { from: 'public', to: '.' }           // PWA用ファイル（manifest.json, sw.jsなど）のコピー
      ]
    })
  ],
  mode: 'development'
};
