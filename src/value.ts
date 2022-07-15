import { EventEmitter } from "events"
import { DataProxy } from "./proxy"

export class PropValue extends EventEmitter {
  public value: any
  private dep: Array<Watcher>
  // 该值所属数据响应中心
  dataProxy?: DataProxy<object>

  constructor(value: any, dataProxy?: DataProxy<object>) {
    super()
    this.value = value
    this.dep = []
    this.dataProxy = dataProxy
  }

  setDep(watcher: Watcher) {
    this.dep.push(watcher)
  }

  valueOf() {
    return this.value
  }

  toString() {
    return this.value
  }

  set(value: any) {
    this.value = value
  }

  get(): any {
    return this.value
  }

  notify() {
    this.dep.forEach(watcher => {
      watcher.update()
    })
    this.emit('change', this.value)
  }

}



export class Watcher {
  fn: () => void

  constructor(fn: () => void) {
    this.fn = fn
  }

  update() {
    this.fn()
  }
}