import { DataProxy } from "./proxy";

export interface StateConfig {
  // 是否开启数组中对象的监控
  deep?: boolean
}

export class State<T extends object> {

  private dataProxy: DataProxy<T>
  private config?: StateConfig

  constructor(data: T, config?: StateConfig) {
    this.dataProxy = new DataProxy<T>(data)
    this.config = config
  }

  get data(): T {
    return this.dataProxy.getData()
  }

  // 用于监控数据变化
  watch(path: string, fn: (value: any) => void): void {
    let props = path.split('.')
    if (!props.length) return;
    let obj: Record<any, any> = this.dataProxy.getTarget()
    let prop: string = props.shift() || ''
    while (props.length) {
      let p = props.shift()
      if (p) {
        obj = obj[prop]
        prop = p
      }
    }

    let events = this.dataProxy.getEventProxy()
    let propValue = events.getProp(obj, prop)
    propValue.on('change', fn)
  }

}