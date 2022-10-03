import { mount } from "./mount/mount";
import { defineState, state } from "./reactive";
import { RefImpl } from "./reactive";
import { render } from "./render";
import { VNode } from "./vnode";
import { H } from './render'

export interface Options {
  arrayDiff?: boolean
}

export interface AppUtils {
  state<T extends unknown>(value: T): RefImpl<T>
  defineState<T extends Record<string | symbol, any>>(target: T): T
  h: H
}

export interface AppPlugin {
  install(utils: AppUtils): void
}

export class App {
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

  use(plugin: AppPlugin) {
    const utils: AppUtils = { state, defineState, h: render }
    plugin.install(utils)
    return this
  }
}

export function createApp(vnode: VNode, options?: Options): App {
  return new App(vnode, options)
}

