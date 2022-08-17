import { unmount, mount, setElementProp } from "./mount";
import { VText } from "./vnode/text";
import { VNode, VNODE_TYPE } from "./vnode/vnode";

export function isSameVNode(oldVNode: VNode, newVNode: VNode): boolean {
  return oldVNode.flag === newVNode.flag
}

export function patch(oldVNode: VNode, newVNode: VNode, container: HTMLElement) {

  if (oldVNode === newVNode) return
  if (isSameVNode(oldVNode, newVNode)) {
    if (oldVNode.flag === VNODE_TYPE.TEXT) {
      let node = <VText>oldVNode
      let newNode = <VText>newVNode
      node.el!.nodeValue = newNode.children
      newNode.el = node.el
    } else {
      const nextSibling = oldVNode?.el?.nextSibling
      unmount(oldVNode, container)
      mount(newVNode, container, nextSibling as HTMLElement | undefined)
    }
  } else {
    const nextSibling = oldVNode?.el?.nextSibling
    unmount(oldVNode, container)
    mount(newVNode, container, nextSibling as HTMLElement | undefined)
  }

}

export function patchElement() {

}


export function patchText() {

}

export function patchArrayNode(oldVNode: VNode, newVNode: VNode) {

}


export function patchElementProp(oldValue: any, newValue: any, el: HTMLElement, prop: string) {
  setElementProp(el, prop, newValue)
}