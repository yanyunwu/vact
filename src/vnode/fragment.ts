

export const Fragment = Symbol('Fragment');

import { Activer } from "../reactive";
import { VNode, VNODE_TYPE } from "./vnode";


export interface VFragment extends VNode {

  // 虚拟节点类型
  type: symbol,

  // 虚拟节点属性
  props: null,

  // 虚拟节点子节点
  children: Array<Activer | VNode | string>,

  // 虚拟节点表标识
  flag: VNODE_TYPE.FRAGMENT

  // 锚点
  anchor: Text,
  el: Text

}