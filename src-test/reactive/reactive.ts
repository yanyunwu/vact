const targetMap = new WeakMap()
type Activer = () => void
let activer: Activer | null = null


export function reactive(target: Record<any, any>) {
  let handler: ProxyHandler<Record<any, any>> = {
    get(target, prop, receiver) {
      track(target, prop)
      return Reflect.get(target, prop, receiver)
    },

    set(target, prop, value, receiver) {
      const res = Reflect.set(target, prop, value, receiver)
      trigger(target, prop)
      return res
    }
  }

  return new Proxy(target, handler)
}


function trigger(target: Record<any, any>, prop: string | symbol) {
  let mapping: Record<string | symbol, Array<any>> = targetMap.get(target)
  if (!mapping) return

  let mappingProp: Array<any> = mapping[prop]
  if (!mappingProp) return

  mappingProp.forEach(item => item())
}


function track(target: Record<any, any>, prop: string | symbol) {
  let mapping: Record<string | symbol, Array<any>> = targetMap.get(target)
  if (!mapping) targetMap.set(target, mapping = {})

  let mappingProp: Array<any> = mapping[prop]
  if (!mappingProp) mappingProp = mapping[prop] = []

  mappingProp.push(activer)
}

export function setActiver(fn: Activer | null) {
  activer = fn
}

export function getActiver(): Activer | null {
  return activer
}
