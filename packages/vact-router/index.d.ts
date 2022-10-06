import { ComponentType, AppPluginInstance, FunctionComponentType, AppContext } from 'vactapp';

declare class Dynamic {
    map: Map<string, ComponentType>;
    addMapComponent(id: string, component: ComponentType): this;
    getMapComponent(id: string): ComponentType | undefined;
}

interface Route {
    path: string;
    component?: ComponentType;
    children?: Array<Route>;
}
interface RouterConfig {
    mode: 'hash' | 'history';
    routes: Array<Route>;
}
declare const defaultRouterConfig: RouterConfig;
declare class Application implements AppPluginInstance {
    private readonly mode;
    private _path?;
    private readonly routes;
    private mapDynamic;
    RouterView: FunctionComponentType;
    h: any;
    get path(): string;
    set path(value: string);
    constructor(config?: RouterConfig);
    private hash;
    addAllPathRoute(path: string, component: ComponentType): void;
    getPathComponent(): ComponentType;
    getMap(): Dynamic;
    install(ctx: AppContext): void;
}
declare function createRouter(config: RouterConfig): Application;

export { Application, Route, RouterConfig, createRouter, defaultRouterConfig };
