import { Activer } from "../reactive";
import {VNode, VNODE_TYPE, OriginVNode, VNodeProps} from "./vnode";
import { H } from '../render'


/** 函数组件类型 */
export interface FunctionComponentType {
  (props: Record<any, any>, children: Array<VNode>): OriginVNode
}

/** 类组件类型 */
export interface ClassComponentType {
  new (props: Record<string, any>, children: Array<VNode>): Component
}

export type ComponentType = FunctionComponentType | ClassComponentType

export const VComponentSymbol = Symbol('VComponent')
export type VComponentType = typeof VComponentSymbol

export interface VComponent extends VNode {

  // 虚拟节点类型
  type: VComponentType,

  // 虚拟节点属性
  props: VNodeProps,

  // 虚拟节点子节点
  children: Array<VNode>,

  // 虚拟节点表标识
  flag: VNODE_TYPE.COMPONENT

  root: VNode,
  // root的el
  el?: Text | HTMLElement

}

// todo
export interface Component {
  props: Record<string, any>
  children: Array<Activer | VNode | string>
  render(h?: H): OriginVNode
}


// todo
function defineComponent<T extends ComponentType>(Component: T): T {
  return Component
}

