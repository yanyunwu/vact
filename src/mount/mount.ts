import { patch } from "./patch";
import { watchVNode } from "../reactive";
import { App } from "../app";
import {
  VAlive,
  VArrayNode,
  VComponent,
  VElement,
  VFragment, VNodeElement,
  VText
} from "../vnode";
import { VNode, VNODE_TYPE } from "../vnode";
import { mountElement, unmountElement } from "./element";

export function mount(vnode: VNode, container: HTMLElement, anchor?: VNodeElement, app?: App) {
  switch (vnode.flag) {
    case VNODE_TYPE.ELEMENT:
      mountElement(vnode as VElement, container, anchor, app)
      break
    case VNODE_TYPE.TEXT:
      mountText(vnode as VText, container, anchor)
      break
    case VNODE_TYPE.FRAGMENT:
      mountFragment(vnode as VFragment, container, anchor, app)
      break
    case VNODE_TYPE.ARRAYNODE:
      mountArrayNode(vnode as VArrayNode, container, anchor, app)
      break
    case VNODE_TYPE.COMPONENT:
      mountComponent(vnode as VComponent, container, anchor, app)
      break
    case VNODE_TYPE.ALIVE:
      mountAlive(vnode as VAlive, container, anchor, app)
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
    case VNODE_TYPE.FRAGMENT:
      unmountFragment(vnode as VFragment, container)
      break
    case VNODE_TYPE.ARRAYNODE:
      unmountArrayNode(vnode as VArrayNode, container)
      break
    case VNODE_TYPE.COMPONENT:
      unmountComponent(vnode as VComponent, container)
      break
  }
}

export function mountChildren(children: Array<VNode>, container: HTMLElement, anchor?: VNodeElement, app?: App) {
  children.forEach(child => mount(child, container, anchor, app))
}

export function mountText(vnode: VText, container: HTMLElement, anchor?: VNodeElement) {
  const el = document.createTextNode(vnode.children)
  vnode.el = el
  container.insertBefore(el, anchor!)
}

export function unmountText(vnode: VText, container: HTMLElement) {
  vnode.el.remove()
}

export function mountFragment(vnode: VFragment, container: HTMLElement, anchor?: VNodeElement, app?: App) {
  const start = document.createTextNode('')
  const end = document.createTextNode('')
  vnode.anchor = start
  vnode.el = end
  container.insertBefore(start, anchor!)
  mountChildren(vnode.children, container, anchor, app)
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

export function mountArrayNode(vnode: VArrayNode, container: HTMLElement, anchor?: VNodeElement, app?: App) {
  const start = document.createTextNode('')
  const end = document.createTextNode('')
  vnode.anchor = start
  vnode.el = end
  container.insertBefore(start, anchor!)
  mountChildren(vnode.children, container, anchor, app)
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

export function mountComponent(vNode: VComponent, container: HTMLElement, anchor?: VNodeElement, app?: App) {
  const root = vNode.root
  mount(root, container, anchor, app)
}

export function unmountComponent(vNode: VComponent, container: HTMLElement) {
  unmount(vNode.root, container)
}

export function mountAlive(vnode: VAlive, container: HTMLElement, anchor?: VNodeElement, app?: App) {
  let firstVNode = watchVNode(vnode, (oldVNode, newVNode) => patch(oldVNode, newVNode, container, app))
  vnode.vnode = firstVNode
  mount(firstVNode, container, anchor, app)
}
