import { Activer } from "../reactive"
import { Component } from './component'

/**
 * 虚拟dom节点类型枚举
*/
export enum VNODE_TYPE {
  // 普通元素节点类型
  ELEMENT,
  // 文本节点类型
  TEXT,
  FRAGMENT,
  // COMPONENT,
  ARRAYNODE,
  ALIVE
}

/**
 * 虚拟dom接口类型
*/
export interface VNode {

  // 虚拟节点类型
  type: string | symbol | Component,

  // 虚拟节点表标识
  flag: VNODE_TYPE

  // 虚拟节点属性
  props?: Record<string, any>,

  // 虚拟节点子节点
  children?: Array<VNode> | string,

  // 真实节点
  el?: HTMLElement | Text
  anchor?: Text

  activer?: Activer
  // 目前存在的节点
  vnode?: VNode

}

