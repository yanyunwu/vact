import Component from './component';
import { PropValue } from './value';
import { TextVNode, ElementVNode, SubComponent, ComponentVNode } from './vnode'

export function mount(selector: string, rootNode: Component) {
  let ele = document.querySelector(selector)
  let rootEle = rootNode.renderRoot().createEle()
  if (ele && rootEle) {
    if (ele.parentNode) {
      ele.parentNode.replaceChild(rootEle, ele)
    }
  }
}

export type SubConstructor = new (props: Record<any, any>, children: any[]) => SubComponent
export function createNode(a: string | SubConstructor, b?: {}, c?: []): ElementVNode | ComponentVNode {
  if (typeof a === 'string') {
    return new ElementVNode(a, b, c)
  } else if (typeof a === 'function') {
    return new ComponentVNode(a, b, c)
  } else {
    throw new Error('只能传入字符串或者构造函数')
  }
}


export class Vact {
  static depPool: any[] = []
}
