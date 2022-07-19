
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
          this.running = false;
          this.fn = fn;
      }
      update() {
          if (this.running)
              return;
          this.running = true;
          let fn = () => {
              this.fn();
              this.running = false;
          };
          runTask(fn);
      }
  }

  /**
   * 数据响应式中心
  */
  /**
   * 数据事件存放处
  */
  class DataEventProxy {
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
      getEventProxy(target) {
          return this.valueMap.get(target);
      }
      // 设置用于绑定属性事件的代理对象
      setEventProxy(target, valueTarget) {
          this.valueMap.set(target, valueTarget);
      }
  }
  /**
   * 监控数据响应变化处
  */
  class DataProxy {
      constructor(data) {
          this.target = data;
          this.dataProxyValue = new DataEventProxy();
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
                      for (let depArr of getDepPool()) {
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
                      let valueTarget = this.dataProxyValue.getEventProxy(target[prop]);
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
      getTarget() {
          return this.target;
      }
      getEventProxy() {
          return this.dataProxyValue;
      }
      // 当对象属性被新对象替换时
      replaceProps(target, valueTarget) {
          for (let prop in valueTarget) {
              let propValue = valueTarget[prop];
              propValue.value = target[prop];
              propValue.notify();
          }
          this.dataProxyValue.setEventProxy(target, valueTarget);
      }
  }

  class State {
      constructor(data, config) {
          this.dataProxy = new DataProxy(data);
          this.config = config;
      }
      get data() {
          return this.dataProxy.getData();
      }
      // 用于监控数据变化
      watch(path, fn) {
          let props = path.split('.');
          if (!props.length)
              return;
          let obj = this.dataProxy.getTarget();
          let prop = props.shift() || '';
          while (props.length) {
              let p = props.shift();
              if (p) {
                  obj = obj[prop];
                  prop = p;
              }
          }
          let events = this.dataProxy.getEventProxy();
          let propValue = events.getProp(obj, prop);
          propValue.on('change', fn);
      }
  }

  function setNodeChildren(parentNode, children) {
      let standardNodeList = [];
      for (let i = 0; i < children.length; i++) {
          let child = children[i];
          // 如果是函数要先看函数的返回值 不然直接添加
          if (typeof child !== 'function') {
              let snode = standardNode(child, parentNode);
              snode.createRNode(); // 创建真实节点
              standardNodeList.push(standardNode(child, parentNode));
              snode.mount(); // 将真实节点挂载到父节点
              continue;
          }
          let [propValues, result] = getDepProps(child);
          let snode = standardNode(result, parentNode);
          snode.createRNode(); // 创建真实节点
          snode.setDeps(propValues, child);
          snode.bindDeps();
          snode.mount(); // 将真实节点挂载到父节点
          standardNodeList.push(snode);
      }
      // parentNode.setChildrenNodes(standardNodeList)
      // parentNode.mount()
  }
  // 首先标准化节点
  function standardNode(baseNode, parentNode) {
      if (typeof baseNode === "string") {
          let textNode = new TextVNode(baseNode);
          textNode.setParentVNode(parentNode);
          return textNode;
      }
      else if (baseNode instanceof ElementVNode) { // 如果是元素节点
          baseNode.setParentVNode(parentNode);
      }
      else if (baseNode instanceof ComponentVNode) {
          baseNode.setParentVNode(parentNode);
      }
      else if (baseNode instanceof FragmentVNode) {
          baseNode.setParentVNode(parentNode);
      }
      else if (baseNode instanceof ArrayVNode) {
          baseNode.setParentVNode(parentNode);
      }
      else {
          // 特殊处理 为null则不渲染返回空节点
          if (baseNode === null)
              baseNode = '';
          let textNode = new TextVNode(String(baseNode));
          textNode.setParentVNode(parentNode);
          return textNode;
      }
      return baseNode;
  }
  function replaceNode(newNode, oldNode) {
      oldNode.replaceWith(newNode);
  }

  class VNode {
      // 设置节点的父节点
      setParentVNode(parent) {
          this.parentVNode = parent;
      }
  }
  VNode.ELEMENT = 0;
  VNode.TEXT = 1;
  VNode.COMPONENT = 2;
  VNode.FRAGMENT = 3;

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
      getRNode() {
          return this.textNode;
      }
      // 创建并初始化真实节点
      createRNode() {
          this.textNode = document.createTextNode(this.text);
      }
      setDeps(propValues, fn) {
          this.propValues = propValues;
          this.fn = fn;
      }
      // 绑定节点的依赖
      bindDeps() {
          if (this.propValues && this.fn) {
              let fn = () => replaceNode(standardNode(this.fn()), this);
              let watcher = new Watcher(fn);
              this.propValues.forEach(propValue => propValue.setDep(watcher));
          }
      }
      mount() {
          var _a;
          (_a = this.parentVNode) === null || _a === void 0 ? void 0 : _a.getRNode().appendChild(this.getRNode());
      }
      replaceWith(node) {
          var _a;
          (_a = this.parentVNode) === null || _a === void 0 ? void 0 : _a.getRNode().replaceChild(node.getRNode(), this.getRNode());
      }
  }

  class FragmentVNode extends VNode {
      constructor(props, children) {
          super();
          this.type = VNode.FRAGMENT;
          this.props = props;
          this.children = children;
          this.VNodeChildren = [];
          this.pivot = new TextVNode('');
          this.pivot.createTextNode();
      }
      getPivot() {
          return this.pivot;
      }
      setPivot(pivot) {
          this.pivot = pivot;
      }
      getRNode() {
          return this.fragment;
      }
      getParentMountedEle() {
          if (this.parentVNode instanceof FragmentVNode) {
              return this.parentVNode.getParentMountedEle();
          }
          else {
              return this.parentVNode.getRNode();
          }
      }
      createFragment() {
          if (this.fragment)
              return this.fragment; // 如果已经初始化过则不要再初始化
          this.fragment = document.createDocumentFragment();
          // 处理标签子节点
          this.setChildren();
          return this.fragment;
      }
      /**
       * 处理子节点
      */
      setChildren() {
          if (!this.fragment || this.children === undefined || this.children === null)
              return;
          if (!Array.isArray(this.children))
              this.children = [this.children];
          // for (let i = 0; i < this.children.length; i++) {
          //   let child = this.children[i]
          //   // 如果是函数要先看函数的返回值 不然直接添加
          //   if (typeof child !== 'function') {
          //     setElementChild(this.fragment, this.VNodeChildren[i] = initVNodeWithList(child, this))
          //     continue
          //   }
          //   let [depProps, result] = getDepProps(child)
          //   if (Array.isArray(result)) {
          //     let pivot = initVNode('');
          //     setElementChild(this.fragment, pivot)
          //     this.VNodeChildren[i] = initVNodeWithList(result, this) as ChildVNode[]
          //     addFragmentEle(this.fragment, this.VNodeChildren[i] as ChildVNode[], pivot as TextVNode)
          //     let fn = () => {
          //       removeFragmentEle(this.VNodeChildren[i] as ChildVNode[])
          //       let newVnodeList = (child as Function)()
          //       if (Array.isArray(newVnodeList)) {
          //         this.VNodeChildren[i] = initVNodeWithList(newVnodeList, this) as ChildVNode[]
          //         addFragmentEle(this.getParentMountedEle(), this.VNodeChildren[i] as ChildVNode[], pivot as TextVNode)
          //       }
          //     }
          //     depProps.forEach(propValue => propValue.setDep(new Watcher(fn)))
          //   } else {
          //     this.VNodeChildren[i] = initVNode(result, this)
          //     setElementChild(this.fragment, this.VNodeChildren[i])
          //     let fn = () => {
          //       let newNode = (child as () => BaseChildVNode)()
          //       this.VNodeChildren[i] = replaceElementChild(this.getParentMountedEle(), initVNode(newNode, this), this.VNodeChildren[i] as ChildVNode)
          //     }
          //     depProps.forEach(propValue => propValue.setDep(new Watcher(fn)))
          //   }
          // }
      }
      // 创建并初始化真实节点
      createRNode() {
          if (this.fragment)
              return; // 如果已经初始化过则不要再初始化
          this.fragment = document.createDocumentFragment();
          // 处理标签子节点
          this.setChildren();
      }
      setDeps(propValues, fn) {
          this.propValues = propValues;
          this.fn = fn;
      }
      // 绑定节点的依赖
      bindDeps() {
          if (this.propValues && this.fn) {
              let fn = () => replaceNode(standardNode(this.fn()), this);
              let watcher = new Watcher(fn);
              this.propValues.forEach(propValue => propValue.setDep(watcher));
          }
      }
      mount() {
          var _a, _b;
          (_a = this.parentVNode) === null || _a === void 0 ? void 0 : _a.getRNode().appendChild(this.getRNode());
          (_b = this.parentVNode) === null || _b === void 0 ? void 0 : _b.getRNode().appendChild(this.pivot.getRNode());
      }
      replaceWith(node) {
      }
  }

  // 获取一个响应式的对象
  function defineState(data, config) {
      return new State(data, config);
  }
  function mount(selector, rootNode) {
      let ele = document.querySelector(selector);
      let rootEle;
      if (rootNode instanceof Component) {
          let ef = rootNode.createEFVNode();
          if (ef instanceof ElementVNode) {
              rootEle = ef.createEle();
          }
          else {
              throw new Error('用于挂载渲染的根组件必须使用原始标签');
          }
      }
      else if (rootNode instanceof ComponentVNode) {
          rootNode.createRNode();
          rootEle = rootNode.getRNode();
      }
      if (ele && rootEle) {
          if (ele.parentNode) {
              ele.parentNode.replaceChild(rootEle, ele);
          }
      }
  }
  function createNode(nodeTag, props, children) {
      if (typeof nodeTag === 'string') {
          return new ElementVNode(nodeTag, props, children);
      }
      else if (typeof nodeTag === 'function') {
          return new ComponentVNode(nodeTag, props, children);
      }
      if (typeof nodeTag === 'symbol' && nodeTag === Vact.Fragment) {
          return new FragmentVNode(props, children);
      }
      else {
          throw new Error('只能传入字符串或者构造函数');
      }
  }

  class Vact {
      static getDepPool() {
          return this.depPool;
      }
      static runTask(fn) {
          this.watcherTask.push(fn);
          if (!this.updating) {
              this.updating = true;
              Promise.resolve()
                  .then(() => {
                  let callbcak;
                  while (callbcak = this.watcherTask.shift()) {
                      callbcak();
                  }
              })
                  .then(() => this.updating = false);
          }
      }
  }
  Vact.Fragment = Symbol('fragment标识');
  Vact.depPool = [];
  Vact.updating = false;
  Vact.watcherTask = [];
  Vact.mount = mount;
  Vact.createNode = createNode;
  function getDepPool() {
      return Vact.getDepPool();
  }
  function getDepProps(fn) {
      let depProps = [];
      let pool = Vact.getDepPool();
      pool.push(depProps);
      let res = fn();
      pool.splice(pool.indexOf(depProps), 1);
      return [depProps, res];
  }
  function runTask(fn) {
      Vact.runTask(fn);
  }

  // import { BaseChildVNode, RBaseChildVNode, ChildVNode } from "./type"
  class ElementVNode extends VNode {
      constructor(tag, props, children) {
          super();
          this.type = VNode.ELEMENT;
          this.tag = tag;
          this.props = props;
          this.children = children;
      }
      getRNode() {
          return this.ele;
      }
      createEle() {
          if (this.ele)
              return; // 如果已经初始化过则不要再初始化
          this.ele = document.createElement(this.tag);
          // 处理标签属性
          this.setProps();
          // 处理标签子节点
          this.setChildren();
          return this.ele;
      }
      /**
       * 处理原生node节点的属性绑定
      */
      setProps() {
          if (!this.props || !this.ele)
              return;
          // 处理标签属性
          for (let prop in this.props) {
              // 如果是函数要先看函数的返回值 不然直接设置属性
              if (typeof this.props[prop] !== 'function') {
                  setElementProp(this.ele, prop, this.props[prop]);
                  continue;
              }
              let [depProps, result] = getDepProps(this.props[prop]);
              setElementProp(this.ele, prop, result);
              // 如果是函数则直接跳过
              if (typeof result === 'function')
                  continue;
              let fn = () => setElementProp(this.ele, prop, this.props[prop]());
              depProps.forEach(propValue => propValue.setDep(new Watcher(fn)));
          }
      }
      /**
       * 处理子节点
      */
      setChildren() {
          /* if (!this.ele || this.children === undefined || this.children === null) return
          if (!Array.isArray(this.children)) this.children = [this.children]
      
          for (let child of this.children) {
            // 如果是函数要先看函数的返回值 不然直接添加
            if (typeof child !== 'function') {
              setElementChild(this.ele, initVNodeWithList(child, this))
              continue
            }
      
            let [depProps, result] = getDepProps(child)
      
            if (Array.isArray(result)) {
              let pivot = initVNode('');
              setElementChild(this.ele, pivot)
              let curNodeList = initVNodeWithList(result, this) as ChildVNode[]
              addFragmentEle(this.ele, curNodeList, pivot as TextVNode)
              let fn = () => {
                removeFragmentEle(curNodeList)
                let newVnodeList = (child as Function)()
                if (Array.isArray(newVnodeList)) {
                  curNodeList = initVNodeWithList(newVnodeList, this) as ChildVNode[]
                  addFragmentEle(this.ele!, curNodeList, pivot as TextVNode)
                }
              }
              depProps.forEach(propValue => propValue.setDep(new Watcher(fn)))
            } else {
              let curNode = initVNode(result, this)
              setElementChild(this.ele, curNode)
              let fn = () => {
                let newNode = (child as () => BaseChildVNode)()
                curNode = replaceElementChild(this.ele!, initVNode(newNode, this), curNode)
              }
              depProps.forEach(propValue => propValue.setDep(new Watcher(fn)))
            }
          } */
      }
      // 创建并初始化真实节点
      createRNode() {
          if (this.ele)
              return; // 如果已经初始化过则不要再初始化
          this.ele = document.createElement(this.tag);
          if (this.children === undefined || this.children === null)
              return;
          if (!Array.isArray(this.children))
              this.children = [this.children];
          // 处理标签属性
          this.setProps();
          // 处理标签子节点
          setNodeChildren(this, this.children);
      }
      setDeps(propValues, fn) {
          this.propValues = propValues;
          this.fn = fn;
      }
      // 绑定节点的依赖
      bindDeps() {
          if (this.propValues && this.fn) {
              let fn = () => replaceNode(standardNode(this.fn()), this);
              let watcher = new Watcher(fn);
              this.propValues.forEach(propValue => propValue.setDep(watcher));
          }
      }
      mount() {
          var _a;
          (_a = this.parentVNode) === null || _a === void 0 ? void 0 : _a.getRNode().appendChild(this.getRNode());
      }
      replaceWith(node) {
          var _a;
          node.createRNode();
          (_a = this.parentVNode) === null || _a === void 0 ? void 0 : _a.getRNode().replaceChild(node.getRNode(), this.getRNode());
      }
  }
  /**
   * 处理原生标签的属性绑定
  */
  function setElementProp(ele, prop, value) {
      if (typeof value === 'string') {
          if (prop === 'className') { // className比较特殊
              ele.className = value;
          }
          else {
              ele.setAttribute(prop, value);
          }
      }
      else if (prop === 'style' && typeof value === 'object' && value !== null) { // 对于style标签为对象的值的特殊处理
          let styleStringList = [];
          for (let cssattr in value) {
              styleStringList.push(`${cssattr}:${value[cssattr]};`);
          }
          ele.setAttribute(prop, styleStringList.join(''));
      }
      else if (typeof value === 'function') { // 如果是function则绑定事件
          let pattern = /^on([a-zA-Z]+)/;
          if (pattern.test(prop)) {
              let mat = prop.match(pattern);
              mat && ele.addEventListener(mat[1].toLocaleLowerCase(), value.bind(ele));
          }
          else {
              ele.addEventListener(prop, value.bind(ele));
          }
      }
  }
  /**
   * 处理子节点的添加
  */
  // export function setElementChild(ele: HTMLElement, childNode: ChildVNode | Array<ChildVNode>) {
  //   if (Array.isArray(childNode)) {
  //     childNode.forEach(subChildNode => {
  //       ele.appendChild(subChildNode.getRNode())
  //       if (subChildNode instanceof FragmentVNode) {
  //         ele.appendChild(subChildNode.getPivot().getRNode())
  //       }
  //       if (childNode instanceof ComponentVNode) {
  //         let ef = childNode.getComponent().getEFVNode()
  //         if (ef instanceof FragmentVNode) {
  //           ele.appendChild(ef.getPivot().getRNode())
  //         }
  //       }
  //     })
  //   } else {
  //     ele.appendChild(childNode.getRNode())
  //     if (childNode instanceof FragmentVNode) {
  //       ele.appendChild(childNode.getPivot().getRNode())
  //     }
  //     if (childNode instanceof ComponentVNode) {
  //       let ef = childNode.getComponent().getEFVNode()
  //       if (ef instanceof FragmentVNode) {
  //         ele.appendChild(ef.getPivot().getRNode())
  //       }
  //     }
  //   }
  // }
  // 初始化虚拟节点，并生成真实节点
  // export function initVNode(baseNode: BaseChildVNode, parent?: ElementVNode | FragmentVNode): ChildVNode {
  //   // 如果是普通的文本字符串
  //   if (typeof baseNode === "string") {
  //     let textNode = new TextVNode(baseNode)
  //     textNode.setParentVNode(parent)
  //     textNode.createTextNode()
  //     return textNode
  //   } else if (baseNode instanceof ComponentVNode) { // render可能返回ElementVNode 也可能返回 ComponentVNode
  //     let ef = baseNode.createComponent().createEFVNode()
  //     if (ef instanceof ElementVNode) ef.createEle()
  //     else ef.createFragment()
  //     ef.setParentVNode(parent)
  //     baseNode.setParentVNode(parent)
  //     return baseNode
  //   } else if (baseNode instanceof ElementVNode) {  // 如果是元素节点
  //     baseNode.createEle()
  //     baseNode.setParentVNode(parent)
  //     return baseNode
  //   } else if (baseNode instanceof FragmentVNode) {
  //     baseNode.createFragment()
  //     baseNode.setParentVNode(parent)
  //     return baseNode
  //   } else {
  //     // 特殊处理 为null则不渲染返回空节点
  //     if (baseNode === null) baseNode = ''
  //     let textNode = new TextVNode(String(baseNode))
  //     textNode.setParentVNode(parent)
  //     textNode.createTextNode()
  //     return textNode
  //   }
  // }
  // export function initVNodeWithList(baseNode: BaseChildVNode | Array<BaseChildVNode>, parent?: ElementVNode | FragmentVNode): ChildVNode | Array<ChildVNode> {
  //   if (Array.isArray(baseNode)) {
  //     return baseNode.map(item => initVNode(item, parent))
  //   } else {
  //     return initVNode(baseNode, parent)
  //   }
  // }
  /**
   * 替换并返回现在的节点
  */
  // export function replaceElementChild(ele: HTMLElement, newNode: ChildVNode, oldNode: ChildVNode): ChildVNode {
  //   if (newNode instanceof TextVNode && oldNode instanceof TextVNode) {
  //     oldNode.getRNode().nodeValue = newNode.getRNode().nodeValue
  //     return oldNode
  //   }
  //   let newEXNode: ElementVNode | FragmentVNode | TextVNode
  //   let oldEXNode: ElementVNode | FragmentVNode | TextVNode
  //   if (newNode instanceof ComponentVNode) newEXNode = newNode.getComponent().getEFVNode()
  //   else newEXNode = newNode
  //   if (oldNode instanceof ComponentVNode) oldEXNode = oldNode.getComponent().getEFVNode()
  //   else oldEXNode = oldNode
  //   if (oldEXNode instanceof FragmentVNode) {
  //     return replaceToFragmentVNode(ele, newEXNode, oldEXNode)
  //   }
  //   if (newEXNode instanceof FragmentVNode) {
  //     return replacedByFragmentVNode(ele, newEXNode, oldEXNode)
  //   }
  //   ele.replaceChild(newNode.getRNode(), oldNode.getRNode())
  //   return newNode
  // }
  // 替换为FragmentVNode时
  // function replaceToFragmentVNode(ele: HTMLElement, newNode: ChildVNode, oldNode: FragmentVNode): ChildVNode {
  //   let pivot = oldNode.getPivot()
  //   removeFragmentNode(oldNode)
  //   ele.insertBefore(newNode.getRNode(), pivot.getRNode())
  //   if (newNode instanceof FragmentVNode) {
  //     if (newNode === oldNode) {
  //       // 待续
  //     } else {
  //       pivot.getRNode().replaceWith(newNode.getPivot().getRNode())
  //     }
  //   } else {
  //     pivot.getRNode().remove()
  //   }
  //   return newNode
  // }
  // 被替换为FragmentVNode时
  // function replacedByFragmentVNode(ele: HTMLElement, newNode: FragmentVNode, oldNode: ChildVNode): FragmentVNode {
  //   let pivot = newNode.getPivot()
  //   oldNode.getRNode().replaceWith(pivot.getRNode())
  //   ele.insertBefore(newNode.getRNode(), pivot.getRNode())
  //   return newNode
  // }
  // 移除Fragment节点
  // function removeFragmentNode(node: FragmentVNode) {
  //   node.VNodeChildren.forEach(child => {
  //     if (child instanceof FragmentVNode) {
  //       removeFragmentNode(child)
  //     } else if (Array.isArray(child)) {
  //       removeFragmentEle(child)
  //     } else {
  //       child.getRNode().remove()
  //     }
  //   })
  // }
  // export function addFragmentEle(ele: HTMLElement, childNodes: ChildVNode[], pivot?: TextVNode) {
  //   let fragment = document.createDocumentFragment()
  //   childNodes.forEach(child => fragment.appendChild(child.getRNode()))
  //   if (pivot) ele.insertBefore(fragment, pivot.getRNode())
  //   else ele.appendChild(fragment)
  // }
  // export function removeFragmentEle(childNodes: ChildVNode[]) {
  //   childNodes.forEach(child => child.getRNode().remove())
  // }

  class ComponentVNode extends VNode {
      constructor(Constructor, props, children) {
          super();
          this.type = VNode.COMPONENT;
          this.Constructor = Constructor;
          this.props = props || {};
          if (Array.isArray(children)) {
              this.children = children;
          }
          else {
              if (children !== undefined && children !== null) {
                  this.children = [children];
              }
              else {
                  this.children = [];
              }
          }
          // 在初始化内部一定不要调用init
      }
      createComponent() {
          if (this.component)
              return this.component;
          // 处理自定义组件的属性
          let props = new DataProxy({}).getData();
          for (let prop in this.props) {
              // 如果属性不为函数则不需要设置响应式
              if (typeof this.props[prop] !== 'function') {
                  props[prop] = this.props[prop];
                  continue;
              }
              let [depProps, result] = getDepProps(this.props[prop]);
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
          let children = new DataProxy([]).getData();
          if (this.children) {
              for (let i = 0; i < this.children.length; i++) {
                  if (typeof this.children[i] !== 'function') {
                      children[i] = this.children[i];
                      continue;
                  }
                  let [depProps, result] = getDepProps(this.children[i]);
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
          if (Constructor.prototype && Constructor.prototype.classComponent) {
              this.component = new Constructor();
          }
          else {
              let funComponent = new FunComponent();
              funComponent.setRenderFun(Constructor);
              this.component = funComponent;
          }
          this.component.setProps(props);
          this.component.setChildren(children);
          return this.component;
      }
      getComponent() {
          return this.component;
      }
      getRNode() {
          // if (this.component instanceof Component) {
          //   return this.component.getEFVNode().getRNode()
          // } else if (this.component instanceof ElementVNode) {
          //   return this.component.getRNode()
          // } else {
          //   throw new Error('组件初始化')
          // }
          return this.component.getEFVNode().getRNode();
      }
      // 创建并初始化真实节点
      createRNode() {
          if (this.component)
              return; // 如果已经初始化过则不要再初始化
          let Constructor = this.Constructor;
          if (Constructor.prototype && Constructor.prototype.classComponent) {
              this.component = new Constructor();
          }
          else {
              let funComponent = new FunComponent();
              funComponent.setRenderFun(Constructor);
              this.component = funComponent;
          }
          this.component.setProps({});
          this.component.setChildren([]);
          this.component.createEFVNode();
      }
      setDeps(propValues, fn) {
          this.propValues = propValues;
          this.fn = fn;
      }
      // 绑定节点的依赖
      bindDeps() {
          if (this.propValues && this.fn) {
              let fn = () => replaceNode(standardNode(this.fn()), this);
              let watcher = new Watcher(fn);
              this.propValues.forEach(propValue => propValue.setDep(watcher));
          }
      }
      mount() {
          var _a;
          (_a = this.parentVNode) === null || _a === void 0 ? void 0 : _a.getRNode().appendChild(this.getRNode());
      }
      replaceWith(node) {
          var _a;
          node.createRNode();
          (_a = this.parentVNode) === null || _a === void 0 ? void 0 : _a.getRNode().replaceChild(node.getRNode(), this.getRNode());
      }
  }

  class ArrayVNode extends VNode {
      constructor(props, bnodeList) {
          super();
          this.type = 8;
          this.props = props;
          this.bnodeList = bnodeList;
          this.nodeList = [];
          this.pivot = new TextVNode('');
          this.pivot.createRNode();
      }
      setParentVNode(parent) {
          this.parentVNode = parent;
      }
      getRNode() {
          return this.fragment;
      }
      // 创建并初始化真实节点
      createRNode() {
          this.fragment = document.createDocumentFragment();
          this.bnodeList.forEach(child => {
              let schild = standardNode(child);
              schild.createRNode();
              this.nodeList.push(schild);
              this.fragment.appendChild(schild.getRNode());
          });
      }
      setDeps(propValues, fn) {
          this.propValues = propValues;
          this.fn = fn;
      }
      // 绑定节点的依赖
      bindDeps() {
          if (this.propValues && this.fn) {
              let fn = () => replaceNode(standardNode(this.fn()), this);
              let watcher = new Watcher(fn);
              this.propValues.forEach(propValue => propValue.setDep(watcher));
          }
      }
      mount() {
          var _a, _b;
          (_a = this.parentVNode) === null || _a === void 0 ? void 0 : _a.getRNode().appendChild(this.getRNode());
          (_b = this.parentVNode) === null || _b === void 0 ? void 0 : _b.getRNode().appendChild(this.pivot.getRNode());
      }
      replaceWith(node) {
          var _a;
          node.createRNode();
          if (node instanceof ArrayVNode) {
              this.nodeList.forEach(child => child.getRNode().remove());
              (_a = this.parentVNode) === null || _a === void 0 ? void 0 : _a.getRNode().insertBefore(node.getRNode(), this.pivot.getRNode());
              node.pivot = this.pivot;
          }
      }
  }

  class Component {
      constructor(config = {}) {
          this.config = config;
          // 设置响应式数据对象
          this.data = new DataProxy(this.config.data || {}).getData();
      }
      setProps(props) {
          this.props = props;
      }
      setChildren(children) {
          this.children = children;
      }
      createEFVNode() {
          if (this.efVNode)
              return this.efVNode;
          let renderOut = this.render(createNode);
          if (renderOut instanceof ComponentVNode) {
              // renderOut = renderOut.createComponent().createEFVNode()
              renderOut.createRNode();
              let com = renderOut.getComponent();
              renderOut = com.getEFVNode();
          }
          return this.efVNode = renderOut;
      }
      getEFVNode() {
          return this.efVNode;
      }
  }
  Component.prototype.classComponent = true;
  /**
   * 解决函数式组件的类
  */
  class FunComponent extends Component {
      constructor() {
          super();
      }
      setRenderFun(fun) {
          this.renderFun = fun;
      }
      render() {
          return this.renderFun.call(this, this.props, this.children);
      }
  }

  Vact.Component = Component;
  const h = createNode;
  const Fragment = Vact.Fragment;

  exports.Component = Component;
  exports.Fragment = Fragment;
  exports.createNode = createNode;
  exports["default"] = Vact;
  exports.defineState = defineState;
  exports.h = h;
  exports.mount = mount;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=boundle.umd.js.map
