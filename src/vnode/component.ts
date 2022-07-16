import { Component } from "../component"
import { getDepProps } from "../application"
import { DataProxy } from "../proxy"
import { Watcher } from "../value"
import { VNode } from "./baseNode"
import { RBaseChildVNode, SubComponent } from "./type"
import { ElementVNode } from "./element"



/**
 * 组件节点
*/
interface SubComponentConstructor {
  new(props: Record<any, any>, children: any[]): SubComponent
}
type FunComponent = (props: Record<any, any>, children: any[]) => RBaseChildVNode
type ComponentConstructor = SubComponentConstructor | FunComponent

export class ComponentVNode extends VNode {
  type: number = VNode.COMPONENT
  component?: SubComponent | RBaseChildVNode
  Constructor: ComponentConstructor
  props?: Record<any, any>
  children?: any[]
  constructor(Constructor: ComponentConstructor, props?: Record<any, any>, children?: any[]) {
    super()
    this.Constructor = Constructor
    this.props = props || {}
    if (Array.isArray(children)) {
      this.children = children
    } else {
      if (children !== undefined && children !== null) {
        this.children = [children]
      } else {
        this.children = []
      }
    }

    // 在初始化内部一定不要调用init
  }

  init() {
    // 处理自定义组件的属性
    let props: Record<any, any> = new DataProxy({}).getData()
    for (let prop in this.props) {
      // 如果属性不为函数则不需要设置响应式
      if (typeof this.props[prop] !== 'function') {
        props[prop] = this.props[prop]
        continue
      }

      let [depProps, result] = getDepProps(this.props[prop])

      if (typeof result === 'function') {
        props[prop] = result
      } else {
        props[prop] = result
        let fn = () => props[prop] = this.props![prop]()
        depProps.forEach(item => {
          item.setDep(new Watcher(fn))
        })
      }
    }

    let children = new DataProxy<any[]>([]).getData()
    if (this.children) {
      for (let i = 0; i < this.children.length; i++) {
        if (typeof this.children[i] !== 'function') {
          children[i] = this.children[i]
          continue
        }

        let [depProps, result] = getDepProps(this.children[i])

        if (typeof result === 'function') {
          children[i] = result
        } else {
          children[i] = result
          let fn = () => children[i] = this.children![i]()

          depProps.forEach(item => {
            item.setDep(new Watcher(fn))
          })

        }



      }
    }

    let Constructor = this.Constructor
    if (Constructor.prototype) {
      this.component = new (Constructor as SubComponentConstructor)(props, children)
    } else {
      this.component = (Constructor as FunComponent)(props, children)
    }

    if (this.component instanceof Component) {
      this.component.setProps(props)
      this.component.setChildren(children)
    }


  }

  getComponent(): SubComponent | RBaseChildVNode {
    this.init()
    return this.component!
  }


  getRVnode(): HTMLElement {
    if (this.component instanceof Component) {
      return this.component.getElementVNode().getRVnode()
    } else if (this.component instanceof ElementVNode) {
      return this.component.getRVnode()
    } else {
      throw new Error('组件初始化')
    }
  }


}