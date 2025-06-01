const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 3000,
    host: '0.0.0.0',
    hot: false,
    liveReload: false,                     
    client: false  
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'ひろかずRPG'
    })
  ],
  mode: 'development'
};