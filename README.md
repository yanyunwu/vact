# vact

创世纪前端响应式新框架

[![OSCS Status](https://www.oscs1024.com/platform/badge/yanyunwu/vact.svg?size=small)](https://www.oscs1024.com/project/yanyunwu/vact?ref=badge_small)



## oscs

[![OSCS Status](https://www.oscs1024.com/platform/badge/yanyunwu/vact.svg?size=large)](https://www.oscs1024.com/project/yanyunwu/vact?ref=badge_large)




## 前言

正如介绍所说，本框架是模仿加借鉴vue和react，并结合二者的特点开发而来。既包含了vue的响应式，又继承了react的函数式编程，并通过我自己编写的jsx babel插件解析，即可使用。



## 安装

**yarn**: `yarn add vactapp`

**npm**: `npm i vactapp`



## 快速使用

```jsx
import { Component, mount, createNode, defineState } from 'vactapp'

const state = defineState({
  count: 0,
  color: 'red'
})

class App extends Component {
  render() {
    return <div>
      <h1 style={{ color: state.data.color }}>hello world!</h1>
      <div onClick={() => state.data.color = 'blue'}><button>改变颜色</button></div>
      <div>
        <span>计数器</span>
        <button onClick={() => state.data.count++}>增加</button>
        {state.data.count}
        <button onClick={() => state.data.count--}>减少</button>
      </div>
    </div>
  }
}

mount('#app', new App())
```



## 响应式

defineState只是一个定义状态的api

每个组件在初始化会自动生成一个响应式对象

```jsx
class App extends Component {
    constructor() {
        super({
            data: {
                name: "小明"
            }
        })
        
        this.data.name // 此时this.data是响应式 和上面的state.data一样
    }
}
```



## 配合webpack使用

如果使用创建节点的api去写的话会比较麻烦，所以这边推荐使用jsx语法

**babel插件**：babel-plugin-syntax-jsx      
babel-plugin-transform-vact-jsx（翻译vact的babel）


### webapck配置

```js
const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // 入口
  entry: path.join(__dirname, './src/index.jsx'),

  // 出口
  output: {
    // 目录
    path: path.join(__dirname, './dist'),
    filename: 'bundle.js',
  },
  // development` : 开发阶段  (不压缩)
  // production` :  发布阶段 (压缩)
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              "syntax-jsx", // 在这里装上我们的babel插件
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
    port: 8080 // 默认打开端口号
  }

}
```



### webpack项目目录

```txt
- node_modules
- dist
- src
	- index.html
	- index.jsx
- package.json
- webpack.config.js
```

如果你不会webpack请赶快去学习



## 函数式组件

```jsx
function Button(props, children) {
    return <button onClick={props.onClick} >{children[0]}</button>
}

let Button2 = (props, children) => <button onClick={props.onClick} >{children[0]}</button>

class App extends Component {
    constructor() {
        super({
            data: {
                count: 0
            }
        })
    }
    
    render() {
        return <div>
            {this.data.count}
            <Button onClick={() => this.data.count++} >增加</Button>
            <Button2 onClick={() => this.data.count++} >增加</Button2>
        </div>
    }
}
```

你可以使用函数声明组件，返回需要渲染的html，同时属性和子元素会作为参数传入



**后序：用法和jsx原本语法差不多，但也有很多不同的地方**
