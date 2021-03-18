/**
 * Configs file for bundling
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var path = require('path');
var pkg = require('./package.json');
var webpack = require('webpack');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var TerserPlugin = require('terser-webpack-plugin');
var OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

function getOptimization(isMinified) {
  if (isMinified) {
    return {
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: false,
          extractComments: false
        }),
        new OptimizeCSSAssetsPlugin()
      ]
    };
  }

  return {
    minimize: false
  };
}

module.exports = function(env, argv) {
  var isProduction = argv.mode === 'production';
  var isMinified = !!argv.minify;
  var FILENAME = pkg.name + (isMinified ? '.min' : '');
  var BANNER = [
    'TOAST UI Date Picker',
    '@version ' + pkg.version,
    '@author ' + pkg.author,
    '@license ' + pkg.license
  ].join('\n');

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/js/index.js',
    output: {
      library: ['tui', 'DatePicker'],
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'dist'),
      publicPath: 'dist',
      filename: FILENAME + '.js'
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
          use: [MiniCssExtractPlugin.loader, 'css-loader']
        },
        {
          test: /\.png/,
          loader: 'url-loader'
        }
      ]
    },
    plugins: [
      new webpack.BannerPlugin(BANNER),
      new MiniCssExtractPlugin({ filename: FILENAME + '.css' })
    ],
    optimization: getOptimization(isMinified),
    devServer: {
      historyApiFallback: false,
      progress: true,
      host: '0.0.0.0',
      disableHostCheck: true
    }
  };
};
