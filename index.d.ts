declare class TextVNode extends VNode {
    type: number;
    text: string;
    textNode?: Text;
    constructor(text: string);
    createTextNode(): Text;
    getRNode(): HTMLElement | Text;
}

declare type ChildVNode = ElementVNode | TextVNode | ComponentVNode | FragmentVNode;
declare type BaseChildVNode = string | ElementVNode | Component | ComponentVNode | FragmentVNode | Array<string | ElementVNode | Component | ComponentVNode | FragmentVNode>;
declare type RBaseChildVNode = BaseChildVNode | (() => BaseChildVNode);
interface SubComponent {
    createEFVNode(): ElementVNode | FragmentVNode;
    setProps(props: {}): void;
    setChildren(children: any[]): void;
    getEFVNode(): ElementVNode | FragmentVNode;
}

declare class FragmentVNode extends VNode {
    type: number;
    props?: {
        [key: string]: any;
    };
    children?: Array<RBaseChildVNode>;
    fragment?: HTMLElement;
    VNodeChildren: Array<ChildVNode | ChildVNode[]>;
    pivot: TextVNode;
    constructor(props?: Record<any, any>, children?: any[]);
    getPivot(): TextVNode;
    setPivot(pivot: TextVNode): void;
    getRNode(): HTMLElement;
    getParentMountedEle(): HTMLElement;
    createFragment(): HTMLElement;
    /**
     * 处理子节点
    */
    setChildren(): void;
}

declare abstract class VNode {
    parentVNode?: ElementVNode | FragmentVNode;
    abstract type: number;
    static ELEMENT: number;
    static TEXT: number;
    static COMPONENT: number;
    static FRAGMENT: number;
    abstract getRNode(): HTMLElement | Text;
    setParentVNode(parent?: ElementVNode | FragmentVNode): void;
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
    createEle(): HTMLElement | undefined;
    /**
     * 处理原生node节点的属性绑定
    */
    setProps(): void;
    /**
     * 处理子节点
    */
    setChildren(): void;
}

/**
 * 组件节点
*/
interface SubComponentConstructor {
    new (): SubComponent;
}
declare type FunComponentType = (props?: Record<any, any>, children?: any[]) => ElementVNode;
declare type ComponentConstructor = SubComponentConstructor | FunComponentType;
declare class ComponentVNode extends VNode {
    type: number;
    component?: SubComponent;
    Constructor: ComponentConstructor;
    props?: Record<any, any>;
    children?: any[];
    constructor(Constructor: ComponentConstructor, props?: Record<any, any>, children?: any[]);
    createComponent(): SubComponent;
    getComponent(): SubComponent;
    getRNode(): HTMLElement;
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
    children?: any[];
    efVNode?: ElementVNode | FragmentVNode;
    classComponent: boolean;
    constructor(config?: Config);
    setProps(props: {}): void;
    setChildren(children: any[]): void;
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
