declare class VNode {
    static ELEMENT: number;
    static TEXT: number;
}
declare class TextVNode extends VNode {
    type: number;
    text: string;
    textNode?: Text;
    constructor(text: string);
    createTextNode(): Text;
}
declare type BaseElementVNodeChild = string | TextVNode | ElementVNode | Component$1 | Array<any>;
declare type ElementVNodeChild = BaseElementVNodeChild | (() => BaseElementVNodeChild);
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
 * 根组件
*/
interface Config {
    data?: {
        [key: string | symbol]: any;
    };
}
declare abstract class Component$1 {
    config: Config;
    data?: {};
    constructor(config?: Config);
    setProxy(): void;
    abstract render(h: (tag: string, props: {}, childNodes: []) => TextVNode | ElementVNode): ElementVNode;
    renderRoot(): ElementVNode;
}

declare function mount$1(selector: string, rootNode: Component$1): void;
declare function createNode$1(a: string, b?: {}, c?: []): ElementVNode;

declare const mount: typeof mount$1;
declare const Component: typeof Component$1;
declare const createNode: typeof createNode$1;

export { Component, createNode, mount };
