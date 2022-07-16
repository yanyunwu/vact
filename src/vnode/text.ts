import { VNode } from "./baseNode"

export class TextVNode extends VNode {
  type: number = VNode.TEXT
  text: string
  textNode?: Text

  constructor(text: string) {
    super()
    this.text = text
  }

  createTextNode() {
    this.textNode = document.createTextNode(this.text)
    return this.textNode
  }

  getRVnode(): HTMLElement | Text {
    return this.textNode!
  }
}