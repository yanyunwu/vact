
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
  })(VNODE_TYPE || (VNODE_TYPE = {}));

  function isSameVNode(oldVNode, newVNode) {
      return oldVNode.flag === newVNode.flag;
  }
  function patch(oldVNode, newVNode, container) {
      var _a, _b;
      // 如果两个节点引用一样不需要判断
      if (oldVNode === newVNode)
          return;
      // 这里在判断相同类型的节点后可以做进一步优化
      if (isSameVNode(oldVNode, newVNode)) {
          if (oldVNode.flag === VNODE_TYPE.TEXT) {
              patchText(oldVNode, newVNode);
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

  const Fragment = Symbol('Fragment');

  const Text = Symbol('Text');

  const ArrayNode = Symbol('ArrayNode');

  function isString(content) {
      return typeof content === 'string';
  }
  function isFunction(content) {
      return typeof content === 'function';
  }
  function isFragment(content) {
      return content === Fragment;
  }
  function isArrayNode(content) {
      return content === ArrayNode;
  }
  function isText(content) {
      return content === Text;
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
  function trigger(target, prop, oldValue, newValue) {
      let mapping = targetMap.get(target);
      if (!mapping)
          return;
      let mappingProp = mapping[prop];
      if (!mappingProp)
          return;
      mappingProp.forEach(watcher => watcher.update(oldValue, newValue));
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

  function render(type, props, children) {
      // 预处理 处理为单个的children
      if (!isText(type) && !Array.isArray(children)) {
          children = [children];
      }
      // 子元素预处理 
      if (children && Array.isArray(children)) {
          children = children.map(child => isFunction(child) ? active(child) : child);
      }
      // 属性预处理
      if (props) {
          for (const prop in props) {
              // 以on开头的事件不需要处理
              if (!isOnEvent(prop) && isFunction(props[prop])) {
                  props[prop] = active(props[prop]);
              }
          }
      }
      let flag;
      if (isString(type)) {
          flag = VNODE_TYPE.ELEMENT;
      }
      else if (isFragment(type)) {
          flag = VNODE_TYPE.FRAGMENT;
      }
      else if (isText(type)) {
          flag = VNODE_TYPE.TEXT;
      }
      else if (isArrayNode(type)) {
          flag = VNODE_TYPE.ARRAYNODE;
      }
      else if (isFunction(type)) {
          return renderComponent(type, props || {}, children || []);
      }
      else {
          throw '传入参数不合法';
      }
      return {
          type: type,
          props,
          children,
          flag
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
          this.callback(oldValue, newValue);
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
  function watchVNode(activeVNode, callback) {
      let watcher = new Watcher(activeVNode, function (oldVNode, newVNode) {
          if (!isVNode(newVNode)) {
              if (!newVNode && typeof newVNode !== 'number')
                  newVNode = render(Text, null, '');
              else if (Array.isArray(newVNode)) {
                  newVNode = render(ArrayNode, null, newVNode);
              }
              else {
                  newVNode = render(Text, null, String(newVNode));
              }
          }
          callback(oldVNode, newVNode);
          watcher.value = newVNode;
      });
      if (isVNode(watcher.value))
          return watcher.value;
      if (!watcher.value && typeof watcher.value !== 'number')
          watcher.value = render(Text, null, '');
      else if (Array.isArray(watcher.value)) {
          watcher.value = render(ArrayNode, null, watcher.value);
      }
      else {
          watcher.value = render(Text, null, String(watcher.value));
      }
      return watcher.value;
  }
  /**
   * 监控可变dom的prop
  */
  function watchProp(activeProp, callback) {
      return new Watcher(activeProp, callback).value;
  }

  function mount(vnode, container, anchor) {
      switch (vnode.flag) {
          case VNODE_TYPE.ELEMENT:
              mountElement(vnode, container, anchor);
              break;
          case VNODE_TYPE.TEXT:
              mountText(vnode, container, anchor);
              break;
          case VNODE_TYPE.FRAGMENT:
              mountFragment(vnode, container, anchor);
              break;
          case VNODE_TYPE.ARRAYNODE:
              mountArrayNode(vnode, container, anchor);
              break;
          case VNODE_TYPE.COMPONENT:
              mountComponent(vnode, container, anchor);
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
  function mountChildren(children, container, anchor) {
      children.forEach(child => {
          if (isActiver(child)) {
              let firstVNode = watchVNode(child, (oldVNode, newVNode) => patch(oldVNode, newVNode, container));
              mount(firstVNode, container, anchor);
          }
          else if (isVNode(child)) {
              mount(child, container, anchor);
          }
          else if (isArray(child)) {
              mountChildren(child, container, anchor);
          }
          else {
              mount(render(Text, null, child || typeof child === 'number' ? String(child) : ''), container, anchor);
          }
      });
  }
  function mountElement(vnode, container, anchor) {
      const el = document.createElement(vnode.type);
      vnode.el = el;
      mountElementProps(vnode);
      mountChildren(vnode.children, el);
      container.insertBefore(el, anchor);
  }
  function unmountElement(vnode, container) {
      var _a;
      (_a = vnode.el) === null || _a === void 0 ? void 0 : _a.remove();
  }
  function mountText(vnode, container, anchor) {
      const el = document.createTextNode(vnode.children);
      vnode.el = el;
      container.insertBefore(el, anchor);
  }
  function unmountText(vnode, container) {
      var _a;
      (_a = vnode.el) === null || _a === void 0 ? void 0 : _a.remove();
  }
  function mountFragment(vnode, container, anchor) {
      const start = document.createTextNode('');
      const end = document.createTextNode('');
      vnode.anchor = start;
      vnode.el = end;
      container.insertBefore(start, anchor);
      mountChildren(vnode.children, container, anchor);
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
  function mountArrayNode(vnode, container, anchor) {
      const start = document.createTextNode('');
      const end = document.createTextNode('');
      vnode.anchor = start;
      vnode.el = end;
      container.insertBefore(start, anchor);
      mountChildren(vnode.children, container, anchor);
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
  function mountComponent(vnode, container, anchor) {
      const root = vnode.type.render(render);
      vnode.root = root;
      mount(root, container, anchor);
      vnode.el = root.el;
  }
  function unmountComponent(vnode, container) {
      unmount(vnode.root);
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

  class Component {
      constructor(config = {}) {
          this.config = config;
          this.data = defineState(config.data || {});
      }
  }

  class Vact {
      constructor(vnode, options) {
          this.rootVNode = vnode;
      }
      mount(selector) {
          const el = document.querySelector(selector);
          let container = document.createElement('div');
          mount(this.rootVNode, container);
          el === null || el === void 0 ? void 0 : el.replaceWith(...container.childNodes);
      }
  }
  function createApp(vnode, options) {
      return new Vact(vnode, options);
  }

  exports.Activer = Activer;
  exports.Component = Component;
  exports.Fragment = Fragment;
  exports.Text = Text;
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
