import { patch } from "./patch";
import { Activer } from "./reactive/active";
import { watchVNode } from "./reactive/watch";
import { isActiver } from "./utils";
import { VElement } from "./vnode/element";
import { VNode } from "./vnode/vnode";


export function mount(vnode: VNode, container: HTMLElement) {

}

export function mountChildren(children: Array<Activer | VNode>, container: HTMLElement) {
  children.forEach(child => {
    if (isActiver(child)) {
      let res = watchVNode(child, () => patch(res, child.value, container))
      mount(res, container)
    }
  })
}

export function mountElement(vnode: VElement, container: HTMLElement) {
  const el = document.createElement(vnode.type)
  container.appendChild(el)
}

export function unmountElement(vnode: VElement, container: HTMLElement) {
  const el = document.createElement(vnode.type)
  container.appendChild(el)
}