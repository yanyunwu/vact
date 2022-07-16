

export abstract class VNode {
  abstract type: number
  static ELEMENT: number = 0
  static TEXT: number = 1
  static COMPONENT: number = 2
  // 用于获取挂载到虚拟节点的真实节点
  abstract getRVnode(): HTMLElement | Text
}