// 运行时的基础：内部 Symbol、Event、EventTarget
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  // 原来是 IIFE 的参数，现在由第一个 part 取出来放进 ctx
  const native = globalThis.__nacre_native;

  // 用 IIFE 作用域内的 Symbol 存内部状态：既能跨类访问，又不出现在公开属性上
  const kTarget = Symbol('target');
  const kDefaultPrevented = Symbol('defaultPrevented');
  const kStopImmediate = Symbol('stopImmediate');
  const kListeners = Symbol('listeners');
  // 原生类覆写它来接「某个类型的监听器从无到有 / 从有到无」。
  // 默认什么都不做——纯 JS 的 EventTarget 不需要告诉谁。
  const kSubscribe = Symbol('subscribe');
  // 导航栈动过之后重建持有边，见 UINavigationController
  const kSyncStack = Symbol('syncStack');
  // **加监听器不改变对象的寿命。** 对象活不活只看从 application 出发走不走
  // 得到它（所有权镜像，见下面 ownership）。这里曾经有一个全局的强引用集合，
  // 加了监听器的对象全放进去、监听器全部移走才出来——结果是从界面上摘下来
  // 的按钮、被弹出的页面上的按钮永远不被回收。

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

  // 包装对象的「出厂配置」。构造函数这条路和原生侧的包装工厂共用这一段，
  // 免得两边漂——工厂不走构造函数（见 setWrapperFactory）。
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
        // 订阅是同步的，不会回调进 JS，所以中间没有重入。
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
        // 先快照：派发过程中增删监听器不影响本轮
        for (const entry of list.slice()) {
          // once 的监听器在调用前就移除，和标准一致
          if (entry.once) this.removeEventListener(event.type, entry.callback);
          try {
            entry.callback.call(this, event);
          } catch (e) {
            // 一个监听器抛异常不能中断其余监听器，也不能冒到派发方
            console.error('Event listener threw: ' + (e && e.stack ? e.stack : e));
          }
          if (event[kStopImmediate]) break;
        }
      }
      return !event[kDefaultPrevented];
    }
  }

  // ---------- 错误类事件 ----------
  // 这两类事件由运行时在 JS 线程上同步派发，派发方拿得到返回值，
  // 所以是 cancelable 的：调 preventDefault() 就不会再打运行时的默认日志。

  function defineField(obj, name, value) {
    Object.defineProperty(obj, name, { value, enumerable: true });
  }

  class ErrorEvent extends Event {
    constructor(type, options) {
      const o = options == null ? {} : options;
      super(type, o);
      defineField(this, 'message', o.message === undefined ? '' : o.message);
      defineField(this, 'error', o.error);
      defineField(this, 'filename', o.filename === undefined ? '' : o.filename);
      defineField(this, 'lineno', o.lineno === undefined ? 0 : o.lineno);
    }
  }

  class PromiseRejectionEvent extends Event {
    constructor(type, options) {
      const o = options == null ? {} : options;
      super(type, o);
      defineField(this, 'reason', o.reason);
      defineField(this, 'promise', o.promise);
    }
  }

  // ---------- 原生对象的包装 ----------
  // 句柄 id 挂在闭包里的 Symbol 上，而不是 V8 的 internal field。
  // 用 internal field 就得绕过 JS 构造函数来建对象，EventTarget 的
  // 监听器表就初始化不了。

  // 这个 part 对外提供的东西
  Object.assign(ctx, {
    ErrorEvent,
    Event,
    EventTarget,
    PromiseRejectionEvent,
    define,
    defineField,
    initWrapper,
    kListeners,
    kSubscribe,
    kSyncStack,
    native,
  });
})
