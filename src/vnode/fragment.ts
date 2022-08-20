import { VNode, VNODE_TYPE } from "./vnode";

export const FragmentSymbol = Symbol('Fragment');
export interface VFragment extends VNode {

  // 虚拟节点类型
  type: symbol,

  // 虚拟节点子节点
  children: Array<VNode>,

  // 虚拟节点表标识
  flag: VNODE_TYPE.FRAGMENT

  // 锚点
  anchor: Text,
  el: Text

}