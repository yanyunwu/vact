import { Component } from './component';
import { PropValue } from './value';
// import { ElementVNode, SubComponent, ComponentVNode } from './vnode'
import { ElementVNode, ComponentVNode } from './vnode'
import { SubComponent } from './vnode/type'

export function mount(selector: string, rootNode: Component | ComponentVNode) {
  let ele = document.querySelector(selector)
  let rootEle: HTMLElement | null = null
  if (rootNode instanceof Component) {
    rootEle = rootNode.renderRoot().createEle()
  } else {
    let component = rootNode.getComponent()
    if (component instanceof Component) rootEle = component.renderRoot().createEle()
    else if (component instanceof ElementVNode) rootEle = component.createEle()
  }
  if (ele && rootEle) {
    if (ele.parentNode) {
      ele.parentNode.replaceChild(rootEle, ele)
    }
  }
}

export type SubConstructor = new (props: Record<any, any>, children: any[]) => SubComponent
export function createNode(nodeTag: string | SubConstructor, props?: {}, children?: []): ElementVNode | ComponentVNode {
  if (typeof nodeTag === 'string') {
    return new ElementVNode(nodeTag, props, children)
  } else if (typeof nodeTag === 'function') {
    return new ComponentVNode(nodeTag, props, children)
  } else {
    throw new Error('只能传入字符串或者构造函数')
  }
}


export class Vact {
  static depPool: any[] = []
  static getDepPool(): any[] {
    return this.depPool
  }

  static Component = Component
  static mount = mount
  static createNode = createNode
}

export function setDeps() {

}

export function getDepProps<T>(fn: () => T): [PropValue[], T] {
  let depProps: PropValue[] = []
  let pool = Vact.depPool
  pool.push(depProps)
  let res = fn()
  pool.splice(pool.indexOf(depProps), 1)
  return [depProps, res]
}
