
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Vact = {}));
})(this, (function (exports) { 'use strict';

  var domain;

  // This constructor is used to store event handlers. Instantiating this is
  // faster than explicitly calling `Object.create(null)` to get a "clean" empty
  // object (tested with v8 v4.9).
  function EventHandlers() {}
  EventHandlers.prototype = Object.create(null);

  function EventEmitter() {
    EventEmitter.init.call(this);
  }

  // nodejs oddity
  // require('events') === require('events').EventEmitter
  EventEmitter.EventEmitter = EventEmitter;

  EventEmitter.usingDomains = false;

  EventEmitter.prototype.domain = undefined;
  EventEmitter.prototype._events = undefined;
  EventEmitter.prototype._maxListeners = undefined;

  // By default EventEmitters will print a warning if more than 10 listeners are
  // added to it. This is a useful default which helps finding memory leaks.
  EventEmitter.defaultMaxListeners = 10;

  EventEmitter.init = function() {
    this.domain = null;
    if (EventEmitter.usingDomains) {
      // if there is an active domain, then attach to it.
      if (domain.active ) ;
    }

    if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
      this._events = new EventHandlers();
      this._eventsCount = 0;
    }

    this._maxListeners = this._maxListeners || undefined;
  };

  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.
  EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || isNaN(n))
      throw new TypeError('"n" argument must be a positive number');
    this._maxListeners = n;
    return this;
  };

  function $getMaxListeners(that) {
    if (that._maxListeners === undefined)
      return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }

  EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return $getMaxListeners(this);
  };

  // These standalone emit* functions are used to optimize calling of event
  // handlers for fast cases because emit() itself often has a variable number of
  // arguments and can be deoptimized because of that. These functions always have
  // the same number of arguments and thus do not get deoptimized, so the code
  // inside them can execute faster.
  function emitNone(handler, isFn, self) {
    if (isFn)
      handler.call(self);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self);
    }
  }
  function emitOne(handler, isFn, self, arg1) {
    if (isFn)
      handler.call(self, arg1);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1);
    }
  }
  function emitTwo(handler, isFn, self, arg1, arg2) {
    if (isFn)
      handler.call(self, arg1, arg2);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1, arg2);
    }
  }
  function emitThree(handler, isFn, self, arg1, arg2, arg3) {
    if (isFn)
      handler.call(self, arg1, arg2, arg3);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1, arg2, arg3);
    }
  }

  function emitMany(handler, isFn, self, args) {
    if (isFn)
      handler.apply(self, args);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].apply(self, args);
    }
  }

  EventEmitter.prototype.emit = function emit(type) {
    var er, handler, len, args, i, events, domain;
    var doError = (type === 'error');

    events = this._events;
    if (events)
      doError = (doError && events.error == null);
    else if (!doError)
      return false;

    domain = this.domain;

    // If there is no 'error' event listener then throw.
    if (doError) {
      er = arguments[1];
      if (domain) {
        if (!er)
          er = new Error('Uncaught, unspecified "error" event');
        er.domainEmitter = this;
        er.domain = domain;
        er.domainThrown = false;
        domain.emit('error', er);
      } else if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
      return false;
    }

    handler = events[type];

    if (!handler)
      return false;

    var isFn = typeof handler === 'function';
    len = arguments.length;
    switch (len) {
      // fast cases
      case 1:
        emitNone(handler, isFn, this);
        break;
      case 2:
        emitOne(handler, isFn, this, arguments[1]);
        break;
      case 3:
        emitTwo(handler, isFn, this, arguments[1], arguments[2]);
        break;
      case 4:
        emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
        break;
      // slower
      default:
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        emitMany(handler, isFn, this, args);
    }

    return true;
  };

  function _addListener(target, type, listener, prepend) {
    var m;
    var events;
    var existing;

    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');

    events = target._events;
    if (!events) {
      events = target._events = new EventHandlers();
      target._eventsCount = 0;
    } else {
      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (events.newListener) {
        target.emit('newListener', type,
                    listener.listener ? listener.listener : listener);

        // Re-assign `events` because a newListener handler could have caused the
        // this._events to be assigned to a new object
        events = target._events;
      }
      existing = events[type];
    }

    if (!existing) {
      // Optimize the case of one listener. Don't need the extra array object.
      existing = events[type] = listener;
      ++target._eventsCount;
    } else {
      if (typeof existing === 'function') {
        // Adding the second element, need to change to array.
        existing = events[type] = prepend ? [listener, existing] :
                                            [existing, listener];
      } else {
        // If we've already got an array, just append.
        if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
      }

      // Check for listener leak
      if (!existing.warned) {
        m = $getMaxListeners(target);
        if (m && m > 0 && existing.length > m) {
          existing.warned = true;
          var w = new Error('Possible EventEmitter memory leak detected. ' +
                              existing.length + ' ' + type + ' listeners added. ' +
                              'Use emitter.setMaxListeners() to increase limit');
          w.name = 'MaxListenersExceededWarning';
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          emitWarning(w);
        }
      }
    }

    return target;
  }
  function emitWarning(e) {
    typeof console.warn === 'function' ? console.warn(e) : console.log(e);
  }
  EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.prependListener =
      function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
      };

  function _onceWrap(target, type, listener) {
    var fired = false;
    function g() {
      target.removeListener(type, g);
      if (!fired) {
        fired = true;
        listener.apply(target, arguments);
      }
    }
    g.listener = listener;
    return g;
  }

  EventEmitter.prototype.once = function once(type, listener) {
    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');
    this.on(type, _onceWrap(this, type, listener));
    return this;
  };

  EventEmitter.prototype.prependOnceListener =
      function prependOnceListener(type, listener) {
        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };

  // emits a 'removeListener' event iff the listener was removed
  EventEmitter.prototype.removeListener =
      function removeListener(type, listener) {
        var list, events, position, i, originalListener;

        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');

        events = this._events;
        if (!events)
          return this;

        list = events[type];
        if (!list)
          return this;

        if (list === listener || (list.listener && list.listener === listener)) {
          if (--this._eventsCount === 0)
            this._events = new EventHandlers();
          else {
            delete events[type];
            if (events.removeListener)
              this.emit('removeListener', type, list.listener || listener);
          }
        } else if (typeof list !== 'function') {
          position = -1;

          for (i = list.length; i-- > 0;) {
            if (list[i] === listener ||
                (list[i].listener && list[i].listener === listener)) {
              originalListener = list[i].listener;
              position = i;
              break;
            }
          }

          if (position < 0)
            return this;

          if (list.length === 1) {
            list[0] = undefined;
            if (--this._eventsCount === 0) {
              this._events = new EventHandlers();
              return this;
            } else {
              delete events[type];
            }
          } else {
            spliceOne(list, position);
          }

          if (events.removeListener)
            this.emit('removeListener', type, originalListener || listener);
        }

        return this;
      };

  EventEmitter.prototype.removeAllListeners =
      function removeAllListeners(type) {
        var listeners, events;

        events = this._events;
        if (!events)
          return this;

        // not listening for removeListener, no need to emit
        if (!events.removeListener) {
          if (arguments.length === 0) {
            this._events = new EventHandlers();
            this._eventsCount = 0;
          } else if (events[type]) {
            if (--this._eventsCount === 0)
              this._events = new EventHandlers();
            else
              delete events[type];
          }
          return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = Object.keys(events);
          for (var i = 0, key; i < keys.length; ++i) {
            key = keys[i];
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners('removeListener');
          this._events = new EventHandlers();
          this._eventsCount = 0;
          return this;
        }

        listeners = events[type];

        if (typeof listeners === 'function') {
          this.removeListener(type, listeners);
        } else if (listeners) {
          // LIFO order
          do {
            this.removeListener(type, listeners[listeners.length - 1]);
          } while (listeners[0]);
        }

        return this;
      };

  EventEmitter.prototype.listeners = function listeners(type) {
    var evlistener;
    var ret;
    var events = this._events;

    if (!events)
      ret = [];
    else {
      evlistener = events[type];
      if (!evlistener)
        ret = [];
      else if (typeof evlistener === 'function')
        ret = [evlistener.listener || evlistener];
      else
        ret = unwrapListeners(evlistener);
    }

    return ret;
  };

  EventEmitter.listenerCount = function(emitter, type) {
    if (typeof emitter.listenerCount === 'function') {
      return emitter.listenerCount(type);
    } else {
      return listenerCount.call(emitter, type);
    }
  };

  EventEmitter.prototype.listenerCount = listenerCount;
  function listenerCount(type) {
    var events = this._events;

    if (events) {
      var evlistener = events[type];

      if (typeof evlistener === 'function') {
        return 1;
      } else if (evlistener) {
        return evlistener.length;
      }
    }

    return 0;
  }

  EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
  };

  // About 1.5x faster than the two-arg version of Array#splice().
  function spliceOne(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
      list[i] = list[k];
    list.pop();
  }

  function arrayClone(arr, i) {
    var copy = new Array(i);
    while (i--)
      copy[i] = arr[i];
    return copy;
  }

  function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i = 0; i < ret.length; ++i) {
      ret[i] = arr[i].listener || arr[i];
    }
    return ret;
  }

  class PropValue extends EventEmitter {
      constructor(value, dataProxy) {
          super();
          this.value = value;
          this.dep = [];
          this.dataProxy = dataProxy;
      }
      setDep(watcher) {
          this.dep.push(watcher);
      }
      valueOf() {
          return this.value;
      }
      toString() {
          return this.value;
      }
      set(value) {
          this.value = value;
      }
      get() {
          return this.value;
      }
      notify() {
          this.dep.forEach(watcher => {
              watcher.update();
          });
          this.emit('change', this.value);
      }
  }
  class Watcher {
      constructor(fn) {
          this.fn = fn;
      }
      update() {
          this.fn();
      }
  }

  /**
   * 数据响应式中心
  */
  /**
   * 数据存放处
  */
  class DataProxyValue {
      constructor() {
          this.valueMap = new WeakMap();
      }
      getProp(target, prop) {
          if (!this.valueMap.get(target)) {
              this.valueMap.set(target, {});
          }
          let valueTarget = this.valueMap.get(target);
          if (!valueTarget[prop]) {
              let propValue = new PropValue(Array.isArray(target[prop]) ? new Proxy(target[prop], {
                  set(target, prop, value, receiver) {
                      // 这里一定要先设置再通知
                      let res = Reflect.set(target, prop, value, receiver);
                      propValue.notify();
                      return res;
                  }
              }) : target[prop]);
              valueTarget[prop] = propValue;
          }
          return valueTarget[prop];
      }
      // 获取用于绑定属性事件的代理对象
      getValueTarget(target) {
          return this.valueMap.get(target);
      }
      // 设置用于绑定属性事件的代理对象
      setValueTarget(target, valueTarget) {
          this.valueMap.set(target, valueTarget);
      }
  }
  /**
   * 用于实现对数组监控，只适合定长的数组
  */
  class ArrayProxy {
      constructor(data) {
          this.dataProxyValue = new DataProxyValue();
          // 监控数组对象
          const handler = {
              get: (target, prop, receiver) => {
                  if (typeof target[prop] === 'object' && target[prop] !== null && !Array.isArray(target[prop]) && target[prop].constructor === Object) {
                      return new Proxy(target[prop], handler);
                  }
                  else if (typeof target[prop] === 'function') {
                      return Reflect.get(target, prop, receiver);
                  }
                  else {
                      let propValue = this.dataProxyValue.getProp(target, prop);
                      for (let depArr of Vact.depPool) {
                          if (!depArr.includes(propValue)) {
                              depArr.push(propValue);
                          }
                      }
                      return propValue.value;
                  }
              },
              set: (target, prop, value, receiver) => {
                  if (typeof value === 'object' && value !== null && !Array.isArray(value) && value.constructor === Object) {
                      // 当对象被替换为新对象时 通知对象里所有的响应式
                      let valueTarget = this.dataProxyValue.getValueTarget(target[prop]);
                      let res = Reflect.set(target, prop, value, receiver);
                      this.replaceProps(value, valueTarget);
                      return res;
                  }
                  else {
                      let propValue = this.dataProxyValue.getProp(target, prop);
                      propValue.value = Array.isArray(value) ? new Proxy(value, {
                          set(target, prop, value, receiver) {
                              // 这里一定要先设置再通知
                              let res = Reflect.set(target, prop, value, receiver);
                              propValue.notify();
                              return res;
                          }
                      }) : value;
                      let res = Reflect.set(target, prop, value, receiver);
                      propValue.notify();
                      return res;
                  }
              }
          };
          this.data = new Proxy(data, handler);
      }
      // 当对象属性被新对象替换时
      replaceProps(target, valueTarget) {
          for (let prop in valueTarget) {
              let propValue = valueTarget[prop];
              propValue.value = target[prop];
              propValue.notify();
          }
          this.dataProxyValue.setValueTarget(target, valueTarget);
      }
      getData() {
          return this.data;
      }
  }
  class DataProxyTest {
      constructor(data) {
          this.dataProxyValue = new DataProxyValue();
          // 监控普通对象
          const handler = {
              get: (target, prop, receiver) => {
                  if (typeof target[prop] === 'object' && target[prop] !== null && !Array.isArray(target[prop]) && target[prop].constructor === Object) {
                      return new Proxy(target[prop], handler);
                  }
                  else if (typeof target[prop] === 'function') {
                      return Reflect.get(target, prop, receiver);
                  }
                  else {
                      let propValue = this.dataProxyValue.getProp(target, prop);
                      for (let depArr of Vact.depPool) {
                          if (!depArr.includes(propValue)) {
                              depArr.push(propValue);
                          }
                      }
                      return propValue.value;
                  }
              },
              set: (target, prop, value, receiver) => {
                  if (typeof value === 'object' && value !== null && !Array.isArray(value) && value.constructor === Object) {
                      // 当对象被替换为新对象时 通知对象里所有的响应式
                      let valueTarget = this.dataProxyValue.getValueTarget(target[prop]);
                      let res = Reflect.set(target, prop, value, receiver);
                      this.replaceProps(value, valueTarget);
                      return res;
                  }
                  else {
                      let propValue = this.dataProxyValue.getProp(target, prop);
                      propValue.value = Array.isArray(value) ? new Proxy(value, {
                          set(target, prop, value, receiver) {
                              // 这里一定要先设置再通知
                              let res = Reflect.set(target, prop, value, receiver);
                              propValue.notify();
                              return res;
                          }
                      }) : value;
                      let res = Reflect.set(target, prop, value, receiver);
                      propValue.notify();
                      return res;
                  }
              }
          };
          this.data = new Proxy(data, handler);
      }
      getData() {
          return this.data;
      }
      // 当对象属性被新对象替换时
      replaceProps(target, valueTarget) {
          for (let prop in valueTarget) {
              let propValue = valueTarget[prop];
              propValue.value = target[prop];
              propValue.notify();
          }
          this.dataProxyValue.setValueTarget(target, valueTarget);
      }
  }

  class Component$1 {
      constructor(config = {}) {
          this.config = config;
          // 设置响应式数据对象
          this.setData();
      }
      // 设置数据为响应式的
      setData() {
          this.data = new DataProxyTest(this.config.data || {}).getData();
      }
      setProps(props) {
          this.props = props;
      }
      setChildren(children) {
          this.children = children;
      }
      renderRoot() {
          return this.render(createNode$1);
      }
  }

  class VNode {
  }
  VNode.ELEMENT = 0;
  VNode.TEXT = 1;
  VNode.COMPONENT = 2;
  class TextVNode extends VNode {
      constructor(text) {
          super();
          this.type = VNode.TEXT;
          this.text = text;
      }
      createTextNode() {
          this.textNode = document.createTextNode(this.text);
          return this.textNode;
      }
  }
  /**
   * 组件节点
  */
  class ComponentVNode extends VNode {
      constructor(Constructor, props, children) {
          super();
          this.type = VNode.COMPONENT;
          this.Constructor = Constructor;
          this.props = props || {};
          this.children = children || [];
          // 在初始化内部一定不要调用init
      }
      init() {
          // 处理自定义组件的属性
          let props = new DataProxyTest({}).getData();
          for (let prop in this.props) {
              // 如果属性不为函数则不需要设置响应式
              if (typeof this.props[prop] !== 'function') {
                  props[prop] = this.props[prop];
                  continue;
              }
              let depProps = [];
              let pool = Vact.depPool;
              pool.push(depProps);
              let result = this.props[prop]();
              pool.splice(pool.indexOf(depProps), 1);
              if (typeof result === 'function') {
                  props[prop] = result;
              }
              else {
                  props[prop] = result;
                  let fn = () => props[prop] = this.props[prop]();
                  depProps.forEach(item => {
                      item.setDep(new Watcher(fn));
                  });
              }
          }
          let children = new ArrayProxy([]).getData();
          if (this.children) {
              for (let i = 0; i < this.children.length; i++) {
                  if (typeof this.children[i] !== 'function') {
                      children[i] = this.children[i];
                      continue;
                  }
                  let depProps = [];
                  let pool = Vact.depPool;
                  pool.push(depProps);
                  let result = this.children[i]();
                  pool.splice(pool.indexOf(depProps), 1);
                  if (typeof result === 'function') {
                      children[i] = result;
                  }
                  else {
                      children[i] = result;
                      let fn = () => children[i] = this.children[i]();
                      depProps.forEach(item => {
                          item.setDep(new Watcher(fn));
                      });
                  }
              }
          }
          let Constructor = this.Constructor;
          this.component = new Constructor(props, children);
          this.component.setProps(props);
          this.component.setChildren(children);
      }
      getComponent() {
          this.init();
          return this.component;
      }
  }
  class ElementVNode extends VNode {
      constructor(tag, props, children) {
          super();
          this.type = VNode.ELEMENT;
          this.tag = tag;
          this.props = props;
          this.children = children;
      }
      createEle() {
          var _a;
          this.ele = document.createElement(this.tag);
          // 处理标签属性
          if (this.props) {
              for (let prop in this.props) {
                  // 如果是函数要先看函数的返回值 不然直接设置属性
                  if (typeof this.props[prop] === 'function') {
                      let depProps = [];
                      let pool = Vact.depPool;
                      pool.push(depProps);
                      let result = this.props[prop]();
                      pool.splice(pool.indexOf(depProps), 1);
                      if (typeof result === 'function') {
                          let pattern = /^on([a-zA-Z]+)/;
                          if (pattern.test(prop)) {
                              let mat = prop.match(pattern);
                              mat && this.ele.addEventListener(mat[1].toLocaleLowerCase(), result.bind(this.ele));
                          }
                          else {
                              this.ele.addEventListener(prop, result.bind(this.ele));
                          }
                      }
                      else {
                          (_a = this.ele) === null || _a === void 0 ? void 0 : _a.setAttribute(prop, result);
                          let fn = () => { var _a; return (_a = this.ele) === null || _a === void 0 ? void 0 : _a.setAttribute(prop, this.props[prop]()); };
                          depProps.forEach(item => {
                              item.setDep(new Watcher(fn));
                          });
                      }
                  }
                  else {
                      this.ele.setAttribute(prop, this.props[prop]);
                  }
              }
          }
          // 处理标签子节点
          if (Array.isArray(this.children) && this.children.length) {
              for (let child of this.children) {
                  this.addChild(child);
              }
          }
          else if (this.children !== undefined && this.children !== null) {
              this.addChild(this.children);
          }
          return this.ele;
      }
      // 通过虚拟节点获取所有真实节点
      getRealNode(child) {
          let realNode = document.createTextNode('');
          // 如果是普通的文本字符串
          if (typeof child === "string") {
              let vnode = new TextVNode(child);
              realNode = vnode.createTextNode();
          }
          else if (child instanceof Component$1) {
              realNode = child.renderRoot().createEle();
          }
          else if (child instanceof ComponentVNode) {
              realNode = child.getComponent().renderRoot().createEle();
              // 如果是元素节点
          }
          else if (child instanceof ElementVNode) {
              realNode = child.createEle();
          }
          else if (child instanceof TextVNode) {
              realNode = child.createTextNode();
          }
          else {
              let vnode = new TextVNode(String(child));
              realNode = vnode.createTextNode();
          }
          return realNode;
      }
      // 通过虚拟节点获取所有真实节点列表
      getRealNodeList(childList) {
          let list = [];
          for (let i of childList) {
              list.push(this.getRealNode(i));
          }
          return list;
      }
      // 添加数组中所有的节点
      addChildren(children, pivot) {
          var _a;
          let fragment = document.createDocumentFragment();
          for (let i of children) {
              fragment.appendChild(i);
          }
          (_a = this.ele) === null || _a === void 0 ? void 0 : _a.insertBefore(fragment, pivot);
      }
      // 移除数组中所有的节点
      removeChildren(children) {
          for (let i of children) {
              i.remove();
          }
      }
      addChild(child) {
          if (!this.ele)
              return;
          // child可能是节点对象(元素节点 文本节点 组件节点), 也可能是函数(是函数说明是响应式)
          // 除此之外还有可能是普通的文本字符串
          // 如果是普通的文本字符串
          if (typeof child === "string") {
              let vnode = new TextVNode(child);
              this.ele.appendChild(vnode.createTextNode());
          } // 如果子组件是自定义组件 这里可以删除
          else if (child instanceof Component$1) {
              this.ele.appendChild(child.renderRoot().createEle());
          }
          else if (child instanceof ComponentVNode) {
              this.ele.appendChild(child.getComponent().renderRoot().createEle());
          } // 如果是元素节点
          else if (child instanceof ElementVNode) {
              this.ele.appendChild(child.createEle());
          } // 如果是文本节点
          else if (child instanceof TextVNode) {
              this.ele.appendChild(child.createTextNode());
          } // 如果是函数
          else if (typeof child === 'function') {
              let depProps = [];
              let pool = Vact.depPool;
              pool.push(depProps);
              let result = child();
              pool.splice(pool.indexOf(depProps), 1);
              console.log(result);
              // 对于数组需要特殊处理
              if (Array.isArray(result)) {
                  // 设置数组的锚点
                  let pivot = document.createTextNode('');
                  this.ele.appendChild(pivot);
                  let realNodeList = this.getRealNodeList(result);
                  this.addChildren(realNodeList, pivot);
                  // 没有依赖的属性直接结束
                  if (!depProps.length)
                      return;
                  let fn = () => {
                      this.removeChildren(realNodeList);
                      let newVnodeList = child();
                      if (Array.isArray(newVnodeList)) {
                          realNodeList = this.getRealNodeList(newVnodeList);
                          this.addChildren(realNodeList, pivot);
                      }
                  };
                  for (let prop of depProps) {
                      prop.setDep(new Watcher(fn));
                  }
              }
              else {
                  let realNode = this.getRealNode(result);
                  this.ele.appendChild(realNode);
                  // 没有依赖的属性直接结束
                  if (!depProps.length)
                      return;
                  let fn = () => {
                      var _a, _b;
                      let newVNode = child();
                      let newRealNode = this.getRealNode(newVNode);
                      if (newRealNode) {
                          // 如果都是文本节点则不需要替换, 只需更改文本内容
                          if (newRealNode.nodeType === realNode.nodeType) {
                              realNode.nodeValue = newRealNode.nodeValue;
                          }
                          else {
                              (_a = this.ele) === null || _a === void 0 ? void 0 : _a.replaceChild(newRealNode, realNode);
                              realNode = newRealNode;
                          }
                      }
                      else {
                          (_b = this.ele) === null || _b === void 0 ? void 0 : _b.replaceChild(realNode = document.createTextNode(''), realNode);
                      }
                      // tode: 后续可以优化缓存节点，只需更改缓存节点的属性即可
                  };
                  for (let prop of depProps) {
                      prop.setDep(new Watcher(fn));
                  }
              }
          }
          // 如果是数组 直接递归遍历数组内的内容
          else if (Array.isArray(child)) {
              for (let subChild of child) {
                  this.addChild(subChild);
              }
          }
          // 如果是其他数据类型
          else {
              let vnode = new TextVNode(String(child));
              this.ele.appendChild(vnode.createTextNode());
          }
      }
  }
  ElementVNode.nativeEvents = {
      onClick: 'click',
  };

  function mount$1(selector, rootNode) {
      let ele = document.querySelector(selector);
      let rootEle = rootNode.renderRoot().createEle();
      if (ele && rootEle) {
          if (ele.parentNode) {
              ele.parentNode.replaceChild(rootEle, ele);
          }
      }
  }
  function createNode$1(a, b, c) {
      if (typeof a === 'string') {
          return new ElementVNode(a, b, c);
      }
      else if (typeof a === 'function') {
          return new ComponentVNode(a, b, c);
      }
      else {
          throw new Error('只能传入字符串或者构造函数');
      }
  }
  class Vact {
      static getDepPool() {
          return this.depPool;
      }
  }
  Vact.depPool = [];
  Vact.Component = Component$1;
  Vact.mount = mount$1;
  Vact.createNode = createNode$1;

  const mount = Vact.mount;
  const Component = Vact.Component;
  const createNode = Vact.createNode;

  exports.Component = Component;
  exports.createNode = createNode;
  exports["default"] = Vact;
  exports.mount = mount;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
