import { Activer } from "../reactive";
import { VNode, VNODE_TYPE } from "./vnode";
import { Child, H } from '../render'

export type FunctionConstructor = (props: Record<string, any>, children: Array<VNode>) => Child
export type ClassConstructor = new (props: Record<string, any>, children: Array<VNode>) => Component
export type ComponentConstructor = ClassConstructor | FunctionConstructor
export interface VComponent extends VNode {

  // 虚拟节点类型
  type: ComponentConstructor,

  // 虚拟节点属性
  props: Record<string, any>,

  // 虚拟节点子节点
  children: Array<VNode>,

  // 虚拟节点表标识
  flag: VNODE_TYPE.COMPONENT

  root: VNode,
  // root的el
  el: Text | HTMLElement

}

export interface Component {
  props: Record<string, any>
  children: Array<Activer | VNode | string>
  render(h?: H): Child
}