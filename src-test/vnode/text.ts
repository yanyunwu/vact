import { VNode, VNODE_TYPE } from "./vnode";


export const Text = Symbol('Text');

export interface VText extends VNode {

  // 虚拟节点类型
  type: symbol,

  // 虚拟节点属性
  props?: null,

  // 虚拟节点子节点
  children: string,

  // 虚拟节点表标识
  flag: VNODE_TYPE.TEXT

  el?: Text

}