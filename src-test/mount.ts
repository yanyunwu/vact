import { patch, patchElementProp } from "./patch";
import { Activer } from "./reactive/active";
import { watchProp, watchVNode } from "./reactive/watch";
import { render } from "./render";
import { isActiver, isFunction, isObject, isOnEvent, isVNode } from "./utils";
import { VArrayNode } from "./vnode/array";
import { VComponent } from "./vnode/component";
import { VElement } from "./vnode/element";
import { VFragment } from "./vnode/fragment";
import { Text, VText } from './vnode/text'
import { VNode, VNODE_TYPE } from "./vnode/vnode";


export function mount(vnode: VNode, container: HTMLElement, anchor?: HTMLElement) {
  switch (vnode.flag) {
    case VNODE_TYPE.ELEMENT:
      mountElement(vnode as VElement, container, anchor)
      break
    case VNODE_TYPE.TEXT:
      mountText(vnode as VText, container, anchor)
      break
    case VNODE_TYPE.Fragment:
      mountFragment(vnode as VFragment, container, anchor)
      break
    case VNODE_TYPE.ArrayNode:
      mountArrayNode(vnode as VArrayNode, container, anchor)
      break
  }
}

export function unmount(vnode: VNode, container: HTMLElement) {
  switch (vnode.flag) {
    case VNODE_TYPE.ELEMENT:
      unmountElement(vnode as VElement, container)
      break
    case VNODE_TYPE.TEXT:
      unmountText(vnode as VText, container)
      break
    case VNODE_TYPE.Fragment:
      unmountFragment(vnode as VFragment, container)
      break
    case VNODE_TYPE.ArrayNode:
      unmountArrayNode(vnode as VArrayNode, container)
      break
  }
}

export function mountChildren(children: Array<Activer | VNode | string>, container: HTMLElement, anchor?: HTMLElement) {
  children.forEach(child => {
    if (isActiver(child)) {
      let firstVNode = watchVNode(child, (oldVNode, newVNode) => patch(oldVNode, newVNode, container))
      mount(firstVNode, container, anchor)
    } else if (isVNode(child)) {
      mount(child, container, anchor)
    } else {
      mount(render(Text, null, String(child)), container, anchor)
    }
  })
}

export function mountElement(vnode: VElement, container: HTMLElement, anchor?: HTMLElement) {
  const el = document.createElement(vnode.type)
  vnode.el = el
  mountElementProps(vnode)
  mountChildren(vnode.children, el)
  container.insertBefore(el, anchor!)
}

export function unmountElement(vnode: VElement, container: HTMLElement) {
  vnode.el?.remove()
}

export function mountText(vnode: VText, container: HTMLElement, anchor?: HTMLElement) {
  const el = document.createTextNode(vnode.children)
  vnode.el = el
  container.insertBefore(el, anchor!)
}

export function unmountText(vnode: VText, container: HTMLElement) {
  vnode.el?.remove()
}

export function mountFragment(vnode: VFragment, container: HTMLElement, anchor?: HTMLElement) {
  const start = document.createTextNode('')
  const end = document.createTextNode('')
  vnode.anchor = start
  vnode.el = end
  container.insertBefore(start, anchor!)
  mountChildren(vnode.children, container, anchor)
  container.insertBefore(end, anchor!)
}

export function unmountFragment(vnode: VFragment, container: HTMLElement) {
  const start = vnode.anchor
  const end = vnode.el
  let cur: ChildNode | null = start
  while (cur && cur !== end) {
    let next: ChildNode | null = cur.nextSibling
    cur.remove()
    cur = next
  }
  end.remove()
}

export function mountArrayNode(vnode: VArrayNode, container: HTMLElement, anchor?: HTMLElement) {
  const start = document.createTextNode('')
  const end = document.createTextNode('')
  vnode.anchor = start
  vnode.el = end
  container.insertBefore(start, anchor!)
  mountChildren(vnode.children, container, anchor)
  container.insertBefore(end, anchor!)
}

export function unmountArrayNode(vnode: VArrayNode, container: HTMLElement, anchor?: HTMLElement) {
  const start = vnode.anchor
  const end = vnode.el
  let cur: ChildNode | null = start
  while (cur && cur !== end) {
    let next: ChildNode | null = cur.nextSibling
    cur.remove()
    cur = next
  }
  end.remove()
}


export function mountElementProps(vnode: VElement) {
  let el = vnode.el!
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
function mergeStyle(style: Record<any, any>): string {
  let styleStringList = []
  for (let cssAttr in style) {
    styleStringList.push(`${cssAttr}:${style[cssAttr]};`)
  }
  return styleStringList.join('')
}