import { Vact } from "../application"
import { Component } from "../component"
import { PropValue, Watcher } from "../value"
import { VNode } from "./baseNode"
import { ComponentVNode } from "./component"
import { TextVNode } from "./text"
import { BaseElementVNodeChild, ElementVNodeChild } from "./type"

export class ElementVNode extends VNode {
  static nativeEvents: { [key: string]: any } = {
    onClick: 'click',
  }

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

  createEle() {
    this.ele = document.createElement(this.tag)

    // 处理标签属性
    if (this.props) {
      for (let prop in this.props) {
        // 如果是函数要先看函数的返回值 不然直接设置属性
        if (typeof this.props[prop] === 'function') {
          let depProps: PropValue[] = []
          let pool = Vact.depPool
          pool.push(depProps)
          let result = this.props[prop]()
          pool.splice(pool.indexOf(depProps), 1)

          if (typeof result === 'function') {
            let pattern = /^on([a-zA-Z]+)/
            if (pattern.test(prop)) {
              let mat = prop.match(pattern)
              mat && this.ele.addEventListener(mat[1].toLocaleLowerCase(), result.bind(this.ele))
            } else {
              this.ele.addEventListener(prop, result.bind(this.ele))
            }
          } else if (prop === 'style' && typeof result === 'object') {
            let fn = () => {
              let styleObj = this.props![prop]()

              let styleList = []
              for (let i in styleObj) {
                styleList.push(`${i}:${styleObj[i]};`)
              }
              this.ele?.setAttribute(prop, styleList.join(''))
            }

            fn()

            depProps.forEach(item => {
              item.setDep(new Watcher(fn))
            })


          } else if (prop === 'className') {

            this.ele.className = result
            let fn = () => this.ele!.className = this.props![prop]()
            depProps.forEach(item => {
              item.setDep(new Watcher(fn))
            })

          } else {
            this.ele?.setAttribute(prop, result)
            let fn = () => this.ele?.setAttribute(prop, this.props![prop]())
            depProps.forEach(item => {
              item.setDep(new Watcher(fn))
            })
          }
        } else {
          if (prop === 'className') {
            this.ele.className = this.props[prop]
          } else {
            this.ele.setAttribute(prop, this.props[prop])
          }
        }

      }
    }

    // 处理标签子节点
    if (Array.isArray(this.children) && this.children.length) {
      for (let child of this.children) {
        this.addChild(child)
      }
    } else if (this.children !== undefined && this.children !== null) {
      this.addChild(this.children)
    }

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
}