const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const BabiliPlugin = require("babili-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  plugins: [
    new BabiliPlugin({})
  ]
});
