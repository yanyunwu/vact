
/**
 * 虚拟dom节点类型枚举
*/
export enum VNODE_TYPE {
  // 普通元素节点类型
  ELEMENT,
  // 文本节点类型
  TEXT,
  Fragment,
  Component
}

/**
 * 虚拟dom接口类型
*/
export interface VNode {

  // 虚拟节点类型
  type: string | symbol,

  // 虚拟节点属性
  props: Record<string, any>,

  // 虚拟节点子节点
  children: Array<any>,

  // 虚拟节点表标识
  flag: VNODE_TYPE

}

