import { isString, isFragment, isText } from "./utils";
import { VNode, VNODE_TYPE } from "./vnode/vnode";

/**
 * 传说中的render函数
*/
export function render(type: string | symbol, props: Record<string, any>, children: Array<any>): VNode {
  let flag: VNODE_TYPE

  if (isString(type)) {
    flag = VNODE_TYPE.ELEMENT
  } else if (isFragment(type)) {
    flag = VNODE_TYPE.Fragment
  } else if (isText(type)) {
    flag = VNODE_TYPE.TEXT
  } else {
    flag = VNODE_TYPE.Component
  }

  return {
    type,
    props,
    children,
    flag
  }
}