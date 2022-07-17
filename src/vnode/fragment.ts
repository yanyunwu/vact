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

  constructor(props?: Record<any, any>, children?: any[]) {
    super()
    this.props = props
    this.children = children
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

    for (let child of this.children) {
      // 如果是函数要先看函数的返回值 不然直接添加
      if (typeof child !== 'function') {
        setElementChild(this.fragment, initVNodeWithList(child))
        continue
      }

      let [depProps, result] = getDepProps(child)

      if (Array.isArray(result)) {
        let pivot = initVNode('');
        setElementChild(this.fragment, pivot)
        let curNodeList = initVNodeWithList(result) as ChildVNode[]
        addFragmentEle(this.fragment, curNodeList, pivot as TextVNode)
        let fn = () => {
          removeFragmentEle(curNodeList)
          let newVnodeList = (child as Function)()
          if (Array.isArray(newVnodeList)) {
            curNodeList = initVNodeWithList(newVnodeList) as ChildVNode[]
            addFragmentEle(this.getParentMountedEle(), curNodeList, pivot as TextVNode)
          }
        }
        depProps.forEach(propValue => propValue.setDep(new Watcher(fn)))
      } else {
        let curNode = initVNode(result)
        setElementChild(this.fragment, curNode)
        let fn = () => {
          let newNode = (child as () => BaseChildVNode)()
          curNode = replaceElementChild(this.getParentMountedEle(), initVNode(newNode), curNode)
        }
        depProps.forEach(propValue => propValue.setDep(new Watcher(fn)))
      }
    }
  }


}