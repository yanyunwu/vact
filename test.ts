import { defineState } from "./src/utils"
import { Component, mount } from '.'


const state = defineState({
  color: 'red'
})

class App extends Component {
  render(h: Function) {
    return h('div', {
      style: () => ({ color: state.data.color })
    }, 'hello world!')
  }
}

mount('#app', new App())






