/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
    // mode: "development",
    mode: "production",
    entry: path.resolve(__dirname, "src/inner-index.tsx"),
    output: {
        path: path.resolve(__dirname, "../docs"),
        filename: "inner-index.js",
    },
    resolve: {
        modules: [path.resolve(__dirname, "node_modules")],
        extensions: [".ts", ".tsx", ".js"],
        fallback: {
            buffer: require.resolve("buffer/"),
            // buffer: false,
            "path": false,
            "fs":false,
            "crypto": false,
            
        },
    },
    module: {
        rules: [
            {
                test: [/\.ts$/, /\.tsx$/],
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
                            plugins: ["@babel/plugin-transform-runtime"],
                        },
                    },
                    
                ],
            },
            { test: /\.wasm$/, type: "asset/inline" },

            // {
            //     test: /\.html$/,
            //     loader: "html-loader",
            // },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "public/inner-index.html"),
            filename: "./inner-index.html",
        }),
        new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
        }),
        // new webpack.ProvidePlugin({
        //     Buffer: ["buffer", "Buffer"],
        //     process: "process/browser",
        // }),
    ],
};
