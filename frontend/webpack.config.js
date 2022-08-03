/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
    // mode: "development",
    mode: "production",
    entry: path.resolve(__dirname, "src/index.tsx"),
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "index.js",
        assetModuleFilename: "assets/tflite/[name][ext]",
    },
    resolve: {
        modules: [path.resolve(__dirname, "node_modules")],
        extensions: [".ts", ".tsx", ".js"],
        fallback: {
            buffer: require.resolve("buffer/"),
            // buffer: false,
        },
    },
    module: {
        rules: [
            { test: /resources\/.*\.json/, type: "asset/source" },
            { test: /resources\/.*\.mp3/, type: "asset/inline" },
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
            { test: /\.bin$/, type: "asset/resource" },
            { test: /\.wasm$/, type: "asset/resource" },
            {
                test: /\.css$/,
                use: ["style-loader", { loader: "css-loader", options: { importLoaders: 1 } }, "postcss-loader"],
            },
            // {
            //     test: /\.html$/,
            //     loader: "html-loader",
            // },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "public/index.html"),
            filename: "./index.html",
        }),
        new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
            process: "process/browser",
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            reportFilename: path.join(__dirname, "./build/stats/app.html"),
            defaultSizes: "gzip",
            openAnalyzer: false,
            generateStatsFile: true,
            statsFilename: path.join(__dirname, "./build/stats/app.json"),
            statsOptions: null,
            logLevel: "info",
        }),
    ],
    devServer: {
        proxy: {
            "/api": {
                target: "http://localhost:8888",
            },
        },
        static: {
            directory: path.join(__dirname, "dist"),
        },
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
        open: true,
        port: 3000,
        host: "0.0.0.0",
        https: true,
        client: {
            overlay: {
                errors: true,
                warnings: false,
            },
        },
    },
};
