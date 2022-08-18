import { VNode, VNODE_TYPE } from './vnode/vnode'
import { Activer } from './reactive/active'
import { Fragment } from './vnode/fragment'
import { Text } from './vnode/text'
import { ArrayNode } from './vnode/array'

export function isString(content: unknown): content is string {
  return typeof content === 'string'
}

export function isFunction(content: unknown): content is Function {
  return typeof content === 'function'
}

export function isFragment(content: unknown): boolean {
  return content === Fragment
}

export function isArrayNode(content: unknown): boolean {
  return content === ArrayNode
}

export function isText(content: unknown): boolean {
  return content === Text
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






