import { mount } from "./mount/mount";
import { render } from './render'
import {
    TextSymbol,
    FragmentSymbol,
    ArraySymbol,
    VComponentSymbol
} from './vnode'
import { Component } from './component'
import { App, createApp } from './app'

export * from './reactive'
export {
    mount,
    render,
    TextSymbol as VText,
    FragmentSymbol as VFragment,
    ArraySymbol as VArray,
    VComponentSymbol as  VComponent,
    Component
}
export { render as createVNode }
export { createApp }
export default App
