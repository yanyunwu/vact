import { BaseChildVNode } from "../children"

export class SlotVNode {
  children: Array<BaseChildVNode>
  constructor(children: Array<BaseChildVNode>) {
    this.children = children
  }
}