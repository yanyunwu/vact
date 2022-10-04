import {
    state,
    defineState,
    watch,
    active
} from "./reactive";
import { renderApi as h } from "./render";
import {App} from "./app";
import {
    isActiver,
    isVArrayNode,
    isVNode,
    isVFragmentNode,
    isVElementNode,
    isVTextNode,
    isVComponentNode,
    isVAliveNode
} from './utils'
import {promisify} from "util";

// todo

// 实现插件功能
export interface AppUtils {
    state: typeof state
    defineState: typeof defineState
    h: typeof h
    watch: typeof watch
    active: typeof active

    isActiver: typeof isActiver
    isVArrayNode: typeof isVArrayNode
    isVNode: typeof isVNode
    isVFragmentNode: typeof isVFragmentNode
    isVElementNode: typeof isVElementNode
    isVTextNode: typeof isVTextNode
    isVComponentNode: typeof isVComponentNode
    isVAliveNode: typeof isVAliveNode
}

export interface AppContext {
    app: App
    utils: AppUtils
}

export type AppPluginType = AppPluginInstance | AppPluginFun

export interface AppPluginInstance {
    install(utils: AppContext): void
}
export interface AppPluginFun {
    (utils: AppContext): void
}

export abstract class AppPlugin {
    abstract install(utils: AppContext): void
}

// 给插件提供的能力
export const appUtils: AppUtils = {
    state,
    defineState,
    h,
    watch,
    active,

    isActiver,
    isVArrayNode,
    isVNode,
    isVFragmentNode,
    isVElementNode,
    isVTextNode,
    isVComponentNode,
    isVAliveNode
}

export function definePlugin(appPlugin: AppPluginFun) {
    return appPlugin
}
