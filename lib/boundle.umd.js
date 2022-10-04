(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Vact = {}));
})(this, (function (exports) { 'use strict';

  const TextSymbol = Symbol('Text');

  const FragmentSymbol = Symbol('Fragment');

  const VComponentSymbol = Symbol('VComponent');

  const ArraySymbol = Symbol('ArrayNode');

  const AliveSymbol = Symbol('Alive');

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
  // 判断是否是一个数组节点
  function isVArrayNode(node) {
      return node.flag === VNODE_TYPE.ARRAYNODE;
  }
  function isVTextNode(node) {
      return node.flag === VNODE_TYPE.TEXT;
  }
  function isVElementNode(node) {
      return node.flag === VNODE_TYPE.ELEMENT;
  }
  function isVFragmentNode(node) {
      return node.flag === VNODE_TYPE.FRAGMENT;
  }
  function isVComponentNode(node) {
      return node.flag === VNODE_TYPE.COMPONENT;
  }
  function isVAliveNode(node) {
      return node.flag === VNODE_TYPE.ALIVE;
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
  // 设置全局变量
  function getActiver() {
      return activeWatcher;
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

  class ComponentLifeCycle {
      constructor(createdList = [], beforeMountedList = [], readyMountedList = [], mountedList = [], beforeUnMountedList = [], unMountedList = []) {
          this.createdList = createdList;
          this.beforeMountedList = beforeMountedList;
          this.readyMountedList = readyMountedList;
          this.mountedList = mountedList;
          this.beforeUnMountedList = beforeUnMountedList;
          this.unMountedList = unMountedList;
          // this.createdList = []
          // this.beforeMountedList = []
          // this.readyMountedList = []
          // this.mountedList = []
          // this.beforeUnMountedList = []
          // this.unMountedList = []
      }
      created(fn) {
          this.createdList.push(fn);
      }
      beforeMounted(fn) {
          this.beforeMountedList.push(fn);
      }
      readyMounted(fn) {
          this.readyMountedList.push(fn);
      }
      mounted(fn) {
          this.mountedList.push(fn);
      }
      beforeUnMounted(fn) {
          this.beforeUnMountedList.push(fn);
      }
      unMounted(fn) {
          this.unMountedList.push(fn);
      }
      emit(lifeName) {
          this[`${lifeName}List`].forEach(fn => fn());
      }
  }
  // 生成类组件生命周期实例
  function createClassComponentLife(component) {
      let lifeNames = ['created', 'beforeMounted', 'readyMounted', 'mounted', 'beforeUnMounted', 'unMounted'];
      let lifeCycle = new ComponentLifeCycle();
      component.life = lifeCycle;
      lifeNames.forEach(lifeName => {
          let fn = component[lifeName];
          if (!fn)
              return;
          lifeCycle[lifeName](fn.bind(component));
      });
      return lifeCycle;
  }

  // 给插件提供的能力
  const appUtils = {
      state,
      defineState,
      h: renderApi,
      watch,
      active,
      isActiver,
      isVArrayNode,
      isVNode,
      isVFragmentNode,
      isVElementNode,
      isVTextNode,
      isVComponentNode,
      isVAliveNode
  };

  /**
   * 函数转化为activer转化为VAlive
   * activer转化为VAlive
   * string转化为VText
   * 数组转化为VArray
   * 其他转化为VText
  */
  function createVNode(originVNode) {
      if (isVNode(originVNode))
          return originVNode;
      if (isFunction(originVNode))
          return renderAlive(active(originVNode));
      else if (isActiver(originVNode))
          return renderAlive(originVNode);
      else if (isString(originVNode))
          return renderText(originVNode);
      else if (isArray(originVNode))
          return renderArrayNode(originVNode.map(item => createVNode(item)));
      else {
          // todo
          let value = originVNode;
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
  function renderApi(type, props, children) {
      return render(type, props || undefined, children);
  }
  function render(type, originProps, originChildren) {
      // text的children比较特殊先处理
      if (isText(type)) {
          return renderText(String(originChildren));
      }
      // 预处理 处理为单个的children
      let originChildrenList = [];
      if (isArray(originChildren))
          originChildrenList.push(...originChildren);
      else
          originChildrenList.push(originChildren);
      // 创建VNode列表
      let vNodeChildren = originChildrenList.map(originChild => createVNode(originChild));
      // 属性预处理
      let props = originProps || {};
      handleProps(props);
      if (isString(type))
          return renderElement(type, props, vNodeChildren);
      if (isFragment(type))
          return renderFragment(vNodeChildren);
      if (isArrayNode(type))
          return renderArrayNode(vNodeChildren);
      if (isFunction(type))
          return renderComponent(type, props, vNodeChildren);
      throw '传入参数不合法';
  }
  /**
   * 对属性进行预处理
   */
  function handleProps(originProps) {
      for (const prop in originProps) {
          // 以on开头的事件不需要处理
          if (!isOnEvent(prop) &&
              isFunction(originProps[prop])) {
              // 如不为on且为函数则判断为响应式
              originProps[prop] = active(originProps[prop]);
          }
      }
      return originProps;
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
  function createComponentProps(props) {
      let componentProps = {};
      for (const prop in props) {
          let curProp = props[prop];
          if (isActiver(curProp)) {
              Object.defineProperty(componentProps, prop, {
                  get() {
                      return curProp.value;
                  }
              });
          }
          else {
              componentProps[prop] = curProp;
          }
      }
      return componentProps;
  }
  // 渲染一个活跃的节点
  function renderAlive(activer) {
      return {
          type: AliveSymbol,
          flag: VNODE_TYPE.ALIVE,
          activer
      };
  }
  // 判断是普通函数还是构造函数
  function renderComponent(component, props, children) {
      let componentProps = createComponentProps(props);
      if (component.prototype &&
          component.prototype.render &&
          isFunction(component.prototype.render)) {
          let ClassComponent = component;
          let result = new ClassComponent(componentProps, children);
          result.props = componentProps;
          result.children = children;
          let lifeCycle = createClassComponentLife(result);
          let vn = result.render(renderApi);
          lifeCycle.emit('created');
          let vc = {
              type: VComponentSymbol,
              root: createVNode(vn),
              props: componentProps,
              children: children,
              flag: VNODE_TYPE.COMPONENT,
              lifeStyleInstance: lifeCycle
          };
          lifeCycle.emit('beforeMounted');
          return vc;
      }
      else {
          let FunctionComponent = component;
          let lifeCycle = new ComponentLifeCycle();
          let vn = FunctionComponent({ props: componentProps, children: children, life: lifeCycle, utils: appUtils });
          lifeCycle.emit('created');
          let vc = {
              type: VComponentSymbol,
              root: createVNode(vn),
              props: componentProps,
              children: children,
              flag: VNODE_TYPE.COMPONENT,
              lifeStyleInstance: lifeCycle
          };
          lifeCycle.emit('beforeMounted');
          return vc;
      }
  }

  // 初始化所有虚拟dom的指令
  function renderWithOrder(vNode, app) {
      // if (isVAliveNode(vNode)) {
      //     let preActiver = vNode.activer
      //     vNode.activer = active(()=> renderWithOrder(createVNode(preActiver.value), app))
      // }
      if (isVComponentNode(vNode)) {
          vNode.root = renderWithOrder(vNode.root, app);
      }
      if (isVElementNode(vNode) ||
          isVFragmentNode(vNode) ||
          isVArrayNode(vNode)) {
          vNode.children = vNode.children.map(node => renderWithOrder(node, app));
      }
      if (isVElementNode(vNode) ||
          isVComponentNode(vNode)) {
          // console.log(vNode)
          // 根据优先级排列
          let orderList = Object.values(app.orderMap).sort((a, b) => b.priority - a.priority);
          return orderList.reduce((pre, cur) => {
              if (pre.props && pre.props[cur.propName] != null) {
                  let res = cur.handler({ value: pre.props[cur.propName], vNode: pre });
                  return createVNode(res === undefined ? pre : res);
              }
              else {
                  return pre;
              }
          }, vNode);
      }
      return vNode;
  }
  function registerOrder(propName, handler, priority = 0) {
      this.orderMap[propName] = {
          handler, priority, propName
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
          var _a;
          let newValue = this.activeProps.value;
          let oldValue = this.value;
          this.value = newValue;
          let meta = { targetPropOldValue: this.depArr, targetPropNewValue: this.nextDepArr };
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
  function watchVNode(activeVNode, callback, app) {
      let watcher = new Watcher(activeVNode.activer, function (oldValue, newValue, meta) {
          const oldVNode = oldValue;
          const newVNode = renderWithOrder(createVNode(ifFunctionToString(newValue)), app);
          // 对于数组节点后期需要记录它的响应式数组用于节点更新
          if (isVArrayNode(oldVNode)) {
              oldVNode.depArray = meta === null || meta === void 0 ? void 0 : meta.targetPropOldValue;
          }
          // 对于数组节点后期需要记录它的响应式数组用于节点更新
          if (isVArrayNode(newVNode)) {
              newVNode.depArray = meta === null || meta === void 0 ? void 0 : meta.targetPropNewValue;
          }
          callback(oldVNode, newVNode);
          watcher.value = newVNode;
          activeVNode.vnode = newVNode;
      });
      return watcher.value = renderWithOrder(createVNode(ifFunctionToString(watcher.value)), app);
  }
  function ifFunctionToString(value) {
      if (isFunction(value)) {
          console.warn('你确定要返回一个函数到页面？');
          return String(value);
      }
      return value;
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
  // todo
  function getNextSibling(vNode) {
      switch (vNode.flag) {
          case VNODE_TYPE.TEXT:
          case VNODE_TYPE.ELEMENT:
          case VNODE_TYPE.ARRAYNODE:
          case VNODE_TYPE.FRAGMENT:
              return vNode.el.nextSibling;
          case VNODE_TYPE.COMPONENT:
              return vNode.root.el.nextSibling;
          case VNODE_TYPE.ALIVE:
              return getNextSibling(vNode.vnode);
      }
  }
  function patch(oldVNode, newVNode, container, app) {
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
              // const nextSibling = oldVNode?.el?.nextSibling
              const nextSibling = getNextSibling(oldVNode);
              unmount(oldVNode);
              mount(newVNode, container, nextSibling);
          }
      }
      else {
          // const nextSibling = oldVNode?.el?.nextSibling
          const nextSibling = getNextSibling(oldVNode);
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
      if (!oldDepArray.length || !newDepArray.length) {
          patchArrayNode(oldVNode, newVNode, container);
          return;
      }
      newVNode.anchor = oldVNode.anchor;
      newVNode.el = oldVNode.el;
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
                  let next;
                  if (newIndex > 0) {
                      next = getNextSibling(newChildren[newIndex - 1]);
                  }
                  else {
                      next = getNextSibling(maxIndexSoFar.node);
                  }
                  VNodeInsertBefore(container, old.node, next);
                  // container.insertBefore(old.node.el!, next)
              }
              else {
                  maxIndexSoFar = old;
              }
              newChildren[newIndex] = old.node;
              moveOld(item, old);
          }
          else {
              // let next = maxIndexSoFar.node.el!.nextSibling
              let next;
              if (newIndex > 0) {
                  next = getNextSibling(newChildren[newIndex - 1]);
              }
              else {
                  next = getNextSibling(maxIndexSoFar.node);
              }
              let newNode = newChildren[newIndex];
              mount(newNode, container, next);
              // maxIndexSoFar = { node: newNode, index: maxIndexSoFar.index + 1 }
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
  /**
   * 将一个虚拟节点挂载到一个锚点前面
   */
  function VNodeInsertBefore(container, node, next) {
      if (node.flag === VNODE_TYPE.ELEMENT || node.flag === VNODE_TYPE.TEXT) {
          container.insertBefore(node.el, next);
      }
      else if (node.flag === VNODE_TYPE.COMPONENT) {
          container.insertBefore(node.root.el, next);
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

  function mount(vNode, container, anchor, app) {
      if (isVElementNode(vNode)) {
          mountElement(vNode, container, anchor, app);
      }
      else if (isVTextNode(vNode)) {
          mountText(vNode, container, anchor);
      }
      else if (isVFragmentNode(vNode)) {
          mountFragment(vNode, container, anchor, app);
      }
      else if (isVArrayNode(vNode)) {
          mountArrayNode(vNode, container, anchor, app);
      }
      else if (isVComponentNode(vNode)) {
          mountComponent(vNode, container, anchor, app);
      }
      else if (isVAliveNode(vNode)) {
          mountAlive(vNode, container, anchor, app);
      }
      else {
          throw '传入的节点不合法！';
      }
  }
  function unmount(vNode, container) {
      if (isVElementNode(vNode)) {
          unmountElement(vNode);
      }
      else if (isVTextNode(vNode)) {
          unmountText(vNode);
      }
      else if (isVFragmentNode(vNode)) {
          unmountFragment(vNode);
      }
      else if (isVArrayNode(vNode)) {
          unmountArrayNode(vNode);
      }
      else if (isVComponentNode(vNode)) {
          unmountComponent(vNode);
      }
      else {
          throw '传入的节点不合法！';
      }
  }
  function mountChildren(children, container, anchor, app) {
      children.forEach(child => mount(child, container, anchor, app));
  }
  function mountText(vNode, container, anchor) {
      const el = document.createTextNode(vNode.children);
      vNode.el = el;
      container.insertBefore(el, anchor);
  }
  function unmountText(vNode, container) {
      vNode.el.remove();
  }
  function mountFragment(vNode, container, anchor, app) {
      const start = document.createTextNode('');
      const end = document.createTextNode('');
      vNode.anchor = start;
      vNode.el = end;
      container.insertBefore(start, anchor);
      mountChildren(vNode.children, container, anchor, app);
      container.insertBefore(end, anchor);
  }
  function unmountFragment(vNode, container) {
      const start = vNode.anchor;
      const end = vNode.el;
      let cur = start;
      while (cur && cur !== end) {
          let next = cur.nextSibling;
          cur.remove();
          cur = next;
      }
      end.remove();
  }
  function mountArrayNode(vNode, container, anchor, app) {
      const start = document.createTextNode('');
      const end = document.createTextNode('');
      vNode.anchor = start;
      vNode.el = end;
      container.insertBefore(start, anchor);
      mountChildren(vNode.children, container, anchor, app);
      container.insertBefore(end, anchor);
  }
  function unmountArrayNode(vNode, container, anchor) {
      const start = vNode.anchor;
      const end = vNode.el;
      let cur = start;
      while (cur && cur !== end) {
          let next = cur.nextSibling;
          cur.remove();
          cur = next;
      }
      end.remove();
  }
  function mountComponent(vNode, container, anchor, app) {
      const root = vNode.root;
      vNode.lifeStyleInstance.emit('readyMounted');
      mount(root, container, anchor, app);
      vNode.lifeStyleInstance.emit('mounted');
  }
  function unmountComponent(vNode, container) {
      vNode.lifeStyleInstance.emit('beforeUnMounted');
      unmount(vNode.root);
      vNode.lifeStyleInstance.emit('unMounted');
  }
  function mountAlive(vNode, container, anchor, app) {
      let firstVNode = watchVNode(vNode, (oldVNode, newVNode) => patch(oldVNode, newVNode, container, app), app);
      vNode.vnode = firstVNode;
      mount(firstVNode, container, anchor, app);
  }

  class Component {
      constructor() {
          this.utils = appUtils;
      }
  }
  function defineComponent(componentType) {
      return componentType;
  }

  // 自定义处理className的指令
  function orderClassName(app) {
      app.order('className', function ({ value, vNode }) {
          let className = vNode.props['className'];
          if (isActiver(className)) {
              let preCall = className.callback;
              className.callback = () => {
                  let value = preCall();
                  if (isObjectExact(value)) {
                      return handleObject(value);
                  }
                  else if (isArray(value)) {
                      return handleArray(value);
                  }
                  else {
                      return value;
                  }
              };
          }
      });
  }
  function handleObject(value) {
      let names = [];
      for (let p in value) {
          if (value[p])
              names.push(p);
      }
      return names.join(' ');
  }
  function handleArray(value) {
      return value.join(' ');
  }

  class App {
      constructor(vNode, options) {
          this.rootVNode = vNode;
          this.options = options || {};
          this.pluginList = [];
          this.orderMap = {};
          this._init();
      }
      _init() {
          orderClassName(this);
      }
      mount(selector) {
          if (selector) {
              const el = (isString(selector) ? document.querySelector(selector) : selector) || document.body;
              mount(renderWithOrder(this.rootVNode, this), el, undefined, this);
          }
          else {
              mount(renderWithOrder(this.rootVNode, this), document.body, undefined, this);
          }
          // let container = document.createElement('div')
          // runtime(this.rootVNode, container, undefined, this)
          // el?.replaceWith(...container.childNodes)
      }
      use(plugin) {
          let index = this.pluginList.indexOf(plugin);
          if (index > -1)
              return this;
          const ctx = { app: this, utils: appUtils };
          if (isFunction(plugin)) {
              plugin(ctx);
          }
          else {
              plugin.install(ctx);
          }
          this.pluginList.push(plugin);
          return this;
      }
      order(propName, handler, priority) {
          registerOrder.call(this, propName, handler, priority);
          return this;
      }
  }
  function createApp(vNode, options) {
      return new App(vNode, options);
  }

  exports.Activer = Activer;
  exports.Component = Component;
  exports.RefImpl = RefImpl;
  exports.VArray = ArraySymbol;
  exports.VComponent = VComponentSymbol;
  exports.VFragment = FragmentSymbol;
  exports.VText = TextSymbol;
  exports.Watcher = Watcher;
  exports.active = active;
  exports.createApp = createApp;
  exports.createVNode = renderApi;
  exports["default"] = App;
  exports.defineComponent = defineComponent;
  exports.defineState = defineState;
  exports.getActiver = getActiver;
  exports.h = renderApi;
  exports.mount = mount;
  exports.reactive = reactive;
  exports.ref = ref;
  exports.render = renderApi;
  exports.setActiver = setActiver;
  exports.state = state;
  exports.track = track;
  exports.trigger = trigger;
  exports.watch = watch;
  exports.watchProp = watchProp;
  exports.watchVNode = watchVNode;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=boundle.umd.js.map
