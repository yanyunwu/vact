# vact

借鉴加创新的前端响应式框架

[![OSCS Status](https://www.oscs1024.com/platform/badge/yanyunwu/vact.svg?size=small)](https://www.oscs1024.com/project/yanyunwu/vact?ref=badge_small)



## oscs

[![OSCS Status](https://www.oscs1024.com/platform/badge/yanyunwu/vact.svg?size=large)](https://www.oscs1024.com/project/yanyunwu/vact?ref=badge_large)




## 前言

正如介绍所说，本框架是模仿加借鉴vue和react，并结合二者的特点开发而来。既包含了vue的响应式，又继承了react的函数式编程，并通过我自己编写的jsx babel插件解析，即可使用。



## 安装

**yarn**: `yarn add vactapp`

**npm**: `npm i vactapp`



***如果想快速体验，请看下面webpack章节中的demo，直接运行demo查看***



**babel依赖(最好配合webpack使用)：**

`@babel/core`

`@babel/preset-env`

`babel-loader`

`babel-plugin-syntax-jsx`

`babel-plugin-transform-vact-jsx`



## 快速使用

```jsx
import { createApp, state } from 'vactapp'

const $data = {
  count: 0,
  color: 'red'
}

let show = state(true)

const head = <>
  <h1 style={{ color: $data.color }}>hello world!</h1>
  <div onClick={() => $data.color = 'blue'}><button>改变颜色</button></div>
</>

const bottom = <>
  <span>底部显示</span>
</>

const app = <div id='app'>
  {head}
  <div>
    <span>计数器</span>
    <button onClick={() => $data.count++}>增加</button>
    {$data.count}
    <button onClick={() => $data.count--}>减少</button>
  </div>
  {show.value && bottom}
  <div><button onClick={() => show.value = !show.value}>切换显示</button></div>
</div>

createApp(app).mount('#app')
```



## 响应式

通过`defineState`和`state`定义响应式对象

```jsx
import { defineState, state, createApp } from 'vactapp'

const data = defineState({
  text: 'hello'
})

const text = state('world!')

const app = <><span>{data.text}</span> <span>{text.value}</span></>

createApp(<div>{app}</div>).mount('#app')
```



### babel解析响应式对象

你可能会好奇为什么第一个例子的$data对象只是单纯的一个对象

事实上，在我写的babel插件中会自动把以$开头的且内容为对象的变量转义为`defineState`

```js
const $data = {
  count: 0,
  color: 'red'
}
// 等同于
const $data = defineState({
  count: 0,
  color: 'red'
})
```



## 配合webpack使用

如果使用创建节点的api去写的话会比较麻烦，所以这边推荐使用jsx语法

**babel插件**：

`babel-plugin-syntax-jsx   `

`babel-plugin-transform-vact-jsx`（翻译vact的babel）



### demo

master分支中demo文件中的demo1目录是已经配好的脚手架环境

#### 使用：

`yarn install` or `npm i`

`yarn dev` or `npm run dev`

完成以上命令行后会自动打开浏览器



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
	- app.jsx
- package.json
- webpack.config.js
```

如果你不会webpack请赶快去学习



## 组件说明

组件可以用一个类或者一个函数声明



### 使用类声明组件

必须有一个render函数， 返回一个根节点（可以为fragment）

```jsx
class App {
    constructor() {
       this.data = defineState({
           count: 0
       })
    }
    
    render() {
        console.log(this.props, this.children)
        return <div>
            {this.data.count}
            <Button onClick={() => this.data.count++} >增加</Button>
            <Button2 onClick={() => this.data.count++} >增加</Button2>
        </div>
    }
}
```

你可以使用函数声明组件，返回需要渲染的html，同时属性和子元素会作为参数传入



### 使用函数声明

```js
function Button(props, children) {
  return <><button onClick={props.onChange}>{props.text}</button></>
}
const text = state('哈哈哈')
const app = <div><Button text={text.value} onChange={() => text.value = '123'}></Button></div>

createApp(app).mount('#app')
```



## 插槽

插槽将作为children传入

```js
function Text(props, children) {
  return <>{children}</>
}
const show = state(true)
const app = <div>
  <Text>
    {show.value && <span>hello</span>}
    <span>world</span>
  </Text>
</div>

setInterval(() => {
  show.value = !show.value
}, 1000);

createApp(app).mount('#app')
```



### 具名插槽

这边不太建议使用children来实现具名插槽，也不是不行

更推荐使用props实现

```js
function Text(props, children) {
  const slots = props.slots
  return <>
    <div>**{slots.head}**</div>
    <div>**{slots.middle}**</div>
    <div>**{slots.bottom}**</div>
  </>
}
const $slots = {
  head: <span>头部</span>,
  middle: <span>中部</span>,
  bottom: <span>底部</span>
}
const app = <div>
  <Text slots={$slots}></Text>
  <div>
    <button onClick={() => {
      console.log($slots.middle = null);
    }}>中部消失</button>
  </div>
</div>

createApp(app).mount('#app')
```



**后序：用法和jsx原本语法差不多，但也有很多不同的地方**

如果你有更好的想法或者建议，请随时call我，本人目前大二马上大三，菜比一枚，可以共同进步交流

qq:2480721346

