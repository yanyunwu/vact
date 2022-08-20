import { mount } from "./mount/mount";
import { VNode } from "./vnode/vnode";

export interface Options {
  arrayDiff?: boolean
}

export class Vact {
  rootVNode: VNode
  options: Options

  constructor(vnode: VNode, options?: Options) {
    this.rootVNode = vnode
    this.options = options || {}
  }

  mount(selector: string): void {
    const el = document.querySelector(selector)
    let container = document.createElement('div')
    mount(this.rootVNode, container, undefined, this)
    el?.replaceWith(...container.childNodes)
  }
}

export function createApp(vnode: VNode, options?: Options): Vact {
  return new Vact(vnode, options)
}

