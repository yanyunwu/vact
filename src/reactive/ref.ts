import { track, trigger } from './reactive'

export class RefImpl<T = any> {
  private _value: T

  constructor(value: T) {
    this._value = value
  }

  get value() {
    track(this, 'value')
    return this._value
  }

  set value(value) {
    this._value = value
    trigger(this, 'value')
  }
}


export function ref<T extends any>(value: T): RefImpl<T> {
  return new RefImpl(value)
}