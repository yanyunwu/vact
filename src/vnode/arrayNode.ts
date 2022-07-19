import { ChildVNode, ParentVNode, standardNode } from "../children"
import { VNode } from "./baseNode"
import { ComponentVNode } from "./component"
import { ElementVNode } from "./element"
import { FragmentVNode } from "./fragment"
import { TextVNode } from "./text"


export class ArrayVNode extends VNode {
  readonly type: number = 8
  parentVNode?: ParentVNode
  props: Record<any, any>
  // 数组节点中不应该在存在数组
  bnodeList: Array<string | ElementVNode | ComponentVNode | FragmentVNode>
  nodeList: Array<TextVNode | ElementVNode | ComponentVNode | FragmentVNode>

  fragment?: HTMLElement
  pivot: TextVNode // 锚点


  constructor(props: Record<any, any>, bnodeList: Array<string | ElementVNode | ComponentVNode | FragmentVNode>) {
    super()
    this.props = props
    this.bnodeList = bnodeList
    this.nodeList = []
    this.pivot = new TextVNode('')
    this.pivot.createRNode()
  }

  setParentVNode(parent?: ParentVNode) {
    this.parentVNode = parent
  }

  getRNode(): HTMLElement {
    return this.fragment!
  }

  // 创建并初始化真实节点
  createRNode(): void {
    this.fragment = document.createDocumentFragment() as unknown as HTMLElement
    this.bnodeList.forEach(child => {
      let schild = standardNode<false>(child, this.parentVNode, false)
      schild.createRNode()
      this.nodeList.push(schild)
      this.fragment!.appendChild(schild.getRNode())
    })
  }

  mount() {
    this.parentVNode?.getRNode().appendChild(this.getRNode())
    this.parentVNode?.getRNode().appendChild(this.pivot.getRNode())
  }

  replaceWith(node: ChildVNode) {
    if (node instanceof ArrayVNode) {
      this.nodeList.forEach(child => child.getRNode().remove())
      this.parentVNode?.getRNode().insertBefore(node.getRNode(), this.pivot.getRNode())
      node.pivot = this.pivot
    }
  }

  // 移除自身节点的方法
  remove() {
    this.nodeList.forEach(node => node.remove())
  }

}


