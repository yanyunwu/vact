import { getDepProps, Vact } from "../application"
import { Component } from "../component"
import { PropValue, Watcher } from "../value"
import { VNode } from "./baseNode"
import { ComponentVNode } from "./component"
import { TextVNode } from "./text"
import { BaseElementVNodeChild, ElementVNodeChild } from "./type"

type ChildVNode = ElementVNode | TextVNode | ComponentVNode

export class ElementVNode extends VNode {
  tag: string
  props?: {
    [key: string]: any
  }
  children?: Array<ElementVNodeChild>
  type: number = VNode.ELEMENT
  ele?: HTMLElement

  constructor(tag: string, props?: {}, children?: []) {
    super()
    this.tag = tag;
    this.props = props;
    this.children = children;
  }

  getRVnode(): HTMLElement {
    return this.ele!
  }

  createEle() {
    this.ele = document.createElement(this.tag)
    // 处理标签属性
    this.setProps()
    // 处理标签子节点
    // this.setChildren()
    this.setChildrenNext()
    return this.ele
  }

  // 通过虚拟节点获取所有真实节点
  getRealNode(child: BaseElementVNodeChild): HTMLElement | Text {
    let realNode: HTMLElement | Text = document.createTextNode('')
    // 如果是普通的文本字符串
    if (typeof child === "string") {
      let vnode = new TextVNode(child)
      realNode = vnode.createTextNode()
    } else if (child instanceof Component) { // 待删除
      realNode = child.renderRoot().createEle()
    } else if (child instanceof ComponentVNode) {
      // realNode = child.getComponent().renderRoot().createEle()
      let component = child.getComponent()
      // 这里判断是类组件还是函数式组件
      if (component instanceof Component) {
        realNode = component.renderRoot().createEle()
      } else if (component instanceof ElementVNode) {
        realNode = component.createEle()
      }
      // 如果是元素节点
    } else if (child instanceof ElementVNode) {
      realNode = child.createEle()
    } else if (child instanceof TextVNode) {
      realNode = child.createTextNode()
    } else {
      let vnode = new TextVNode(String(child))
      realNode = vnode.createTextNode()
    }
    return realNode
  }

  // 通过虚拟节点获取所有真实节点列表
  getRealNodeList(childList: Array<BaseElementVNodeChild>): Array<HTMLElement | Text> {
    let list: Array<HTMLElement | Text> = []
    for (let i of childList) {
      list.push(this.getRealNode(i))
    }
    return list
  }

  // 添加数组中所有的节点
  addChildren(children: Array<HTMLElement | Text>, pivot: Text) {
    let fragment = document.createDocumentFragment()
    for (let i of children) {
      fragment.appendChild(i)
    }
    this.ele?.insertBefore(fragment, pivot)
  }
  // 移除数组中所有的节点
  removeChildren(children: Array<HTMLElement | Text>) {
    for (let i of children) {
      i.remove()
    }
  }

