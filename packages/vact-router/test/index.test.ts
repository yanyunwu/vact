import { Application , DefaultComponent} from '../src'
import {createDynamic} from '../src/dynamic'
import {ComponentType} from 'vactapp'
import path from 'path'

test('router', () => {
    let component = () => 1
    let router = new Application({
        mode: 'hash',
        routes: [
            {
                path: '/aaaa',
                component: component
            },
            {
                path: '/bbb',
                children: [
                    {
                        path: '/ccc'
                    }
                ]
            }
        ]
    })

    let d = new Map<string, ComponentType>([
        [path.join(...['/aaaa']), component],
        [path.join(...['/bbb/ccc']), DefaultComponent]
    ])
    expect(router.getMap().map).toEqual(d)
})
