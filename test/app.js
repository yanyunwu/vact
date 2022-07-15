


/* class App extends Vact.Component {
  constructor(props, children) {
    super({
      data: {
        num: 0,
        num2: 1,
        text: '哈哈哈',
        show: true,
        obj: {
          num3: 10
        }
      }
    })

    // this.data.num.on('change', (newValue) => {
    //   console.log('新值:', newValue);
    // })

  }

  render(h) {
    return h(
      'div',
      null,
      [
        () => this.data.show ? new HelloWorld(null, [() => this.data.text]) : "",
        h('button', {
          onClick: () => (e) => {
            this.data.num++
            this.data.obj.num3++
            // console.log(this.data.num);
            this.data.show = !this.data.show
            this.data.text = this.data.num
          }
        }, ['增加', '哈']),
        () => this.data.num + this.data.num2 + this.data.obj.num3,
        h('button', {
          onClick: () => () => {
            this.data.num2--
          }
        }, ['减少']),
        () => this.data.show ? h('button', {
          onClick: () => () => this.data.num2++
        }, ['增加']) : ""
      ]
    )
  }
}

class HelloWorld extends Vact.Component {
  constructor(props, children) {
    super({
      data: {
        num: 0,
        num2: 1
      }
    })
    this.children = children
  }

  render(h) {
    return h(
      'h1',
      null,
      [
        '我是h1标签',
        this.children[0],
        () => [1, 2, 3, [4, 5]]
      ]
    )
  }
} */

/* class App extends Vact.Component {
  constructor() {
    super({
      data: {
        text: '',
        list: [1, 2, 3],
        obj: {
          a: 1
        }
      }
    })
  }

  render(h) {
    let liList = () => this.data.list.map(num => h('li', null, num))

    return h('div', null,
      [
        h('div', null, [
          h('button', {
            onClick: () => () => {
              this.data.list = [2, 23, 4]
              this.data.list[0] = 4
              console.log(this.data.list);
            }
          }, '111'),
          h('ul', null, [
            h('li', null, '不参与'),
            liList,
            h('li', null, '不参与')
          ]),
        ]),
        h('div', null, new Test())
      ]
    )
  }
}

class Test extends Vact.Component {
  constructor() {
    super({
      data: {
        time: new Date().toTimeString()
      }
    })

    setInterval(() => {
      this.data.time = new Date().toTimeString()
    }, 1000)
  }

  render(h) {
    return h('span', null, [() => this.data.time])
  }
} */


/* class App extends Vact.Component {
  constructor() {
    super({
      data: {
        num: 4,
        show: true,
        list: [1, 2, 3]
      }
    })
  }

  render(h) {
    let liList = () => this.data.list.map(num => h('li', null, num))

    return h('div', null, [
      // () => this.data.show ? h(SubComponent, {
      //   num: () => this.data.num,
      //   setNum: () => (num) => this.data.num = num,
      //   test: 9
      // }, []) : '',

      () => h(SubComponent, {
        num: () => this.data.num,
        setNum: () => (num) => this.data.num = num
      }, []),
      h('button', {
        onClick: () => () => {
          this.data.num++
        }
      }, '加一'),
      h('button', {
        onClick: () => () => {
          this.data.show = !this.data.show
          this.data.list[0] = 888
        }
      }, '隐藏'),
      h(Children, null, [() => this.data.show ? 'h2' : '444', liList])
    ])
  }
}

class SubComponent extends Vact.Component {
  constructor(props) {
    super({
      data: {
        color: 'red'
      }
    })
    // this.props = props
    setTimeout(() => {
      this.props.setNum(2)
      console.log('定时器');
    }, 5000)

  }

  render(h) {
    let liList = () => {
      let list = []
      for (let i = 0; i < this.props.num; i++) {
        list.push(h('li', null, i))
      }
      return list
    }
    return h('ul', {
      style: () => `color: ${this.data.color}`,
      click: () => () => this.data.color = 'blue'
    }, [liList])
  }
}

class Children extends Vact.Component {
  render(h) {
    return h('h2', null, [
      () => this.children[0],
      () => this.children[1]
    ])
  }
} */


/* class VIf extends Vact.Component {
  render(h) {
    return h("div", {}, [() => {
      // console.log(this.children[0]);
      return this.children[0]
    }]);
  }
}

class App extends Vact.Component {
  constructor() {
    super({
      data: {
        show: true
      }
    });
  }

  render(h) {
    return h("div", {}, [h(VIf, {
      ifs: () => this.data.show
    }, [() => this.data.show ? h("span", {}, "哈哈哈") : '']),
    h("button", {
      onClick: () => () => this.data.show = !this.data.show
    }, "变换")]);
  }
} */

/* class App extends Vact.Component {
  constructor() {
    super({
      data: {
        color: 'red',
        className: 'test'
      }
    })
  }

  render(h) {
    return h('div', {
      className: () => this.data.className,
      onClick: () => () => this.data.className = 'blue'
    }, 'hhh')
  }
}

Vact.mount('#app', new App()) */