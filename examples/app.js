const { mount, render, defineState, Text, Fragment, Component, state: ss, createApp } = Vact


/* const state = defineState({
  show: true,
  show1: true,
  list: [1, 2, 3],
  text: 1,
  color: 'red'
})

class App extends Component {
  constructor() {
    super({
      data: {
        color: 'red'
      }
    })
  }

  render(h) {
    console.log(this.props.aaa);
    return h('div', { style: () => ({ color: this.props.aaa }), onClick: () => this.data.color = 'yellow' }, this.children)
  }
}

const app = render('div', { onClick: () => state.color = 'blue' }, [
  () => state.show ? render(Fragment, null,
    render('ul', null, [
      () => state.list.map(num => render('li', null, num))
    ])
  ) : render(App, null, []),
  render(Fragment, null, [() => state.text]),
  render(App, { aaa: () => state.color, b: 1 }, [
    () => state.show1 ? render('span', null, 1) : 2,
    render('span', null, 8888)
  ]),
])

setInterval(() => {
  state.text++
}, 1000) */

const show = defineState({
  list: [{ num: 1, notShow: true }, { num: 2 }, { num: 3 }]
})
const app = render('div', null, [
  () => show.list.map(item => () => !item.notShow && render('span', null, () => item.num)),
  render('button', { onClick: () => show.list[0].num = 999 }, '切换')
])



createApp(render(Fragment, null, [
  1, render('button', null, 123)
])).mount('#app')
