import { getDepProps } from "../application";
import { Watcher } from "../value";
import { VNode } from "./baseNode";
import { setElementChild, initVNodeWithList, initVNode, addFragmentEle, removeFragmentEle, replaceElementChild } from "./element";
import { TextVNode } from "./text";
import { BaseChildVNode, ChildVNode, RBaseChildVNode } from "./type";

// 这个模块暂时没用
export class FragmentVNode extends VNode {
  type: number = VNode.FRAGMENT;
  props?: {
    [key: string]: any
  }
  children?: Array<RBaseChildVNode>
  fragment?: HTMLElement
  VNodeChildren: Array<ChildVNode | ChildVNode[]>
  pivot: TextVNode // 锚点

  constructor(props?: Record<any, any>, children?: any[]) {
    super()
    this.props = props
    this.children = children
    this.VNodeChildren = []
    this.pivot = new TextVNode('')
    this.pivot.createTextNode()
  }

  getPivot(): TextVNode {
    return this.pivot
  }

  setPivot(pivot: TextVNode) {
    this.pivot = pivot
  }

  getRNode(): HTMLElement {
    return this.fragment!
  }

  getParentMountedEle(): HTMLElement {
    if (this.parentVNode! instanceof FragmentVNode) {
      return this.parentVNode!.getParentMountedEle()
    } else {
      return this.parentVNode!.getRNode()
    }
  }

  createFragment(): HTMLElement {
    if (this.fragment) return this.fragment  // 如果已经初始化过则不要再初始化
    this.fragment = document.createDocumentFragment() as unknown as HTMLElement
    // 处理标签子节点
    this.setChildren()
    return this.fragment
  }

  /**
   * 处理子节点
  */

  setChildren() {
    if (!this.fragment || this.children === undefined || this.children === null) return
    if (!Array.isArray(this.children)) this.children = [this.children]

    for (let i = 0; i < this.children.length; i++) {
      let child = this.children[i]
      // 如果是函数要先看函数的返回值 不然直接添加
      if (typeof child !== 'function') {
        setElementChild(this.fragment, this.VNodeChildren[i] = initVNodeWithList(child, this))
        continue
      }

      let [depProps, result] = getDepProps(child)

      if (Array.isArray(result)) {
        let pivot = initVNode('');
        setElementChild(this.fragment, pivot)
        this.VNodeChildren[i] = initVNodeWithList(result, this) as ChildVNode[]
        addFragmentEle(this.fragment, this.VNodeChildren[i] as ChildVNode[], pivot as TextVNode)
        let fn = () => {
          removeFragmentEle(this.VNodeChildren[i] as ChildVNode[])
          let newVnodeList = (child as Function)()
          if (Array.isArray(newVnodeList)) {
            this.VNodeChildren[i] = initVNodeWithList(newVnodeList, this) as ChildVNode[]
            addFragmentEle(this.getParentMountedEle(), this.VNodeChildren[i] as ChildVNode[], pivot as TextVNode)
          }
        }
        depProps.forEach(propValue => propValue.setDep(new Watcher(fn)))
      } else {
        this.VNodeChildren[i] = initVNode(result, this)
        setElementChild(this.fragment, this.VNodeChildren[i])
        let fn = () => {
          let newNode = (child as () => BaseChildVNode)()
          this.VNodeChildren[i] = replaceElementChild(this.getParentMountedEle(), initVNode(newNode, this), this.VNodeChildren[i] as ChildVNode)
        }
        depProps.forEach(propValue => propValue.setDep(new Watcher(fn)))
      }
    }
  }


}