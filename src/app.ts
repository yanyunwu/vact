import { mount } from "./mount/mount";
import { VNode } from "./vnode";
import {isString} from "./utils";
import {  AppPlugin, appUtils } from './plugin'

export interface Options {
  arrayDiff?: boolean
}

export class App {
  rootVNode: VNode
  options: Options

  private pluginList: Array<AppPlugin>

  constructor(vNode: VNode, options?: Options) {
    this.rootVNode = vNode
    this.options = options || {}
    this.pluginList = []
  }

  mount(selector?: string | HTMLElement): void {
    if(selector) {
      const el =  (isString(selector) ? document.querySelector(selector) : selector) || document.body
      mount(this.rootVNode, el as HTMLElement, undefined, this)
    }else {
      mount(this.rootVNode, document.body, undefined, this)
    }

    // let container = document.createElement('div')
    // mount(this.rootVNode, container, undefined, this)
    // el?.replaceWith(...container.childNodes)
  }

  use(plugin: AppPlugin) {
    let index = this.pluginList.indexOf(plugin)
    if(index > -1) return this

    plugin.install({utils: appUtils})
    return this
  }
}

export function createApp(vNode: VNode, options?: Options): App {
  return new App(vNode, options)
}

