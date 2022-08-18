import { Activer } from "../reactive";
import { VNode, VNODE_TYPE } from "./vnode";
import { H } from '../render'


export interface VComponent extends VNode {

  // 虚拟节点类型
  type: Component,

  // 虚拟节点属性
  props: Record<string, any>,

  // 虚拟节点子节点
  children: Array<Activer | VNode | string>,

  // 虚拟节点表标识
  flag: VNODE_TYPE.COMPONENT

  root: VNode,
  // root的el
  el: Text | HTMLElement

}

export interface Component {
  props: Record<string, any>
  children: Array<Activer | VNode | string>

  render(h?: H): VNode
}