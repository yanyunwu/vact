declare class RefImpl<T = any> {
    private _value;
    private readonly _target;
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
/**
 * 外置函数
*/
declare function active<T extends any>(fn: () => T): Activer<T>;

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
    depArr?: Array<any> | false;
    nextDepArr?: Array<any>;
    constructor(activeProps: Activer<T>, callback: (oldValue: T, newValue: T, meta?: Meta) => void);
    update(): void;
}
/**
 * 监控自定义响应式属性
*/
declare function watch<T = any>(activeProps: (() => T) | Activer<T>, callback: (oldValue: T, newValue: T) => void): Watcher<T>;
/**
 * 监控可变状态dom
*/
declare function watchVNode(activeVNode: VAlive, callback: (oldVNode: VNode, newVNode: VNode) => void): VNode;
/**
 * 监控可变dom的prop
*/
declare function watchProp(activeProp: Activer, callback: (oldVNode: VNode, newVNode: VNode) => void): any;

/**
 * 实现响应式对象
*/
declare function reactive<T extends Record<string | symbol, any>>(target: T): T;
/**
 * 响应触发依赖
*/
declare function trigger(target: Record<string | symbol, any>, prop: string | symbol): void;
/**
 * 追踪绑定依赖
*/
declare function track(target: Record<string | symbol, any>, prop: string | symbol): void;
declare function setActiver(fn: Watcher | null): void;
declare function getActiver(): Watcher | null;

/**
 * 传说中的render函数
*/
declare type HSymbol = typeof TextSymbol | typeof FragmentSymbol | typeof AliveSymbol | typeof ArraySymbol;
declare type HType = string | HSymbol | ComponentType;
declare type H = (type: HType, props?: VNodeProps, children?: OriginVNode | Array<OriginVNode>) => VNode;
/**
 * text(不需要props)、fragment(不需要props)、element、component为显性创建
 * array(不需要props)、alive(不需要props)为隐形创建
*/
declare function renderApi(type: HType, props?: VNodeProps | null, children?: OriginVNode | Array<OriginVNode>): VNode;

interface AppUtils {
    state: typeof state;
    defineState: typeof defineState;
    h: typeof renderApi;
    watch: typeof watch;
}
interface AppContext {
    utils: AppUtils;
}
interface AppPlugin {
    install(utils: AppContext): void;
}

/**
 * 根类组件用于类型提示
 * 抽象类
*/
interface ComponentInstance {
    props?: VNodeProps;
    children?: Array<OriginVNode>;
    utils: AppUtils;
    life?: ComponentLifeCycle;
    render(h?: H): OriginVNode;
    /** 组件示例创建之后触发 */
    created?(): void;
    /** 组件示例在渲染之前触发(DOM还没有生成) */
    beforeMounted?(): void;
    /** dom已经生成到js内存但还没挂载 */
    readyMounted?(): void;
    /** dom挂载到了页面上*/
    mounted?(): void;
    /** 卸载之前触发 */
    beforeUnMounted?(): void;
    /** 卸载之后触发 */
    unMounted?(): void;
}
declare abstract class Component implements ComponentInstance {
    abstract props?: VNodeProps;
    abstract children?: Array<OriginVNode>;
    abstract render(h?: H): VNode;
    utils: AppUtils;
    abstract life?: ComponentLifeCycle;
    /** 组件示例创建之后触发 */
    abstract created?(): void;
    /** 组件示例在渲染之前触发(DOM还没有生成) */
    abstract beforeMounted?(): void;
    /** dom已经生成到js内存但还没挂载 */
    abstract readyMounted?(): void;
    /** dom挂载到了页面上*/
    abstract mounted?(): void;
    /** 卸载之前触发 */
    abstract beforeUnMounted?(): void;
    /** 卸载之后触发 */
    abstract unMounted?(): void;
}
declare function defineComponent(componentType: FunctionComponentType): FunctionComponentType;

/**
 * 主要实现关于组件的生命周期
 */
