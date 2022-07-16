import { ComponentVNode, ElementVNode } from "./vnode";
import { SubComponent } from "./vnode/type";
import { DataProxy } from './proxy'
import { createNode, SubConstructor } from "./utils";

/**
 * 根组件
*/

interface Config {
  data?: {
    [key: string | symbol]: any
  },
}

export abstract class Component {

  // 组件配置
  private config: Config
  // 组件响应式数据
  public data: Record<any, any>
  // 组件属性
  props?: Record<any, any>
  // 组件子元素
  children?: any[]
  // 组件挂载的根虚拟节点
  elementVNode?: ElementVNode
  // 类组件标识符
  classComponent!: boolean;

  constructor(config: Config = {}) {
    this.config = config
    // 设置响应式数据对象
    this.data = new DataProxy(this.config.data || {}).getData()
  }

  setProps(props: {}) {
    this.props = props
  }

  setChildren(children: any[]) {
    this.children = children
  }

  abstract render(h: (nodeTag: string | SubConstructor, props?: Record<any, any>, children?: any[]) => ElementVNode | ComponentVNode): ElementVNode

  renderRoot(): ElementVNode {
    return this.elementVNode = this.render(createNode)
  }

  getElementVNode(): ElementVNode {
    return this.elementVNode!
  }
}

Component.prototype.classComponent = true

/**
 * 解决函数式组件的类
*/
export class FunComponent extends Component implements SubComponent {
  renderFun?: (props?: Record<any, any>, children?: any[]) => ElementVNode
  setRenderFun(fun: (props?: Record<any, any>, children?: any[]) => ElementVNode) {
    this.renderFun = fun
  }

  constructor() {
    super()
  }

  render(): ElementVNode {
    return this.renderFun!.call(this, this.props, this.children)
  }
}








