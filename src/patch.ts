import { unmount, mount, setElementProp } from "./mount";
import { VText } from "./vnode/text";
import { VNode, VNODE_TYPE } from "./vnode/vnode";

export function isSameVNode(oldVNode: VNode, newVNode: VNode): boolean {
  return oldVNode.flag === newVNode.flag
}

export function patch(oldVNode: VNode, newVNode: VNode, container: HTMLElement): void {

  // 如果两个节点引用一样不需要判断
  if (oldVNode === newVNode) return

  // 这里在判断相同类型的节点后可以做进一步优化
  if (isSameVNode(oldVNode, newVNode)) {
    if (oldVNode.flag === VNODE_TYPE.TEXT) {
      patchText(<VText>oldVNode, <VText>newVNode, container)
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


export function patchText(oldVNode: VText, newVNode: VText, container: HTMLElement) {
  oldVNode.el!.nodeValue = newVNode.children
  newVNode.el = oldVNode.el
}

export function patchArrayNode(oldVNode: VNode, newVNode: VNode) {

}


export function patchElementProp(oldValue: any, newValue: any, el: HTMLElement, prop: string) {
  setElementProp(el, prop, newValue)
}