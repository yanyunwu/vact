import { unmount, mount, setElementProp } from "./mount";
import { VArrayNode } from "./vnode/array";
import { VText } from "./vnode/text";
import { VNode, VNODE_TYPE } from "./vnode/vnode";
import { Activer } from './reactive'

export function isSameVNode(oldVNode: VNode, newVNode: VNode): boolean {
  return oldVNode.flag === newVNode.flag
}

export function patch(oldVNode: VNode, newVNode: VNode, container: HTMLElement): void {

  // 如果两个节点引用一样不需要判断
  if (oldVNode === newVNode) return

  // 这里在判断相同类型的节点后可以做进一步优化
  if (isSameVNode(oldVNode, newVNode)) {
    let flag = oldVNode.flag = newVNode.flag

    if (flag === VNODE_TYPE.TEXT) {
      patchText(<VText>oldVNode, <VText>newVNode, container)
    } else if (flag === VNODE_TYPE.ARRAYNODE) {
      patchArrayNode(<VArrayNode>oldVNode, <VArrayNode>newVNode, container)
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

export function patchText(oldVNode: VText, newVNode: VText, container: HTMLElement) {
  oldVNode.el!.nodeValue = newVNode.children
  newVNode.el = oldVNode.el
}

export function patchElementProp(oldValue: any, newValue: any, el: HTMLElement, prop: string) {
  setElementProp(el, prop, newValue)
}

export function patchArrayNode(oldVNode: VArrayNode, newVNode: VArrayNode, container: HTMLElement) {
  const oldDepArray = oldVNode.depArray
  const newDepArray = newVNode.depArray
  const oldChildren = oldVNode.children
  const newChildren = newVNode.children

  // console.log(oldVNode.children);


  let map = new Map<any, string | VNode | Activer>()
  oldDepArray.forEach((item, index) => map.set(item, oldChildren[index]))
  // let anchor = oldChildren[0].
  // newChildren.forEach(item => {
  //   if(map.has(item)){
  //     let 
  //   }
  // })


  const nextSibling = oldVNode.el.nextSibling
  unmount(oldVNode, container)
  mount(newVNode, container, nextSibling as HTMLElement | undefined)
}