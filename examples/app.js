const { mount, render, reactive, active, Text, Fragment } = Vact
const state = reactive({
  show: true,
  show1: true
})

const app = render('div', null, [
  () => state.show ? render(Fragment, null, [
    render('ul', null, [
      () => state.show1 ? render('li', null, [1]) : null,
      render('li', null, [2]),
      render('li', null, [3])
    ])
  ]) : null,
  render(Fragment, null, ['1231'])
])

mount(app, document.body)

