import { setNodeChildren } from "../children";
import { VNode } from "./baseNode";
import { TextVNode } from "./text";
import { ChildVNode, RBaseChildVNode } from "../children";
import { ComponentVNode } from "./component";


export class FragmentVNode extends VNode {
  type: number = VNode.FRAGMENT;
  props?: {
    [key: string]: any
  }
  children?: Array<RBaseChildVNode>
  fragment?: HTMLElement
  VNodeChildren: Array<ChildVNode>
  pivot: TextVNode // 锚点

  constructor(props?: Record<any, any>, children?: any[]) {
    super()
    this.props = props
    this.children = children
    this.VNodeChildren = []
    this.pivot = new TextVNode('')
    this.pivot.createRNode()
  }

  getRNode(): HTMLElement {
    return this.fragment!
  }

  /**
   * 处理子节点
  */

  setChildren() {
    if (!this.fragment || this.children === undefined || this.children === null) return
    if (!Array.isArray(this.children)) this.children = [this.children]
    this.VNodeChildren = setNodeChildren(this.parentVNode!, this.children)
  }

  // 创建并初始化真实节点
  createRNode(): void {
    if (this.fragment) return // 如果已经初始化过则不要再初始化
    this.fragment = document.createDocumentFragment() as unknown as HTMLElement
    // 处理标签子节点
    this.setChildren()
  }

  mount() {
    this.parentVNode?.getRNode().appendChild(this.getRNode())
    this.parentVNode?.getRNode().appendChild(this.pivot.getRNode())
  }

  replaceWith(node: ChildVNode) {
    this.remove()
    this.parentVNode?.getRNode().insertBefore(node.getRNode(), this.pivot.getRNode())
    if (node instanceof FragmentVNode) {
      node.pivot = this.pivot
    } else if (node instanceof ComponentVNode) {
      let ef = node.getComponent().getEFVNode()
      if (ef instanceof FragmentVNode) {
        ef.pivot = this.pivot
      }
    }
    else {
      this.pivot.remove()
    }
  }

  remove() {
    this.VNodeChildren.forEach(node => node.remove())
  }

}