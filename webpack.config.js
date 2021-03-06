const path = require('path');

const webpack = require('webpack');

//  Plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CopyPlugin = require('copy-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// Load environment variables from .env file
require('dotenv').config();

module.exports = env => {

    const isDevelopment = env.NODE_ENV === 'development';

    return {

        mode: env.NODE_ENV,

        entry: {
            'main': getSourcePath('js/main.js'),
            'docs': getSourcePath('js/docs.js')
        },

        output: {
            path: getPublicPath(),
            filename: 'js/[name].js'
        },

        module: {

            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                cacheDirectory: true
                            }
                        },
                        {
                            loader: 'eslint-loader'
                        }
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {}
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                url: false
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {}
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    use: 'css-loader'
                },
                {
                    test: /\.font\.js/,
                    use: [
                        'css-loader',
                        'webfonts-loader'
                    ]
                },
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                }
            ]
        },

        plugins: [

            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                Vue: [ 'vue/dist/vue.esm.js', 'default' ]
            }),

            new MiniCssExtractPlugin({
                filename: isDevelopment ? 'css/[name].css' : 'css/[name].min.css'
            }),

            new CopyPlugin([
                {
                    from: getSourcePath('img'),
                    to: getPublicPath('img')
                },
                {
                    from: getSourcePath('docs'),
                    to: getPublicPath('docs')
                },
                // {
                //     from: getSourcePath('fonts'),
                //     to: getPublicPath('fonts')
                // }
            ]),

            new ImageminPlugin({
                test: /\.(jpe?g|png|gif|svg)$/i
            })
        ],

        optimization: {

            minimizer: [

                new TerserJSPlugin({
                    terserOptions: {
                        output: {
                            comments: false
                        }
                    }
                }),

                new OptimizeCSSAssetsPlugin()
            ]
        },

        stats: {
            children: false
        },
        // Enable weback Hot Module Replacement
        devServer: {
            // add any additional files in th js/ folder
            contentBase: [getSourcePath('js/main.js')],
            // variables from .env file
            host: process.env.DEV_SERVER_HOST,
            port: process.env.DEV_SERVER_PORT,
            https: true,
            // Fix invalid host header issue
            allowedHosts: ['.statik.be'],
            // Fix font loading issue
            headers:{
                'Access-Control-Allow-Origin': '*'
            }
        },
    };
};

function getSourcePath() {

    return path.resolve(process.env.npm_package_config_path_src, ...arguments);
}

function getPublicPath() {

    return path.resolve(process.env.npm_package_config_path_public, ...arguments);
}
