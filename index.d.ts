declare abstract class VNode {
    abstract type: number;
    static ELEMENT: number;
    static TEXT: number;
    static COMPONENT: number;
}

declare type BaseElementVNodeChild = string | TextVNode | ElementVNode | Component$1 | Array<any>;
declare type ElementVNodeChild = BaseElementVNodeChild | (() => BaseElementVNodeChild);
interface SubComponent {
    new (props: {}, children: []): SubComponent;
    renderRoot(): ElementVNode;
    setProps(props: {}): void;
    setChildren(children: any[]): void;
}

declare class ElementVNode extends VNode {
    static nativeEvents: {
        [key: string]: any;
    };
    tag: string;
    props?: {
        [key: string]: any;
    };
    children?: Array<ElementVNodeChild>;
    type: number;
    ele?: HTMLElement;
    constructor(tag: string, props?: {}, children?: []);
    createEle(): HTMLElement;
    getRealNode(child: BaseElementVNodeChild): HTMLElement | Text;
    getRealNodeList(childList: Array<BaseElementVNodeChild>): Array<HTMLElement | Text>;
    addChildren(children: Array<HTMLElement | Text>, pivot: Text): void;
    removeChildren(children: Array<HTMLElement | Text>): void;
    addChild(child: ElementVNodeChild): void;
}

/**
 * 组件节点
*/
interface SubComponentConstructor {
    new (props: Record<any, any>, children: any[]): SubComponent;
}
declare type FunComponent = (props: Record<any, any>, children: any[]) => ElementVNodeChild;
declare type ComponentConstructor = SubComponentConstructor | FunComponent;
declare class ComponentVNode extends VNode {
    type: number;
    component?: SubComponent | ElementVNodeChild;
    Constructor: ComponentConstructor;
    props?: Record<any, any>;
    children?: any[];
    constructor(Constructor: ComponentConstructor, props?: Record<any, any>, children?: any[]);
    init(): void;
    getComponent(): SubComponent | ElementVNodeChild;
}

declare class TextVNode extends VNode {
    type: number;
    text: string;
    textNode?: Text;
    constructor(text: string);
    createTextNode(): Text;
}

declare function mount$1(selector: string, rootNode: Component$1): void;
declare type SubConstructor = new (props: Record<any, any>, children: any[]) => SubComponent;
declare function createNode$1(a: string | SubConstructor, b?: {}, c?: []): ElementVNode | ComponentVNode;
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
    constructor(config?: Config);
    setData(): void;
    setProps(props: {}): void;
    setChildren(children: any[]): void;
    abstract render(h: (a: string | SubConstructor, b?: {}, c?: []) => ElementVNode | ComponentVNode): ElementVNode;
    renderRoot(): ElementVNode;
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

export { Component, createNode, Vact as default, defineState, mount };
