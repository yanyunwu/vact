import { Activer } from "../reactive"
import { VNode, VNODE_TYPE, OriginVNode } from "./vnode"

export const AliveSymbol = Symbol('Alive')
export type VAliveType = typeof AliveSymbol
export interface VAlive extends VNode {

  // 虚拟节点类型
  type: symbol,
  // 虚拟节点表标识
  flag: VNODE_TYPE.ELEMENT

  activer: Activer<OriginVNode>
  // 目前存在的节点
  vnode: VNode
}
