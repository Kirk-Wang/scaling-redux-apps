'use strict'

const path = require('path')
const webpack = require('webpack')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const glob = require('glob')


const setMPA = () => {
  const entry = {}
  const htmlWebpackPlugin = []

  const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'))
  entryFiles.map((entryFile) => {
    const match = entryFile.match(/\/src\/(.+)\/index\.js$/)
    const pageName = match[1]
    entry[pageName] = entryFile
    htmlWebpackPlugin.push(new HtmlWebpackPlugin({
      template: path.join(__dirname, `./src/${pageName}/index.html`),
      filename: `${pageName}.html`,
      chunks: [`${pageName}`],
      inject: true,
      minify: {
        html5: true,
        collapseWhitespace: true,
        preserveLineBreaks: false,
        minifyCSS: true,
        minifyJS: true,
        removeComments: false
      }
    }))
  })

  return {
    entry,
    htmlWebpackPlugin
  }
}

const { entry, htmlWebpackPlugin } = setMPA()


module.exports = {
  entry: entry,
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist')
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'babel-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('autoprefixer')({
                  overrideBrowserslist: ['last 2 version', '> 1%', 'ios 7']
                }),
              ]
            }
          },
          {
            loader: 'px2rem-loader',
            // options here
            options: {
              remUnit: 75,
              remPrecision: 8
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:8].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:8].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano')
    }),
    new CleanWebpackPlugin(),
    new FriendlyErrorsWebpackPlugin()
  ].concat(htmlWebpackPlugin),
  devServer: {
    contentBase: './dist',
    hot: true,
    stats: 'errors-only'
  },
  devtool: 'source-map'
}