import { getDepProps } from "../application"
import { ChildVNode, RBaseChildVNode, replaceNode, setNodeChildren, standardNode } from "../children"
import { PropValue, Watcher } from "../value"
import { VNode } from "./baseNode"
import { ComponentVNode } from "./component"
import { FragmentVNode } from "./fragment"
import { TextVNode } from "./text"
// import { BaseChildVNode, RBaseChildVNode, ChildVNode } from "./type"

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
    /* if (!this.ele || this.children === undefined || this.children === null) return
    if (!Array.isArray(this.children)) this.children = [this.children]

    for (let child of this.children) {
      // 如果是函数要先看函数的返回值 不然直接添加
      if (typeof child !== 'function') {
        setElementChild(this.ele, initVNodeWithList(child, this))
        continue
      }

      let [depProps, result] = getDepProps(child)

      if (Array.isArray(result)) {
        let pivot = initVNode('');
        setElementChild(this.ele, pivot)
        let curNodeList = initVNodeWithList(result, this) as ChildVNode[]
        addFragmentEle(this.ele, curNodeList, pivot as TextVNode)
        let fn = () => {
          removeFragmentEle(curNodeList)
          let newVnodeList = (child as Function)()
          if (Array.isArray(newVnodeList)) {
            curNodeList = initVNodeWithList(newVnodeList, this) as ChildVNode[]
            addFragmentEle(this.ele!, curNodeList, pivot as TextVNode)
          }
        }
        depProps.forEach(propValue => propValue.setDep(new Watcher(fn)))
      } else {
        let curNode = initVNode(result, this)
        setElementChild(this.ele, curNode)
        let fn = () => {
          let newNode = (child as () => BaseChildVNode)()
          curNode = replaceElementChild(this.ele!, initVNode(newNode, this), curNode)
        }
        depProps.forEach(propValue => propValue.setDep(new Watcher(fn)))
      }
    } */
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

  // setDeps(propValues: Array<PropValue>, fn: Function): void {
  //   this.propValues = propValues
  //   this.fn = fn
  // }

  // // 绑定节点的依赖
  // bindDeps(): void {
  //   if (this.propValues && this.fn) {
  //     let fn = () => replaceNode(standardNode(this.fn!()), this)
  //     let watcher = new Watcher(fn)
  //     this.propValues.forEach(propValue => propValue.setDep(watcher))
  //   }
  // }

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

/**
 * 处理子节点的添加
*/

// export function setElementChild(ele: HTMLElement, childNode: ChildVNode | Array<ChildVNode>) {
//   if (Array.isArray(childNode)) {
//     childNode.forEach(subChildNode => {
//       ele.appendChild(subChildNode.getRNode())
//       if (subChildNode instanceof FragmentVNode) {
//         ele.appendChild(subChildNode.getPivot().getRNode())
//       }
//       if (childNode instanceof ComponentVNode) {
//         let ef = childNode.getComponent().getEFVNode()
//         if (ef instanceof FragmentVNode) {
//           ele.appendChild(ef.getPivot().getRNode())
//         }
//       }
//     })
//   } else {
//     ele.appendChild(childNode.getRNode())
//     if (childNode instanceof FragmentVNode) {
//       ele.appendChild(childNode.getPivot().getRNode())
//     }

//     if (childNode instanceof ComponentVNode) {
//       let ef = childNode.getComponent().getEFVNode()
//       if (ef instanceof FragmentVNode) {
//         ele.appendChild(ef.getPivot().getRNode())
//       }
//     }
//   }
// }

// 初始化虚拟节点，并生成真实节点
// export function initVNode(baseNode: BaseChildVNode, parent?: ElementVNode | FragmentVNode): ChildVNode {
//   // 如果是普通的文本字符串
//   if (typeof baseNode === "string") {
//     let textNode = new TextVNode(baseNode)
//     textNode.setParentVNode(parent)
//     textNode.createTextNode()
//     return textNode
//   } else if (baseNode instanceof ComponentVNode) { // render可能返回ElementVNode 也可能返回 ComponentVNode
//     let ef = baseNode.createComponent().createEFVNode()
//     if (ef instanceof ElementVNode) ef.createEle()
//     else ef.createFragment()
//     ef.setParentVNode(parent)
//     baseNode.setParentVNode(parent)
//     return baseNode
//   } else if (baseNode instanceof ElementVNode) {  // 如果是元素节点
//     baseNode.createEle()
//     baseNode.setParentVNode(parent)
//     return baseNode
//   } else if (baseNode instanceof FragmentVNode) {
//     baseNode.createFragment()
//     baseNode.setParentVNode(parent)
//     return baseNode
//   } else {
//     // 特殊处理 为null则不渲染返回空节点
//     if (baseNode === null) baseNode = ''
//     let textNode = new TextVNode(String(baseNode))
//     textNode.setParentVNode(parent)
//     textNode.createTextNode()
//     return textNode
//   }
// }

