/**
 * Configs file for bundling
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var pkg = require('./package.json');
var webpack = require('webpack');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var SafeUmdPlugin = require('safe-umd-webpack-plugin');

var isProduction = process.argv.indexOf('--production') >= 0;

var FILENAME = pkg.name + (isProduction ? '.min.js' : '.js');
var BANNER = [
    FILENAME,
    '@version ' + pkg.version,
    '@author ' + pkg.author,
    '@license ' + pkg.license
].join('\n');

var config = {
    eslint: {
        failOnError: isProduction
    },
    entry: './src/js/index.js',
    output: {
        library: ['tui', 'DatePicker'],
        libraryTarget: 'umd',
        path: 'dist',
        publicPath: 'dist',
        filename: FILENAME
    },
    externals: {
        'tui-code-snippet': {
            'commonjs': 'tui-code-snippet',
            'commonjs2': 'tui-code-snippet',
            'amd': 'tui-code-snippet',
            'root': ['tui', 'util']
        },
        'tui-dom': {
            'commonjs': 'tui-dom',
            'commonjs2': 'tui-dom',
            'amd': 'tui-dom',
            'root': ['tui', 'dom']
        },
        'tui-time-picker': {
            'commonjs': 'tui-time-picker',
            'commonjs2': 'tui-time-picker',
            'amd': 'tui-time-picker',
            'root': ['tui', 'TimePicker']
        }
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /(test|node_modules)/,
                loader: 'eslint-loader'
            },
            {
                test: /\.hbs$/,
                exclude: /(node_modules)/,
                loader: 'handlebars-loader'
            },
            {
                test: /\.css/,
                loader: ExtractTextPlugin.extract('style-loader', ['css-loader'])
            },
            {
                test: /\.png/,
                loader: 'url-loader'
            }
        ]
    },
    plugins: [
        new SafeUmdPlugin(),
        new webpack.BannerPlugin(BANNER),
        new ExtractTextPlugin(pkg.name + '.css')
    ],
    devServer: {
        historyApiFallback: false,
        progress: true,
        host: '0.0.0.0',
        disableHostCheck: true
    }
};

if (isProduction) {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }));
}

module.exports = config;
