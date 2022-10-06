import {VNode, VNODE_TYPE, VNodeElement} from "./vnode";


export const TextSymbol = Symbol('Text');
export interface VText extends VNode {

  // 虚拟节点类型
  type: symbol,

  // 虚拟节点子节点
  children: string,

  // 虚拟节点表标识
  flag: VNODE_TYPE.TEXT

  el: Text

}
