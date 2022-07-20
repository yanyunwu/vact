import { getDepProps } from "../application"
import { ParentVNode, standardNode } from "../children"
import { BaseChildVNode } from "../children"
import { ElementVNode } from "./element"


export class SlotVNode {
  children: Array<BaseChildVNode>
  constructor(children: Array<BaseChildVNode>) {
    this.children = children
  }
}