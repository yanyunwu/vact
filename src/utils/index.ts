import { State, StateConfig } from '../state'

// 获取一个响应式的对象
export function defineState(data: Record<string | number | symbol, any>, config?: StateConfig) {
  return new State(data, config)
} 