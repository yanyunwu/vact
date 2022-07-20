import { ElementVNode } from "../vnode"
import { FragmentVNode } from "./fragment"
import { SlotVNode } from "./slot"

// 这里指的是能渲染元素的parentNode
// type ParentVNode = ElementVNode | FragmentVNode
// // 标准化后的子元素节点
// export type ChildVNode = TextVNode | ElementVNode | ComponentVNode | FragmentVNode
// // 我们能获取的基本子元素节点
// export type BaseChildVNode = string | ElementVNode | ComponentVNode | FragmentVNode | SlotVNode | Array<string | ElementVNode | ComponentVNode | FragmentVNode>
// export type RBaseChildVNode = BaseChildVNode | (() => BaseChildVNode)

export interface SubComponent {
  createEFVNode(): ElementVNode | FragmentVNode
  setProps(props: {}): void
  setChildren(children: Record<string, SlotVNode>): void
  getEFVNode(): ElementVNode | FragmentVNode
}