import { mount } from "./mount/mount";
import { defineState, state } from "./reactive";
import { RefImpl } from "./reactive/ref";
import { render } from "./render";
import { VNode } from "./vnode/vnode";
import { H } from './render'

export interface Options {
  arrayDiff?: boolean
}

export interface VactUtils {
  state<T extends unknown>(value: T): RefImpl<T>
  defineState<T extends Record<string | symbol, any>>(target: T): T
  h: H
}

export interface VactPlugin {
  install(utils: VactUtils): void
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

  use(plugin: VactPlugin) {
    const utils: VactUtils = { state, defineState, h: render }
    plugin.install(utils)
    return this
  }
}

export function createApp(vnode: VNode, options?: Options): Vact {
  return new Vact(vnode, options)
}

