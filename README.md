# vact

借鉴加创新的前端响应式框架

[![OSCS Status](https://www.oscs1024.com/platform/badge/yanyunwu/vact.svg?size=small)](https://www.oscs1024.com/project/yanyunwu/vact?ref=badge_small)



## 使用文档

[点击查看vact使用文档](./docs/README.md)

[备用文档链接](https://github.com/yanyunwu/vact/blob/master/docs/README.md)




## 说点什么？

首先介绍一下自己，我不是什么大佬，只是有时候会对于一些东西感兴趣，所以才写了这个东西。它可能没有什么特点，而且更是比不过现在已经非常成熟的vue和react，这点我当然是知道的，而且我还是借鉴和使用了它们的一些思想，但假如说有那么一些创新，或者是有趣的东西，那便足够了，不是吗？我只希望能得到大家的建议，并从中学习进步，就足够了。



## 代码示例

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



***以上只是简单的示例，详细使用请务必查看文档***