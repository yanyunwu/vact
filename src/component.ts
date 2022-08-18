import { defineState } from "./reactive"
import { H } from './render'
import { VNode } from "./vnode/vnode"

/**
 * 根类组件(向下兼容)
 * 已废弃
*/

interface Config {
  data?: Record<string | symbol, any>
}

export abstract class Component {
  // 组件配置
  private config: Config
  // 组件响应式数据
  public data: Record<any, any>
  // 组件属性
  props?: Record<any, any>
  // 组件子元素
  children?: Record<string, any>

  constructor(config: Config = {}) {
    this.config = config
    this.data = defineState(config.data || {})
  }

  abstract render(h: H): VNode
}