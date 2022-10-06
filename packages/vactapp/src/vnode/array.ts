import {VNode, VNODE_TYPE, VNodeElement} from "./vnode";

export const ArraySymbol = Symbol('ArrayNode');
export type VArrayType = typeof ArraySymbol
export interface VArrayNode extends VNode {

  // 虚拟节点类型
  type: symbol,

  // 虚拟节点子节点
  children: Array<VNode>,

  // 虚拟节点表标识
  flag: VNODE_TYPE.ARRAYNODE

  // 锚点
  anchor: Text,
  el: Text,

  // 记录当前数组节点依赖的响应式数组
  depArray: Array<any>
}
