import {active} from "./reactive";
import {Activer} from './reactive'
import {
  isActiver,
  isArray,
  isArrayNode,
  isFragment,
  isFunction,
  isOnEvent,
  isString,
  isText,
  isVNode} from "./utils";
import {
  ClassComponentType,
  ComponentType,
  FunctionComponentType,
  VComponent
} from "./vnode";
import {
  OriginVNode,
  VNode,
  VNODE_TYPE,
  VNodeProps
} from "./vnode";
import {
  ArraySymbol,
  AliveSymbol,
  TextSymbol,
  FragmentSymbol,
  VComponentSymbol
} from "./vnode";
import {ComponentLifeCycle, createClassComponentLife} from "./lifeCycle";

/**
 * 传说中的render函数
*/

export type HSymbol = typeof TextSymbol | typeof FragmentSymbol | typeof AliveSymbol | typeof ArraySymbol
export type HType = string | HSymbol | ComponentType
export type H = (type: HType,  props?: VNodeProps, children?: OriginVNode | Array<OriginVNode>) => VNode

/**
 * 函数转化为activer转化为VAlive
 * activer转化为VAlive
 * string转化为VText
 * 数组转化为VArray
 * 其他转化为VText
*/
export function createVNode(originVNode: OriginVNode): VNode {
  if (isVNode(originVNode)) return originVNode

  if (isFunction(originVNode)) return renderAlive(active(originVNode))
  else if (isActiver(originVNode)) return renderAlive(originVNode)
  else if (isString(originVNode)) return renderText(originVNode)
  else if (isArray(originVNode)) return renderArrayNode(originVNode.map(item => createVNode(item)))
  else {
    // todo
    let value = originVNode
    let retText: VNode
    if (!value && typeof value !== 'number') retText = renderText('')
    else retText = renderText(String(value))
    return retText
  }
}


/**
 * text(不需要props)、fragment(不需要props)、element、component为显性创建
 * array(不需要props)、alive(不需要props)为隐形创建
*/
export function renderApi(type: HType, props?: VNodeProps | null, children?: OriginVNode | Array<OriginVNode>): VNode {
  return render(type, props || undefined, children)
}

export function render(type: HType, originProps?: VNodeProps, originChildren?: OriginVNode | Array<OriginVNode>): VNode {
  // text的children比较特殊先处理
  if (isText(type)) {
    return renderText(String(originChildren))
  }

  // 预处理 处理为单个的children
  let originChildrenList: Array<OriginVNode> = []
  if (isArray(originChildren)) originChildrenList.push(...originChildren)
  else originChildrenList.push(originChildren)
  // 创建VNode列表
  let vNodeChildren: Array<VNode> = originChildrenList.map(originChild => createVNode(originChild))

  // 属性预处理
  let props: VNodeProps = originProps || {}
  handleProps(props)

  if (isString(type)) return renderElement(type, props , vNodeChildren)
  if (isFragment(type)) return renderFragment(vNodeChildren)
  if (isArrayNode(type)) return renderArrayNode(vNodeChildren)
  if (isFunction(type)) return renderComponent(type, props, vNodeChildren)
  throw '传入参数不合法'
}


/**
 * 对属性进行预处理
 */
function handleProps(originProps: VNodeProps): VNodeProps {
  for (const prop in originProps) {
    // 以on开头的事件不需要处理
    if (
        !isOnEvent(prop) &&
        isFunction(originProps[prop])
    ) {
      // 如不为on且为函数则判断为响应式
      originProps[prop] = active(originProps[prop])
    }
  }

  return originProps
}

function renderText(text: string): VNode {
  return {
    type: TextSymbol,
    flag: VNODE_TYPE.TEXT,
    children: text
  }
}

function renderElement(tag: string, props: Record<string, any>, children: Array<VNode>): VNode {
  return {
    type: tag,
    flag: VNODE_TYPE.ELEMENT,
    props,
    children
  }
}

function renderFragment(children: Array<VNode>): VNode {
  return {
    type: FragmentSymbol,
    flag: VNODE_TYPE.FRAGMENT,
    children
  }
}

function renderArrayNode(children: Array<VNode>): VNode {
  return {
    type: ArraySymbol,
    flag: VNODE_TYPE.ARRAYNODE,
    children
  }
}

function createComponentProps(props: VNodeProps): VNodeProps {
  let componentProps:VNodeProps = {}
  for (const prop in props) {
    let curProp = props[prop]
    if (isActiver(curProp)) {
      Object.defineProperty(componentProps, prop, {
        get() {
          return (curProp as Activer).value
        }
      })
    } else {
      componentProps[prop] = curProp
    }
  }

  return componentProps
}

// 渲染一个活跃的节点
function renderAlive(activer: Activer): VNode {
  return {
    type: AliveSymbol,
    flag: VNODE_TYPE.ALIVE,
    activer
  }
}

// 判断是普通函数还是构造函数
function renderComponent(component: ComponentType, props: VNodeProps, children: Array<VNode>): VComponent {
  let componentProps = createComponentProps(props)

  if (
      component.prototype &&
      component.prototype.render &&
      isFunction(component.prototype.render)
  ) {
    let ClassComponent = component as ClassComponentType
    let result = new ClassComponent(componentProps, children)
    result.props = componentProps
    result.children = children
    let lifeCycle = createClassComponentLife(result)
    let vn = result.render(renderApi)
    lifeCycle.emit('created')
    let vc: VComponent = {
      type: VComponentSymbol,
      root: createVNode(vn),
      props: componentProps,
      children: children,
      flag: VNODE_TYPE.COMPONENT,
      lifeStyleInstance: lifeCycle
    }

    lifeCycle.emit('beforeMounted')

    return vc
  } else {
    let FunctionComponent = component as FunctionComponentType
    let lifeCycle = new ComponentLifeCycle()
    let vn = FunctionComponent(componentProps, children, lifeCycle)
    lifeCycle.emit('created')
    let vc: VComponent =  {
      type: VComponentSymbol,
      root: createVNode(vn),
      props: componentProps,
      children: children,
      flag: VNODE_TYPE.COMPONENT,
      lifeStyleInstance: lifeCycle
    }

    lifeCycle.emit('beforeMounted')
    return vc
  }
}