interface ComponentLifeCycleInstance {
    /** 组件示例创建之后触发 */
    created(fn: () => void): void;
    /** 组件示例在渲染之前触发(DOM还没有生成) */
    beforeMounted(fn: () => void): void;
    /** dom已经生成到js内存但还没挂载 */
    readyMounted(fn: () => void): void;
    /** dom挂载到了页面上*/
    mounted(fn: () => void): void;
    /** 卸载之前触发 */
    beforeUnMounted(fn: () => void): void;
    /** 卸载之后触发 */
    unMounted(fn: () => void): void;
}
declare class ComponentLifeCycle implements ComponentLifeCycleInstance {
    private readonly createdList;
    private readonly beforeMountedList;
    private readonly readyMountedList;
    private readonly mountedList;
    private readonly beforeUnMountedList;
    private readonly unMountedList;
    constructor(createdList?: Array<() => void>, beforeMountedList?: Array<() => void>, readyMountedList?: Array<() => void>, mountedList?: Array<() => void>, beforeUnMountedList?: Array<() => void>, unMountedList?: Array<() => void>);
    created(fn: () => void): void;
    beforeMounted(fn: () => void): void;
    readyMounted(fn: () => void): void;
    mounted(fn: () => void): void;
    beforeUnMounted(fn: () => void): void;
    unMounted(fn: () => void): void;
    emit(lifeName: keyof ComponentLifeCycleInstance): void;
}

interface ComponentContext {
    props: Record<string, any>;
    children: Array<VNode>;
    life: ComponentLifeCycle;
    utils: AppUtils;
}
/** 函数组件类型 */
interface FunctionComponentType {
    (context: ComponentContext): OriginVNode;
}
/** 类组件类型 */
interface ClassComponentType {
    new (props: Record<string, any>, children: Array<VNode>): ComponentInstance;
}
declare type ComponentType = FunctionComponentType | ClassComponentType;
declare const VComponentSymbol: unique symbol;

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
declare type VNodeElement = ChildNode;
/**
 * 虚拟dom接口类型
*/
interface VNode {
    type: string | symbol | ComponentType;
    flag: VNODE_TYPE;
    props?: Record<string, any>;
    children?: Array<VNode> | string;
    el?: VNodeElement;
    anchor?: VNodeElement;
    activer?: Activer;
    vnode?: VNode;
}
declare type NotFunctionOriginVNode = string | VNode | Array<OriginVNode> | Activer;
declare type WithFunctionOriginVNode = (() => OriginVNode) | NotFunctionOriginVNode;
declare type OriginVNode = WithFunctionOriginVNode | Exclude<any, WithFunctionOriginVNode>;
/** 虚拟节点属性 todo */
interface VNodeProps {
    [propName: string]: any;
}

declare const TextSymbol: unique symbol;

declare const FragmentSymbol: unique symbol;

declare const ArraySymbol: unique symbol;

declare const AliveSymbol: unique symbol;
interface VAlive extends VNode {
    type: symbol;
    flag: VNODE_TYPE.ELEMENT;
    activer: Activer<OriginVNode>;
    vnode: VNode;
}

interface Options {
    arrayDiff?: boolean;
}
declare class App {
    rootVNode: VNode;
    options: Options;
    private pluginList;
    constructor(vNode: VNode, options?: Options);
    mount(selector?: string | HTMLElement): void;
    use(plugin: AppPlugin): this;
}
declare function createApp(vNode: VNode, options?: Options): App;

declare function mount(vnode: VNode, container: HTMLElement, anchor?: VNodeElement, app?: App): void;

export { Activer, Component, RefImpl, ArraySymbol as VArray, VComponentSymbol as VComponent, FragmentSymbol as VFragment, TextSymbol as VText, Watcher, active, createApp, renderApi as createVNode, App as default, defineComponent, defineState, getActiver, renderApi as h, mount, reactive, ref, renderApi as render, setActiver, state, track, trigger, watch, watchProp, watchVNode };
