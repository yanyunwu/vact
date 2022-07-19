import { getDepProps } from "../application"
import { ChildVNode, RBaseChildVNode, setNodeChildren } from "../children"
import { Watcher } from "../value"
import { VNode } from "./baseNode"
import { ComponentVNode } from "./component"
import { FragmentVNode } from "./fragment"

export class ElementVNode extends VNode {
  // propValues?: PropValue[]
  // fn?: Function

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

  // 创建并初始化真实节点
  createRNode(): void {
    if (this.ele) return // 如果已经初始化过则不要再初始化
    this.ele = document.createElement(this.tag)
    if (this.children === undefined || this.children === null) return
    if (!Array.isArray(this.children)) this.children = [this.children]
    // 处理标签属性
    this.setProps()
    // 处理标签子节点
    setNodeChildren(this, this.children)
  }

  mount() {
    this.parentVNode?.getRNode().appendChild(this.getRNode())
  }

  replaceWith(node: ChildVNode) {
    if (node instanceof FragmentVNode) {
      this.parentVNode?.getRNode().insertBefore(node.getRNode(), this.getRNode())
      this.getRNode().replaceWith(node.pivot.getRNode())
    } else if (node instanceof ComponentVNode) {
      let ef = node.getComponent().getEFVNode()
      if (ef instanceof FragmentVNode) {
        this.parentVNode?.getRNode().insertBefore(node.getRNode(), this.getRNode())
        this.getRNode().replaceWith(ef.pivot.getRNode())
      } else {
        this.parentVNode?.getRNode().replaceChild(node.getRNode(), this.getRNode())
      }
    }
    else {
      if (this.parentVNode) {
        let children = Array.from(this.parentVNode.getRNode().children)
        if (children.includes(this.getRNode())) {
          this.parentVNode.getRNode().replaceChild(node.getRNode(), this.getRNode())
        }
      }
    }
  }

  remove() {
    this.ele?.remove()
  }

}


/**
 * 处理原生标签的属性绑定 
*/

export function setElementProp(ele: HTMLElement, prop: string, value: string | Record<string, string> | Function) {
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


