import { patch } from "./patch";
import { Activer } from "./reactive/active";
import { watchVNode } from "./reactive/watch";
import { render } from "./render";
import { isActiver, isVNode } from "./utils";
import { VArrayNode } from "./vnode/array";
import { VElement } from "./vnode/element";
import { VFragment } from "./vnode/fragment";
import { Text, VText } from './vnode/text'
import { VNode, VNODE_TYPE } from "./vnode/vnode";


export function mount(vnode: VNode, container: HTMLElement, anchor?: HTMLElement) {
  if (vnode.flag === VNODE_TYPE.ELEMENT) {
    mountElement(vnode as VElement, container, anchor)
  } else if (vnode.flag === VNODE_TYPE.TEXT) {
    mountText(vnode as VText, container, anchor)
  } else if (vnode.flag === VNODE_TYPE.Fragment) {
    mountFragment(vnode as VFragment, container, anchor)
  } else if (vnode.flag === VNODE_TYPE.ArrayNode) {
    mountArrayNode(vnode as VArrayNode, container, anchor)
  }
}

export function unmount(vnode: VNode, container: HTMLElement) {
  if (vnode.flag === VNODE_TYPE.ELEMENT) {
    unmountElement(vnode as VElement, container)
  } else if (vnode.flag === VNODE_TYPE.TEXT) {
    unmountText(vnode as VText, container)
  } else if (vnode.flag === VNODE_TYPE.Fragment) {
    unmountFragment(vnode as VFragment, container)
  } else if (vnode.flag === VNODE_TYPE.ArrayNode) {
    unmountArrayNode(vnode as VArrayNode, container)
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