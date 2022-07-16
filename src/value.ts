import { EventEmitter } from "events"
import { DataProxy } from "./proxy"
import { runTask } from './application'


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
  running: boolean = false

  constructor(fn: () => void) {
    this.fn = fn
  }

  update() {
    if (this.running) return
    this.running = true
    let fn = () => {
      this.fn()
      this.running = false
    }
    runTask(fn)
  }
}