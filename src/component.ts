import { SubConstructor, Vact } from "./application";
import { createNode } from './application'
import { ComponentVNode, ElementVNode, TextVNode } from "./vnode";
import { DataProxy } from './proxy'

/**
 * 根组件
*/

interface Config {
  data?: {
    [key: string | symbol]: any
  },
}

abstract class Component {
  config: Config
  data?: {}
  props?: {}
  children?: any[]

  constructor(config: Config = {}) {
    this.config = config
    // 设置响应式数据对象
    this.setData()
  }

  // 设置数据为响应式的
  setData() {
    this.data = new DataProxy(this.config.data || {}).getData()
  }

  setProps(props: {}) {
    this.props = props
  }

  setChildren(children: any[]) {
    this.children = children
  }

  abstract render(h: (a: string | SubConstructor, b?: {}, c?: []) => ElementVNode | ComponentVNode): ElementVNode

  renderRoot(): ElementVNode {
    return this.render(createNode)
  }
}

export default Component