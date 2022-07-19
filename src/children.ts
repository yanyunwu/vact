import { type } from "os"
import { getDepProps } from "./application"
import { TextVNode, ElementVNode, ComponentVNode, FragmentVNode, SlotVNode, ArrayVNode } from "./vnode"



// 这里指的是能渲染元素的parentNode
export type ParentVNode = ElementVNode
// 标准化后的子元素节点
export type ChildVNode = TextVNode | ElementVNode | ComponentVNode | FragmentVNode | ArrayVNode
// 我们能获取的基本子元素节点
export type BaseChildVNode = string | ElementVNode | ComponentVNode | FragmentVNode | ArrayVNode | Array<string | ElementVNode | ComponentVNode | FragmentVNode>
export type RBaseChildVNode = BaseChildVNode | (() => BaseChildVNode)


export function setNodeChildren(parentNode: ParentVNode, children: Array<RBaseChildVNode>): Array<ChildVNode> {
  let standardNodeList: Array<ChildVNode> = []
  for (let i = 0; i < children.length; i++) {
    let child = children[i]
    // 如果是函数要先看函数的返回值 不然直接添加
    if (typeof child !== 'function') {
      let snode = standardNode(child, parentNode)
      snode.createRNode() // 创建真实节点
      standardNodeList.push(snode)
      snode.mount() // 将真实节点挂载到父节点
      continue
    }

    let [propValues, result] = getDepProps(child)
    let snode = standardNode(result, parentNode)
    snode.createRNode() // 创建真实节点

    standardNodeList[i] = snode
    let fn = () => {
      let nextNode = standardNode((child as () => BaseChildVNode)(), parentNode)
      nextNode.createRNode()
      replaceNode(nextNode, standardNodeList[i])
      standardNodeList[i] = nextNode
    }

    snode.setDeps(propValues, fn)
    snode.bindDeps()
    snode.mount() // 将真实节点挂载到父节点
    standardNodeList.push(snode)

  }

  return standardNodeList
  // parentNode.setChildrenNodes(standardNodeList)
  // parentNode.mount()
}

type StandardNodeReturn<T> = T extends true ? ChildVNode : TextVNode | ElementVNode | ComponentVNode | FragmentVNode
// 首先标准化节点
export function standardNode<T extends boolean>(baseNode: BaseChildVNode, parentNode?: ParentVNode, arrIncluded?: T): StandardNodeReturn<T> {
  if (typeof baseNode === "string") {
    let textNode = new TextVNode(baseNode)
    textNode.setParentVNode(parentNode)
    return textNode
  } else if (baseNode instanceof ElementVNode) {  // 如果是元素节点
    baseNode.setParentVNode(parentNode)
  } else if (baseNode instanceof ComponentVNode) {
    baseNode.setParentVNode(parentNode)
  } else if (baseNode instanceof FragmentVNode) {
    baseNode.setParentVNode(parentNode)
  } else if (baseNode instanceof ArrayVNode) {
    baseNode.setParentVNode(parentNode)
  } else if (Array.isArray(baseNode) && (arrIncluded === undefined || arrIncluded)) {
    let arrNode = new ArrayVNode({}, baseNode)
    arrNode.setParentVNode(parentNode)
    return arrNode as StandardNodeReturn<T>
  }
  else {
    // 特殊处理 为null则不渲染返回空节点
    if (baseNode === null) baseNode = ''
    let textNode = new TextVNode(String(baseNode))
    textNode.setParentVNode(parentNode)
    return textNode
  }
  return baseNode as StandardNodeReturn<T>
}

export function replaceNode(newNode: ChildVNode, oldNode: ChildVNode) {
  oldNode.replaceWith(newNode)
}
