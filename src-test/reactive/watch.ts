import { setActiver } from "./reactive"
import { active, Activer } from './active'
import { VNode } from "../vnode/vnode"
import { isActiver } from "../utils"
import { render } from "../render"
import { Text } from '../vnode/text'
import { ArrayNode } from "../vnode/array"

/**
 * 观察者
 * 观察数据的变化
*/
export class Watcher<T = any> {
  value: T
  callback: (oldValue: T, newValue: T) => void
  activeProps: Activer<T>

  constructor(activeProps: Activer<T>, callback: (oldValue: T, newValue: T) => void) {
    setActiver(this)
    this.value = activeProps.value
    this.callback = callback
    this.activeProps = activeProps
    setActiver(null)
  }

  update(targetPropOldValue: any, targetPropnewValue: any) {
    let newValue = this.activeProps.value
    let oldValue = this.value
    this.value = newValue
    this.callback(oldValue, newValue)
  }
}


/**
 * 监控自定义响应式属性
*/
export function watch<T = any>(activeProps: (() => T) | Activer<T>, callback: (oldValue: T, newValue: T) => void): Watcher<T> {
  if (!isActiver(activeProps)) activeProps = active(activeProps)
  return new Watcher<T>(activeProps, function (oldValue: T, newValue: T) {
    callback(oldValue, newValue)
  })
}

/**
 * 监控可变状态dom
*/
export type RowChildType = VNode | null | Array<VNode>
export function watchVNode(activeProps: Activer<RowChildType>, callback: (oldVNode: VNode, newVNode: VNode) => void): VNode {
  let watcher = new Watcher<RowChildType>(activeProps, function (oldVNode: RowChildType, newVNode: RowChildType) {
    if (newVNode === null) newVNode = render(Text, null, '')
    if (Array.isArray(newVNode)) {
      newVNode = render(ArrayNode, null, newVNode)
    }
    callback(oldVNode as VNode, newVNode)
    watcher.value = newVNode
  })

  if (!watcher.value) watcher.value = render(Text, null, '')
  if (Array.isArray(watcher.value)) {
    watcher.value = render(ArrayNode, null, watcher.value)
  }
  return watcher.value
}