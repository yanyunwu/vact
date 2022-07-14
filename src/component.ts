import { SubConstructor, Vact } from "./application";
import { createNode } from './application'
import { ComponentVNode, ElementVNode, TextVNode } from "./vnode";
import { DataProxy, DataProxyTest } from './proxy'

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
  abstract data: {}
  abstract props?: {}
  abstract children?: []

  constructor(config: Config = {}) {
    this.config = config
    // 设置响应式数据对象
    this.setData()
  }

  // 设置数据为响应式的
  setData() {
    this.data = new DataProxyTest(this.config.data || {}).getData()
  }

  abstract render(h: (a: string | SubConstructor, b?: {}, c?: []) => ElementVNode | ComponentVNode): ElementVNode

  renderRoot(): ElementVNode {
    return this.render(createNode)
  }
}

export default Component