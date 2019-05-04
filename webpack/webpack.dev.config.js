const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: "development",

  entry: [
    path.resolve(__dirname, '../src/client/app.tsx')
  ],

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", "json"]
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      {
        test: /\.(png|gif|jpg|jpeg|bmp)$/i,
        loader: 'file-loader?hash=sha512&digest=hex&name=images/[hash].[ext]',
      },
      {
        test: /\.(mp4)$/i,
        loader: 'file-loader?hash=sha512&digest=hex&name=videos/[hash].[ext]',
      },
      {
        test: /\.(woff|woff2|svg|ttf|eot|otf)($|\?)/i,
        loader: 'file-loader?name=fonts/[name]-[hash].[ext]'
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'usage',
                    targets: '> 0.25%, not dead',
                    corejs: 3
                  }
                ],
                '@babel/preset-react'
              ]
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loaders: [
          "style-loader",
          "css-loader",
          {
            loader: 'postcss-loader',
            options: {
              plugins: [autoprefixer]
            }
          },
          "resolve-url-loader",
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sourceMapContents: false
            }
          }
        ]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: 'style!css!postcss'
      }
    ]
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "../dist"),
    publicPath: './',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/server/views/index.html')
    })
  ],
  target: "electron-renderer",
  watch: true
};