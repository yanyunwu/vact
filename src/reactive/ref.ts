import { track, trigger } from './reactive'

export class RefImpl<T = any> {
  private _value: T
  private readonly _target: Record<any, any>

  constructor(value: T) {
    this._value = value
    this._target = { value: this._value }
  }

  get value() {
    track(this._target, 'value')
    return this._value
  }

  set value(value) {
    this._value = value
    this._target.value = this._value
    trigger(this._target, 'value')
  }
}


export function ref<T extends any>(value: T): RefImpl<T> {
  return new RefImpl(value)
}