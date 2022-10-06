import {OriginVNode, VNode} from "../vnode";
import {App} from "../app";
import {createVNode} from "../render";
import {
    isVArrayNode,
    isVComponentNode,
    isVElementNode,
    isVFragmentNode
} from "../utils";

export interface OrderMap {
    [orderProp: string]: {
        propName: string
        handler: OrderHandler
        priority: number
    }
}
export interface OrderHandlerCtx {
    value: any
    vNode: VNode
}
export type OrderHandler = (ctx: OrderHandlerCtx) => OriginVNode

// 初始化所有虚拟dom的指令
export function renderWithOrder(vNode: VNode, app: App): VNode {
    // if (isVAliveNode(vNode)) {
    //     let preActiver = vNode.activer
    //     vNode.activer = active(()=> renderWithOrder(createVNode(preActiver.value), app))
    // }

    if (isVComponentNode(vNode)) {
        vNode.root = renderWithOrder(vNode.root, app)
    }

    if (
        isVElementNode(vNode) ||
        isVFragmentNode(vNode) ||
        isVArrayNode(vNode)
    ) {
        vNode.children = vNode.children.map(node => renderWithOrder(node, app))
    }

    if (
        isVElementNode(vNode) ||
        isVComponentNode(vNode)
    ) {
        // console.log(vNode)
        // 根据优先级排列
        let orderList = Object.values(app.orderMap).sort((a, b) => b.priority - a.priority)
        return orderList.reduce<VNode>((pre, cur) => {
            if (pre.props && pre.props[cur.propName] != null) {
                let res =  cur.handler({value: pre.props[cur.propName], vNode: pre })
                return createVNode( res === undefined ? pre : res )
            }else {
                return pre
            }
        }, vNode)
    }

    return vNode
}

export function registerOrder(this: App, propName: string, handler: OrderHandler, priority: number = 0) {
    this.orderMap[propName] = {
        handler, priority, propName
    }
}
