import { HelloWorld } from './components/HelloWorld'
import { state } from 'vactapp'

function App() {
  const count = state(0)
  return <div id="app">
    <HelloWorld />
    <div className='app-img'><img src={require('./assets/main.gif')} /></div>
    <div className='app-img'>
      <button className='btn' onClick={() => count.value++}>开始{count.value}</button>
    </div>
  </div>
}

export default <App />