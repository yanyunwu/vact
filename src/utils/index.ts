import { Vact } from '../application'
import { Component } from '../component'
import { State, StateConfig } from '../state'
import { ComponentVNode, ElementVNode } from '../vnode'
import { FragmentVNode } from '../vnode/fragment'
import { SubComponent } from '../vnode/type'

// 获取一个响应式的对象
export function defineState(data: Record<string | number | symbol, any>, config?: StateConfig) {
  return new State(data, config)
}

export function mount(selector: string, rootNode: Component | ComponentVNode) {
  let ele = document.querySelector(selector)
  let rootEle: HTMLElement | undefined
  if (rootNode instanceof Component) {
    let ef = rootNode.createEFVNode()
    if (ef instanceof ElementVNode) {
      rootEle = ef.createEle()
    } else {
      throw new Error('用于挂载渲染的根组件必须使用原始标签')
    }
  } else if (rootNode instanceof ComponentVNode) {
    let ef = rootNode.createComponent().createEFVNode()
    if (ef instanceof ElementVNode) {
      rootEle = ef.createEle()
    } else {
      throw new Error('用于挂载渲染的根组件必须使用原始标签')
    }
  }
  if (ele && rootEle) {
    if (ele.parentNode) {
      ele.parentNode.replaceChild(rootEle, ele)
    }
  }
}

export type SubConstructor = new () => SubComponent
export function createNode(nodeTag: string | SubConstructor | symbol, props?: Record<any, any>, children?: any[]): ElementVNode | ComponentVNode | FragmentVNode {
  if (typeof nodeTag === 'string') {
    return new ElementVNode(nodeTag, props, children)
  } else if (typeof nodeTag === 'function') {
    return new ComponentVNode(nodeTag, props, children)
  } if (typeof nodeTag === 'symbol' && nodeTag === Vact.Fragment) {
    return new FragmentVNode(props, children)
  } else {
    throw new Error('只能传入字符串或者构造函数')
  }
}