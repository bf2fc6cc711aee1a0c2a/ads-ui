/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const { port } = require("./package.json");
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || port;
const PROTOCOL = process.env.PROTOCOL || "http";

module.exports = merge(common("development"), {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    static: {
      directory: "./dist",
    },
    host: HOST,
    port: PORT,
    compress: true,
    //inline: true,
    historyApiFallback: true,
    hot: true,
    client: {
      overlay: true,
    },
    open: true,
    https: PROTOCOL === "https",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./src/keycloak.dev.json", to: "keycloak.json"}
      ]
    })
  ]
});
