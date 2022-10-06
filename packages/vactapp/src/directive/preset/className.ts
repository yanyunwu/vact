import {App} from "../../app";
import {isActiver, isObjectExact, isArray} from "../../utils";

// 自定义处理className的指令
export function orderClassName(app: App) {
    app.order('className', function ({value, vNode}) {
        let className = vNode.props!['className']
        if(isActiver(className)) {
            let preCall =  className.callback
            className.callback = () => {
                let value = preCall()
                if (isObjectExact(value)) {
                    return handleObject(value)
                } else if (isArray(value)) {
                    return handleArray(value)
                } else {
                    return value
                }
            }
        }
    })
}

function handleObject(value: Record<string, boolean>): string {
    let names = []
    for (let p in value) {
        if(value[p]) names.push(p)
    }

    return names.join(' ')
}

function handleArray(value: Array<string>): string {
    return value.join(' ')
}
