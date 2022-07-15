

export abstract class VNode {
  abstract type: number
  static ELEMENT: number = 0
  static TEXT: number = 1
  static COMPONENT: number = 2
}