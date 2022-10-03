import { H } from './render'
import { VNode, VNodeProps, OriginVNode } from "./vnode"


/**
 * 根类组件用于类型提示
 * 抽象类
*/

export abstract class Component {
  // 组件属性
  abstract readonly props?: VNodeProps
  // 组件子元素
  abstract readonly children?: Array<OriginVNode>

  abstract created?(): void

  abstract render(h: H): VNode
}
