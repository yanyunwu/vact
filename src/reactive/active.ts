
/**
 * 响应式对象
*/
export class Activer<T = any> {
  callback: () => T
  flag: string = 'activer'

  constructor(fn: () => T) {
    this.callback = fn
  }

  get value(): T {
    return this.callback()
  }
}

/**
 * 外置函数
*/
export function active<T extends any>(fn: () => T): Activer<T> {
  return new Activer(fn)
}

