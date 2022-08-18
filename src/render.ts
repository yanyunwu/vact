import { active } from "./reactive/active";
import { Activer } from './reactive'
import { isString, isFragment, isText, isFunction, isArrayNode, isOnEvent, isVNode, isActiver } from "./utils";
import { Component } from "./vnode/component";
import { VNode, VNODE_TYPE } from "./vnode/vnode";

/**
 * 传说中的render函数
*/
export type ComponentConstructor = new (props: Record<string, any>, children: Array<any> | string) => Component | VNode
export type H = (type: string | symbol | ComponentConstructor, props?: Record<string, any> | null, children?: Array<any> | string) => VNode
export function render(type: string | symbol | ComponentConstructor, props?: Record<string, any> | null, children?: Array<any> | string): VNode {

  // 预处理 处理为单个的children
  if (!isText(type) && !Array.isArray(children)) {
    children = [children]
  }

  // 子元素预处理 
  if (children && Array.isArray(children)) {
    children = children.map(child => isFunction(child) ? active(child) : child)
  }

  // 属性预处理
  if (props) {
    for (const prop in props) {
      // 以on开头的事件不需要处理
      if (!isOnEvent(prop) && isFunction(props[prop])) {
        props[prop] = active(props[prop])
      }
    }
  }

  let flag: VNODE_TYPE

  if (isString(type)) {
    flag = VNODE_TYPE.ELEMENT
  } else if (isFragment(type)) {
    flag = VNODE_TYPE.FRAGMENT
  } else if (isText(type)) {
    flag = VNODE_TYPE.TEXT
  } else if (isArrayNode(type)) {
    flag = VNODE_TYPE.ARRAYNODE
  } else if (isFunction(type)) {
    return renderComponent(type, props || {}, children as [] || [])
  } else {
    throw '传入参数不合法'
  }

  return {
    type: <string | symbol>type,
    props,
    children,
    flag
  }
}

// 判断是普通函数还是构造函数
function renderComponent(component: ComponentConstructor, props: Record<string, any>, children: Array<Activer | VNode | string>): VNode {
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


  let result = new component(cprops, children)
  if (isVNode(result)) {
    return result
  } else {
    result.props = cprops
    result.children = children
    return {
      type: result,
      props,
      children,
      flag: VNODE_TYPE.COMPONENT
    }
  }
}