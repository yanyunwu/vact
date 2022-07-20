import { EventEmitter } from 'events';

declare type ParentVNode = ElementVNode;
declare type ChildVNode = TextVNode | ElementVNode | ComponentVNode | FragmentVNode | ArrayVNode;
declare type BaseChildVNode = string | ElementVNode | ComponentVNode | FragmentVNode | ArrayVNode | Array<string | ElementVNode | ComponentVNode | FragmentVNode>;
declare type RBaseChildVNode = BaseChildVNode | (() => BaseChildVNode);

/**
 * 数据响应式中心
*/
/**
 * 数据事件存放处
*/
declare class DataEventProxy {
    private valueMap;
    constructor();
    getProp(target: Record<any, any>, prop: any): PropValue;
    getEventProxy(target: Record<any, any>): Record<any, any>;
    setEventProxy(target: Record<any, any>, valueTarget: Record<any, any>): void;
}
/**
 * 监控数据响应变化处
*/
declare class DataProxy<T extends object> {
    private target;
    private data;
    private dataProxyValue;
    constructor(data: T);
    getData(): T;
    getTarget(): T;
    getEventProxy(): DataEventProxy;
    private replaceProps;
}

declare class PropValue extends EventEmitter {
    value: any;
    private dep;
    dataProxy?: DataProxy<object>;
    constructor(value: any, dataProxy?: DataProxy<object>);
    setDep(watcher: Watcher): void;
    valueOf(): any;
    toString(): any;
    set(value: any): void;
    get(): any;
    notify(): void;
}
declare class Watcher {
    fn: () => void;
    running: boolean;
    constructor(fn: () => void);
    update(): void;
}

declare abstract class VNode {
    parentVNode?: ElementVNode;
    abstract type: number;
    static ELEMENT: number;
    static TEXT: number;
    static COMPONENT: number;
    static FRAGMENT: number;
    abstract getRNode(): HTMLElement | Text;
    setParentVNode(parent?: ElementVNode): void;
    propValues?: Array<PropValue>;
    fn?: () => void;
    abstract createRNode(): void;
    setDeps(propValues: Array<PropValue>, fn: () => void): void;
    bindDeps(): void;
    abstract mount(): void;
    abstract replaceWith(node: ChildVNode): void;
}

declare class ElementVNode extends VNode {
    tag: string;
    props?: {
        [key: string]: any;
    };
    children?: Array<RBaseChildVNode>;
    type: number;
    ele?: HTMLElement;
    constructor(tag: string, props?: Record<any, any>, children?: any[]);
    getRNode(): HTMLElement;
    /**
     * 处理原生node节点的属性绑定
    */
    setProps(): void;
    createRNode(): void;
    mount(): void;
    replaceWith(node: ChildVNode): void;
    remove(): void;
}

declare class TextVNode extends VNode {
    type: number;
    text: string;
    textNode?: HTMLElement;
    constructor(text: string);
    getRNode(): HTMLElement;
    createRNode(): void;
    mount(): void;
    replaceWith(node: ChildVNode): void;
    remove(): void;
}

declare class FragmentVNode extends VNode {
    type: number;
    props?: {
        [key: string]: any;
    };
    children?: Array<RBaseChildVNode>;
    fragment?: HTMLElement;
    VNodeChildren: Array<ChildVNode>;
    pivot: TextVNode;
    constructor(props?: Record<any, any>, children?: any[]);
    getRNode(): HTMLElement;
    /**
     * 处理子节点
    */
    setChildren(): void;
    createRNode(): void;
    mount(): void;
    replaceWith(node: ChildVNode): void;
    remove(): void;
}

declare class SlotVNode {
    children: Array<BaseChildVNode>;
    constructor(children: Array<BaseChildVNode>);
}

interface SubComponent {
    createEFVNode(): ElementVNode | FragmentVNode;
    setProps(props: {}): void;
    setChildren(children: Record<string, SlotVNode>): void;
    getEFVNode(): ElementVNode | FragmentVNode;
}

/**
 * 组件节点
*/
interface SubComponentConstructor {
    new (): SubComponent;
}
declare type FunComponentType = (props?: Record<any, any>, children?: Record<string, SlotVNode>) => ElementVNode;
declare type ComponentConstructor = SubComponentConstructor | FunComponentType;
declare class ComponentVNode extends VNode {
    type: number;
    component?: SubComponent;
    Constructor: ComponentConstructor;
    props?: Record<any, any>;
    children?: RBaseChildVNode[];
    constructor(Constructor: ComponentConstructor, props?: Record<any, any>, children?: RBaseChildVNode[]);
    setComponentProps(): Record<any, any>;
    setComponentChildren(): Record<string, SlotVNode>;
    getComponent(): SubComponent;
    getRNode(): HTMLElement;
    createRNode(): void;
    mount(): void;
    replaceWith(node: ChildVNode): void;
    remove(): void;
}

declare class ArrayVNode extends VNode {
    readonly type: number;
    props: Record<any, any>;
    bnodeList: Array<string | ElementVNode | ComponentVNode | FragmentVNode>;
    nodeList: Array<TextVNode | ElementVNode | ComponentVNode | FragmentVNode>;
    fragment?: HTMLElement;
    pivot: TextVNode;
    constructor(props: Record<any, any>, bnodeList: Array<string | ElementVNode | ComponentVNode | FragmentVNode>);
    setParentVNode(parent?: ParentVNode): void;
    getRNode(): HTMLElement;
    createRNode(): void;
    mount(): void;
    replaceWith(node: ChildVNode): void;
    remove(): void;
}

interface StateConfig {
    deep?: boolean;
}
declare class State<T extends object> {
    private dataProxy;
    private config?;
    constructor(data: T, config?: StateConfig);
    get data(): T;
    watch(path: string, fn: (value: any) => void): void;
}

declare function defineState(data: Record<string | number | symbol, any>, config?: StateConfig): State<Record<string | number | symbol, any>>;
declare function mount(selector: string, rootNode: Component | ComponentVNode): void;
declare type SubConstructor = new () => SubComponent;
declare function createNode(nodeTag: string | SubConstructor | symbol, props?: Record<any, any>, children?: any[]): ElementVNode | ComponentVNode | FragmentVNode;

/**
 * 根组件
*/
interface Config {
    data?: {
        [key: string | symbol]: any;
    };
}
declare abstract class Component {
    private config;
    data: Record<any, any>;
    props?: Record<any, any>;
    children?: Record<string, SlotVNode>;
    efVNode?: ElementVNode | FragmentVNode;
    classComponent: boolean;
    constructor(config?: Config);
    setProps(props: {}): void;
    setChildren(children: Record<string, SlotVNode>): void;
    abstract render(h: (nodeTag: string | SubConstructor | symbol, props?: Record<any, any>, children?: any[]) => ElementVNode | ComponentVNode | FragmentVNode): ElementVNode | ComponentVNode | FragmentVNode;
    createEFVNode(): ElementVNode | FragmentVNode;
    getEFVNode(): ElementVNode | FragmentVNode;
}

declare class Vact {
    static Fragment: symbol;
    private static depPool;
    static getDepPool(): any[];
    private static updating;
    private static watcherTask;
    static runTask(fn: Function): void;
    static Component: any;
    static mount: typeof mount;
    static createNode: typeof createNode;
}

declare const h: typeof createNode;
declare const Fragment: symbol;

export { Component, Fragment, createNode, Vact as default, defineState, h, mount };
