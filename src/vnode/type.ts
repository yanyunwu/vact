import { Component } from "../component"
import { TextVNode, ElementVNode, ComponentVNode } from "../vnode"
import { FragmentVNode } from "./fragment"

export type ChildVNode = ElementVNode | TextVNode | ComponentVNode | FragmentVNode
export type BaseChildVNode = string | ElementVNode | Component | ComponentVNode | FragmentVNode | Array<string | ElementVNode | Component | ComponentVNode | FragmentVNode>
export type RBaseChildVNode = BaseChildVNode | (() => BaseChildVNode)

export interface SubComponent {
  createElementVNode(): ElementVNode
  setProps(props: {}): void
  setChildren(children: any[]): void
  getElementVNode(): ElementVNode
}