

import { Activer } from "../reactive/active";
import { VNode, VNODE_TYPE } from "./vnode";


export interface VComponent extends VNode {

  // 虚拟节点类型
  type: Component,

  // 虚拟节点属性
  props: Record<string, any>,

  // 虚拟节点子节点
  children: Array<Activer | VNode | string>,

  // 虚拟节点表标识
  flag: VNODE_TYPE.Component

  root: VNode

}

export interface Component {

}