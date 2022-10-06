import {createApp, defineComponent} from 'vactapp'
import {createRouter} from 'vact-router'

const router = createRouter({
  mode: 'hash',
  routes: [
    {
      path: '/',
      component: function () {
        return <h2>主页组件</h2>
      }
    },
    {
      path: '/aaa',
      children: [
        {
          path: '/',
          component: () => 'child aaa'
        },
        {
          path: '/bbb',
          component: () => 'child bbb'
        }
      ]
    }
  ]
})

const RouterView = router.RouterView


const App = defineComponent(function () {
  return <h1>123<RouterView /></h1>
})

const app = createApp(<App/>)
app.use(router)
app.mount('#app')
