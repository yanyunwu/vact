import { createApp, state } from 'vactapp'

const $data = {
  count: 0,
  color: 'red'
}

let show = state(true)

const head = <>
  <h1 style={{ color: $data.color }}>hello world!</h1>
  <div onClick={() => $data.color = 'blue'}><button>改变颜色</button></div>
</>

const bottom = <>
  <span>底部显示</span>
</>

const app = <div id='app'>
  {head}
  <div>
    <span>计数器</span>
    <button onClick={() => $data.count++}>增加</button>
    {$data.count}
    <button onClick={() => $data.count--}>减少</button>
  </div>
  {show.value && bottom}
  <div><button onClick={() => show.value = !show.value}>切换显示</button></div>
</div>

createApp(app).mount('#app')