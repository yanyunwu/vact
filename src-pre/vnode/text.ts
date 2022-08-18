import { ChildVNode } from "../children"
import { VNode } from "./baseNode"
import { ComponentVNode } from "./component"
import { FragmentVNode } from "./fragment"

export class TextVNode extends VNode {
  type: number = VNode.TEXT
  text: string
  textNode?: HTMLElement

  constructor(text: string) {
    super()
    this.text = text
  }

  getRNode(): HTMLElement {
    return this.textNode!
  }

  // 创建并初始化真实节点
  createRNode(): void {
    this.textNode = document.createTextNode(this.text) as unknown as HTMLElement
  }

  mount() {
    this.parentVNode?.getRNode().appendChild(this.getRNode())
  }

  replaceWith(node: ChildVNode) {
    if (node instanceof TextVNode) {
      this.getRNode().nodeValue = node.getRNode().nodeValue
      node.textNode = this.textNode
      return
    }

    if (node instanceof FragmentVNode) {
      this.parentVNode?.getRNode().insertBefore(node.getRNode(), this.getRNode())
      this.getRNode().replaceWith(node.pivot.getRNode())
    } else if (node instanceof ComponentVNode) {
      let ef = node.getComponent().getEFVNode()
      if (ef instanceof FragmentVNode) {
        this.parentVNode?.getRNode().insertBefore(node.getRNode(), this.getRNode())
        this.getRNode().replaceWith(ef.pivot.getRNode())
      } else {
        this.parentVNode?.getRNode().replaceChild(node.getRNode(), this.getRNode())
      }
    }
    else {
      this.parentVNode?.getRNode().replaceChild(node.getRNode(), this.getRNode())
    }
  }

  remove() {
    this.textNode?.remove()
  }
}