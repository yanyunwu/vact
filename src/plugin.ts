import {
    state,
    defineState,
    watch
} from "./reactive";
import { renderApi as h } from "./render";

// todo

// 实现插件功能

export interface AppUtils {
    state: typeof state
    defineState: typeof defineState
    h: typeof h
    watch: typeof watch
}

export interface AppContext {
    utils: AppUtils
}

export interface AppPlugin {
    install(utils: AppContext): void
}

// 给插件提供的能力
export const appUtils: AppUtils = {
    state,
    defineState,
    h,
    watch
}
