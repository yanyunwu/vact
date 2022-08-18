import { mount } from "./mount";
import { render } from './render'
import { Text } from './vnode/text'
import { Fragment } from './vnode/fragment'
import { Component } from './component'
import { Vact, createApp } from './vact'

export * from './reactive'
export { mount, render, Text, Fragment, Component }
export { render as createVNode }
export { createApp }
export default Vact