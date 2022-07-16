import { createNode, mount } from './utils';
import { PropValue } from './value';

export class Vact {
  private static depPool: any[] = []
  static getDepPool(): any[] {
    return this.depPool
  }

  private static updating: boolean = false
  private static watcherTask: Function[] = []
  static runTask(fn: Function) {
    this.watcherTask.push(fn)
    if (!this.updating) {
      this.updating = true
      Promise.resolve()
        .then(() => {
          let callbcak: Function | undefined
          while (callbcak = this.watcherTask.shift()) {
            callbcak()
          }
        })
        .then(() => this.updating = false)
    }
  }

  static Component: any;
  static mount = mount
  static createNode = createNode
}

export function getDepPool(): any[] {
  return Vact.getDepPool()
}

export function getDepProps<T>(fn: () => T): [PropValue[], T] {
  let depProps: PropValue[] = []
  let pool = Vact.getDepPool()
  pool.push(depProps)
  let res = fn()
  pool.splice(pool.indexOf(depProps), 1)
  return [depProps, res]
}

export function runTask(fn: Function) {
  Vact.runTask(fn)
}
