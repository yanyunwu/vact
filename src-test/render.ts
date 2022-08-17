import { active } from "./reactive/active";
import { isString, isFragment, isText, isFunction, isArrayNode, isOnEvent } from "./utils";
import { VNode, VNODE_TYPE } from "./vnode/vnode";

/**
 * 传说中的render函数
*/
export function render(type: string | symbol, props?: Record<string, any> | null, children?: Array<any> | string): VNode {
  let flag: VNODE_TYPE

  if (isString(type)) {
    flag = VNODE_TYPE.ELEMENT
  } else if (isFragment(type)) {
    flag = VNODE_TYPE.Fragment
  } else if (isText(type)) {
    flag = VNODE_TYPE.TEXT
  } else if (isArrayNode(type)) {
    flag = VNODE_TYPE.ArrayNode
  } else {
    flag = VNODE_TYPE.Component
  }

  if (!isText(type) && !Array.isArray(children)) {
    children = [children]
  }

  // 子元素预处理 
  if (children && Array.isArray(children)) {
    children = children.map(child => isFunction(child) ? active(child) : child)
  }

  // 属性预处理
  if (props) {
    for (const prop in props) {
      // 以on开头的事件不需要处理
      if (!isOnEvent(prop) && isFunction(props[prop])) {
        props[prop] = active(props[prop])
      }
    }
  }

  return {
    type,
    props,
    children,
    flag
  }
}