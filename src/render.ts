import { active } from "./reactive/active";
import { Activer } from './reactive'
import { isString, isFragment, isText, isFunction, isArrayNode, isOnEvent, isVNode, isActiver, isArray } from "./utils";
import { Component } from "./vnode/component";
import { VNode, VNODE_TYPE } from "./vnode/vnode";
import { ArraySymbol } from "./vnode/array";
import { AliveSymbol } from "./vnode/alive";
import { TextSymbol } from './vnode/text'
import { FragmentSymbol } from "./vnode/fragment";

/**
 * 传说中的render函数
*/
export type ComponentConstructor = (new () => Component) | ((props: Record<string, any>, children: Array<VNode>) => Child)
export type H = (type: string | symbol | ComponentConstructor, props?: Record<string, any> | null, mayChildren?: Child | Array<Child>) => VNode
// 未经过标准化的children类型
export type Child = (() => Child) | string | VNode | Array<Child> | Activer | Exclude<(() => Child) | string | VNode | Array<Child> | Activer, any>

/**
 * 函数转化为activer转化为VAlive
 * activer转化为VAlive
 * string转化为VText
 * 数组转化为VArray
 * 其他转化为VText
*/
export function standarVNode(node: Child): VNode {
  if (isVNode(node)) return node

  if (isFunction(node)) return renderAlive(active(node))
  else if (isActiver(node)) return renderAlive(node)
  else if (isString(node)) return renderText(node)
  else if (isArray(node)) return renderArrayNode(node.map(item => standarVNode(item)))
  else {
    let value = node
    let retText: VNode
    if (!value && typeof value !== 'number') retText = renderText('')
    else retText = renderText(String(value))
    return retText
  }
}


/**
 * text(不需要props)、fragment(不需要props)、element、component为显性创建
 * array(不需要props)、alive(不需要props)为隐形创建
*/
export function render(type: string | symbol | ComponentConstructor, props?: Record<string, any> | null, mayChildren?: Child | Array<Child>): VNode {
  // text的children比较特殊先处理
  if (isText(type)) {
    return renderText(String(mayChildren))
  }

  let children: Array<Child>
  // 预处理 处理为单个的children
  if (isArray(mayChildren)) children = mayChildren
  else children = [mayChildren as Child]

  let standardChildren: Array<VNode> = children.map(child => standarVNode(child))

  // 属性预处理
  if (props) {
    for (const prop in props) {
      // 以on开头的事件不需要处理
      if (!isOnEvent(prop) && isFunction(props[prop])) {
        props[prop] = active(props[prop])
      }
    }
  }

  if (isString(type)) return renderElement(type, props || {}, standardChildren)
  if (isFragment(type)) return renderFragment(standardChildren)
  if (isArrayNode(type)) return renderArrayNode(standardChildren)
  if (isFunction(type)) return renderComponent(type, props || {}, standardChildren)
  throw '传入参数不合法'
}

function renderText(text: string): VNode {
  return {
    type: TextSymbol,
    flag: VNODE_TYPE.TEXT,
    children: text
  }
}

function renderElement(tag: string, props: Record<string, any>, children: Array<VNode>): VNode {
  return {
    type: tag,
    flag: VNODE_TYPE.ELEMENT,
    props,
    children
  }
}

function renderFragment(children: Array<VNode>): VNode {
  return {
    type: FragmentSymbol,
    flag: VNODE_TYPE.FRAGMENT,
    children
  }
}

function renderArrayNode(children: Array<VNode>): VNode {
  return {
    type: ArraySymbol,
    flag: VNODE_TYPE.ARRAYNODE,
    children
  }
}


// 判断是普通函数还是构造函数
function renderComponent(component: ComponentConstructor, props: Record<string, any>, children: Array<VNode>): VNode {
  let cprops: Record<string, any> = {}
  for (let prop in props) {
    let cur = props[prop]
    if (isActiver(cur)) {
      Object.defineProperty(cprops, prop, {
        get() {
          return (<Activer>cur).value
        }
      })
    } else {
      cprops[prop] = cur
    }
  }

  if (component.prototype && component.prototype.render && isFunction(component.prototype.render)) {
    let Constructor = component as new () => Component
    let result = new Constructor()
    result.props = cprops
    result.children = children
    return standarVNode(result.render(render))
  } else {
    let Fun = component as (props: Record<string, any>, children: Array<VNode>) => Child
    return standarVNode(Fun(cprops, children))
  }
}


function renderAlive(activer: Activer): VNode {
  return {
    type: AliveSymbol,
    flag: VNODE_TYPE.ALIVE,
    activer
  }
}
