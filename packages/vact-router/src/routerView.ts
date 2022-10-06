import {Application} from "./index";
import {ComponentType} from "vactapp";

// 实现一个动态组件
export function callback(app: Application): ComponentType {
    return function () {
        return app.h(app.getPathComponent())
    }
}
