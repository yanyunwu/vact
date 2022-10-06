import {
    AppPluginInstance,
    AppContext,
    RefImpl,
    ComponentType,
    FunctionComponentType,
} from 'vactapp'
import {createDynamic, Dynamic} from './dynamic'
import path from 'path'
import {callback} from './routerView'

export interface Route {
    path: string
    component?: ComponentType
    children?: Array<Route>
}

export interface RouterConfig {
    mode: 'hash' | 'history'
    routes: Array<Route>
}

export const defaultRouterConfig: RouterConfig = {
    mode: 'hash',
    routes: []
}


export class Application implements AppPluginInstance {
    private readonly mode: 'hash' | 'history'
    private _path?: RefImpl<string>
    private readonly routes: Array<Route> = []
    private mapDynamic: Dynamic = createDynamic()
    RouterView: FunctionComponentType
    h: any

    get path(): string {
        if(!this._path) return ''
        return path.join(this._path.value, '/')
    }

    set path(value: string) {
        if(!this._path) return
        this._path.value = path.join(value, '/')
    }

    constructor(
        config: RouterConfig = defaultRouterConfig
    ) {
        this.routes = config.routes
        this.mode = config.mode
        handleRoutes(this.routes, this)
        this.RouterView = () => callback(this)
        if(this.mode === 'hash') {
            this.hash()
        }
    }

    private hash() {
        window.addEventListener('hashchange', (e) => {
            this.path = location.hash.slice(1)
        })

        window.addEventListener('DOMContentLoaded', () => {
            if (!location.hash) location.hash = "/"
            else this.path = location.hash.slice(1)
        })
    }

    addAllPathRoute(path: string, component: ComponentType) {
        this.mapDynamic.addMapComponent(path, component)
    }

    getPathComponent(): ComponentType {
        return this.mapDynamic.getMapComponent(this.path) || DefaultComponent
    }

    getMap() {
        return this.mapDynamic
    }

    install(ctx: AppContext) {
        this._path = ctx.utils.state('')
        this.h = ctx.utils.h
    }
}

// 解析传入的routes列表
function handleRoutes(routes: Route[], app: Application) {
    let temp: string[] = []
    let reCall = (route: Route) => {
        temp.push(route.path)
        if(route.children) {
            route.children.forEach(child => {
                reCall(child)
            })
        } else {
            let allPath = path.join(...temp, '/')
            app.addAllPathRoute(allPath, route.component || DefaultComponent)
        }
        temp.pop()
    }

    routes.forEach(route => {
        reCall(route)
    })
}

function DefaultComponent() {
    return '你还没有为该路由注册组件！'
}


export function createRouter(config: RouterConfig): Application {
    return new Application(config)
}
