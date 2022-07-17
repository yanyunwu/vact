import { Component } from "../component"
import { TextVNode, ElementVNode, ComponentVNode } from "../vnode"

export type ChildVNode = ElementVNode | TextVNode | ComponentVNode
export type BaseChildVNode = string | ElementVNode | Component | ComponentVNode | Array<string | ElementVNode | Component | ComponentVNode>
export type RBaseChildVNode = BaseChildVNode | (() => BaseChildVNode)

export interface SubComponent {
  createElementVNode(): ElementVNode
  setProps(props: {}): void
  setChildren(children: any[]): void
  getElementVNode(): ElementVNode
}