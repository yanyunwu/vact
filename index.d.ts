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
 * 响应式对象
*/
declare class Activer<T = any> {
    callback: () => T;
    flag: string;
    constructor(fn: () => T);
    get value(): T;
}

interface Component$1 {
    props: Record<string, any>;
    children: Array<Activer | VNode | string>;
    render(h?: H): VNode;
}

/**
 * 传说中的render函数
*/
declare type ComponentConstructor = new (props: Record<string, any>, children: Array<VNode>) => Component$1 | VNode;
declare type H = (type: string | symbol | ComponentConstructor, props?: Record<string, any> | null, mayChildren?: Child | Array<Child>) => VNode;
declare type Child = (() => Child) | string | VNode | Array<Child> | Activer | Exclude<(() => Child) | string | VNode | Array<Child> | Activer, any>;
/**
 * text(不需要props)、fragment(不需要props)、element、component为显性创建
 * array(不需要props)、alive(不需要props)为隐形创建
*/
declare function render(type: string | symbol | ComponentConstructor, props?: Record<string, any> | null, mayChildren?: Child | Array<Child>): VNode;

declare type Meta = {
    targetPropOldValue: any;
    targetPropnewValue: any;
};
/**
 * 观察者
 * 观察数据的变化
*/
declare class Watcher<T = any> {
    value: T;
    callback: (oldValue: T, newValue: T, meta?: Meta) => void;
    activeProps: Activer<T>;
    constructor(activeProps: Activer<T>, callback: (oldValue: T, newValue: T, meta?: Meta) => void);
    update(targetPropOldValue: any, targetPropnewValue: any): void;
}
/**
 * 监控自定义响应式属性
*/
declare function watch<T = any>(activeProps: (() => T) | Activer<T>, callback: (oldValue: T, newValue: T) => void): Watcher<T>;
/**
 * 监控可变状态dom
*/
declare function watchVNode(activeVNode: Activer<Child>, callback: (oldVNode: VNode, newVNode: VNode) => void): VNode;
/**
 * 监控可变dom的prop
*/
declare function watchProp(activeProp: Activer, callback: (oldVNode: VNode, newVNode: VNode) => void): any;

/**
 * 实现响应式对象
*/
declare function reactive<T extends Record<string | symbol, any>>(target: T): T;

/**
 * 虚拟dom节点类型枚举
*/
declare enum VNODE_TYPE {
    ELEMENT = 0,
    TEXT = 1,
    FRAGMENT = 2,
    COMPONENT = 3,
    ARRAYNODE = 4,
    ALIVE = 5
}
/**
 * 虚拟dom接口类型
*/
interface VNode {
    type: string | symbol | Component$1;
    flag: VNODE_TYPE;
    props?: Record<string, any>;
    children?: Array<VNode> | string;
    el?: HTMLElement | Text;
    activer?: Activer;
    vnode?: VNode;
}

interface Options {
    arrayDiff?: boolean;
}
declare class Vact {
    rootVNode: VNode;
    options: Options;
    constructor(vnode: VNode, options?: Options);
    mount(selector: string): void;
}
declare function createApp(vnode: VNode, options?: Options): Vact;

declare const FragmentSymbol: unique symbol;

declare const TextSymbol: unique symbol;

declare function mount(vnode: VNode, container: HTMLElement, anchor?: HTMLElement, app?: Vact): void;

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

export { Activer, Component, FragmentSymbol as Fragment, TextSymbol as Text, createApp, render as createVNode, Vact as default, defineState, mount, reactive, ref, render, state, watch, watchProp, watchVNode };
