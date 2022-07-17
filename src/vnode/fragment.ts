import { VNode } from "./baseNode";
import { RBaseChildVNode } from "./type";


export class FragmentVNode extends VNode {
  type: number = VNode.FRAGMENT;
  tag: string
  props?: {
    [key: string]: any
  }
  children?: Array<RBaseChildVNode>
  ele?: HTMLElement
  realEle?: HTMLElement // 用于实现子dom增删改操作的真实父dom

  constructor(tag: string, props?: Record<any, any>, children?: any[]) {
    super()
    this.tag = tag
  }

  getRNode(): HTMLElement | Text {
    return this.ele!
  }

  createEle() {
    if (this.ele) return // 如果已经初始化过则不要再初始化
    this.ele = document.createElement(this.tag)
    // 处理标签属性
    this.setProps()
    // 处理标签子节点
    this.setChildren()
    return this.ele
  }

  setProps() {

  }

  setChildren() {

  }


}