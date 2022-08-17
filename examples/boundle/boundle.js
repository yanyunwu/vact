
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
      VNODE_TYPE[VNODE_TYPE["Fragment"] = 2] = "Fragment";
      VNODE_TYPE[VNODE_TYPE["Component"] = 3] = "Component";
      VNODE_TYPE[VNODE_TYPE["ArrayNode"] = 4] = "ArrayNode";
  })(VNODE_TYPE || (VNODE_TYPE = {}));

  function isSameVNode(oldVNode, newVNode) {
      return oldVNode.flag === newVNode.flag;
  }
  function patch(oldVNode, newVNode, container) {
      var _a, _b;
      if (oldVNode === newVNode)
          return;
      if (isSameVNode(oldVNode, newVNode)) {
          if (oldVNode.flag === VNODE_TYPE.TEXT) {
              let node = oldVNode;
              let newNode = newVNode;
              node.el.nodeValue = newNode.children;
              newNode.el = node.el;
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
              if (isObjectExact(res)) {
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

  /**
   * 传说中的render函数
  */
  function render(type, props, children) {
      let flag;
      if (isString(type)) {
          flag = VNODE_TYPE.ELEMENT;
      }
      else if (isFragment(type)) {
          flag = VNODE_TYPE.Fragment;
      }
      else if (isText(type)) {
          flag = VNODE_TYPE.TEXT;
      }
      else if (isArrayNode(type)) {
          flag = VNODE_TYPE.ArrayNode;
      }
      else {
          flag = VNODE_TYPE.Component;
      }
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
      return {
          type,
          props,
          children,
          flag
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
          this.callback(oldValue, newValue);
      }
  }
  function watchVNode(activeVNode, callback) {
      let watcher = new Watcher(activeVNode, function (oldVNode, newVNode) {
          if (!isVNode(newVNode)) {
              if (newVNode === null)
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
      if (watcher.value === null)
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
          case VNODE_TYPE.Fragment:
              mountFragment(vnode, container, anchor);
              break;
          case VNODE_TYPE.ArrayNode:
              mountArrayNode(vnode, container, anchor);
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
          case VNODE_TYPE.Fragment:
              unmountFragment(vnode);
              break;
          case VNODE_TYPE.ArrayNode:
              unmountArrayNode(vnode);
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
          else {
              mount(render(Text, null, String(child)), container, anchor);
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
  function mergeStyle(style) {
      let styleStringList = [];
      for (let cssAttr in style) {
          styleStringList.push(`${cssAttr}:${style[cssAttr]};`);
      }
      return styleStringList.join('');
  }

  exports.Fragment = Fragment;
  exports.Text = Text;
  exports.active = active;
  exports.mount = mount;
  exports.reactive = reactive;
  exports.render = render;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
