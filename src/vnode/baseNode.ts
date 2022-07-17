import { ElementVNode } from "./element"
import { FragmentVNode } from "./fragment"

export abstract class VNode {
  // 父虚拟结点
  parentVNode?: ElementVNode | FragmentVNode
  // 子节点类型
  abstract type: number

  static ELEMENT: number = 0
  static TEXT: number = 1
  static COMPONENT: number = 2
  static FRAGMENT: number = 3

  // 用于获取挂载到虚拟节点的真实节点
  abstract getRNode(): HTMLElement | Text

  // 设置节点的父节点
  setParentVNode(parent?: ElementVNode | FragmentVNode) {
    this.parentVNode = parent
  }
}