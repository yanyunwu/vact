

export const Fragment = Symbol('Fragment');

import { Activer } from "../reactive/active";
import { VNode, VNODE_TYPE } from "./vnode";


export interface VFragment extends VNode {

  // 虚拟节点类型
  type: symbol,

  // 虚拟节点属性
  props: Record<string, any>,

  // 虚拟节点子节点
  children: Array<Activer | VNode | string>,

  // 虚拟节点表标识
  flag: VNODE_TYPE.Fragment

  // 锚点
  anchor: Text,
  el: Text

}