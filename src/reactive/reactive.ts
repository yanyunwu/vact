import { isObjectExact } from "../utils"
import { Watcher } from "./watch"

// 目标对象到映射对象
const targetMap = new WeakMap()
// 全局变量watcher
let activeWatcher: Watcher | null = null
const REACTIVE = Symbol('reactive')

/**
 * 实现响应式对象
*/
export function reactive<T extends Record<string | symbol, any>>(target: T): T {
  if (target[REACTIVE]) return target

  let handler: ProxyHandler<T> = {
    get(target, prop, receiver) {
      if (prop === REACTIVE) return true
      const res = Reflect.get(target, prop, receiver)

      if (isObjectExact(res)) {
        return reactive(res)
      }

      if (Array.isArray(res)) {
        track(target, prop)
        return reactiveArray(res, target, prop)
      }

      track(target, prop)
      return res
    },

    set(target, prop, value, receiver) {
      const oldValue = Reflect.get(target, prop, receiver)
      const res = Reflect.set(target, prop, value, receiver)
      const newValue = Reflect.get(target, prop, receiver)
      trigger(target, prop, oldValue, newValue)
      return res
    }
  }

  return new Proxy(target, handler)
}

/**
 * 设置响应式数组
*/
function reactiveArray(targetArr: Array<any>, targetObj: Record<any, any>, Arrprop: string | symbol) {
  let handler: ProxyHandler<Record<any, any>> = {
    get(target, prop, receiver) {
      const res = Reflect.get(target, prop, receiver)

      if (isObjectExact(res)) {
        return reactive(res)
      }

      return res
    },
    set(target, prop, value, receiver) {
      const res = Reflect.set(target, prop, value, receiver)
      trigger(targetObj, Arrprop)
      return res
    }
  }

  return new Proxy(targetArr, handler)
}

/**
 * 响应触发依赖
*/
export function trigger(target: Record<any, any>, prop: string | symbol, oldValue?: any, newValue?: any) {
  let mapping: Record<string | symbol, Array<Watcher>> = targetMap.get(target)
  if (!mapping) return

  let mappingProp: Array<Watcher> = mapping[prop]
  if (!mappingProp) return

  mappingProp.forEach(watcher => watcher.update(oldValue, newValue))
}

/**
 * 追踪绑定依赖
*/
export function track(target: Record<any, any>, prop: string | symbol) {
  if (!activeWatcher) return

  let mapping: Record<string | symbol, Array<Watcher>> = targetMap.get(target)
  if (!mapping) targetMap.set(target, mapping = {})

  let mappingProp: Array<Watcher> = mapping[prop]
  if (!mappingProp) mappingProp = mapping[prop] = []

  mappingProp.push(activeWatcher)
}

// 设置全局变量
export function setActiver(fn: Watcher | null) {
  activeWatcher = fn
}
// 设置全局变量
export function getActiver(): Watcher | null {
  return activeWatcher
}

