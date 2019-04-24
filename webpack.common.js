const path = require("path");

module.exports = {
  entry: "./app/main.js", // Start at app/main.js
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js" // Output to public/bundle.js
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [path.resolve(__dirname, "../app")],
        query: { presets: ["es2017"] }
      },
      {
        test: /\.scss$/,
        loader: "style-loader!css-loader!sass-loader"
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: "url-loader?limit=100000"
      },
      {
        test: /\.html$/,
        loader: "html-loader"
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "public"),
    compress: true,
    port: 9000
  },
  plugins: []
};
