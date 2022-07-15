import { Component } from "../component"
import { Vact } from "../application"
import { DataProxy } from "../proxy"
import { PropValue, Watcher } from "../value"
import { VNode } from "./baseNode"
import { ElementVNodeChild, SubComponent } from "./type"



/**
 * 组件节点
*/
interface SubComponentConstructor {
  new(props: Record<any, any>, children: any[]): SubComponent
}
type FunComponent = (props: Record<any, any>, children: any[]) => ElementVNodeChild
type ComponentConstructor = SubComponentConstructor | FunComponent

export class ComponentVNode extends VNode {
  type: number = VNode.COMPONENT
  component?: SubComponent | ElementVNodeChild
  Constructor: ComponentConstructor
  props?: Record<any, any>
  children?: any[]
  constructor(Constructor: ComponentConstructor, props?: Record<any, any>, children?: any[]) {
    super()
    this.Constructor = Constructor
    this.props = props || {}
    this.children = children || []

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

      let depProps: PropValue[] = []
      let pool = Vact.depPool
      pool.push(depProps)
      let result = this.props[prop]()
      pool.splice(pool.indexOf(depProps), 1)

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


        let depProps: PropValue[] = []
        let pool = Vact.depPool
        pool.push(depProps)
        let result = this.children[i]()
        pool.splice(pool.indexOf(depProps), 1)

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

  getComponent(): SubComponent | ElementVNodeChild {
    this.init()
    return this.component!
  }


}