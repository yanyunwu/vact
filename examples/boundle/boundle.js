
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
      VNODE_TYPE[VNODE_TYPE["COMPONENT"] = 3] = "COMPONENT";
      VNODE_TYPE[VNODE_TYPE["ARRAYNODE"] = 4] = "ARRAYNODE";
      VNODE_TYPE[VNODE_TYPE["ALIVE"] = 5] = "ALIVE";
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
  function runUpdate(watcher, oldValue, newValue) {
      if (watcherTask.includes(watcher))
          return;
      watcherTask.push(watcher);
      if (!updating) {
          updating = true;
          Promise.resolve()
              .then(() => {
              let watcher = undefined;
              while (watcher = watcherTask.shift()) {
                  watcher.update(oldValue, newValue);
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
              const oldValue = Reflect.get(target, prop, receiver);
              const res = Reflect.set(target, prop, value, receiver);
              const newValue = Reflect.get(target, prop, receiver);
              trigger(target, prop, oldValue, newValue);
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
              const oldValue = target.slice();
              const res = Reflect.set(target, prop, value, receiver);
              const newValue = target;
              trigger(targetObj, Arrprop, oldValue, newValue);
              return res;
          }
      };
      return new Proxy(targetArr, handler);
  }
  /**
   * 响应触发依赖
  */
  function trigger(target, prop, oldValue, newValue) {
      let mapping = targetMap.get(target);
      if (!mapping)
          return;
      let mappingProp = mapping[prop];
      if (!mappingProp)
          return;
      // mappingProp.forEach(watcher => watcher.update(oldValue, newValue))
      mappingProp.forEach(watcher => runUpdate(watcher, oldValue, newValue));
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
      mappingProp.push(activeWatcher);
  }
  // 设置全局变量
  function setActiver(fn) {
      activeWatcher = fn;
  }

  class RefImpl {
      constructor(value) {
          this._value = value;
      }
      get value() {
          track(this, 'value');
          return this._value;
      }
      set value(value) {
          this._value = value;
          trigger(this, 'value');
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
      let result = new component(cprops, children);
      if (isVNode(result)) {
          return result;
      }
      else {
          result.props = cprops;
          result.children = children;
          return {
              type: result,
              props,
              children,
              flag: VNODE_TYPE.COMPONENT
          };
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
      update(targetPropOldValue, targetPropnewValue) {
          let newValue = this.activeProps.value;
          let oldValue = this.value;
          this.value = newValue;
          let meta = { targetPropOldValue, targetPropnewValue };
          this.callback(oldValue, newValue, meta);
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
      const oldDepArray = oldVNode.depArray;
      const newDepArray = newVNode.depArray;
      const oldChildren = oldVNode.children;
      const newChildren = newVNode.children;
      let map = new Map();
      oldDepArray.forEach((item, index) => map.set(item, { node: oldChildren[index], index }));
      let maxIndexSoFar = { node: oldChildren[0], index: 0 };
      newDepArray.forEach((item, newIndex) => {
          if (map.has(item)) {
              let old = map.get(item);
              if (old.index < maxIndexSoFar.index) {
                  let next = maxIndexSoFar.node.el.nextSibling;
                  container.insertBefore(old.node.el, next);
              }
              maxIndexSoFar = old;
              newChildren[newIndex] = old.node;
              map.delete(item);
          }
          else {
              let next = maxIndexSoFar.node.el.nextSibling;
              let newNode = newChildren[newIndex];
              mount(newChildren[newIndex], container, next);
              maxIndexSoFar = { node: newNode, index: maxIndexSoFar.index + 1 };
          }
      });
      map.forEach(value => unmount(value.node));
  }
  function patchArrayNode(oldVNode, newVNode, container) {
      const nextSibling = oldVNode.el.nextSibling;
      unmount(oldVNode);
      mount(newVNode, container, nextSibling);
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
          case VNODE_TYPE.COMPONENT:
              mountComponent(vnode, container, anchor, app);
              break;
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
          case VNODE_TYPE.COMPONENT:
              unmountComponent(vnode);
              break;
      }
  }
  function mountChildren(children, container, anchor, app) {
      children.forEach(child => mount(child, container, anchor, app));
  }
  // export function mountElement(vnode: VElement, container: HTMLElement, anchor?: HTMLElement) {
  //   const el = document.createElement(vnode.type)
  //   vnode.el = el
  //   mountElementProps(vnode)
  //   mountChildren(vnode.children, el)
  //   container.insertBefore(el, anchor!)
  // }
  // export function unmountElement(vnode: VElement, container: HTMLElement) {
  //   vnode.el.remove()
  // }
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
  // export function mountElementProps(vnode: VElement) {
  //   let el = vnode.el
  //   let props = vnode.props
  //   // 处理标签属性
  //   for (let prop in props) {
  //     let value = props[prop]
  //     if (isActiver(value)) {
  //       let firstValue = watchProp(value, (oldValue, newValue) => patchElementProp(oldValue, newValue, el, prop))
  //       setElementProp(el, prop, firstValue)
  //     } else {
  //       setElementProp(el, prop, value)
  //     }
  //   }
  // }
  // /**
  //  * 处理单个dom属性
  // */
  // export function setElementProp(el: HTMLElement, prop: string, value: any) {
  //   if (isOnEvent(prop) && isFunction(value)) {
  //     let pattern = /^on(.+)$/
  //     let result = prop.match(pattern)
  //     result && el.addEventListener(result[1].toLocaleLowerCase(), value.bind(el))
  //     return
  //   }
  //   switch (prop) {
  //     case 'className':
  //       el.className = String(value)
  //       break
  //     case 'style':
  //       if (isObject(value)) {
  //         value = mergeStyle(value)
  //       }
  //     default:
  //       el.setAttribute(prop, value)
  //   }
  // }
  // /**
  //  * 将对象形式的style转化为字符串
  // */
  // function mergeStyle(style: Record<any, any>): string {
  //   let styleStringList = []
  //   for (let cssAttr in style) {
  //     styleStringList.push(`${cssAttr}:${style[cssAttr]};`)
  //   }
  //   return styleStringList.join('')
  // }
  function mountComponent(vnode, container, anchor, app) {
      const root = vnode.type.render(render);
      vnode.root = root;
      mount(root, container, anchor, app);
      vnode.el = root.el;
  }
  function unmountComponent(vnode, container) {
      unmount(vnode.root);
  }
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
