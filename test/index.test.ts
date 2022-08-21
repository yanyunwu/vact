import { render } from '../src/render'
import { VNODE_TYPE } from '../src/vnode/vnode';


test('function: render(type, props, children): VNode', () => {
  expect(render('span', null, [])).toEqual({
    type: 'span',
    flag: VNODE_TYPE.ELEMENT,
    props: {},
    children: []
  });
})