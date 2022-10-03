import { mount } from "./mount/mount";
import { renderApi } from './render'
import {
    TextSymbol,
    FragmentSymbol,
    ArraySymbol,
    VComponentSymbol
} from './vnode'
import { Component, defineComponent } from './component'
import { App, createApp } from './app'

export * from './reactive'
export {
    mount,
    renderApi as render,
    renderApi as h,
    Component,
    defineComponent
}
export {
    TextSymbol as VText,
    FragmentSymbol as VFragment,
    ArraySymbol as VArray,
    VComponentSymbol as  VComponent,
}
export { renderApi as createVNode }
export { createApp }
export default App
