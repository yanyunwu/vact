import { ChildVNode } from "../children"
import { PropValue, Watcher } from "../value"
import { ElementVNode } from "./element"

export abstract class VNode {
  // 父虚拟结点
  parentVNode?: ElementVNode
  // 子节点类型
  abstract type: number

  static ELEMENT: number = 0
  static TEXT: number = 1
  static COMPONENT: number = 2
  static FRAGMENT: number = 3

  // 用于获取挂载到虚拟节点的真实节点
  abstract getRNode(): HTMLElement | Text

  // 设置节点的父节点
  setParentVNode(parent?: ElementVNode) {
    this.parentVNode = parent
  }

  // 节点依赖的属性
  propValues?: Array<PropValue>
  // 节点的生成函数
  fn?: () => void
  abstract createRNode(): void

  // 设置节点的依赖
  setDeps(propValues: Array<PropValue>, fn: () => void): void {
    this.propValues = propValues
    this.fn = fn
  }

  // 绑定节点的依赖
  bindDeps(): void {
    if (this.propValues && this.fn) {
      // let curMountedNode: ChildVNode = this as unknown as ChildVNode
      // let fn = () => {
      //   let nextNode = standardNode(this.fn!(), this.parentVNode)
      //   nextNode.createRNode()
      //   replaceNode(nextNode, curMountedNode)
      //   curMountedNode = nextNode
      // }
      let watcher = new Watcher(this.fn)
      this.propValues.forEach(propValue => propValue.setDep(watcher))
    }
  }

  abstract mount(): void
  abstract replaceWith(node: ChildVNode): void
}