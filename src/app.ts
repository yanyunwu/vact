import { mount } from "./runtime/mount";
import { VNode } from "./vnode";
import {isString, isFunction} from "./utils";
import { AppPluginType, appUtils } from './plugin'
import {OrderHandler, OrderMap, registerOrder, renderWithOrder} from './directive/directive'
import {orderClassName} from "./directive/preset/className";

export interface Options {
  arrayDiff?: boolean
}

export class App {
  rootVNode: VNode
  options: Options

  private pluginList: Array<AppPluginType>
  orderMap:OrderMap

  constructor(vNode: VNode, options?: Options) {
    this.rootVNode = vNode
    this.options = options || {}
    this.pluginList = []
    this.orderMap = {}
    this._init()
  }

  private _init() {
    orderClassName(this)
  }

  mount(selector?: string | HTMLElement): void {
    if(selector) {
      const el =  (isString(selector) ? document.querySelector(selector) : selector) || document.body
      mount(renderWithOrder(this.rootVNode, this), el as HTMLElement, undefined, this)
    }else {
      mount(renderWithOrder(this.rootVNode, this), document.body, undefined, this)
    }

    // let container = document.createElement('div')
    // runtime(this.rootVNode, container, undefined, this)
    // el?.replaceWith(...container.childNodes)
  }

  use(plugin: AppPluginType) {
    let index = this.pluginList.indexOf(plugin)
    if(index > -1) return this

    const ctx = {app: this, utils: appUtils}

    if (isFunction(plugin)) {
      plugin(ctx)
    } else {
      plugin.install(ctx)
    }
    this.pluginList.push(plugin)
    return this
  }

  order(propName: string, handler: OrderHandler, priority?: number) {
    registerOrder.call(this, propName, handler, priority)
    return this
  }
}

export function createApp(vNode: VNode, options?: Options): App {
  return new App(vNode, options)
}

