const { h, defineState, state, Text, Fragment, createApp } = Vact




function App () {
  const show = state(true)
  return h('h1', {onClick: () => show.value = !show.value}, () => show.value ?  () => 1 : 1)
}


createApp(h(App), { arrayDiff: true }).mount('#app');
