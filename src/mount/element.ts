import { App } from "../app"
import { watchProp } from "../reactive"
import { isActiver, isOnEvent, isFunction, isObject } from "../utils"
import {VElement, VNodeElement} from "../vnode"
import { mountChildren } from "./mount"
import { patchElementProp } from "./patch"



export function mountElement(vnode: VElement, container: HTMLElement, anchor?: VNodeElement, app?: App) {
  const el = document.createElement(vnode.type)
  vnode.el = el
  mountElementProps(vnode)
  mountChildren(vnode.children, el, undefined, app)
  container.insertBefore(el, anchor!)
}

export function unmountElement(vnode: VElement, container: HTMLElement) {
  vnode.el.remove()
}

export function mountElementProps(vnode: VElement) {
  let el = vnode.el
  let props = vnode.props

  // 处理标签属性
  for (let prop in props) {
    let value = props[prop]
    if (isActiver(value)) {
      let firstValue = watchProp(value, (oldValue, newValue) => patchElementProp(oldValue, newValue, el, prop))
      setElementProp(el, prop, firstValue)
    } else {
      setElementProp(el, prop, value)
    }
  }
}

/**
 * 处理单个dom属性
*/
export function setElementProp(el: HTMLElement, prop: string, value: any) {
  if (isOnEvent(prop) && isFunction(value)) {
    let pattern = /^on(.+)$/
    let result = prop.match(pattern)
    result && el.addEventListener(result[1].toLocaleLowerCase(), value.bind(el))
    return
  }

  switch (prop) {
    case 'className':
      el.className = String(value)
      break
    case 'style':
      if (isObject(value)) {
        value = mergeStyle(value)
      }
    default:
      el.setAttribute(prop, value)
  }
}

/**
 * 将对象形式的style转化为字符串
*/
export function mergeStyle(style: Record<any, any>): string {
  let styleStringList = []
  for (let cssAttr in style) {
    styleStringList.push(`${cssAttr}:${style[cssAttr]};`)
  }
  return styleStringList.join('')
}