// export function initVNodeWithList(baseNode: BaseChildVNode | Array<BaseChildVNode>, parent?: ElementVNode | FragmentVNode): ChildVNode | Array<ChildVNode> {
//   if (Array.isArray(baseNode)) {
//     return baseNode.map(item => initVNode(item, parent))
//   } else {
//     return initVNode(baseNode, parent)
//   }
// }

/**
 * 替换并返回现在的节点
*/
// export function replaceElementChild(ele: HTMLElement, newNode: ChildVNode, oldNode: ChildVNode): ChildVNode {
//   if (newNode instanceof TextVNode && oldNode instanceof TextVNode) {
//     oldNode.getRNode().nodeValue = newNode.getRNode().nodeValue
//     return oldNode
//   }

//   let newEXNode: ElementVNode | FragmentVNode | TextVNode
//   let oldEXNode: ElementVNode | FragmentVNode | TextVNode

//   if (newNode instanceof ComponentVNode) newEXNode = newNode.getComponent().getEFVNode()
//   else newEXNode = newNode
//   if (oldNode instanceof ComponentVNode) oldEXNode = oldNode.getComponent().getEFVNode()
//   else oldEXNode = oldNode

//   if (oldEXNode instanceof FragmentVNode) {
//     return replaceToFragmentVNode(ele, newEXNode, oldEXNode)
//   }

//   if (newEXNode instanceof FragmentVNode) {
//     return replacedByFragmentVNode(ele, newEXNode, oldEXNode)
//   }

//   ele.replaceChild(newNode.getRNode(), oldNode.getRNode())
//   return newNode
// }

// 替换为FragmentVNode时
// function replaceToFragmentVNode(ele: HTMLElement, newNode: ChildVNode, oldNode: FragmentVNode): ChildVNode {
//   let pivot = oldNode.getPivot()
//   removeFragmentNode(oldNode)
//   ele.insertBefore(newNode.getRNode(), pivot.getRNode())
//   if (newNode instanceof FragmentVNode) {
//     if (newNode === oldNode) {
//       // 待续
//     } else {
//       pivot.getRNode().replaceWith(newNode.getPivot().getRNode())
//     }
//   } else {
//     pivot.getRNode().remove()
//   }
//   return newNode
// }
// 被替换为FragmentVNode时
// function replacedByFragmentVNode(ele: HTMLElement, newNode: FragmentVNode, oldNode: ChildVNode): FragmentVNode {
//   let pivot = newNode.getPivot()
//   oldNode.getRNode().replaceWith(pivot.getRNode())
//   ele.insertBefore(newNode.getRNode(), pivot.getRNode())
//   return newNode
// }

// 移除Fragment节点
// function removeFragmentNode(node: FragmentVNode) {
//   node.VNodeChildren.forEach(child => {
//     if (child instanceof FragmentVNode) {
//       removeFragmentNode(child)
//     } else if (Array.isArray(child)) {
//       removeFragmentEle(child)
//     } else {
//       child.getRNode().remove()
//     }
//   })
// }


// export function addFragmentEle(ele: HTMLElement, childNodes: ChildVNode[], pivot?: TextVNode) {
//   let fragment = document.createDocumentFragment()
//   childNodes.forEach(child => fragment.appendChild(child.getRNode()))
//   if (pivot) ele.insertBefore(fragment, pivot.getRNode())
//   else ele.appendChild(fragment)
// }

// export function removeFragmentEle(childNodes: ChildVNode[]) {
//   childNodes.forEach(child => child.getRNode().remove())
// }


