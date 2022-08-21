(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Vact = {}));
})(this, (function (exports) { 'use strict';

  /**
   * 虚拟dom节点类型枚举
  */
  var VNODE_TYPE;
  (function (VNODE_TYPE) {
      // 普通元素节点类型
      VNODE_TYPE[VNODE_TYPE["ELEMENT"] = 0] = "ELEMENT";
      // 文本节点类型
      VNODE_TYPE[VNODE_TYPE["TEXT"] = 1] = "TEXT";
      VNODE_TYPE[VNODE_TYPE["FRAGMENT"] = 2] = "FRAGMENT";
      // COMPONENT,
      VNODE_TYPE[VNODE_TYPE["ARRAYNODE"] = 3] = "ARRAYNODE";
      VNODE_TYPE[VNODE_TYPE["ALIVE"] = 4] = "ALIVE";
  })(VNODE_TYPE || (VNODE_TYPE = {}));

  const FragmentSymbol = Symbol('Fragment');

  const TextSymbol = Symbol('Text');

  const ArraySymbol = Symbol('ArrayNode');

  function isString(content) {
      return typeof content === 'string';
  }
  function isFunction(content) {
      return typeof content === 'function';
  }
  function isFragment(content) {
      return content === FragmentSymbol;
  }
  function isArrayNode(content) {
      return content === ArraySymbol;
  }
  function isText(content) {
      return content === TextSymbol;
  }
  function isActiver(content) {
      return isObject(content) && content.flag === 'activer';
  }
  function isVNode(content) {
      return isObject(content) && content.flag in VNODE_TYPE;
  }
  function isObjectExact(content) {
      return isObject(content) && content.constructor === Object;
  }
  function isOnEvent(str) {
      return /^on.+$/.test(str);
  }
  function isObject(content) {
      return typeof content === 'object' && content !== null;
  }
  function isArray(content) {
      return Array.isArray(content);
  }

  let updating = false;
  const watcherTask = [];
  function runUpdate(watcher) {
      let index = watcherTask.indexOf(watcher);
      if (!(index > -1))
          watcherTask.push(watcher);
      if (!updating) {
          updating = true;
          Promise.resolve()
              .then(() => {
              let watcher = undefined;
              while (watcher = watcherTask.shift()) {
                  watcher.update();
              }
          }).finally(() => {
              updating = false;
          });
      }
  }

  // 目标对象到映射对象
  const targetMap = new WeakMap();
  // 全局变量watcher
  let activeWatcher = null;
  const REACTIVE = Symbol('reactive');
  /**
   * 实现响应式对象
  */
  function reactive(target) {
      if (target[REACTIVE])
          return target;
      let handler = {
          get(target, prop, receiver) {
              if (prop === REACTIVE)
                  return true;
              const res = Reflect.get(target, prop, receiver);
              if (isObjectExact(res) && !isVNode(res)) {
                  return reactive(res);
              }
              if (Array.isArray(res)) {
                  track(target, prop);
                  return reactiveArray(res, target, prop);
              }
              track(target, prop);
              return res;
          },
          set(target, prop, value, receiver) {
              const res = Reflect.set(target, prop, value, receiver);
              trigger(target, prop);
              return res;
          }
      };
      return new Proxy(target, handler);
  }
  /**
   * 设置响应式数组
  */
  function reactiveArray(targetArr, targetObj, Arrprop) {
      let handler = {
          get(target, prop, receiver) {
              const res = Reflect.get(target, prop, receiver);
              if (isObjectExact(res)) {
                  return reactive(res);
              }
              return res;
          },
          set(target, prop, value, receiver) {
              const res = Reflect.set(target, prop, value, receiver);
              trigger(targetObj, Arrprop);
              return res;
          }
      };
      return new Proxy(targetArr, handler);
  }
  /**
   * 响应触发依赖
  */
  function trigger(target, prop) {
      let mapping = targetMap.get(target);
      if (!mapping)
          return;
      let mappingProp = mapping[prop];
      if (!mappingProp)
          return;
      // mappingProp.forEach(watcher => watcher.update(oldValue, newValue))
      mappingProp.forEach(watcher => {
          // 针对于对数组响应做特殊处理
          if (isArray(target[prop])) {
              watcher.nextDepArr = target[prop];
          }
          runUpdate(watcher);
      });
  }
  /**
   * 追踪绑定依赖
  */
  function track(target, prop) {
      if (!activeWatcher)
          return;
      let mapping = targetMap.get(target);
      if (!mapping)
          targetMap.set(target, mapping = {});
      let mappingProp = mapping[prop];
      if (!mappingProp)
          mappingProp = mapping[prop] = [];
      // 针对于对数组响应做特殊处理
      if (isArray(target[prop])) {
          if (activeWatcher.depArr) {
              activeWatcher.depArr = false;
          }
          else {
              if (activeWatcher.depArr === undefined) {
                  activeWatcher.depArr = target[prop].slice();
              }
          }
      }
      mappingProp.push(activeWatcher);
  }
  // 设置全局变量
  function setActiver(fn) {
      activeWatcher = fn;
  }

  class RefImpl {
      constructor(value) {
          this._value = value;
          this._target = { value: this._value };
      }
      get value() {
          track(this._target, 'value');
          return this._value;
      }
      set value(value) {
          this._value = value;
          this._target.value = this._value;
          trigger(this._target, 'value');
      }
  }
  function ref(value) {
      return new RefImpl(value);
  }

  function state(value) {
      return ref(value);
  }
  function defineState(target) {
      return reactive(target);
  }

  /**
   * 响应式对象
  */
  class Activer {
      constructor(fn) {
          this.flag = 'activer';
          this.callback = fn;
      }
      get value() {
          return this.callback();
      }
  }
  /**
   * 外置函数
  */
  function active(fn) {
      return new Activer(fn);
  }

  const AliveSymbol = Symbol('Alive');

  /**
   * 函数转化为activer转化为VAlive
   * activer转化为VAlive
   * string转化为VText
   * 数组转化为VArray
   * 其他转化为VText
  */
  function standarVNode(node) {
      if (isVNode(node))
          return node;
      if (isFunction(node))
          return renderAlive(active(node));
      else if (isActiver(node))
          return renderAlive(node);
      else if (isString(node))
          return renderText(node);
      else if (isArray(node))
          return renderArrayNode(node.map(item => standarVNode(item)));
      else {
          let value = node;
          let retText;
          if (!value && typeof value !== 'number')
              retText = renderText('');
          else
              retText = renderText(String(value));
          return retText;
      }
  }
  /**
   * text(不需要props)、fragment(不需要props)、element、component为显性创建
   * array(不需要props)、alive(不需要props)为隐形创建
  */
  function render(type, props, mayChildren) {
      // text的children比较特殊先处理
      if (isText(type)) {
          return renderText(String(mayChildren));
      }
      let children;
      // 预处理 处理为单个的children
      if (isArray(mayChildren))
          children = mayChildren;
      else
          children = [mayChildren];
      let standardChildren = children.map(child => standarVNode(child));
      // 属性预处理
      if (props) {
          for (const prop in props) {
              // 以on开头的事件不需要处理
              if (!isOnEvent(prop) && isFunction(props[prop])) {
                  props[prop] = active(props[prop]);
              }
          }
      }
      if (isString(type))
          return renderElement(type, props || {}, standardChildren);
      if (isFragment(type))
          return renderFragment(standardChildren);
      if (isArrayNode(type))
          return renderArrayNode(standardChildren);
      if (isFunction(type))
          return renderComponent(type, props || {}, standardChildren);
      throw '传入参数不合法';
  }
  function renderText(text) {
      return {
          type: TextSymbol,
          flag: VNODE_TYPE.TEXT,
          children: text
      };
  }
  function renderElement(tag, props, children) {
      return {
          type: tag,
          flag: VNODE_TYPE.ELEMENT,
          props,
          children
      };
  }
  function renderFragment(children) {
      return {
          type: FragmentSymbol,
          flag: VNODE_TYPE.FRAGMENT,
          children
      };
  }
  function renderArrayNode(children) {
      return {
          type: ArraySymbol,
          flag: VNODE_TYPE.ARRAYNODE,
          children
      };
  }
  // 判断是普通函数还是构造函数
  function renderComponent(component, props, children) {
      let cprops = {};
      for (let prop in props) {
          let cur = props[prop];
          if (isActiver(cur)) {
              Object.defineProperty(cprops, prop, {
                  get() {
                      return cur.value;
                  }
              });
          }
          else {
              cprops[prop] = cur;
          }
      }
      if (component.prototype && component.prototype.render && isFunction(component.prototype.render)) {
          let Constructor = component;
          let result = new Constructor();
          result.props = cprops;
          result.children = children;
          return standarVNode(result.render(render));
      }
      else {
          let Fun = component;
          return standarVNode(Fun(cprops, children));
      }
  }
  function renderAlive(activer) {
      return {
          type: AliveSymbol,
          flag: VNODE_TYPE.ALIVE,
          activer
      };
  }

  /**
   * 观察者
   * 观察数据的变化
  */
  class Watcher {
      constructor(activeProps, callback) {
          setActiver(this);
          this.value = activeProps.value;
          this.callback = callback;
          this.activeProps = activeProps;
          setActiver(null);
      }
      update() {
          // console.log(this.depArr, this.nextDepArr);
          var _a;
          let newValue = this.activeProps.value;
          let oldValue = this.value;
          this.value = newValue;
          let meta = { targetPropOldValue: this.depArr, targetPropnewValue: this.nextDepArr };
          this.callback(oldValue, newValue, meta);
          this.depArr = (_a = this.nextDepArr) === null || _a === void 0 ? void 0 : _a.slice();
      }
  }
  /**
   * 监控自定义响应式属性
  */
  function watch(activeProps, callback) {
      if (!isActiver(activeProps))
          activeProps = active(activeProps);
      return new Watcher(activeProps, function (oldValue, newValue) {
          callback(oldValue, newValue);
      });
  }
  /**
   * 监控可变状态dom
  */
  function watchVNode(activeVNode, callback) {
      let watcher = new Watcher(activeVNode, function (oldValue, newValue, meta) {
          const oldVNode = oldValue;
          const newVNode = standarVNode(newValue);
          // 对于数组节点后期需要记录它的响应式数组用于节点更新
          if (oldVNode.flag === VNODE_TYPE.ARRAYNODE) {
              oldVNode.depArray = meta === null || meta === void 0 ? void 0 : meta.targetPropOldValue;
          }
          // 对于数组节点后期需要记录它的响应式数组用于节点更新
          if (newVNode.flag === VNODE_TYPE.ARRAYNODE) {
              newVNode.depArray = meta === null || meta === void 0 ? void 0 : meta.targetPropnewValue;
          }
          callback(oldVNode, newVNode);
          watcher.value = newVNode;
      });
      return watcher.value = standarVNode(watcher.value);
  }
  /**
   * 监控可变dom的prop
  */
  function watchProp(activeProp, callback) {
      return new Watcher(activeProp, callback).value;
  }

  function mountElement(vnode, container, anchor, app) {
      const el = document.createElement(vnode.type);
      vnode.el = el;
      mountElementProps(vnode);
      mountChildren(vnode.children, el, undefined, app);
      container.insertBefore(el, anchor);
  }
  function unmountElement(vnode, container) {
      vnode.el.remove();
  }
  function mountElementProps(vnode) {
      let el = vnode.el;
      let props = vnode.props;
      // 处理标签属性
      for (let prop in props) {
          let value = props[prop];
          if (isActiver(value)) {
              let firstValue = watchProp(value, (oldValue, newValue) => patchElementProp(oldValue, newValue, el, prop));
              setElementProp(el, prop, firstValue);
          }
          else {
              setElementProp(el, prop, value);
          }
      }
  }
  /**
   * 处理单个dom属性
  */
  function setElementProp(el, prop, value) {
      if (isOnEvent(prop) && isFunction(value)) {
          let pattern = /^on(.+)$/;
          let result = prop.match(pattern);
          result && el.addEventListener(result[1].toLocaleLowerCase(), value.bind(el));
          return;
      }
      switch (prop) {
          case 'className':
              el.className = String(value);
              break;
          case 'style':
              if (isObject(value)) {
                  value = mergeStyle(value);
              }
          default:
              el.setAttribute(prop, value);
      }
  }
  /**
   * 将对象形式的style转化为字符串
  */
  function mergeStyle(style) {
      let styleStringList = [];
      for (let cssAttr in style) {
          styleStringList.push(`${cssAttr}:${style[cssAttr]};`);
      }
      return styleStringList.join('');
  }

  function isSameVNode(oldVNode, newVNode) {
      return oldVNode.flag === newVNode.flag;
  }
  function patch(oldVNode, newVNode, container, app) {
      var _a, _b;
      // 如果两个节点引用一样不需要判断
      if (oldVNode === newVNode)
          return;
      // 这里在判断相同类型的节点后可以做进一步优化
      if (isSameVNode(oldVNode, newVNode)) {
          let flag = oldVNode.flag = newVNode.flag;
          if (flag === VNODE_TYPE.TEXT) {
              patchText(oldVNode, newVNode);
          }
          else if (flag === VNODE_TYPE.ARRAYNODE) {
              if (app === null || app === void 0 ? void 0 : app.options.arrayDiff) {
                  patchArrayNodeT(oldVNode, newVNode, container);
              }
              else {
                  patchArrayNode(oldVNode, newVNode, container);
              }
          }
          else {
              const nextSibling = (_a = oldVNode === null || oldVNode === void 0 ? void 0 : oldVNode.el) === null || _a === void 0 ? void 0 : _a.nextSibling;
              unmount(oldVNode);
              mount(newVNode, container, nextSibling);
          }
      }
      else {
          const nextSibling = (_b = oldVNode === null || oldVNode === void 0 ? void 0 : oldVNode.el) === null || _b === void 0 ? void 0 : _b.nextSibling;
          unmount(oldVNode);
          mount(newVNode, container, nextSibling);
      }
  }
  function patchText(oldVNode, newVNode, container) {
      oldVNode.el.nodeValue = newVNode.children;
      newVNode.el = oldVNode.el;
  }
  function patchElementProp(oldValue, newValue, el, prop) {
      setElementProp(el, prop, newValue);
  }
  function patchArrayNodeT(oldVNode, newVNode, container) {
      if (!oldVNode.depArray) {
          patchArrayNode(oldVNode, newVNode, container);
          return;
      }
      const oldDepArray = oldVNode.depArray;
      const newDepArray = newVNode.depArray;
      const oldChildren = oldVNode.children;
      const newChildren = newVNode.children;
      // 为映射做初始化
      let map = new Map();
      oldDepArray.forEach((item, index) => {
          let arr = map.get(item);
          if (!arr)
              map.set(item, arr = []);
          arr.push({ node: oldChildren[index], index, used: false });
      });
      let getOld = (item) => {
          let arr = map.get(item);
          if (!arr)
              return false;
          let index = arr.findIndex(alone => !alone.used);
          if (index > -1)
              return arr[index];
          else
              return false;
      };
      let moveOld = (item, node) => {
          let arr = map.get(item);
          if (!arr)
              return;
          let index = arr.findIndex(alone => alone === node);
          arr.splice(index, 1);
      };
      let maxIndexSoFar = { node: oldChildren[0], index: 0 };
      newDepArray.forEach((item, newIndex) => {
          let old = getOld(item);
          if (old) {
              if (old.index < maxIndexSoFar.index) {
                  let next = maxIndexSoFar.node.el.nextSibling;
                  VNodeInsertBefore(container, old.node, next);
                  // container.insertBefore(old.node.el!, next)
              }
              maxIndexSoFar = old;
              newChildren[newIndex] = old.node;
              moveOld(item, old);
          }
          else {
              let next = maxIndexSoFar.node.el.nextSibling;
              let newNode = newChildren[newIndex];
              mount(newNode, container, next);
              maxIndexSoFar = { node: newNode, index: maxIndexSoFar.index + 1 };
          }
      });
      map.forEach(value => {
          value.forEach(item => {
              if (!item.used) {
                  unmount(item.node);
              }
          });
      });
  }
  function patchArrayNode(oldVNode, newVNode, container) {
      const nextSibling = oldVNode.el.nextSibling;
      unmount(oldVNode);
      mount(newVNode, container, nextSibling);
  }
  function VNodeInsertBefore(container, node, next) {
      if (node.flag === VNODE_TYPE.ELEMENT || node.flag === VNODE_TYPE.TEXT) {
          container.insertBefore(node.el, next);
      }
      else if (node.flag === VNODE_TYPE.ARRAYNODE || node.flag === VNODE_TYPE.FRAGMENT) {
          let start = node.anchor;
          let nextToMove = start === null || start === void 0 ? void 0 : start.nextSibling;
          let end = node.el;
          while (start !== end) {
              container.insertBefore(start, next);
              start = nextToMove;
              nextToMove = start === null || start === void 0 ? void 0 : start.nextSibling;
          }
          container.insertBefore(end, next);
      }
  }

  function mount(vnode, container, anchor, app) {
      switch (vnode.flag) {
          case VNODE_TYPE.ELEMENT:
              mountElement(vnode, container, anchor, app);
              break;
          case VNODE_TYPE.TEXT:
              mountText(vnode, container, anchor);
              break;
          case VNODE_TYPE.FRAGMENT:
              mountFragment(vnode, container, anchor, app);
              break;
          case VNODE_TYPE.ARRAYNODE:
              mountArrayNode(vnode, container, anchor, app);
              break;
          // case VNODE_TYPE.COMPONENT:
          //   mountComponent(vnode as VComponent, container, anchor, app)
          //   break
          case VNODE_TYPE.ALIVE:
              mountAlive(vnode, container, anchor, app);
              break;
      }
  }
  function unmount(vnode, container) {
      switch (vnode.flag) {
          case VNODE_TYPE.ELEMENT:
              unmountElement(vnode);
              break;
          case VNODE_TYPE.TEXT:
              unmountText(vnode);
              break;
          case VNODE_TYPE.FRAGMENT:
              unmountFragment(vnode);
              break;
          case VNODE_TYPE.ARRAYNODE:
              unmountArrayNode(vnode);
              break;
          // case VNODE_TYPE.COMPONENT:
          //   unmountComponent(vnode as VComponent, container)
          //   break
      }
  }
  function mountChildren(children, container, anchor, app) {
      children.forEach(child => mount(child, container, anchor, app));
  }
  function mountText(vnode, container, anchor) {
      const el = document.createTextNode(vnode.children);
      vnode.el = el;
      container.insertBefore(el, anchor);
  }
  function unmountText(vnode, container) {
      vnode.el.remove();
  }
  function mountFragment(vnode, container, anchor, app) {
      const start = document.createTextNode('');
      const end = document.createTextNode('');
      vnode.anchor = start;
      vnode.el = end;
      container.insertBefore(start, anchor);
      mountChildren(vnode.children, container, anchor, app);
      container.insertBefore(end, anchor);
  }
  function unmountFragment(vnode, container) {
      const start = vnode.anchor;
      const end = vnode.el;
      let cur = start;
      while (cur && cur !== end) {
          let next = cur.nextSibling;
          cur.remove();
          cur = next;
      }
      end.remove();
  }
  function mountArrayNode(vnode, container, anchor, app) {
      const start = document.createTextNode('');
      const end = document.createTextNode('');
      vnode.anchor = start;
      vnode.el = end;
      container.insertBefore(start, anchor);
      mountChildren(vnode.children, container, anchor, app);
      container.insertBefore(end, anchor);
  }
  function unmountArrayNode(vnode, container, anchor) {
      const start = vnode.anchor;
      const end = vnode.el;
      let cur = start;
      while (cur && cur !== end) {
          let next = cur.nextSibling;
          cur.remove();
          cur = next;
      }
      end.remove();
  }
  // export function mountComponent(vnode: VComponent, container: HTMLElement, anchor?: HTMLElement, app?: Vact) {
  //   console.log(1111);
  //   const root = vnode.type.render(render)
  //   vnode.root = root
  //   mount(root, container, anchor, app)
  //   vnode.el = root.el!
  // }
  // export function unmountComponent(vnode: VComponent, container: HTMLElement) {
  //   unmount(vnode.root, container)
  // }
  function mountAlive(vnode, container, anchor, app) {
      let firstVNode = watchVNode(vnode.activer, (oldVNode, newVNode) => patch(oldVNode, newVNode, container, app));
      vnode.vnode = firstVNode;
      mount(firstVNode, container, anchor, app);
  }

  class Component {
      constructor(config = {}) {
          this.config = config;
          this.data = defineState(config.data || {});
      }
  }

  class Vact {
      constructor(vnode, options) {
          this.rootVNode = vnode;
          this.options = options || {};
      }
      mount(selector) {
          const el = document.querySelector(selector);
          let container = document.createElement('div');
          mount(this.rootVNode, container, undefined, this);
          el === null || el === void 0 ? void 0 : el.replaceWith(...container.childNodes);
      }
  }
  function createApp(vnode, options) {
      return new Vact(vnode, options);
  }

  exports.Activer = Activer;
  exports.Component = Component;
  exports.Fragment = FragmentSymbol;
  exports.Text = TextSymbol;
  exports.createApp = createApp;
  exports.createVNode = render;
  exports["default"] = Vact;
  exports.defineState = defineState;
  exports.mount = mount;
  exports.reactive = reactive;
  exports.ref = ref;
  exports.render = render;
  exports.state = state;
  exports.watch = watch;
  exports.watchProp = watchProp;
  exports.watchVNode = watchVNode;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=boundle.umd.js.map
