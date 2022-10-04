import { patch } from "./patch";
import { watchVNode } from "../reactive";
import { App } from "../app";
import {
  VAlive,
  VArrayNode,
  VComponent,
  VFragment,
  VNodeElement,
  VText
} from "../vnode";
import { VNode } from "../vnode";
import { mountElement, unmountElement } from "./element";
import {
  isVAliveNode,
  isVArrayNode,
  isVComponentNode,
  isVElementNode,
  isVFragmentNode,
  isVTextNode
} from "../utils";


export function mount(vNode: VNode, container: HTMLElement, anchor?: VNodeElement, app?: App) {
  if (isVElementNode(vNode)) {
    mountElement(vNode, container, anchor, app)
  } else if (isVTextNode(vNode)) {
    mountText(vNode, container, anchor)
  } else if (isVFragmentNode(vNode)) {
    mountFragment(vNode, container, anchor, app)
  } else if (isVArrayNode(vNode)) {
    mountArrayNode(vNode, container, anchor, app)
  } else if (isVComponentNode(vNode)) {
    mountComponent(vNode, container, anchor, app)
  } else if (isVAliveNode(vNode)) {
    mountAlive(vNode, container, anchor, app)
  } else {
    throw '传入的节点不合法！'
  }
}

export function unmount(vNode: VNode, container: HTMLElement) {
  if (isVElementNode(vNode)) {
    unmountElement(vNode, container)
  } else if (isVTextNode(vNode)) {
    unmountText(vNode, container)
  } else if (isVFragmentNode(vNode)) {
    unmountFragment(vNode, container)
  } else if (isVArrayNode(vNode)) {
    unmountArrayNode(vNode, container)
  } else if (isVComponentNode(vNode)) {
    unmountComponent(vNode, container)
  } else {
    throw '传入的节点不合法！'
  }
}

export function mountChildren(children: Array<VNode>, container: HTMLElement, anchor?: VNodeElement, app?: App) {
  children.forEach(child => mount(child, container, anchor, app))
}

export function mountText(vNode: VText, container: HTMLElement, anchor?: VNodeElement) {
  const el = document.createTextNode(vNode.children)
  vNode.el = el
  container.insertBefore(el, anchor!)
}

export function unmountText(vNode: VText, container: HTMLElement) {
  vNode.el.remove()
}

export function mountFragment(vNode: VFragment, container: HTMLElement, anchor?: VNodeElement, app?: App) {
  const start = document.createTextNode('')
  const end = document.createTextNode('')
  vNode.anchor = start
  vNode.el = end
  container.insertBefore(start, anchor!)
  mountChildren(vNode.children, container, anchor, app)
  container.insertBefore(end, anchor!)
}

export function unmountFragment(vNode: VFragment, container: HTMLElement) {
  const start = vNode.anchor
  const end = vNode.el
  let cur: ChildNode | null = start
  while (cur && cur !== end) {
    let next: ChildNode | null = cur.nextSibling
    cur.remove()
    cur = next
  }
  end.remove()
}

export function mountArrayNode(vNode: VArrayNode, container: HTMLElement, anchor?: VNodeElement, app?: App) {
  const start = document.createTextNode('')
  const end = document.createTextNode('')
  vNode.anchor = start
  vNode.el = end
  container.insertBefore(start, anchor!)
  mountChildren(vNode.children, container, anchor, app)
  container.insertBefore(end, anchor!)
}

export function unmountArrayNode(vNode: VArrayNode, container: HTMLElement, anchor?: HTMLElement) {
  const start = vNode.anchor
  const end = vNode.el
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
  vNode.lifeStyleInstance.emit('readyMounted')
  mount(root, container, anchor, app)
  vNode.lifeStyleInstance.emit('mounted')
}

export function unmountComponent(vNode: VComponent, container: HTMLElement) {
  vNode.lifeStyleInstance.emit('beforeUnMounted')
  unmount(vNode.root, container)
  vNode.lifeStyleInstance.emit('unMounted')
}

export function mountAlive(vNode: VAlive, container: HTMLElement, anchor?: VNodeElement, app?: App) {
  let firstVNode = watchVNode(vNode, (oldVNode, newVNode) => patch(oldVNode, newVNode, container, app), app!)
  vNode.vnode = firstVNode
  mount(firstVNode, container, anchor, app)
}
