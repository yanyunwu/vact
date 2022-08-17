const { mount, render, reactive, active, Text, Fragment } = Vact
const state = reactive({
  show: true,
  show1: true,
  list: [1, 2, 3],
  text: 1,
  color: 'red'
})

const app = render('div', { style: () => ({ color: state.color }), onClick: () => state.color = 'blue' }, [
  () => state.show ? render(Fragment, null,
    render('ul', null, [
      () => state.list.map(num => render('li', null, num))
    ])
  ) : null,
  render(Fragment, null, [() => state.text])
])

mount(app, document.body)

setInterval(() => {
  state.text++
}, 1000)

