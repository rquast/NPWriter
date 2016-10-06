const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
var autoprefixer = require('autoprefixer');

module.exports = {
    entry: [
        'webpack/hot/dev-server',
        'webpack-dev-server/client?http://localhost:3000',
        './plugins/index.js'
    ],
    output: {
        filename: "plugins.js",
        path: "./plugins/dist"
    },
    devServer: {
        historyApiFallback: true,
        inline: true, // reload on the fly (auto refresh)
        compress: false,
        hot: true,
        publicPath: "/plugins/dist/",
        port: 3000 // which port to run the server on
    },
    postcss: [
        autoprefixer({
            browsers: ['last 2 versions']
        })
    ],
    module: {
        loaders: [
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style', 'css!postcss!sass')
            },
            {
                test: /\.(js|jsx|es6)$/,
                exclude: /(node_modules)/,
                loaders: [
                    'babel?presets[]=es2015-node6,presets[]=stage-3'
                ]
            }
        ]
    },
    cssLoader: {
        // True enables local scoped css
        modules: false,
        // Which loaders should be applied to @imported resources (How many after the css loader)
        importLoaders: 1,
        sourceMap: true
    },
    plugins: [
        new ExtractTextPlugin("style.css"),
        new webpack.ProvidePlugin({
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
        })
    ]
};