  addChild(child: ElementVNodeChild): void {
    if (!this.ele) return
    // child可能是节点对象(元素节点 文本节点 组件节点), 也可能是函数(是函数说明是响应式)
    // 除此之外还有可能是普通的文本字符串

    // 如果是普通的文本字符串
    if (typeof child === "string") {
      let vnode = new TextVNode(child)
      this.ele.appendChild(vnode.createTextNode())
    }  // 如果子组件是自定义组件 这里可以删除
    else if (child instanceof Component) {
      this.ele.appendChild(child.renderRoot().createEle())
    }
    else if (child instanceof ComponentVNode) {

      let component = child.getComponent()
      // 这里判断是类组件还是函数式组件
      if (component instanceof Component) {
        this.ele.appendChild(component.renderRoot().createEle())
      } else if (component instanceof ElementVNode) {
        this.ele.appendChild(component.createEle())
      }

    } // 如果是元素节点
    else if (child instanceof ElementVNode) {
      this.ele.appendChild(child.createEle())
    }   // 如果是文本节点
    else if (child instanceof TextVNode) {
      this.ele.appendChild(child.createTextNode())
    }   // 如果是函数
    else if (typeof child === 'function') {

      let depProps: PropValue[] = []
      let pool = Vact.depPool
      pool.push(depProps)
      let result = child()
      pool.splice(pool.indexOf(depProps), 1)

      // 对于数组需要特殊处理

      if (Array.isArray(result)) {
        // 设置数组的锚点
        let pivot = document.createTextNode('');
        this.ele.appendChild(pivot)
        let realNodeList = this.getRealNodeList(result)
        this.addChildren(realNodeList, pivot)

        // 没有依赖的属性直接结束
        if (!depProps.length) return

        let fn = () => {
          this.removeChildren(realNodeList)
          let newVnodeList = child()

          if (Array.isArray(newVnodeList)) {
            realNodeList = this.getRealNodeList(newVnodeList)
            this.addChildren(realNodeList, pivot)
          }
        }

        for (let prop of depProps) {
          prop.setDep(new Watcher(fn))
        }
      } else {
        let realNode = this.getRealNode(result)
        this.ele.appendChild(realNode)
        // 没有依赖的属性直接结束
        if (!depProps.length) return

        let fn = () => {
          let newVNode = child()
          let newRealNode = this.getRealNode(newVNode)
          if (newRealNode) {
            // 如果都是文本节点则不需要替换, 只需更改文本内容
            if (newRealNode.nodeType === realNode.nodeType) {
              realNode.nodeValue = newRealNode.nodeValue
            } else {
              this.ele?.replaceChild(newRealNode, realNode)
              realNode = newRealNode
            }
          } else {
            this.ele?.replaceChild(realNode = document.createTextNode(''), realNode)
          }

          // tode: 后续可以优化缓存节点，只需更改缓存节点的属性即可

        }

        for (let prop of depProps) {
          prop.setDep(new Watcher(fn))
        }
      }



    }



    // 如果是数组 直接递归遍历数组内的内容
    else if (Array.isArray(child)) {
      for (let subChild of child) {
        this.addChild(subChild)
      }
    }
    // 如果是其他数据类型
    else {
      let vnode = new TextVNode(String(child))
      this.ele.appendChild(vnode.createTextNode())
    }
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

  setChildrenNext() {
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
          let newNode = (child as () => BaseElementVNodeChild)()
          curNode = replaceElementChild(this.ele!, initVNode(newNode), curNode)
        }
        depProps.forEach(propValue => propValue.setDep(new Watcher(fn)))
      }
    }
  }

  setChildren() {
    if (!this.ele || this.children === undefined || this.children === null) return
    if (!Array.isArray(this.children)) this.children = [this.children]
    this.children.forEach(child => this.addChild(child))
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


function setElementChild(ele: HTMLElement, childNode: ChildVNode | Array<ChildVNode>) {
  if (Array.isArray(childNode)) {
    childNode.forEach(subChildNode => ele.appendChild(subChildNode.getRVnode()))
  } else {
    ele.appendChild(childNode.getRVnode())
  }
}

// 初始化虚拟节点，并生成真实节点
function initVNode(baseNode: BaseElementVNodeChild): ChildVNode {
  // 如果是普通的文本字符串
  if (typeof baseNode === "string") {
    let textNode = new TextVNode(baseNode)
    textNode.createTextNode()
    return textNode
  } else if (baseNode instanceof ComponentVNode) {
    baseNode.getComponent()
    // realNode = child.getComponent().renderRoot().createEle()
    let component = baseNode.getComponent()
    // 这里判断是类组件还是函数式组件
    if (component instanceof Component) component.renderRoot().createEle()
    else if (component instanceof ElementVNode) component.createEle()
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

function initVNodeWithList(baseNode: BaseElementVNodeChild | Array<BaseElementVNodeChild>): ChildVNode | Array<ChildVNode> {
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
    oldNode.getRVnode().nodeValue = newNode.getRVnode().nodeValue
    return oldNode
  }
  ele.replaceChild(newNode.getRVnode(), oldNode.getRVnode())
  return newNode
}


function addFragmentEle(ele: HTMLElement, childNodes: ChildVNode[], pivot?: TextVNode) {
  let fragment = document.createDocumentFragment()
  childNodes.forEach(child => fragment.appendChild(child.getRVnode()))
  if (pivot) ele.insertBefore(fragment, pivot.getRVnode())
  else ele.appendChild(fragment)
}

function removeFragmentEle(childNodes: ChildVNode[]) {
  childNodes.forEach(child => child.getRVnode().remove())
}