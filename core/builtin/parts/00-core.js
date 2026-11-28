// 运行时的基础：内部 Symbol、Event、EventTarget，和几个各处都用的小助手
//
// 两端共用，排在所有内置脚本的最前面：平台的桥和别的 part 都从 ctx 上拿这里放的东西。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  // 原生入口，由引擎挂在全局上；第一个 part 取出来放进 ctx，平台的 25-globals.js 再从全局摘掉
  const native = globalThis.__nacre_native;

  // 用 IIFE 作用域内的 Symbol 存内部状态：既能跨类访问，又不出现在公开属性上
  const kTarget = Symbol('target');
  const kDefaultPrevented = Symbol('defaultPrevented');
  const kStopImmediate = Symbol('stopImmediate');
  const kListeners = Symbol('listeners');
  // 原生类覆写它来接「某个类型的监听器从无到有 / 从有到无」。
  // 默认什么都不做——纯 JS 的 EventTarget 不需要告诉谁。
  const kSubscribe = Symbol('subscribe');
  // 包装对象上挂原生句柄的 Symbol。平台的桥用它把包装和原生对象对上；28-web-globals.js
  // 用它认出包装对象（structuredClone 不克隆它们）。
  //
  // 句柄挂在 Symbol 上，而不是 V8 的 internal field：用 internal field 就得绕过 JS 构造
  // 函数来建对象，EventTarget 的监听器表就初始化不了。
  const kHandle = Symbol('nativeHandle');
  // **加监听器不改变对象的寿命。** 对象活不活由平台的桥管（所有权），和有没有监听器
  // 无关。这里曾经有一个全局的强引用集合，加了监听器的对象全放进去、监听器全部移走
  // 才出来——结果是从界面上摘下来的按钮、被弹出的页面上的按钮永远不被回收。

  // options 对象里某个成员「带没带」。照 Web IDL 的约定：值是 undefined 的
  // 成员视为没带，{ scale: undefined } 等于 {}。
  //
  // 不能写 'key' in o——那只看键在不在，undefined 会被当成有效值一路传到
  // 原生。条件表达式里顺手写出来的 { atIndex: cond ? 0 : undefined } 是很常见
  // 的写法，不该因此出错
  function has(o, key) {
    return o[key] !== undefined;
  }

  function define(obj, name, value) {
    // 和 ECMAScript 内置一致：不可枚举、可写、可配置
    Object.defineProperty(obj, name, {
      value, writable: true, enumerable: false, configurable: true,
    });
    return value;
  }

  // ---------- Event ----------

  class Event {
    constructor(type, options) {
      if (arguments.length < 1) {
        throw new TypeError("Failed to construct 'Event': 1 argument required, but only 0 present.");
      }
      const o = options == null ? {} : options;
      Object.defineProperty(this, 'type', { value: String(type), enumerable: true });
      Object.defineProperty(this, 'cancelable', { value: Boolean(o.cancelable), enumerable: true });
      this[kTarget] = null;
      this[kDefaultPrevented] = false;
      this[kStopImmediate] = false;
    }
    get target() { return this[kTarget]; }
    get currentTarget() { return this[kTarget]; }
    get defaultPrevented() { return this[kDefaultPrevented]; }
    preventDefault() {
      // cancelable 为 false 时静默失效，和标准一致
      if (this.cancelable) this[kDefaultPrevented] = true;
    }
    // 目前不做传播，保留接口是为了将来加冒泡时不破坏既有代码
    stopPropagation() {}
    stopImmediatePropagation() { this[kStopImmediate] = true; }
  }

  // ---------- EventTarget ----------

  // 包装对象的「出厂配置」。构造函数这条路和平台桥里的包装工厂共用这一段，
  // 免得两边漂——工厂建包装不走构造函数。
  function initWrapper(obj) {
    Object.defineProperty(obj, kListeners, {
      value: new Map(), writable: false, enumerable: false, configurable: false,
    });
    return obj;
  }

  class EventTarget {
    constructor() {
      initWrapper(this);
    }

    addEventListener(type, callback, options) {
      if (this[kListeners] === undefined) throw new TypeError('Illegal invocation');
      if (arguments.length < 2) {
        throw new TypeError("Failed to execute 'addEventListener': 2 arguments required.");
      }
      if (callback == null) return;
      if (typeof callback !== 'function') {
        throw new TypeError("Failed to execute 'addEventListener': parameter 2 is not of type 'Function'.");
      }
      const t = String(type);
      const once = typeof options === 'object' && options !== null ? Boolean(options.once) : false;
      let list = this[kListeners].get(t);
      if (list === undefined) {
        // 这个类型从无到有：**先**告诉原生「我要听了」，成了再登记。
        // 原生会拒绝它不认识的事件名（抛 TypeError）。先登记的话，抛了之后
        // 那一条还留在表里：同一个回调再注册被当成重复、换一个回调也不再去
        // 问原生，两种都静默通过；而且这个键让监听器表永远不为空。
        // 订阅是同步的，原生在里面只做登记（加 target、设委托、加观察者），
        // 这些操作不会让系统当场回调，所以中间没有重入。
        this[kSubscribe](t, true);
        list = [];
        this[kListeners].set(t, list);
      }
      // 同一个 (type, callback) 只注册一次，和标准一致
      for (const entry of list) if (entry.callback === callback) return;
      list.push({ callback, once });
    }

    removeEventListener(type, callback) {
      if (this[kListeners] === undefined) throw new TypeError('Illegal invocation');
      const t = String(type);
      const list = this[kListeners].get(t);
      if (list === undefined) return;
      for (let i = 0; i < list.length; i++) {
        if (list[i].callback !== callback) continue;
        // 记一笔「已经移除」：正在进行的派发手里是名单的快照，这一条可能还
        // 在快照里排着，轮到它时要跳过（见 dispatchEvent）
        list[i].removed = true;
        list.splice(i, 1);
        // 这个类型从有到无：告诉原生「不用再发了」
        if (list.length === 0) {
          this[kListeners].delete(t);
          this[kSubscribe](t, false);
        }
        return;
      }
    }

    // 默认不订阅任何东西。原生类覆写它。
    [kSubscribe](type, on) {}

    dispatchEvent(event) {
      if (this[kListeners] === undefined) throw new TypeError('Illegal invocation');
      if (!(event instanceof Event)) {
        throw new TypeError("Failed to execute 'dispatchEvent': parameter 1 is not of type 'Event'.");
      }
      event[kTarget] = this;
      event[kStopImmediate] = false;
      const list = this[kListeners].get(event.type);
      if (list !== undefined) {
        // 先快照：派发过程中新加的监听器这一轮不调。移除的不一样——还没轮到
        // 的监听器被前面的移除了，这一轮就不再调它（Chrome 和 DOM 标准都是
        // 这样：每一条有一个「已移除」的标记，轮到时先看一眼）。移除之后又
        // 加回同一个函数是一次新的登记，不在这份快照里
        for (const entry of list.slice()) {
          if (entry.removed) continue;
          // once 的监听器在调用前就移除，和标准一致
          if (entry.once) this.removeEventListener(event.type, entry.callback);
          try {
            entry.callback.call(this, event);
          } catch (e) {
            // 一个监听器抛异常不能中断其余监听器，也不能冒到派发方。接住之后
            // 交给运行时，和没接住的异常走同一条路报出去。和浏览器里监听器的
            // 异常进 window.onerror 是一回事。error 的监听器自己再抛，引擎那边
            // 不会再派发一次
            native.reportError(e);
          }
          if (event[kStopImmediate]) break;
        }
      }
      return !event[kDefaultPrevented];
    }
  }

  // 往对象上挂一个只读、可枚举的字段。事件的字段不用它了（事件类的字段是原型上的
  // getter，见 core 的 05-events.js），别处还在用

  function defineField(obj, name, value) {
    Object.defineProperty(obj, name, { value, enumerable: true });
  }

  // 带字段的事件类（ErrorEvent、CustomEvent……）和定义事件类的助手在 05-events.js

  define(globalThis, 'Event', Event);
  define(globalThis, 'EventTarget', EventTarget);

  // 这个 part 对外提供的东西
  Object.assign(ctx, {
    Event,
    EventTarget,
    define,
    defineField,
    has,
    initWrapper,
    kHandle,
    kListeners,
    kSubscribe,
    native,
  });
})
