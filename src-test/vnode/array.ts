export const ArrayNode = Symbol('ArrayNode');

import { Activer } from "../reactive/active";
import { VNode, VNODE_TYPE } from "./vnode";


export interface VArrayNode extends VNode {

  // 虚拟节点类型
  type: symbol,

  // 虚拟节点属性
  props: null,

  // 虚拟节点子节点
  children: Array<Activer | VNode | string>,

  // 虚拟节点表标识
  flag: VNODE_TYPE.ArrayNode

  // 锚点
  anchor: Text,
  el: Text
}