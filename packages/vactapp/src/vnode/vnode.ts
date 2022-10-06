import { Activer } from "../reactive"
import { ComponentType } from './component'

/**
 * 虚拟dom节点类型枚举
*/
export enum VNODE_TYPE {
  // 普通元素节点类型
  ELEMENT,
  // 文本节点类型
  TEXT,
  FRAGMENT,
  COMPONENT,
  ARRAYNODE,
  ALIVE
}

export type VNodeElement = ChildNode

/**
 * 虚拟dom接口类型
*/
export interface VNode {

  // 虚拟节点类型
  type: string | symbol | ComponentType,

  // 虚拟节点表标识
  flag: VNODE_TYPE

  // 虚拟节点属性
  props?: Record<string, any>,

  // 虚拟节点子节点
  children?: Array<VNode> | string,

  // 真实节点
  el?: VNodeElement
  anchor?: VNodeElement

  activer?: Activer
  // 目前存在的节点
  vnode?: VNode

}

// 未经过标准化的childVNode类型
export type NotFunctionOriginVNode= string | VNode | Array<OriginVNode> | Activer
export type WithFunctionOriginVNode= (() => OriginVNode) | NotFunctionOriginVNode
export type OriginVNode= WithFunctionOriginVNode | Exclude<any, WithFunctionOriginVNode>

/** 虚拟节点属性 todo */
export interface VNodeProps {
  [propName: string]: any
}

