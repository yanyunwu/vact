import { ComponentInstance } from './component'

/**
 * 主要实现关于组件的生命周期
 */


export interface ComponentLifeCycleInstance {

    /** 组件示例创建之后触发 */
    created(fn: () => void): void

    /** 组件示例在渲染之前触发(DOM还没有生成) */
    beforeMounted(fn: () => void): void

    /** dom已经生成到js内存但还没挂载 */
    readyMounted(fn: () => void): void

    /** dom挂载到了页面上*/
    mounted(fn: () => void): void

    /** 卸载之前触发 */
    beforeUnMounted(fn: () => void):void

    /** 卸载之后触发 */
    unMounted(fn: () => void):void
}

type LifeCycleNames<T = keyof ComponentLifeCycleInstance> = T extends string ? `${T}List` : never
type GetCycleName<T> = T extends `${infer U}List` ? U : never



export class ComponentLifeCycle implements ComponentLifeCycleInstance {


    constructor(
        private readonly createdList: Array<() => void> = [],
        private readonly beforeMountedList: Array<() => void> = [],
        private readonly readyMountedList: Array<() => void> = [],
        private readonly mountedList: Array<() => void> = [],
        private readonly beforeUnMountedList: Array<() => void> = [],
        private readonly unMountedList: Array<() => void> = []
    ) {
        // this.createdList = []
        // this.beforeMountedList = []
        // this.readyMountedList = []
        // this.mountedList = []
        // this.beforeUnMountedList = []
        // this.unMountedList = []
    }

    created(fn: () => void): void {
        this.createdList.push(fn)
    }

    beforeMounted(fn: () => void): void {
        this.beforeMountedList.push(fn)
    }

    readyMounted(fn: () => void): void {
        this.readyMountedList.push(fn)
    }

    mounted(fn: () => void): void {
        this.mountedList.push(fn)
    }

    beforeUnMounted(fn: () => void): void {
        this.beforeUnMountedList.push(fn)
    }

    unMounted(fn: () => void): void {
        this.unMountedList.push(fn)
    }

    emit(lifeName: keyof ComponentLifeCycleInstance) {
        this[`${lifeName}List`].forEach(fn => fn())
    }

}

// 生成类组件生命周期实例
export function createClassComponentLife(component: ComponentInstance) {
    let lifeNames: [
        'created',
        'beforeMounted',
        'readyMounted',
        'mounted',
        'beforeUnMounted',
        'unMounted'
    ] = ['created', 'beforeMounted', 'readyMounted', 'mounted', 'beforeUnMounted', 'unMounted']

    let lifeCycle = new ComponentLifeCycle()
    component.life = lifeCycle

    lifeNames.forEach(lifeName => {
        let fn = component[lifeName]
        if(!fn) return
        lifeCycle[lifeName](fn.bind(component))
    })

    return lifeCycle
}


