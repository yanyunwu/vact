!function(e,t){e&&!e.getElementById("livereloadscript")&&((t=e.createElement("script")).async=1,t.src="//"+(self.location.host||"localhost").split(":")[0]+":35729/livereload.js?snipver=1",t.id="livereloadscript",e.getElementsByTagName("head")[0].appendChild(t))}(self.document),function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Vact={})}(this,(function(e){"use strict";function t(){}function n(){n.init.call(this)}function r(e){return void 0===e._maxListeners?n.defaultMaxListeners:e._maxListeners}function i(e,t,n){if(t)e.call(n);else for(var r=e.length,i=c(e,r),s=0;s<r;++s)i[s].call(n)}function s(e,t,n,r){if(t)e.call(n,r);else for(var i=e.length,s=c(e,i),o=0;o<i;++o)s[o].call(n,r)}function o(e,t,n,r,i){if(t)e.call(n,r,i);else for(var s=e.length,o=c(e,s),l=0;l<s;++l)o[l].call(n,r,i)}function l(e,t,n,r,i,s){if(t)e.call(n,r,i,s);else for(var o=e.length,l=c(e,o),a=0;a<o;++a)l[a].call(n,r,i,s)}function a(e,t,n,r){if(t)e.apply(n,r);else for(var i=e.length,s=c(e,i),o=0;o<i;++o)s[o].apply(n,r)}function h(e,n,i,s){var o,l,a,h;if("function"!=typeof i)throw new TypeError('"listener" argument must be a function');if((l=e._events)?(l.newListener&&(e.emit("newListener",n,i.listener?i.listener:i),l=e._events),a=l[n]):(l=e._events=new t,e._eventsCount=0),a){if("function"==typeof a?a=l[n]=s?[i,a]:[a,i]:s?a.unshift(i):a.push(i),!a.warned&&(o=r(e))&&o>0&&a.length>o){a.warned=!0;var u=new Error("Possible EventEmitter memory leak detected. "+a.length+" "+n+" listeners added. Use emitter.setMaxListeners() to increase limit");u.name="MaxListenersExceededWarning",u.emitter=e,u.type=n,u.count=a.length,h=u,"function"==typeof console.warn?console.warn(h):console.log(h)}}else a=l[n]=i,++e._eventsCount;return e}function u(e,t,n){var r=!1;function i(){e.removeListener(t,i),r||(r=!0,n.apply(e,arguments))}return i.listener=n,i}function f(e){var t=this._events;if(t){var n=t[e];if("function"==typeof n)return 1;if(n)return n.length}return 0}function c(e,t){for(var n=new Array(t);t--;)n[t]=e[t];return n}t.prototype=Object.create(null),n.EventEmitter=n,n.usingDomains=!1,n.prototype.domain=void 0,n.prototype._events=void 0,n.prototype._maxListeners=void 0,n.defaultMaxListeners=10,n.init=function(){this.domain=null,n.usingDomains&&undefined.active,this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=new t,this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},n.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||isNaN(e))throw new TypeError('"n" argument must be a positive number');return this._maxListeners=e,this},n.prototype.getMaxListeners=function(){return r(this)},n.prototype.emit=function(e){var t,n,r,h,u,f,c,p="error"===e;if(f=this._events)p=p&&null==f.error;else if(!p)return!1;if(c=this.domain,p){if(t=arguments[1],!c){if(t instanceof Error)throw t;var d=new Error('Uncaught, unspecified "error" event. ('+t+")");throw d.context=t,d}return t||(t=new Error('Uncaught, unspecified "error" event')),t.domainEmitter=this,t.domain=c,t.domainThrown=!1,c.emit("error",t),!1}if(!(n=f[e]))return!1;var y="function"==typeof n;switch(r=arguments.length){case 1:i(n,y,this);break;case 2:s(n,y,this,arguments[1]);break;case 3:o(n,y,this,arguments[1],arguments[2]);break;case 4:l(n,y,this,arguments[1],arguments[2],arguments[3]);break;default:for(h=new Array(r-1),u=1;u<r;u++)h[u-1]=arguments[u];a(n,y,this,h)}return!0},n.prototype.addListener=function(e,t){return h(this,e,t,!1)},n.prototype.on=n.prototype.addListener,n.prototype.prependListener=function(e,t){return h(this,e,t,!0)},n.prototype.once=function(e,t){if("function"!=typeof t)throw new TypeError('"listener" argument must be a function');return this.on(e,u(this,e,t)),this},n.prototype.prependOnceListener=function(e,t){if("function"!=typeof t)throw new TypeError('"listener" argument must be a function');return this.prependListener(e,u(this,e,t)),this},n.prototype.removeListener=function(e,n){var r,i,s,o,l;if("function"!=typeof n)throw new TypeError('"listener" argument must be a function');if(!(i=this._events))return this;if(!(r=i[e]))return this;if(r===n||r.listener&&r.listener===n)0==--this._eventsCount?this._events=new t:(delete i[e],i.removeListener&&this.emit("removeListener",e,r.listener||n));else if("function"!=typeof r){for(s=-1,o=r.length;o-- >0;)if(r[o]===n||r[o].listener&&r[o].listener===n){l=r[o].listener,s=o;break}if(s<0)return this;if(1===r.length){if(r[0]=void 0,0==--this._eventsCount)return this._events=new t,this;delete i[e]}else!function(e,t){for(var n=t,r=n+1,i=e.length;r<i;n+=1,r+=1)e[n]=e[r];e.pop()}(r,s);i.removeListener&&this.emit("removeListener",e,l||n)}return this},n.prototype.removeAllListeners=function(e){var n,r;if(!(r=this._events))return this;if(!r.removeListener)return 0===arguments.length?(this._events=new t,this._eventsCount=0):r[e]&&(0==--this._eventsCount?this._events=new t:delete r[e]),this;if(0===arguments.length){for(var i,s=Object.keys(r),o=0;o<s.length;++o)"removeListener"!==(i=s[o])&&this.removeAllListeners(i);return this.removeAllListeners("removeListener"),this._events=new t,this._eventsCount=0,this}if("function"==typeof(n=r[e]))this.removeListener(e,n);else if(n)do{this.removeListener(e,n[n.length-1])}while(n[0]);return this},n.prototype.listeners=function(e){var t,n=this._events;return n&&(t=n[e])?"function"==typeof t?[t.listener||t]:function(e){for(var t=new Array(e.length),n=0;n<t.length;++n)t[n]=e[n].listener||e[n];return t}(t):[]},n.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):f.call(e,t)},n.prototype.listenerCount=f,n.prototype.eventNames=function(){return this._eventsCount>0?Reflect.ownKeys(this._events):[]};class p extends n{constructor(e,t){super(),this.value=e,this.dep=[],this.dataProxy=t}setDep(e){this.dep.push(e)}valueOf(){return this.value}toString(){return this.value}set(e){this.value=e}get(){return this.value}notify(){this.dep.forEach((e=>{e.update()})),this.emit("change",this.value)}}class d{constructor(e){this.fn=e}update(){this.fn()}}class y{constructor(){this.valueMap=new WeakMap}getProp(e,t){this.valueMap.get(e)||this.valueMap.set(e,{});let n=this.valueMap.get(e);if(!n[t]){let r=new p(Array.isArray(e[t])?new Proxy(e[t],{set(e,t,n,i){let s=Reflect.set(e,t,n,i);return r.notify(),s}}):e[t]);n[t]=r}return n[t]}getValueTarget(e){return this.valueMap.get(e)}setValueTarget(e,t){this.valueMap.set(e,t)}}class v{constructor(e){this.dataProxyValue=new y;const t={get:(e,n,r)=>{if("object"!=typeof e[n]||null===e[n]||Array.isArray(e[n])){if("function"==typeof e[n])return Reflect.get(e,n,r);{let t=this.dataProxyValue.getProp(e,n);for(let e of L.depPool)e.includes(t)||e.push(t);return t.value}}return new Proxy(e[n],t)},set:(e,t,n,r)=>{if("object"!=typeof n||null===n||Array.isArray(n)){let i=this.dataProxyValue.getProp(e,t);i.value=Array.isArray(n)?new Proxy(n,{set(e,t,n,r){let s=Reflect.set(e,t,n,r);return i.notify(),s}}):n;let s=Reflect.set(e,t,n,r);return i.notify(),s}{let i=this.dataProxyValue.getValueTarget(e[t]),s=Reflect.set(e,t,n,r);return this.replaceProps(n,i),s}}};this.data=new Proxy(e,t)}replaceProps(e,t){for(let n in t){let r=t[n];r.value=e[n],r.notify()}this.dataProxyValue.setValueTarget(e,t)}getData(){return this.data}}class g{constructor(e){this.dataProxyValue=new y;const t={get:(e,n,r)=>{if("object"!=typeof e[n]||null===e[n]||Array.isArray(e[n])){if("function"==typeof e[n])return Reflect.get(e,n,r);{let t=this.dataProxyValue.getProp(e,n);for(let e of L.depPool)e.includes(t)||e.push(t);return t.value}}return new Proxy(e[n],t)},set:(e,t,n,r)=>{if("object"!=typeof n||null===n||Array.isArray(n)){let i=this.dataProxyValue.getProp(e,t);i.value=Array.isArray(n)?new Proxy(n,{set(e,t,n,r){let s=Reflect.set(e,t,n,r);return i.notify(),s}}):n;let s=Reflect.set(e,t,n,r);return i.notify(),s}{let i=this.dataProxyValue.getValueTarget(e[t]),s=Reflect.set(e,t,n,r);return this.replaceProps(n,i),s}}};this.data=new Proxy(e,t)}getData(){return this.data}replaceProps(e,t){for(let n in t){let r=t[n];r.value=e[n],r.notify()}this.dataProxyValue.setValueTarget(e,t)}}class m{constructor(e={}){this.config=e,this.setData()}setData(){this.data=new g(this.config.data||{}).getData()}setProps(e){this.props=e}setChildren(e){this.children=e}renderRoot(){return this.render(P)}}class w{}w.ELEMENT=0,w.TEXT=1,w.COMPONENT=2;class x extends w{constructor(e){super(),this.type=w.TEXT,this.text=e}createTextNode(){return this.textNode=document.createTextNode(this.text),this.textNode}}class C extends w{constructor(e,t,n){super(),this.type=w.COMPONENT,this.Constructor=e,this.props=t||{},this.children=n||[]}init(){let e=new g({}).getData();for(let t in this.props){if("function"!=typeof this.props[t]){e[t]=this.props[t];continue}let n=[],r=L.depPool;r.push(n);let i=this.props[t]();if(r.splice(r.indexOf(n),1),"function"==typeof i)e[t]=i;else{e[t]=i;let r=()=>e[t]=this.props[t]();n.forEach((e=>{e.setDep(new d(r))}))}}let t=new v([]).getData();if(this.children)for(let e=0;e<this.children.length;e++){if("function"!=typeof this.children[e]){t[e]=this.children[e];continue}let n=[],r=L.depPool;r.push(n);let i=this.children[e]();if(r.splice(r.indexOf(n),1),"function"==typeof i)t[e]=i;else{t[e]=i;let r=()=>t[e]=this.children[e]();n.forEach((e=>{e.setDep(new d(r))}))}}let n=this.Constructor;this.component=new n(e,t),this.component.setProps(e),this.component.setChildren(t)}getComponent(){return this.init(),this.component}}class E extends w{constructor(e,t,n){super(),this.type=w.ELEMENT,this.tag=e,this.props=t,this.children=n}createEle(){var e;if(this.ele=document.createElement(this.tag),this.props)for(let t in this.props)if("function"==typeof this.props[t]){let n=[],r=L.depPool;r.push(n);let i=this.props[t]();if(r.splice(r.indexOf(n),1),"function"==typeof i){let e=/^on([a-zA-Z]+)/;if(e.test(t)){let n=t.match(e);n&&this.ele.addEventListener(n[1].toLocaleLowerCase(),i.bind(this.ele))}else this.ele.addEventListener(t,i.bind(this.ele))}else{null===(e=this.ele)||void 0===e||e.setAttribute(t,i);let r=()=>{var e;return null===(e=this.ele)||void 0===e?void 0:e.setAttribute(t,this.props[t]())};n.forEach((e=>{e.setDep(new d(r))}))}}else this.ele.setAttribute(t,this.props[t]);if(Array.isArray(this.children)&&this.children.length)for(let e of this.children)this.addChild(e);else void 0!==this.children&&null!==this.children&&this.addChild(this.children);return this.ele}getRealNode(e){let t=document.createTextNode("");if("string"==typeof e){t=new x(e).createTextNode()}else if(e instanceof m)t=e.renderRoot().createEle();else if(e instanceof C)t=e.getComponent().renderRoot().createEle();else if(e instanceof E)t=e.createEle();else if(e instanceof x)t=e.createTextNode();else{t=new x(String(e)).createTextNode()}return t}getRealNodeList(e){let t=[];for(let n of e)t.push(this.getRealNode(n));return t}addChildren(e,t){var n;let r=document.createDocumentFragment();for(let t of e)r.appendChild(t);null===(n=this.ele)||void 0===n||n.insertBefore(r,t)}removeChildren(e){for(let t of e)t.remove()}addChild(e){if(this.ele)if("string"==typeof e){let t=new x(e);this.ele.appendChild(t.createTextNode())}else if(e instanceof m)this.ele.appendChild(e.renderRoot().createEle());else if(e instanceof C)this.ele.appendChild(e.getComponent().renderRoot().createEle());else if(e instanceof E)this.ele.appendChild(e.createEle());else if(e instanceof x)this.ele.appendChild(e.createTextNode());else if("function"==typeof e){let t=[],n=L.depPool;n.push(t);let r=e();if(n.splice(n.indexOf(t),1),Array.isArray(r)){let n=document.createTextNode("");this.ele.appendChild(n);let i=this.getRealNodeList(r);if(this.addChildren(i,n),!t.length)return;let s=()=>{this.removeChildren(i);let t=e();Array.isArray(t)&&(i=this.getRealNodeList(t),this.addChildren(i,n))};for(let e of t)e.setDep(new d(s))}else{let n=this.getRealNode(r);if(this.ele.appendChild(n),!t.length)return;let i=()=>{var t,r;let i=e(),s=this.getRealNode(i);s?s.nodeType===n.nodeType?n.nodeValue=s.nodeValue:(null===(t=this.ele)||void 0===t||t.replaceChild(s,n),n=s):null===(r=this.ele)||void 0===r||r.replaceChild(n=document.createTextNode(""),n)};for(let e of t)e.setDep(new d(i))}}else if(Array.isArray(e))for(let t of e)this.addChild(t);else{let t=new x(String(e));this.ele.appendChild(t.createTextNode())}}}function P(e,t,n){if("string"==typeof e)return new E(e,t,n);if("function"==typeof e)return new C(e,t,n);throw new Error("只能传入字符串或者构造函数")}E.nativeEvents={onClick:"click"};class L{static getDepPool(){return this.depPool}}L.depPool=[],L.Component=m,L.mount=function(e,t){let n=document.querySelector(e),r=t.renderRoot().createEle();n&&r&&n.parentNode&&n.parentNode.replaceChild(r,n)},L.createNode=P;const T=L.mount,_=L.Component,N=L.createNode;e.Component=_,e.createNode=N,e.default=L,e.mount=T,Object.defineProperty(e,"__esModule",{value:!0})}));
