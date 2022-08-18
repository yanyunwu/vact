import { mount } from "./mount";
import { VNode } from "./vnode/vnode";


export class Vact {
  rootVNode: VNode

  constructor(vnode: VNode, options?: Record<string, any>) {
    this.rootVNode = vnode
  }

  mount(selector: string): void {
    const el = document.querySelector(selector)
    let container = document.createElement('div')
    mount(this.rootVNode, container)
    el?.replaceWith(...container.childNodes)
  }
}

export function createApp(vnode: VNode, options?: Record<string, any>): Vact {
  return new Vact(vnode, options)
}

