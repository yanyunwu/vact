import {VNode, VNODE_TYPE, VNodeElement, VNodeProps} from "./vnode";

export interface VElement extends VNode {

  // 虚拟节点类型
  type: string,

  // 虚拟节点属性
  props: VNodeProps,

  // 虚拟节点子节点
  children: Array<VNode>,

  // 虚拟节点表标识
  flag: VNODE_TYPE.ELEMENT

  el: HTMLElement
}
