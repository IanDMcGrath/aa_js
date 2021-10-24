const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, '../src/script.js'),
  output:
  {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, '../dist_repo/dist')
  },
  devtool: 'source-map',
  plugins:
  [
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, '../static') }
      ]
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html'),
      minify: true
    }),
    new MiniCSSExtractPlugin()
  ],
  module:
  {
    rules:
    [
      // HTML
      {
        test: /\.(html)$/,
        loader: 'html-loader'
        // options: {
        //   // THIS will resolve relative URLs to reference from the app/ directory
        //   root: path.resolve(__dirname, 'src')
        // }
      },

      // JS
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use:
        [
          'babel-loader'
        ]
      },

      // CSS
      {
        test: /\.css$/,
        use:
        [
          MiniCSSExtractPlugin.loader,
          'css-loader'
        ]
      },

      // Images
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use:
        [
          {
            loader: 'file-loader',
            options:
            {
              outputPath: 'assets/images/'
            }
          }
        ]
      },

      // Fonts
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        use:
        [
          {
            loader: 'file-loader',
            options:
            {
              outputPath: 'assets/fonts/'
            }
          }
        ]
      }
    ]
  }
};
