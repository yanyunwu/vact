import { Activer } from "../reactive"
import { VNode, VNODE_TYPE } from "./vnode"

export const AliveSymbol = Symbol('Alive')
export interface VAlive extends VNode {

  // 虚拟节点类型
  type: symbol,
  // 虚拟节点表标识
  flag: VNODE_TYPE.ELEMENT

  activer: Activer
  // 目前存在的节点
  vnode: VNode
}