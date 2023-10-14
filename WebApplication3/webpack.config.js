const Webpack = require("webpack");
const Path = require("path");

const CompressionPlugin = require("compression-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
//const FileManagerPlugin = require("filemanager-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const opts = {
    isDevelopmentBuild: process.env.NODE_ENV !== "production",
    isProductionBuild: process.env.NODE_ENV === 'production'
};

console.log('prod?: ', opts.isProductionBuild);

module.exports = {
    entry: {
        site: "./src/js/site.js"
    },
    mode: opts.isProductionBuild ? "production" : "development",
    devtool: opts.isProductionBuild ? "source-map" : "inline-source-map",
    output: {
        path: Path.resolve(__dirname, 'wwwroot'),
        pathinfo: opts.isDevelopmentBuild,
        filename: "js/[name].js",
        chunkFilename: 'js/[name].js'
    },
    optimization: {
        minimize: opts.isProductionBuild,
        minimizer: opts.isProductionBuild ? [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    ecma: 5
                }
            }),
            new CssMinimizerPlugin({})
        ] : [],
        runtimeChunk: opts.isDevelopmentBuild
    },
    plugins: [
        // Extract css files to separate bundle
        new MiniCssExtractPlugin({
            filename: "css/site.css",
            chunkFilename: "css/site.css"
        }),
        // Copy fonts and images to dist
        new CopyWebpackPlugin({
            patterns: [
                { from: "src/fonts", to: "fonts" },
                { from: "src/img", to: "img" }
            ]
        }),
        // Compress resources
        new CompressionPlugin({
            filename: "[path][base].gz",
            algorithm: "gzip",
            test: /\.js$|\.css$/i,
            threshold: 10240,
            minRatio: 0.8
        })
        // Copy dist folder to static
        /*...(process.env.NODE_ENV === "production") ? [
            new FileManagerPlugin({
                events: {
                    onEnd: {
                        copy: [
                            { source: "./dist/", destination: "./static" }
                        ]
                    }
                },
            })
        ] : [],*/
    ],
    module: {
        rules: [
            // Css-loader & sass-loader
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader"
                ]
            },
            // Load fonts
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/i,
                type: "asset/resource",
                generator: {
                    filename: "fonts/[name][ext]"
                }
            },
            // Load images
            {
                test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
                type: "asset/resource",
                generator: {
                    filename: "img/[name][ext]"
                }
            },
        ]
    },
};