import {ComponentType} from 'vactapp'

// 用来保存id对component的映射
export class Dynamic {
    map: Map<string, ComponentType> = new Map()

    addMapComponent(id: string, component: ComponentType) {
        this.map.set(id, component)
        return this
    }

    getMapComponent(id: string): ComponentType | undefined {
        return this.map.get(id)
    }
}

export function createDynamic():Dynamic {
    return new Dynamic()
}
