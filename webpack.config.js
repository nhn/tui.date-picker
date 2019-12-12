/**
 * Configs file for bundling
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var path = require('path');
var pkg = require('./package.json');
var webpack = require('webpack');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = function(env, argv) {
  var isProduction = argv.mode === 'production';
  var FILENAME = pkg.name + (isProduction ? '.min.js' : '.js');
  var BANNER = [
    'TOAST UI Date Picker',
    '@version ' + pkg.version,
    '@author ' + pkg.author,
    '@license ' + pkg.license
  ].join('\n');

  return {
    mode: 'development',
    entry: './src/js/index.js',
    output: {
      library: ['tui', 'DatePicker'],
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'dist'),
      publicPath: 'dist',
      filename: FILENAME
    },
    externals: {
      'tui-time-picker': {
        commonjs: 'tui-time-picker',
        commonjs2: 'tui-time-picker',
        amd: 'tui-time-picker',
        root: ['tui', 'TimePicker']
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(test|node_modules)/,
          loader: 'eslint-loader',
          enforce: 'pre',
          options: {
            failOnError: isProduction
          }
        },
        {
          test: /\.css/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        },
        {
          test: /\.png/,
          loader: 'url-loader'
        }
      ]
    },
    plugins: [
      new webpack.BannerPlugin(BANNER),
      new MiniCssExtractPlugin({filename: pkg.name + '.css'})
    ],
    devServer: {
      historyApiFallback: false,
      progress: true,
      host: '0.0.0.0',
      disableHostCheck: true
    }
  };
};
