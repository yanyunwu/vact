import { replaceNode, standardNode, ChildVNode } from "../children"
import { PropValue, Watcher } from "../value"
import { VNode } from "./baseNode"

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
    this.parentVNode?.getRNode().replaceChild(node.getRNode(), this.getRNode())
  }

  remove() {
    this.textNode?.remove()
  }
}