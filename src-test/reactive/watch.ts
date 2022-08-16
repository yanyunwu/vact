import { setActiver } from "./reactive"
import { Activer } from './active'
import { VNode } from "../vnode/vnode"

export function watchVNode(props: (() => any) | Activer, callback: () => any): VNode {
  setActiver(callback)
  let res: VNode
  if (typeof props === 'function') {
    res = props()
  } else {
    res = props.callback()
  }
  setActiver(null)
  return res
}