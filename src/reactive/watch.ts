import { setActiver } from "./reactive"
import { active, Activer } from './active'
import { VNode, VNODE_TYPE, OriginVNode } from "../vnode"
import { isActiver } from "../utils"
import { createVNode } from "../render"
import { VArrayNode } from "../vnode"
import { VAlive } from "../vnode"

type Meta = {
  targetPropOldValue: any,
  targetPropnewValue: any
}

/**
 * 观察者
 * 观察数据的变化
*/
export class Watcher<T = any> {
  value: T
  callback: (oldValue: T, newValue: T, meta?: Meta) => void
  activeProps: Activer<T>
  depArr?: Array<any> | false
  nextDepArr?: Array<any>

  constructor(activeProps: Activer<T>, callback: (oldValue: T, newValue: T, meta?: Meta) => void) {
    setActiver(this)
    this.value = activeProps.value
    this.callback = callback
    this.activeProps = activeProps
    setActiver(null)
  }

  update() {
    let newValue = this.activeProps.value
    let oldValue = this.value
    this.value = newValue
    let meta = { targetPropOldValue: this.depArr, targetPropnewValue: this.nextDepArr }
    this.callback(oldValue, newValue, meta)
    this.depArr = this.nextDepArr?.slice()
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
export function watchVNode(activeVNode: VAlive, callback: (oldVNode: VNode, newVNode: VNode) => void): VNode {
  let watcher = new Watcher<OriginVNode>(activeVNode.activer, function (oldValue: OriginVNode, newValue: OriginVNode, meta) {
    const oldVNode = oldValue as VNode
    const newVNode = createVNode(newValue)

    // 对于数组节点后期需要记录它的响应式数组用于节点更新
    if (oldVNode.flag === VNODE_TYPE.ARRAYNODE) {
      (<VArrayNode>oldVNode).depArray = meta?.targetPropOldValue
    }
    // 对于数组节点后期需要记录它的响应式数组用于节点更新
    if (newVNode.flag === VNODE_TYPE.ARRAYNODE) {
      (<VArrayNode>newVNode).depArray = meta?.targetPropnewValue
    }

    callback(oldVNode, newVNode)
    watcher.value = newVNode
    activeVNode.vnode = newVNode
  })

  return watcher.value = createVNode(watcher.value)
}


/**
 * 监控可变dom的prop
*/
export function watchProp(activeProp: Activer, callback: (oldVNode: VNode, newVNode: VNode) => void): any {
  return new Watcher(activeProp, callback).value
}
