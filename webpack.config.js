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
    static: [
      {
        directory: path.resolve(__dirname, 'dist'),
        publicPath: '/'
      },
    {
      directory: path.resolve(__dirname, 'src'),
      publicPath: '/'
    }
  ],
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
    })
  ],
  mode: 'development'
};
