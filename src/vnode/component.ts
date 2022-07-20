import { FunComponent } from "../component"
import { getDepProps } from "../application"
import { DataProxy } from "../proxy"
import { Watcher } from "../value"
import { VNode } from "./baseNode"
import { SubComponent } from "./type"
import { ElementVNode } from "./element"
import { BaseChildVNode, ChildVNode } from "../children"
import { FragmentVNode } from "./fragment"
import { SlotVNode } from "./slot"

/**
 * 组件节点
*/
interface SubComponentConstructor {
  new(): SubComponent
}
type FunComponentType = (props?: Record<any, any>, children?: Record<string, SlotVNode>) => ElementVNode
type ComponentConstructor = SubComponentConstructor | FunComponentType

export class ComponentVNode extends VNode {
  type: number = VNode.COMPONENT
  component?: SubComponent
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

  setComponentProps(): Record<any, any> {
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

    return props
  }

  setComponentChildren(): Record<string, SlotVNode> {
    let children: BaseChildVNode[] = new DataProxy<any[]>([]).getData()
    if (this.children) {
      for (let i = 0; i < this.children.length; i++) {
        if (typeof this.children[i] !== 'function') {
          children[i] = this.children[i]
          continue
        }

        let [depProps, result] = getDepProps<BaseChildVNode>(this.children[i])
        children[i] = result
        let fn = () => children[i] = this.children![i]()
        depProps.forEach(item => {
          item.setDep(new Watcher(fn))
        })

      }
    }
    return {
      default: new SlotVNode(children)
    }
  }

  getComponent(): SubComponent {
    return this.component!
  }


  getRNode(): HTMLElement {
    // if (this.component instanceof Component) {
    //   return this.component.getEFVNode().getRNode()
    // } else if (this.component instanceof ElementVNode) {
    //   return this.component.getRNode()
    // } else {
    //   throw new Error('组件初始化')
    // }
    return this.component!.getEFVNode().getRNode()
  }

  // 创建并初始化真实节点
  createRNode(): void {
    if (this.component) return // 如果已经初始化过则不要再初始化
    let Constructor = this.Constructor
    if (Constructor.prototype && Constructor.prototype.classComponent) {
      this.component = new (Constructor as SubComponentConstructor)()
    } else {
      let funComponent = new FunComponent()
      funComponent.setRenderFun(Constructor as FunComponentType)
      this.component = funComponent
    }

    this.component.setProps(this.setComponentProps())
    this.component.setChildren(this.setComponentChildren())

    let ef = this.component.createEFVNode()
    // 先设置父元素
    ef.setParentVNode(this.parentVNode)
    ef.createRNode()
  }

  mount() {
    this.getComponent().getEFVNode().mount()
  }

  replaceWith(node: ChildVNode) {
    let ef = this.getComponent().getEFVNode()
    ef.replaceWith(node)
  }

  remove() {
    let ef = this.component?.getEFVNode()
    if (ef instanceof ElementVNode) {
      ef.remove()
    } else if (ef instanceof FragmentVNode) {
      ef.remove()
    }
  }
}


