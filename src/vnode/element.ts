import { getDepProps } from "../application"
import { Watcher } from "../value"
import { VNode } from "./baseNode"
import { ComponentVNode } from "./component"
import { TextVNode } from "./text"
import { BaseChildVNode, RBaseChildVNode, ChildVNode } from "./type"



export class ElementVNode extends VNode {
  tag: string
  props?: {
    [key: string]: any
  }
  children?: Array<RBaseChildVNode>
  type: number = VNode.ELEMENT
  ele?: HTMLElement

  constructor(tag: string, props?: Record<any, any>, children?: any[]) {
    super()
    this.tag = tag;
    this.props = props;
    this.children = children;
  }

  getRNode(): HTMLElement {
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

  /**
   * 处理原生node节点的属性绑定
  */

  setProps() {
    if (!this.props || !this.ele) return

    // 处理标签属性
    for (let prop in this.props) {
      // 如果是函数要先看函数的返回值 不然直接设置属性
      if (typeof this.props[prop] !== 'function') {
        setElementProp(this.ele, prop, this.props[prop])
        continue;
      }

      let [depProps, result] = getDepProps<any>(this.props[prop])
      setElementProp(this.ele, prop, result)

      // 如果是函数则直接跳过
      if (typeof result === 'function') continue
      let fn = () => setElementProp(this.ele!, prop, this.props![prop]())
      depProps.forEach(propValue => propValue.setDep(new Watcher(fn)))
    }

  }

  /**
   * 处理子节点
  */

  setChildren() {
    if (!this.ele || this.children === undefined || this.children === null) return
    if (!Array.isArray(this.children)) this.children = [this.children]

    for (let child of this.children) {
      // 如果是函数要先看函数的返回值 不然直接添加
      if (typeof child !== 'function') {
        setElementChild(this.ele, initVNodeWithList(child))
        continue
      }

      let [depProps, result] = getDepProps(child)

      if (Array.isArray(result)) {
        let pivot = initVNode('');
        setElementChild(this.ele, pivot)
        let curNodeList = initVNodeWithList(result) as ChildVNode[]
        addFragmentEle(this.ele, curNodeList, pivot as TextVNode)
        let fn = () => {
          removeFragmentEle(curNodeList)
          let newVnodeList = (child as Function)()
          if (Array.isArray(newVnodeList)) {
            curNodeList = initVNodeWithList(newVnodeList) as ChildVNode[]
            addFragmentEle(this.ele!, curNodeList, pivot as TextVNode)
          }
        }
        depProps.forEach(propValue => propValue.setDep(new Watcher(fn)))
      } else {
        let curNode = initVNode(result)
        setElementChild(this.ele, curNode)
        let fn = () => {
          let newNode = (child as () => BaseChildVNode)()
          curNode = replaceElementChild(this.ele!, initVNode(newNode), curNode)
        }
        depProps.forEach(propValue => propValue.setDep(new Watcher(fn)))
      }
    }
  }
}


/**
 * 处理原生标签的属性绑定 
*/

function setElementProp(ele: HTMLElement, prop: string, value: string | Record<string, string> | Function) {
  if (typeof value === 'string') {
    if (prop === 'className') { // className比较特殊
      ele.className = value
    } else {
      ele.setAttribute(prop, value)
    }
  } else if (prop === 'style' && typeof value === 'object' && value !== null) { // 对于style标签为对象的值的特殊处理
    let styleStringList = []
    for (let cssattr in value) {
      styleStringList.push(`${cssattr}:${value[cssattr]};`)
    }
    ele.setAttribute(prop, styleStringList.join(''))
  } else if (typeof value === 'function') { // 如果是function则绑定事件
    let pattern = /^on([a-zA-Z]+)/
    if (pattern.test(prop)) {
      let mat = prop.match(pattern)
      mat && ele.addEventListener(mat[1].toLocaleLowerCase(), value.bind(ele))
    } else {
      ele.addEventListener(prop, value.bind(ele))
    }
  }
}

/**
 * 处理子节点的添加
*/

function setElementChild(ele: HTMLElement, childNode: ChildVNode | Array<ChildVNode>) {
  if (Array.isArray(childNode)) {
    childNode.forEach(subChildNode => ele.appendChild(subChildNode.getRNode()))
  } else {
    ele.appendChild(childNode.getRNode())
  }
}

// 初始化虚拟节点，并生成真实节点
function initVNode(baseNode: BaseChildVNode): ChildVNode {
  // 如果是普通的文本字符串
  if (typeof baseNode === "string") {
    let textNode = new TextVNode(baseNode)
    textNode.createTextNode()
    return textNode
  } else if (baseNode instanceof ComponentVNode) { // render可能返回ElementVNode 也可能返回 ComponentVNode
    baseNode.createComponent().createElementVNode().createEle()
    return baseNode
  } else if (baseNode instanceof ElementVNode) {  // 如果是元素节点
    baseNode.createEle()
    return baseNode
  } else {
    // 特殊处理 为null则不渲染返回空节点
    if (baseNode === null) baseNode = ''
    let textNode = new TextVNode(String(baseNode))
    textNode.createTextNode()
    return textNode
  }
}

function initVNodeWithList(baseNode: BaseChildVNode | Array<BaseChildVNode>): ChildVNode | Array<ChildVNode> {
  if (Array.isArray(baseNode)) {
    return baseNode.map(item => initVNode(item))
  } else {
    return initVNode(baseNode)
  }
}

/**
 * 替换并返回现在的节点
*/
function replaceElementChild(ele: HTMLElement, newNode: ChildVNode, oldNode: ChildVNode): ChildVNode {
  if (newNode instanceof TextVNode && oldNode instanceof TextVNode) {
    oldNode.getRNode().nodeValue = newNode.getRNode().nodeValue
    return oldNode
  }

  ele.replaceChild(newNode.getRNode(), oldNode.getRNode())
  return newNode
}


function addFragmentEle(ele: HTMLElement, childNodes: ChildVNode[], pivot?: TextVNode) {
  let fragment = document.createDocumentFragment()
  childNodes.forEach(child => fragment.appendChild(child.getRNode()))
  if (pivot) ele.insertBefore(fragment, pivot.getRNode())
  else ele.appendChild(fragment)
}

function removeFragmentEle(childNodes: ChildVNode[]) {
  childNodes.forEach(child => child.getRNode().remove())
}