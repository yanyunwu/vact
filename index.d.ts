/**
 * 响应式对象
*/
declare class Activer<T = any> {
    callback: () => T;
    flag: string;
    constructor(fn: () => T);
    get value(): T;
}

declare class RefImpl<T = any> {
    private _value;
    constructor(value: T);
    get value(): T;
    set value(value: T);
}
declare function ref<T extends any>(value: T): RefImpl<T>;

declare function state<T extends any>(value: T): RefImpl<T>;
declare function defineState<T extends Record<string | symbol, any>>(target: T): T;

/**
 * 传说中的render函数
*/
declare type ComponentConstructor = new (props: Record<string, any>, children: Array<any> | string) => Component$1 | VNode;
declare type H = (type: string | symbol | ComponentConstructor, props?: Record<string, any> | null, children?: Array<any> | string) => VNode;
declare function render(type: string | symbol | ComponentConstructor, props?: Record<string, any> | null, children?: Array<any> | string): VNode;

interface Component$1 {
    props: Record<string, any>;
    children: Array<Activer | VNode | string>;
    render(h?: H): VNode;
}

/**
 * 虚拟dom节点类型枚举
*/
declare enum VNODE_TYPE {
    ELEMENT = 0,
    TEXT = 1,
    FRAGMENT = 2,
    COMPONENT = 3,
    ARRAYNODE = 4
}
/**
 * 虚拟dom接口类型
*/
interface VNode {
    type: string | symbol | Component$1;
    props?: Record<string, any> | null;
    children?: Array<Activer | VNode | string> | string;
    flag: VNODE_TYPE;
    el?: HTMLElement | Text;
}

/**
 * 观察者
 * 观察数据的变化
*/
declare class Watcher<T = any> {
    value: T;
    callback: (oldValue: T, newValue: T) => void;
    activeProps: Activer<T>;
    constructor(activeProps: Activer<T>, callback: (oldValue: T, newValue: T) => void);
    update(targetPropOldValue: any, targetPropnewValue: any): void;
}
/**
 * 监控自定义响应式属性
*/
declare function watch<T = any>(activeProps: (() => T) | Activer<T>, callback: (oldValue: T, newValue: T) => void): Watcher<T>;
/**
 * 监控可变状态dom
*/
declare type RowChildType = VNode | null | Array<VNode>;
declare function watchVNode(activeVNode: Activer<RowChildType>, callback: (oldVNode: VNode, newVNode: VNode) => void): VNode;
/**
 * 监控可变dom的prop
*/
declare function watchProp(activeProp: Activer, callback: (oldVNode: VNode, newVNode: VNode) => void): any;

/**
 * 实现响应式对象
*/
declare function reactive<T extends Record<string | symbol, any>>(target: T): T;

declare const Fragment: unique symbol;

declare const Text$1: unique symbol;

declare function mount(vnode: VNode, container: HTMLElement, anchor?: HTMLElement): void;

/**
 * 根类组件(向下兼容)
 * 已废弃
*/
interface Config {
    data?: Record<string | symbol, any>;
}
declare abstract class Component {
    private config;
    data: Record<any, any>;
    props?: Record<any, any>;
    children?: Record<string, any>;
    constructor(config?: Config);
    abstract render(h: H): VNode;
}

declare class Vact {
    rootVNode: VNode;
    constructor(vnode: VNode, options?: Record<string, any>);
    mount(selector: string): void;
}
declare function createApp(vnode: VNode, options?: Record<string, any>): Vact;

export { Activer, Component, Fragment, Text$1 as Text, createApp, render as createVNode, Vact as default, defineState, mount, reactive, ref, render, state, watch, watchProp, watchVNode };
