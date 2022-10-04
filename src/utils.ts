import {
  ArraySymbol,
  FragmentSymbol,
  TextSymbol, VAlive,
  VArrayNode, VComponent,
  VElement,
  VFragment,
  VNode,
  VNODE_TYPE,
  VText
} from './vnode'
import {Activer} from './reactive'

export function isString(content: unknown): content is string {
  return typeof content === 'string'
}

export function isFunction(content: unknown): content is Function {
  return typeof content === 'function'
}

export function isFragment(content: unknown): boolean {
  return content === FragmentSymbol
}

export function isArrayNode(content: unknown): boolean {
  return content === ArraySymbol
}

export function isText(content: unknown): boolean {
  return content === TextSymbol
}

export function isActiver(content: unknown): content is Activer {
  return isObject(content) && (content as Record<any, any>).flag === 'activer'
}

export function isVNode(content: unknown): content is VNode {
  return isObject(content) && (content as Record<any, any>).flag in VNODE_TYPE
}

export function isObjectExact(content: unknown): content is Object {
  return isObject(content) && content.constructor === Object
}

export function isOnEvent(str: string): boolean {
  return /^on.+$/.test(str)
}

export function isObject(content: unknown): content is object {
  return typeof content === 'object' && content !== null
}


export function isArray(content: unknown): content is Array<any> {
  return Array.isArray(content)
}

// 判断是否是一个数组节点
export function isVArrayNode(node: VNode): node is VArrayNode {
  return node.flag === VNODE_TYPE.ARRAYNODE
}
export function isVTextNode(node: VNode): node is VText {
  return node.flag === VNODE_TYPE.TEXT
}
export function isVElementNode(node: VNode): node is VElement {
  return node.flag === VNODE_TYPE.ELEMENT
}
export function isVFragmentNode(node: VNode): node is VFragment {
  return node.flag === VNODE_TYPE.FRAGMENT
}
export function isVComponentNode(node: VNode): node is VComponent {
  return node.flag === VNODE_TYPE.COMPONENT
}
export function isVAliveNode(node: VNode): node is VAlive {
  return node.flag === VNODE_TYPE.ALIVE
}





