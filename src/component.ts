import { H } from './render'
import { VNode, VNodeProps, OriginVNode, FunctionComponentType } from "./vnode"
import {appUtils, AppUtils} from "./plugin";
import {ComponentLifeCycle} from "./lifeCycle";


/**
 * 根类组件用于类型提示
 * 抽象类
*/

// todo
export interface ComponentInstance {
  props?: VNodeProps
  children?: Array<OriginVNode>
  utils: AppUtils
  life?: ComponentLifeCycle
  render(h?: H): OriginVNode

  /** 组件示例创建之后触发 */
  created?(): void

  /** 组件示例在渲染之前触发(DOM还没有生成) */
  beforeMounted?(): void

  /** dom已经生成到js内存但还没挂载 */
  readyMounted?(): void

  /** dom挂载到了页面上*/
  mounted?(): void

  /** 卸载之前触发 */
  beforeUnMounted?():void

  /** 卸载之后触发 */
  unMounted?():void
}

export abstract class Component implements ComponentInstance{
  // 组件属性
  abstract props?: VNodeProps
  // 组件子元素
  abstract children?: Array<OriginVNode>

  abstract render(h?: H): VNode

  utils: AppUtils = appUtils
  abstract life?: ComponentLifeCycle

  /** 组件示例创建之后触发 */
  abstract created?(): void

  /** 组件示例在渲染之前触发(DOM还没有生成) */
  abstract beforeMounted?(): void

  /** dom已经生成到js内存但还没挂载 */
  abstract readyMounted?(): void

  /** dom挂载到了页面上*/
  abstract mounted?(): void

  /** 卸载之前触发 */
  abstract beforeUnMounted?():void

  /** 卸载之后触发 */
  abstract unMounted?():void
}

export function defineComponent(componentType: FunctionComponentType): FunctionComponentType {
  return componentType
}
