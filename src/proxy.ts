import { EventEmitter } from "events";
import { Vact } from "./application";
import { PropValue } from "./value";

/**
 * 数据响应式中心
*/

/**
 * 数据存放处
*/

export class DataProxyValue {
  private valueMap: WeakMap<{}, any>
  constructor() {
    this.valueMap = new WeakMap()
  }

  getProp(target: Record<any, any>, prop: any): PropValue {
    if (!this.valueMap.get(target)) {
      this.valueMap.set(target, {})
    }

    let valueTarget = this.valueMap.get(target)

    if (!valueTarget[prop]) {

      let propValue = new PropValue(Array.isArray(target[prop]) ? new Proxy(target[prop], {
        set(target, prop, value, receiver) {
          // 这里一定要先设置再通知
          let res = Reflect.set(target, prop, value, receiver)
          propValue.notify()
          return res
        }
      }) : target[prop])
      valueTarget[prop] = propValue
    }
    return valueTarget[prop]
  }
  // 获取用于绑定属性事件的代理对象
  getValueTarget(target: Record<any, any>): Record<any, any> {
    return this.valueMap.get(target)
  }

  // 设置用于绑定属性事件的代理对象
  setValueTarget(target: Record<any, any>, valueTarget: Record<any, any>) {
    this.valueMap.set(target, valueTarget)
  }

}

/**
 * 监控数据响应变化处
*/

export class DataProxy {
  data: object
  dataProxyValue: DataProxyValue

  constructor(data: object) {
    this.dataProxyValue = new DataProxyValue()
    // 监控普通对象
    const handler: ProxyHandler<any> = {
      get: (target, prop, receiver) => {
        if (Array.isArray(target)) {
          return Reflect.get(target, prop)
        } else if (typeof target[prop] === 'object' && target[prop] !== null && !Array.isArray(target[prop])) {
          return new Proxy(target[prop], handler)
        } else if (typeof target[prop] === 'function') {
          return Reflect.get(target, prop)
        }
        else {
          let res = this.dataProxyValue.getProp(target, prop)
          for (let depArr of Vact.depPool) {
            if (!depArr.includes(res)) {
              depArr.push(res)
            }
          }
          return res
        }
      },
      set: (target, prop, value, receiver) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // 当对象被替换为新对象时 通知对象里所有的响应式
          let valueTarget = this.dataProxyValue.getValueTarget(target[prop])
          this.replaceProps(value, valueTarget)
          return Reflect.set(target, prop, value, receiver)
        } else {
          let propValue = this.dataProxyValue.getProp(target, prop)
          propValue.value = value
          propValue.notify()
          return Reflect.set(target, prop, value, receiver)
        }


      }

    }
    this.data = new Proxy(data, handler)


  }


  getData() {
    return this.data
  }

  // 当对象属性被新对象替换时
  replaceProps(target: Record<any, any>, valueTarget: Record<any, any>) {
    for (let prop in valueTarget) {
      let propValue = valueTarget[prop]
      propValue.value = target[prop]
      propValue.notify()
    }
    this.dataProxyValue.setValueTarget(target, valueTarget)
  }

}

/**
 * 用于实现对数组监控，只适合定长的数组
*/
export class ArrayProxy {
  data: any[]
  dataProxyValue: DataProxyValue

  constructor(data: any[]) {
    this.dataProxyValue = new DataProxyValue()
    // 监控数组对象
    const handler: ProxyHandler<any> = {
      get: (target, prop, receiver) => {
        if (typeof target[prop] === 'object' && target[prop] !== null && !Array.isArray(target[prop]) && target[prop].constructor === Object) {
          return new Proxy(target[prop], handler)
        } else if (typeof target[prop] === 'function') {
          return Reflect.get(target, prop, receiver)
        }
        else {
          let propValue = this.dataProxyValue.getProp(target, prop)
          for (let depArr of Vact.depPool) {
            if (!depArr.includes(propValue)) {
              depArr.push(propValue)
            }
          }
          return propValue.value
        }
      },
      set: (target, prop, value, receiver) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // 当对象被替换为新对象时 通知对象里所有的响应式
          let valueTarget = this.dataProxyValue.getValueTarget(target[prop])
          let res = Reflect.set(target, prop, value, receiver)
          this.replaceProps(value, valueTarget)
          return res
        } else {
          let propValue = this.dataProxyValue.getProp(target, prop)

          propValue.value = Array.isArray(value) ? new Proxy(value, {
            set(target, prop, value, receiver) {
              // 这里一定要先设置再通知
              let res = Reflect.set(target, prop, value, receiver)
              propValue.notify()
              return res
            }
          }) : value


          let res = Reflect.set(target, prop, value, receiver)
          propValue.notify()
          return res
        }


      }



    }
    this.data = new Proxy(data, handler)

  }

  // 当对象属性被新对象替换时
  replaceProps(target: Record<any, any>, valueTarget: Record<any, any>) {
    for (let prop in valueTarget) {
      let propValue = valueTarget[prop]
      propValue.value = target[prop]
      propValue.notify()
    }
    this.dataProxyValue.setValueTarget(target, valueTarget)
  }

  getData() {
    return this.data
  }



}


export class DataProxyTest {
  data: object
  dataProxyValue: DataProxyValue

  constructor(data: object) {
    this.dataProxyValue = new DataProxyValue()
    // 监控普通对象
    const handler: ProxyHandler<any> = {
      get: (target, prop, receiver) => {

        if (typeof target[prop] === 'object' && target[prop] !== null && !Array.isArray(target[prop]) && target[prop].constructor === Object) {
          return new Proxy(target[prop], handler)
        } else if (typeof target[prop] === 'function') {
          return Reflect.get(target, prop, receiver)
        }
        else {
          let propValue = this.dataProxyValue.getProp(target, prop)
          for (let depArr of Vact.depPool) {
            if (!depArr.includes(propValue)) {
              depArr.push(propValue)
            }
          }
          return propValue.value
        }
      },
      set: (target, prop, value, receiver) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // 当对象被替换为新对象时 通知对象里所有的响应式
          let valueTarget = this.dataProxyValue.getValueTarget(target[prop])
          let res = Reflect.set(target, prop, value, receiver)
          this.replaceProps(value, valueTarget)
          return res
        } else {
          let propValue = this.dataProxyValue.getProp(target, prop)

          propValue.value = Array.isArray(value) ? new Proxy(value, {
            set(target, prop, value, receiver) {
              // 这里一定要先设置再通知
              let res = Reflect.set(target, prop, value, receiver)
              propValue.notify()
              return res
            }
          }) : value


          let res = Reflect.set(target, prop, value, receiver)
          propValue.notify()
          return res
        }


      }

    }
    this.data = new Proxy(data, handler)


  }


  getData() {
    return this.data
  }

  // 当对象属性被新对象替换时
  replaceProps(target: Record<any, any>, valueTarget: Record<any, any>) {
    for (let prop in valueTarget) {
      let propValue = valueTarget[prop]
      propValue.value = target[prop]
      propValue.notify()
    }
    this.dataProxyValue.setValueTarget(target, valueTarget)
  }

}

