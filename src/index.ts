import { mount } from "./mount/mount";
import { render } from './render'
import { TextSymbol } from './vnode/text'
import { FragmentSymbol } from './vnode/fragment'
import { Component } from './component'
import { Vact, createApp } from './vact'

export * from './reactive'
export { mount, render, TextSymbol as Text, FragmentSymbol as Fragment, Component }
export { render as createVNode }
export { createApp }
export default Vact