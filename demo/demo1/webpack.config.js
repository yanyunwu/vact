// 因为 webpack 是基于 node
// 所以在配置文件里面 我们可以直接使用 node 的语法
const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  // 入口
  entry: path.join(__dirname, './src/app.jsx'),

  // 出口
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.css$/, //正则表达式，匹配文件类型
        use: ["style-loader", "css-loader"] //申明使用什么loader进行处理
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              "syntax-jsx",
              "transform-vact-jsx"
            ]
          }
        }
      },
    ]
  },

  plugins: [
    // 使用插件 指定模板
    new htmlWebpackPlugin({
      template: path.join(__dirname, './src/index.html')
    })
  ],

  devServer: {
    open: true,
    port: 8080
  }
}