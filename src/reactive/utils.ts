import { ref } from './ref'
import { reactive } from './reactive'


export function state<T extends any>(value: T) {
  return ref(value)
}

export function defineState<T extends Record<string | symbol, any>>(target: T): T {
  return reactive(target)
}





