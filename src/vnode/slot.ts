import { ParentVNode } from "../children"
import { BaseChildVNode } from "../children"


export class SlotVNode {
  parentVNode?: ParentVNode
  children: Array<BaseChildVNode>
  slots: Record<string, Array<SlotVNode>>

  constructor(children: Array<BaseChildVNode>) {
    this.children = children
    this.slots = {}
  }

  setSlots() {

  }

  setParentVNode(parent?: ParentVNode) {
    this.parentVNode = parent
  }

}