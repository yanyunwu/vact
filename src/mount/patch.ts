import {mount, unmount} from "./mount";
import { App } from "../app";
import {VArrayNode} from "../vnode";
import {VText} from "../vnode";
import {VNode, VNODE_TYPE} from "../vnode";
import {setElementProp} from "./element";
import {VComponent} from "../vnode";

export function isSameVNode(oldVNode: VNode, newVNode: VNode): boolean {
  return oldVNode.flag === newVNode.flag
}

// todo
export function getNextSibling(vNode: VNode): ChildNode | null {
  switch (vNode.flag) {
    case VNODE_TYPE.TEXT:
    case VNODE_TYPE.ELEMENT:
    case VNODE_TYPE.ARRAYNODE:
    case VNODE_TYPE.FRAGMENT:
      return vNode.el!.nextSibling
    case VNODE_TYPE.COMPONENT:
      return (vNode as VComponent).root.el!.nextSibling
    case VNODE_TYPE.ALIVE:
      return getNextSibling(vNode.vnode!)
  }
}

export function patch(oldVNode: VNode, newVNode: VNode, container: HTMLElement, app?: App): void {

  // 如果两个节点引用一样不需要判断
  if (oldVNode === newVNode) return

  // 这里在判断相同类型的节点后可以做进一步优化
  if (isSameVNode(oldVNode, newVNode)) {
    let flag = oldVNode.flag = newVNode.flag

    if (flag === VNODE_TYPE.TEXT) {
      patchText(<VText>oldVNode, <VText>newVNode, container)
    } else if (flag === VNODE_TYPE.ARRAYNODE) {
      if (app?.options.arrayDiff) {
        patchArrayNodeT(<VArrayNode>oldVNode, <VArrayNode>newVNode, container)
      } else {
        patchArrayNode(<VArrayNode>oldVNode, <VArrayNode>newVNode, container)
      }
    } else {
      // const nextSibling = oldVNode?.el?.nextSibling
      const nextSibling = getNextSibling(oldVNode)
      unmount(oldVNode, container)
      mount(newVNode, container, nextSibling as HTMLElement | undefined)
    }

  } else {
    // const nextSibling = oldVNode?.el?.nextSibling
    const nextSibling = getNextSibling(oldVNode)
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

export function patchArrayNodeT(oldVNode: VArrayNode, newVNode: VArrayNode, container: HTMLElement) {
  if (!oldVNode.depArray) {
    patchArrayNode(oldVNode, newVNode, container)
    return
  }

  const oldDepArray = oldVNode.depArray
  const newDepArray = newVNode.depArray
  const oldChildren = oldVNode.children
  const newChildren = newVNode.children

  if (!oldDepArray.length || !newDepArray.length) {
    patchArrayNode(oldVNode, newVNode, container)
    return
  }

  newVNode.anchor = oldVNode.anchor
  newVNode.el = oldVNode.el

  type NodeInfo = { node: VNode, index: number, used: boolean }
  // 为映射做初始化
  let map = new Map<any, Array<NodeInfo>>()
  oldDepArray.forEach((item, index) => {
    let arr = map.get(item)
    if (!arr) map.set(item, arr = [])
    arr.push({ node: oldChildren[index], index, used: false })
  })

  let getOld = (item: any) => {
    let arr = map.get(item)
    if (!arr) return false

    let index = arr.findIndex(alone => !alone.used)

    if (index > -1) return arr[index]
    else return false
  }

  let moveOld = (item: any, node: NodeInfo) => {
    let arr = map.get(item)
    if (!arr) return

    let index = arr.findIndex(alone => alone === node)
    arr.splice(index, 1)
  }

  let maxIndexSoFar = { node: oldChildren[0], index: 0 }

  newDepArray.forEach((item, newIndex) => {
    let old = getOld(item)
    if (old) {
      if (old.index < maxIndexSoFar.index) {
        let next: ChildNode | null
        if (newIndex > 0) {
          next = getNextSibling(newChildren[newIndex - 1]) as ChildNode | null
        } else {
          next = getNextSibling(maxIndexSoFar.node) as ChildNode | null
        }

        VNodeInsertBefore(container, old.node, next)
        // container.insertBefore(old.node.el!, next)
      } else {
        maxIndexSoFar = old
      }

      newChildren[newIndex] = old.node
      moveOld(item, old)
    } else {
      // let next = maxIndexSoFar.node.el!.nextSibling
      let next: ChildNode | null
      if (newIndex > 0) {
        next = getNextSibling(newChildren[newIndex - 1]) as ChildNode | null
      } else {
        next = getNextSibling(maxIndexSoFar.node) as ChildNode | null
      }

      let newNode = newChildren[newIndex]
      mount(newNode, container, next as HTMLElement | undefined)
      // maxIndexSoFar = { node: newNode, index: maxIndexSoFar.index + 1 }
    }
  })


  map.forEach(value => {
    value.forEach(item => {
      if (!item.used) {
        unmount(item.node, container)
      }
    })
  })
}

function patchArrayNode(oldVNode: VArrayNode, newVNode: VArrayNode, container: HTMLElement) {
  const nextSibling = oldVNode.el.nextSibling
  unmount(oldVNode, container)
  mount(newVNode, container, nextSibling as HTMLElement | undefined)
}


/**
 * 将一个虚拟节点挂载到一个锚点前面
 */
function VNodeInsertBefore(container: HTMLElement, node: VNode, next: HTMLElement | undefined | Text | ChildNode | null) {
  if (node.flag === VNODE_TYPE.ELEMENT || node.flag === VNODE_TYPE.TEXT) {
    container.insertBefore(node.el!, next!)
  } else if (node.flag === VNODE_TYPE.COMPONENT) {
    container.insertBefore((node as VComponent).root.el!, next!)
  }
  else if (node.flag === VNODE_TYPE.ARRAYNODE || node.flag === VNODE_TYPE.FRAGMENT) {
    let start: ChildNode | null | undefined = node.anchor
    let nextToMove = start?.nextSibling
    let end: ChildNode | null | undefined = node.el
    while (start !== end) {
      container.insertBefore(start!, next!)
      start = nextToMove
      nextToMove = start?.nextSibling
    }
    container.insertBefore(end!, next!)
  }
}
