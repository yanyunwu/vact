# Vact使用文档



## 简介

**vact**，从名字就能看出，和**vue**还有react是少不了关系的，它是一款基于**vue**的响应式原理，以及**react**的**jsx**语法，并结合我自身的创新开发而来。当然，仅凭我一个人是无法将它维护的很好的，所以，我想借助它来向大家展示一下我自己的想法以及一些有趣的用法，那么接下来，请听我娓娓道来。



### 整体架构思想

这套框架的当然是具备声明式渲染和响应性的特点的，但不同的是，它并不是以比较diff为主，而是在一开始就确认好每一个活跃的dom节点的响应性，只有在一些比较严苛的条件（比如数组），才会启用diff进行比较。如果你不理解的话可以先接着往下看，这不影响你接下来的阅读。



### 基本示例

***注：下面的实例都是基于jsx语法，因为使用创建节点的api过于繁琐***

```jsx
import { state, createApp } from 'vactapp'

const count = state(0)
let app = <div>
  <button onClick={() => count.value++}>
    count is:{count.value}
  </button>
</div>

createApp(app).mount('#app')
```

**结果如下：**

![基本示例](E:\code\project\vactapp\docs\static\基本示例.gif)



## 渐进式

可以通过将节点挂载到真实dom来实现部分响应式代理



## 快速使用

目前可以通过babel安装插件解析jsx语法



## 基础



### 创建应用

```jsx
import { createApp } from 'vactapp'

const app = createApp(<div>Hello World!</div>)
app.mount('#app')
```



### jsx语法

这部分其实不需要我过多介绍，现在非常流行，而且网上也有教程

简单写一下

- html代码块中大括号里面用来写表达式

```jsx
const template = <div id={'app'}>
          {'hello'}
      </div>
```



- 事件以on开头，且代码块中为函数且只能为函数

```jsx
const button = <button onClick={(e) => console.log(e.target)}>确定</button>
```



### 响应式

想要实现响应式，必须首先创建响应式对象

```jsx
import { defineState, watch } from 'vactapp'

const data = defineState({
    count: 0
})

watch(() => data.count, (oldValue, newValue) => {
	console.log(oldValue, newValue)
})

data.count++ // 打印 0, 1
```



当然也可以创建基础属性的响应对象，但数值必须通过value访问

```jsx
import { state } from 'vactapp'

const count = state(0)

watch(() => count.value, (oldValue, newValue) => {
	console.log(oldValue, newValue)
})

count.value++ // 打印 0, 1
```



### css样式绑定

### 元素节点响应绑定

### 条件渲染

### 列表渲染

### 事件绑定

### 表单绑定

### 属性监听器

### 组件使用

#### 声明并使用组件

#### 组件属性

#### 组件插槽

#### 动态组件



## 进阶

### 数组节点进行列表渲染时的优化



## 结尾

