declare abstract class VNode {
    abstract type: number;
    static ELEMENT: number;
    static TEXT: number;
    static COMPONENT: number;
    abstract getRVnode(): HTMLElement | Text;
}

declare type BaseChildVNode = string | ElementVNode | Component$1 | ComponentVNode | Array<string | ElementVNode | Component$1 | ComponentVNode>;
declare type RBaseChildVNode = BaseChildVNode | (() => BaseChildVNode);
interface SubComponent {
    new (props: {}, children: []): SubComponent;
    renderRoot(): ElementVNode;
    setProps(props: {}): void;
    setChildren(children: any[]): void;
    getElementVNode(): ElementVNode;
}

declare class ElementVNode extends VNode {
    tag: string;
    props?: {
        [key: string]: any;
    };
    children?: Array<RBaseChildVNode>;
    type: number;
    ele?: HTMLElement;
    constructor(tag: string, props?: {}, children?: []);
    getRVnode(): HTMLElement;
    createEle(): HTMLElement;
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
    new (props: Record<any, any>, children: any[]): SubComponent;
}
declare type FunComponent = (props: Record<any, any>, children: any[]) => RBaseChildVNode;
declare type ComponentConstructor = SubComponentConstructor | FunComponent;
declare class ComponentVNode extends VNode {
    type: number;
    component?: SubComponent | RBaseChildVNode;
    Constructor: ComponentConstructor;
    props?: Record<any, any>;
    children?: any[];
    constructor(Constructor: ComponentConstructor, props?: Record<any, any>, children?: any[]);
    init(): void;
    getComponent(): SubComponent | RBaseChildVNode;
    getRVnode(): HTMLElement;
}

declare function mount$1(selector: string, rootNode: Component$1 | ComponentVNode): void;
declare type SubConstructor = new (props: Record<any, any>, children: any[]) => SubComponent;
declare function createNode$1(nodeTag: string | SubConstructor, props?: {}, children?: []): ElementVNode | ComponentVNode;
declare class Vact {
    static depPool: any[];
    static getDepPool(): any[];
    static Component: typeof Component$1;
    static mount: typeof mount$1;
    static createNode: typeof createNode$1;
}

/**
 * 根组件
*/
interface Config {
    data?: {
        [key: string | symbol]: any;
    };
}
declare abstract class Component$1 {
    private config;
    data?: {};
    props?: {};
    children?: any[];
    elementVNode?: ElementVNode;
    constructor(config?: Config);
    setData(): void;
    setProps(props: {}): void;
    setChildren(children: any[]): void;
    abstract render(h: (a: string | SubConstructor, b?: {}, c?: []) => ElementVNode | ComponentVNode): ElementVNode;
    renderRoot(): ElementVNode;
    getElementVNode(): ElementVNode;
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

declare const mount: typeof mount$1;
declare const Component: typeof Component$1;
declare const createNode: typeof createNode$1;

declare const h: typeof createNode$1;

export { Component, createNode, Vact as default, defineState, h, mount };
