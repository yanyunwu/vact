import { VNode, VNODE_TYPE } from './vnode/vnode'
import { Activer } from './reactive/active'
import { Fragment } from './vnode/fragment'
import { Text } from './vnode/text'

export function isString(content: unknown): content is string {
  return typeof content === 'string'
}

export function isFunction(content: unknown): content is Function {
  return typeof content === 'function'
}

export function isFragment(content: unknown): boolean {
  return content === Fragment
}

export function isText(content: unknown): boolean {
  return content === Text
}

export function isActiver(content: unknown): content is Activer {
  return typeof content === 'object' && content !== null && (content as Record<any, any>).flag === 'activer'
}

export function isVNode(content: unknown): content is VNode {
  return typeof content === 'object' && content !== null && (content as Record<any, any>).flag in VNODE_TYPE
}

export function isObjectExact(content: unknown): content is Object {
  return typeof content === 'object' && content !== null && content.constructor === Object
}





