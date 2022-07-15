import { Component } from "../component"
import { TextVNode, ElementVNode } from "../vnode"

export type BaseElementVNodeChild = string | TextVNode | ElementVNode | Component | Array<any>
export type ElementVNodeChild = BaseElementVNodeChild | (() => BaseElementVNodeChild)

export interface SubComponent {
  new(props: {}, children: []): SubComponent
  renderRoot(): ElementVNode
  setProps(props: {}): void
  setChildren(children: any[]): void
}