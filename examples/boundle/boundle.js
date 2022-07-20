!function(e,t){e&&!e.getElementById("livereloadscript")&&((t=e.createElement("script")).async=1,t.src="//"+(self.location.host||"localhost").split(":")[0]+":35729/livereload.js?snipver=1",t.id="livereloadscript",e.getElementsByTagName("head")[0].appendChild(t))}(self.document),function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Vact={})}(this,(function(e){"use strict";function t(){}function n(){n.init.call(this)}function i(e){return void 0===e._maxListeners?n.defaultMaxListeners:e._maxListeners}function r(e,t,n){if(t)e.call(n);else for(var i=e.length,r=c(e,i),o=0;o<i;++o)r[o].call(n)}function o(e,t,n,i){if(t)e.call(n,i);else for(var r=e.length,o=c(e,r),s=0;s<r;++s)o[s].call(n,i)}function s(e,t,n,i,r){if(t)e.call(n,i,r);else for(var o=e.length,s=c(e,o),l=0;l<o;++l)s[l].call(n,i,r)}function l(e,t,n,i,r,o){if(t)e.call(n,i,r,o);else for(var s=e.length,l=c(e,s),a=0;a<s;++a)l[a].call(n,i,r,o)}function a(e,t,n,i){if(t)e.apply(n,i);else for(var r=e.length,o=c(e,r),s=0;s<r;++s)o[s].apply(n,i)}function h(e,n,r,o){var s,l,a,h;if("function"!=typeof r)throw new TypeError('"listener" argument must be a function');if((l=e._events)?(l.newListener&&(e.emit("newListener",n,r.listener?r.listener:r),l=e._events),a=l[n]):(l=e._events=new t,e._eventsCount=0),a){if("function"==typeof a?a=l[n]=o?[r,a]:[a,r]:o?a.unshift(r):a.push(r),!a.warned&&(s=i(e))&&s>0&&a.length>s){a.warned=!0;var d=new Error("Possible EventEmitter memory leak detected. "+a.length+" "+n+" listeners added. Use emitter.setMaxListeners() to increase limit");d.name="MaxListenersExceededWarning",d.emitter=e,d.type=n,d.count=a.length,h=d,"function"==typeof console.warn?console.warn(h):console.log(h)}}else a=l[n]=r,++e._eventsCount;return e}function d(e,t,n){var i=!1;function r(){e.removeListener(t,r),i||(i=!0,n.apply(e,arguments))}return r.listener=n,r}function p(e){var t=this._events;if(t){var n=t[e];if("function"==typeof n)return 1;if(n)return n.length}return 0}function c(e,t){for(var n=new Array(t);t--;)n[t]=e[t];return n}t.prototype=Object.create(null),n.EventEmitter=n,n.usingDomains=!1,n.prototype.domain=void 0,n.prototype._events=void 0,n.prototype._maxListeners=void 0,n.defaultMaxListeners=10,n.init=function(){this.domain=null,n.usingDomains&&undefined.active,this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=new t,this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},n.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||isNaN(e))throw new TypeError('"n" argument must be a positive number');return this._maxListeners=e,this},n.prototype.getMaxListeners=function(){return i(this)},n.prototype.emit=function(e){var t,n,i,h,d,p,c,u="error"===e;if(p=this._events)u=u&&null==p.error;else if(!u)return!1;if(c=this.domain,u){if(t=arguments[1],!c){if(t instanceof Error)throw t;var f=new Error('Uncaught, unspecified "error" event. ('+t+")");throw f.context=t,f}return t||(t=new Error('Uncaught, unspecified "error" event')),t.domainEmitter=this,t.domain=c,t.domainThrown=!1,c.emit("error",t),!1}if(!(n=p[e]))return!1;var g="function"==typeof n;switch(i=arguments.length){case 1:r(n,g,this);break;case 2:o(n,g,this,arguments[1]);break;case 3:s(n,g,this,arguments[1],arguments[2]);break;case 4:l(n,g,this,arguments[1],arguments[2],arguments[3]);break;default:for(h=new Array(i-1),d=1;d<i;d++)h[d-1]=arguments[d];a(n,g,this,h)}return!0},n.prototype.addListener=function(e,t){return h(this,e,t,!1)},n.prototype.on=n.prototype.addListener,n.prototype.prependListener=function(e,t){return h(this,e,t,!0)},n.prototype.once=function(e,t){if("function"!=typeof t)throw new TypeError('"listener" argument must be a function');return this.on(e,d(this,e,t)),this},n.prototype.prependOnceListener=function(e,t){if("function"!=typeof t)throw new TypeError('"listener" argument must be a function');return this.prependListener(e,d(this,e,t)),this},n.prototype.removeListener=function(e,n){var i,r,o,s,l;if("function"!=typeof n)throw new TypeError('"listener" argument must be a function');if(!(r=this._events))return this;if(!(i=r[e]))return this;if(i===n||i.listener&&i.listener===n)0==--this._eventsCount?this._events=new t:(delete r[e],r.removeListener&&this.emit("removeListener",e,i.listener||n));else if("function"!=typeof i){for(o=-1,s=i.length;s-- >0;)if(i[s]===n||i[s].listener&&i[s].listener===n){l=i[s].listener,o=s;break}if(o<0)return this;if(1===i.length){if(i[0]=void 0,0==--this._eventsCount)return this._events=new t,this;delete r[e]}else!function(e,t){for(var n=t,i=n+1,r=e.length;i<r;n+=1,i+=1)e[n]=e[i];e.pop()}(i,o);r.removeListener&&this.emit("removeListener",e,l||n)}return this},n.prototype.removeAllListeners=function(e){var n,i;if(!(i=this._events))return this;if(!i.removeListener)return 0===arguments.length?(this._events=new t,this._eventsCount=0):i[e]&&(0==--this._eventsCount?this._events=new t:delete i[e]),this;if(0===arguments.length){for(var r,o=Object.keys(i),s=0;s<o.length;++s)"removeListener"!==(r=o[s])&&this.removeAllListeners(r);return this.removeAllListeners("removeListener"),this._events=new t,this._eventsCount=0,this}if("function"==typeof(n=i[e]))this.removeListener(e,n);else if(n)do{this.removeListener(e,n[n.length-1])}while(n[0]);return this},n.prototype.listeners=function(e){var t,n=this._events;return n&&(t=n[e])?"function"==typeof t?[t.listener||t]:function(e){for(var t=new Array(e.length),n=0;n<t.length;++n)t[n]=e[n].listener||e[n];return t}(t):[]},n.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):p.call(e,t)},n.prototype.listenerCount=p,n.prototype.eventNames=function(){return this._eventsCount>0?Reflect.ownKeys(this._events):[]};class u extends n{constructor(e,t){super(),this.value=e,this.dep=[],this.dataProxy=t}setDep(e){this.dep.push(e)}valueOf(){return this.value}toString(){return this.value}set(e){this.value=e}get(){return this.value}notify(){this.dep.forEach((e=>{e.update()})),this.emit("change",this.value)}}class f{constructor(e){this.running=!1,this.fn=e}update(){if(this.running)return;this.running=!0;!function(e){b.runTask(e)}((()=>{this.fn(),this.running=!1}))}}class g{constructor(){this.valueMap=new WeakMap}getProp(e,t){this.valueMap.get(e)||this.valueMap.set(e,{});let n=this.valueMap.get(e);if(!n[t]){let i=new u(Array.isArray(e[t])?new Proxy(e[t],{get:(e,t,n)=>Reflect.get(e,t,n),set(e,t,n,r){let o=Reflect.set(e,t,n,r);return i.notify(),o}}):e[t]);n[t]=i}return n[t]}getEventProxy(e){return this.valueMap.get(e)}setEventProxy(e,t){this.valueMap.set(e,t)}}class v{constructor(e){this.target=e,this.dataProxyValue=new g;const t={get:(e,n,i)=>{if("object"!=typeof e[n]||null===e[n]||Array.isArray(e[n])||e[n].constructor!==Object){if("function"==typeof e[n])return Reflect.get(e,n,i);{let t=this.dataProxyValue.getProp(e,n);for(let e of b.getDepPool())e.includes(t)||e.push(t);return Array.isArray(e)?Reflect.get(e,n,i):t.value}}return new Proxy(e[n],t)},set:(e,t,n,i)=>{if("object"!=typeof n||null===n||Array.isArray(n)||n.constructor!==Object){let r=this.dataProxyValue.getProp(e,t);r.value=Array.isArray(n)?new Proxy(n,{get:(e,t,n)=>Reflect.get(e,t,n),set(e,t,n,i){let o=Reflect.set(e,t,n,i);return r.notify(),o}}):n;let o=Reflect.set(e,t,n,i);return r.notify(),o}{let r=this.dataProxyValue.getEventProxy(e[t]),o=Reflect.set(e,t,n,i);return this.replaceProps(n,r),o}}};this.data=new Proxy(e,t)}getData(){return this.data}getTarget(){return this.target}getEventProxy(){return this.dataProxyValue}replaceProps(e,t){for(let n in t){let i=t[n];i.value=e[n],i.notify()}this.dataProxyValue.setEventProxy(e,t)}}class N{constructor(e,t){this.dataProxy=new v(e),this.config=t}get data(){return this.dataProxy.getData()}watch(e,t){let n=e.split(".");if(!n.length)return;let i=this.dataProxy.getTarget(),r=n.shift()||"";for(;n.length;){let e=n.shift();e&&(i=i[r],r=e)}this.dataProxy.getEventProxy().getProp(i,r).on("change",t)}}function m(e,t){let n=[],i=0;for(let r=0;r<t.length;r++){let o=t[r];if("function"!=typeof o){let t=y(o,e);t.createRNode(),n[i]=t,t.mount(),i++;continue}let[s,l]=_(o);if(l instanceof V){let t=l.children;for(let r=0;r<t.length;r++){let o=()=>t[r],[s,l]=_(o),a=y(l,e);a.createRNode();let h=i;n[h]=a,i++;let d=()=>{let t=y(o(),e);t.createRNode(),R(t,n[h]),n[h]=t};a.setDeps(s,d),a.bindDeps(),a.mount()}continue}let a=y(l,e);a.createRNode();let h=i;n[h]=a,i++;let d=()=>{let t=y(o(),e);t.createRNode(),R(t,n[h]),n[h]=t};a.setDeps(s,d),a.bindDeps(),a.mount()}return n}function y(e,t,n){if("string"==typeof e){let n=new C(e);return n.setParentVNode(t),n}if(e instanceof A)e.setParentVNode(t);else if(e instanceof E)e.setParentVNode(t);else if(e instanceof x)e.setParentVNode(t);else{if(!(e instanceof D)){if(Array.isArray(e)&&(void 0===n||n)){let n=new D({},e);return n.setParentVNode(t),n}{null===e&&(e="");let n=new C(String(e));return n.setParentVNode(t),n}}e.setParentVNode(t)}return e}function R(e,t){t.replaceWith(e)}class w{setParentVNode(e){this.parentVNode=e}setDeps(e,t){this.propValues=e,this.fn=t}bindDeps(){if(this.propValues&&this.fn){let e=new f(this.fn);this.propValues.forEach((t=>t.setDep(e)))}}}w.ELEMENT=0,w.TEXT=1,w.COMPONENT=2,w.FRAGMENT=3;class V{constructor(e){this.children=e}}class E extends w{constructor(e,t,n){super(),this.type=w.COMPONENT,this.Constructor=e,this.props=t||{},Array.isArray(n)?this.children=n:this.children=null!=n?[n]:[]}setComponentProps(){let e=new v({}).getData();for(let t in this.props){if("function"!=typeof this.props[t]){e[t]=this.props[t];continue}let[n,i]=_(this.props[t]);if("function"==typeof i)e[t]=i;else{e[t]=i;let r=()=>e[t]=this.props[t]();n.forEach((e=>{e.setDep(new f(r))}))}}return e}setComponentChildren(){let e={},t=t=>e[t]?e[t]:e[t]=new V(new v([]).getData());if(this.children)for(let e=0;e<this.children.length;e++){let n=this.children[e];if("function"!=typeof n){if("string"==typeof n||Array.isArray(n))t("default").children.push(n);else{let e;n.props&&(e=n.props.slot);let i="default";null!=e&&(i="function"==typeof e?e():e);let r=t(i).children;r[r.length]=n}continue}let[i,r]=_(n);if("string"==typeof r||Array.isArray(r)){const e=t("default").children;let o=e.length;e[o]=r;let s=()=>e[o]=n();i.forEach((e=>e.setDep(new f(s))))}else{let e;r.props&&(e=r.props.slot);let o="default";null!=e&&(o="function"==typeof e?e():e);const s=t(o).children;let l=s.length;s[l]=r;let a=()=>s[l]=n();i.forEach((e=>e.setDep(new f(a))))}}return e}getComponent(){return this.component}getRNode(){return this.component.getEFVNode().getRNode()}createRNode(){if(this.component)return;let e=this.Constructor;if(e.prototype&&e.prototype.classComponent)this.component=new e;else{let t=new M;t.setRenderFun(e),this.component=t}this.component.setProps(this.setComponentProps()),this.component.setChildren(this.setComponentChildren());let t=this.component.createEFVNode();t.setParentVNode(this.parentVNode),t.createRNode()}mount(){this.getComponent().getEFVNode().mount()}replaceWith(e){this.getComponent().getEFVNode().replaceWith(e)}remove(){var e;let t=null===(e=this.component)||void 0===e?void 0:e.getEFVNode();(t instanceof A||t instanceof x)&&t.remove()}}class C extends w{constructor(e){super(),this.type=w.TEXT,this.text=e}getRNode(){return this.textNode}createRNode(){this.textNode=document.createTextNode(this.text)}mount(){var e;null===(e=this.parentVNode)||void 0===e||e.getRNode().appendChild(this.getRNode())}replaceWith(e){var t,n,i,r;if(e instanceof C)return this.getRNode().nodeValue=e.getRNode().nodeValue,void(e.textNode=this.textNode);if(e instanceof x)null===(t=this.parentVNode)||void 0===t||t.getRNode().insertBefore(e.getRNode(),this.getRNode()),this.getRNode().replaceWith(e.pivot.getRNode());else if(e instanceof E){let t=e.getComponent().getEFVNode();t instanceof x?(null===(n=this.parentVNode)||void 0===n||n.getRNode().insertBefore(e.getRNode(),this.getRNode()),this.getRNode().replaceWith(t.pivot.getRNode())):null===(i=this.parentVNode)||void 0===i||i.getRNode().replaceChild(e.getRNode(),this.getRNode())}else null===(r=this.parentVNode)||void 0===r||r.getRNode().replaceChild(e.getRNode(),this.getRNode())}remove(){var e;null===(e=this.textNode)||void 0===e||e.remove()}}class x extends w{constructor(e,t){super(),this.type=w.FRAGMENT,this.props=e,this.children=t,this.VNodeChildren=[],this.pivot=new C(""),this.pivot.createRNode()}getRNode(){return this.fragment}setChildren(){this.fragment&&void 0!==this.children&&null!==this.children&&(Array.isArray(this.children)||(this.children=[this.children]),this.VNodeChildren=m(this.parentVNode,this.children))}createRNode(){this.fragment||(this.fragment=document.createDocumentFragment(),this.setChildren())}mount(){var e,t;null===(e=this.parentVNode)||void 0===e||e.getRNode().appendChild(this.getRNode()),null===(t=this.parentVNode)||void 0===t||t.getRNode().appendChild(this.pivot.getRNode())}replaceWith(e){var t;if(this.remove(),null===(t=this.parentVNode)||void 0===t||t.getRNode().insertBefore(e.getRNode(),this.pivot.getRNode()),e instanceof x)e.pivot=this.pivot;else if(e instanceof E){let t=e.getComponent().getEFVNode();t instanceof x&&(t.pivot=this.pivot)}else this.pivot.remove()}remove(){this.VNodeChildren.forEach((e=>e.remove()))}}function P(e,t){let n,i=document.querySelector(e);if(t instanceof F){let e=t.createEFVNode();e.createRNode(),n=e.getRNode()}else t instanceof E&&(t.createRNode(),n=t.getRNode());i&&n&&i.parentNode&&i.parentNode.replaceChild(n,i)}function L(e,t,n){if("string"==typeof e)return new A(e,t,n);if("function"==typeof e)return new E(e,t,n);if("symbol"==typeof e&&e===b.Fragment)return new x(t,n);throw new Error("只能传入字符串或者构造函数")}class b{static getDepPool(){return this.depPool}static runTask(e){this.watcherTask.push(e),this.updating||(this.updating=!0,Promise.resolve().then((()=>{let e;for(;e=this.watcherTask.shift();)e()})).then((()=>this.updating=!1)))}}function _(e){let t=[],n=b.getDepPool();n.push(t);let i=e();return n.splice(n.indexOf(t),1),[t,i]}b.Fragment=Symbol("fragment标识"),b.depPool=[],b.updating=!1,b.watcherTask=[],b.mount=P,b.createNode=L;class A extends w{constructor(e,t,n){super(),this.type=w.ELEMENT,this.tag=e,this.props=t,this.children=n}getRNode(){return this.ele}setProps(){if(this.props&&this.ele)for(let e in this.props){if("function"!=typeof this.props[e]){T(this.ele,e,this.props[e]);continue}let[t,n]=_(this.props[e]);if(T(this.ele,e,n),"function"==typeof n)continue;let i=()=>T(this.ele,e,this.props[e]());t.forEach((e=>e.setDep(new f(i))))}}createRNode(){this.ele||(this.ele=document.createElement(this.tag),void 0!==this.children&&null!==this.children&&(Array.isArray(this.children)||(this.children=[this.children]),this.setProps(),m(this,this.children)))}mount(){var e;null===(e=this.parentVNode)||void 0===e||e.getRNode().appendChild(this.getRNode())}replaceWith(e){var t,n,i;if(e instanceof x)null===(t=this.parentVNode)||void 0===t||t.getRNode().insertBefore(e.getRNode(),this.getRNode()),this.getRNode().replaceWith(e.pivot.getRNode());else if(e instanceof E){let t=e.getComponent().getEFVNode();t instanceof x?(null===(n=this.parentVNode)||void 0===n||n.getRNode().insertBefore(e.getRNode(),this.getRNode()),this.getRNode().replaceWith(t.pivot.getRNode())):null===(i=this.parentVNode)||void 0===i||i.getRNode().replaceChild(e.getRNode(),this.getRNode())}else if(this.parentVNode){Array.from(this.parentVNode.getRNode().children).includes(this.getRNode())&&this.parentVNode.getRNode().replaceChild(e.getRNode(),this.getRNode())}}remove(){var e;null===(e=this.ele)||void 0===e||e.remove()}}function T(e,t,n){if("string"==typeof n)"className"===t?e.className=n:e.setAttribute(t,n);else if("style"===t&&"object"==typeof n&&null!==n){let i=[];for(let e in n)i.push(`${e}:${n[e]};`);e.setAttribute(t,i.join(""))}else if("function"==typeof n){let i=/^on([a-zA-Z]+)/;if(i.test(t)){let r=t.match(i);r&&e.addEventListener(r[1].toLocaleLowerCase(),n.bind(e))}else e.addEventListener(t,n.bind(e))}}class D extends w{constructor(e,t){super(),this.type=8,this.props=e,this.bnodeList=t,this.nodeList=[],this.pivot=new C(""),this.pivot.createRNode()}setParentVNode(e){this.parentVNode=e}getRNode(){return this.fragment}createRNode(){this.fragment=document.createDocumentFragment(),this.bnodeList.forEach((e=>{let t=y(e,this.parentVNode,!1);t.createRNode(),this.nodeList.push(t),this.fragment.appendChild(t.getRNode())}))}mount(){var e,t;null===(e=this.parentVNode)||void 0===e||e.getRNode().appendChild(this.getRNode()),null===(t=this.parentVNode)||void 0===t||t.getRNode().appendChild(this.pivot.getRNode())}replaceWith(e){var t;e instanceof D&&(this.nodeList.forEach((e=>e.getRNode().remove())),null===(t=this.parentVNode)||void 0===t||t.getRNode().insertBefore(e.getRNode(),this.pivot.getRNode()),e.pivot=this.pivot)}remove(){this.nodeList.forEach((e=>e.remove()))}}class F{constructor(e={}){this.config=e,this.data=new v(this.config.data||{}).getData()}setProps(e){this.props=e}setChildren(e){this.children=e}createEFVNode(){if(this.efVNode)return this.efVNode;let e=this.render(L);if(e instanceof E){e.createRNode();let t=e.getComponent();e=t.getEFVNode()}return this.efVNode=e}getEFVNode(){return this.efVNode}}F.prototype.classComponent=!0;class M extends F{constructor(){super()}setRenderFun(e){this.renderFun=e}render(){return this.renderFun.call(this,this.props,this.children)}}b.Component=F;const O=L,k=b.Fragment;e.Component=F,e.Fragment=k,e.createNode=L,e.default=b,e.defineState=function(e,t){return new N(e,t)},e.h=O,e.mount=P,Object.defineProperty(e,"__esModule",{value:!0})}));
