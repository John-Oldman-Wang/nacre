// 原生模块：application.nativeModules
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// App 团队和第三方把自己的原生代码登记成「模块」（原生那一侧见
// NacreModule.h），JS 从这里按名字拿到它，调它的方法、听它的事件。第三方的
// JS 是普通的 npm 包代码，打进用户的产物里，只用得到这里公开的东西。
//
// 对桥来说，所有模块共用一个原生对象（application.nativeModules 包着的那个），
// 模块名和方法名是参数——所以没有新的过桥通道。
(function (ctx) {
  'use strict';

  const {
    Application,
    Event,
    EventTarget,
    define,
    defineField,
    defineNativeClass,
    internalEventHandlers,
    kHandle,
    kSubscribe,
    nativeCall,
    nativeCallAsync,
    nativeClassObject,
    nativeOnly,
    own,
  } = ctx;

  // ---------- base64 ----------
  //
  // 二进制过桥用的。桥上走的是 JSON 文本，装不了字节，所以每块二进制写成
  // base64。引擎自带 Uint8Array 的 toBase64 / fromBase64（C++ 实现的）时用
  // 它；没有就用下面这份 JS 的。
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const hasNativeBase64 = typeof Uint8Array.prototype.toBase64 === 'function' &&
                          typeof Uint8Array.fromBase64 === 'function';

  function encodeBase64(view) {
    if (hasNativeBase64) return view.toBase64();
    let out = '';
    const n = view.length;
    for (let i = 0; i < n; i += 3) {
      const a = view[i];
      const b = i + 1 < n ? view[i + 1] : 0;
      const c = i + 2 < n ? view[i + 2] : 0;
      out += B64[a >> 2] + B64[((a & 3) << 4) | (b >> 4)] +
             (i + 1 < n ? B64[((b & 15) << 2) | (c >> 6)] : '=') +
             (i + 2 < n ? B64[c & 63] : '=');
    }
    return out;
  }

  let b64Reverse = null;
  function decodeBase64(text) {
    if (hasNativeBase64) return Uint8Array.fromBase64(text).buffer;
    if (b64Reverse === null) {
      b64Reverse = new Uint8Array(128);
      for (let i = 0; i < 64; i++) b64Reverse[B64.charCodeAt(i)] = i;
    }
    let pad = 0;
    if (text.endsWith('==')) pad = 2;
    else if (text.endsWith('=')) pad = 1;
    const size = (text.length / 4) * 3 - pad;
    const out = new Uint8Array(size > 0 ? size : 0);
    let at = 0;
    for (let i = 0; i < text.length; i += 4) {
      const v = (b64Reverse[text.charCodeAt(i)] << 18) | (b64Reverse[text.charCodeAt(i + 1)] << 12) |
                (b64Reverse[text.charCodeAt(i + 2)] << 6) | b64Reverse[text.charCodeAt(i + 3)];
      if (at < size) out[at++] = v >> 16;
      if (at < size) out[at++] = (v >> 8) & 255;
      if (at < size) out[at++] = v & 255;
    }
    return out.buffer;
  }

  // ---------- 值：JS → 原生 ----------
  //
  // 能过去的只有 JSON 表示得了的那几种，外加二进制。**在过桥之前查**：
  // JSON.stringify 会把 NaN 写成 null、把函数和 undefined 直接丢掉、对 Date
  // 调 toJSON——到了原生已经看不出原来是什么。所以这里自己走一遍，碰到过
  // 不去的就抛，不替换。
  //
  // 二进制拆成两份：树里那个位置留 null，另外往 bytes 里记一条
  // [位置, base64]。原生照这张表把 NSData 放回去。

  // 报错里用的位置：argument 1.items[2]
  function describePath(path) {
    let text = 'argument ' + (path[0] + 1);
    for (let i = 1; i < path.length; i++) {
      text += typeof path[i] === 'number' ? '[' + path[i] + ']' : '.' + path[i];
    }
    return text;
  }

  function describeKind(value) {
    if (typeof value === 'function') return 'a function';
    if (typeof value === 'symbol') return 'a symbol';
    if (typeof value === 'bigint') return 'a BigInt';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') return 'a string with an unpaired surrogate';
    const name = value.constructor && value.constructor.name;
    return typeof name === 'string' && name !== '' && name !== 'Object'
      ? 'an instance of ' + name : 'an object that is not a plain object';
  }

  function reject(where, path, value, why) {
    throw new TypeError(
      where + ': ' + describePath(path) + ' is ' + (why || describeKind(value)) +
      '; only null, booleans, finite numbers, strings, arrays, plain objects and ' +
      'ArrayBuffers (or views on them) can be passed to a native module');
  }

  function encode(value, path, bytes, ancestors, where) {
    if (value === null || value === undefined) return null;
    const type = typeof value;
    if (type === 'boolean') return value;
    if (type === 'number') {
      if (!Number.isFinite(value)) reject(where, path, value);
      return value;
    }
    if (type === 'string') {
      // 落单的代理项编不成 UTF-8，原生那边会整个解不开
      if (!value.isWellFormed()) reject(where, path, value);
      return value;
    }
    if (type !== 'object') reject(where, path, value);

    if (value instanceof ArrayBuffer) {
      bytes.push([path.slice(), encodeBase64(new Uint8Array(value))]);
      return null;
    }
    if (ArrayBuffer.isView(value)) {
      // 只传视图盖住的那一段
      bytes.push([path.slice(),
                  encodeBase64(new Uint8Array(value.buffer, value.byteOffset, value.byteLength))]);
      return null;
    }
    if (value[kHandle] !== undefined || value instanceof EventTarget) {
      reject(where, path, value, 'a native object');
    }
    const isArray = Array.isArray(value);
    if (!isArray) {
      const proto = Object.getPrototypeOf(value);
      if (proto !== Object.prototype && proto !== null) reject(where, path, value);
    }
    // 环：这个对象是自己的祖先。同一个对象出现在两处不算环，可以传
    if (ancestors.has(value)) reject(where, path, value, 'part of a cycle');
    ancestors.add(value);
    let out;
    if (isArray) {
      out = new Array(value.length);
      for (let i = 0; i < value.length; i++) {
        path.push(i);
        out[i] = encode(value[i], path, bytes, ancestors, where);
        path.pop();
      }
    } else {
      out = {};
      for (const key of Object.keys(value)) {
        const item = value[key];
        // 值是 undefined 的成员视为没写（project.md 原则 13）
        if (item === undefined) continue;
        path.push(key);
        if (!key.isWellFormed()) reject(where, path, key);
        // 用 defineProperty：键可能叫 __proto__
        Object.defineProperty(out, key, {
          value: encode(item, path, bytes, ancestors, where),
          writable: true, enumerable: true, configurable: true,
        });
        path.pop();
      }
    }
    ancestors.delete(value);
    return out;
  }

  function encodeArguments(args, where) {
    const bytes = [];
    const tree = new Array(args.length);
    const ancestors = new Set();
    for (let i = 0; i < args.length; i++) {
      tree[i] = encode(args[i], [i], bytes, ancestors, where);
    }
    return { tree, bytes };
  }

  // ---------- 值：原生 → JS ----------
  // 反过来：照 bytes 那张表把 ArrayBuffer 放回树里
  function decode(value, bytes) {
    let result = value === undefined ? null : value;
    if (Array.isArray(bytes)) {
      for (const [path, text] of bytes) {
        const buffer = decodeBase64(text);
        if (path.length === 0) { result = buffer; continue; }
        let at = result;
        for (let i = 0; i < path.length - 1; i++) at = at[path[i]];
        // 用 defineProperty：键可能叫 __proto__
        Object.defineProperty(at, path[path.length - 1], {
          value: buffer, writable: true, enumerable: true, configurable: true,
        });
      }
    }
    return result;
  }

  // 原生报的错。name 是 TypeError / RangeError 时建成那个类的实例（用户
  // 代码会 instanceof），别的名字是 Error 加 name。code 和 domain 有才挂
  function makeError(info) {
    const o = info || {};
    const message = typeof o.message === 'string' ? o.message : '';
    const name = typeof o.name === 'string' && o.name !== '' ? o.name : 'Error';
    let error;
    if (name === 'TypeError') error = new TypeError(message);
    else if (name === 'RangeError') error = new RangeError(message);
    else {
      error = new Error(message);
      if (name !== 'Error') define(error, 'name', name);
    }
    if (o.code !== undefined) error.code = o.code;
    if (o.domain !== undefined) error.domain = o.domain;
    return error;
  }

  // 原生交回来的信封：{ ok: true, value, bytes? } 或 { ok: false, error }
  function open(envelope, where) {
    if (envelope === null || typeof envelope !== 'object') {
      throw new TypeError(where + ': the native side returned nothing usable');
    }
    if (envelope.ok !== true) throw makeError(envelope.error);
    return decode(envelope.value, envelope.bytes);
  }

  // ---------- NativeModule ----------

  // 模块对象的内部状态。用 WeakMap 不用属性：对象上什么都看不见
  const states = new WeakMap();   // NativeModule -> { hub, name, methods, events, sync, async }
  // 名字 -> 模块对象。放在闭包里而不是挂在 hub 的包装上：包装万一被重建，
  // 这张表和模块对象上的监听器都还在
  const modules = new Map();
  let allowModule = false;

  function stateOf(module, what) {
    const state = states.get(module);
    if (state === undefined) throw new TypeError(what + ': Illegal invocation');
    return state;
  }

  function list(names) {
    return names.length === 0 ? 'none' : names.join(', ');
  }

  // 找不到方法，或者同步异步用反了。两种都在过桥之前报，把该用什么说出来
  function checkMethod(state, method, wantAsync, where) {
    const mine = wantAsync ? state.async : state.sync;
    if (mine.has(method)) return;
    const other = wantAsync ? state.sync : state.async;
    if (other.has(method)) {
      throw new TypeError(
        where + ': "' + method + '" is ' + (wantAsync ? 'a sync' : 'an async') +
        ' method of native module "' + state.name + '"; use ' +
        (wantAsync ? 'call("' : 'callAsync("') + method + '", …) instead');
    }
    throw new TypeError(
      where + ': native module "' + state.name + '" has no method "' + method +
      '"; sync methods: ' + list(state.methods.sync) +
      '; async methods: ' + list(state.methods.async));
  }

  function methodName(args, where) {
    if (args.length < 1) throw new TypeError(where + ': a method name is required');
    return String(args[0]);
  }

  class NativeModule extends EventTarget {
    constructor() {
      if (!allowModule) {
        throw new TypeError('Illegal constructor: NativeModule is created by the runtime, ' +
                            'use application.nativeModules.get(name)');
      }
      super();
    }

    get name() { return stateOf(this, 'name').name; }
    /** { sync: [...], async: [...] }，冻结的，每次读是同一个对象 */
    get methods() { return stateOf(this, 'methods').methods; }
    get events() { return stateOf(this, 'events').events; }

    /** 同步调用：当场拿到返回值；原生报的错在这里抛出来 */
    call(method, ...args) {
      const state = stateOf(this, 'call');
      const where = 'call';
      const name = methodName(arguments, where);
      checkMethod(state, name, false, where);
      const { tree, bytes } = encodeArguments(args, state.name + '.' + name);
      return open(nativeCall(state.hub, 'call:method:arguments:bytes:',
                             [state.name, name, tree, bytes]), state.name + '.' + name);
    }

    /**
     * 异步调用：返回 Promise。方法不存在、用反了、参数传不过去，和别的异步
     * 接口一样当场抛（fileSystem.writeText 也是），不是给一个被拒绝的 Promise
     */
    callAsync(method, ...args) {
      const state = stateOf(this, 'callAsync');
      const where = 'callAsync';
      const name = methodName(arguments, where);
      checkMethod(state, name, true, where);
      const label = state.name + '.' + name;
      const { tree, bytes } = encodeArguments(args, label);
      return nativeCallAsync(state.hub, 'callAsync', [state.name, name, tree, bytes])
        .then((result) => {
          // 原生直接交回一块二进制时走的是字节那条路，拿到的就是 ArrayBuffer
          if (result instanceof ArrayBuffer) return result;
          return open(result, label);
        });
    }

    // 某个事件名的监听器从无到有、从有到无：告诉原生「要听了 / 不用发了」。
    // 没人听的事件原生不过桥。没声明过的名字不拒绝，当自定义事件：只登记监听器，
    // 不向原生订阅（和别的原生对象一样，见 NacreRuntime.mm 的订阅入口）
    [kSubscribe](type, on) {
      const state = stateOf(this, 'addEventListener');
      if (type.charCodeAt(0) === 64 /* @ */) {
        throw new TypeError('addEventListener has no value "' + type +
                            '"; names starting with @ are reserved for the runtime');
      }
      if (!state.eventSet.has(type)) return;
      nativeCall(state.hub, 'listen:type:on:', [state.name, type, on]);
    }
  }
  define(globalThis, 'NativeModule', NativeModule);

  function createModule(hub, name, info) {
    allowModule = true;
    let module;
    try {
      module = new NativeModule();
    } finally {
      allowModule = false;
    }
    const sync = Object.freeze(info.sync.slice());
    const async = Object.freeze(info.async.slice());
    const events = Object.freeze(info.events.slice());
    states.set(module, {
      hub,
      name,
      methods: Object.freeze({ sync, async }),
      events,
      sync: new Set(sync),
      async: new Set(async),
      eventSet: new Set(events),
    });
    return module;
  }

  // ---------- NativeModules ----------
  // application.nativeModules。它包着原生那边唯一的那个对象

  defineNativeClass('NativeModules', class NativeModules {
    constructor() { nativeOnly(new.target); }

    /** 登记了哪些模块，排好序。每次读都问原生：模块可以晚登记 */
    get names() {
      return Object.freeze(nativeCall(this, 'names', []));
    }

    has(name) {
      return nativeCall(this, 'describe:', [String(name)]) !== null;
    }

    /** 同一个名字每次给同一个对象；没登记过的名字抛，并列出登记了哪些 */
    get(name) {
      const key = String(name);
      const known = modules.get(key);
      if (known !== undefined) return known;
      const info = nativeCall(this, 'describe:', [key]);
      if (info === null) {
        throw new TypeError(
          'nativeModules.get: no native module named "' + key + '"; registered modules: ' +
          list(nativeCall(this, 'names', [])));
      }
      const module = createModule(this, key, info);
      modules.set(key, module);
      return module;
    }
  });

  // 原生模块发的事件。原生把它发在 hub 上，名字是 @nativemodule（@ 开头的
  // 是内部事件，不派发给监听器），这里转给对应的模块对象
  internalEventHandlers.set('@nativemodule', (hub, payload) => {
    if (payload === null || typeof payload !== 'object') return;
    const module = modules.get(payload.module);
    if (module === undefined) return;
    const event = new Event(String(payload.type));
    defineField(event, 'detail', decode(payload.detail, payload.bytes));
    module.dispatchEvent(event);
  });

  // application.nativeModules。挂法和能力包往 Application 上挂属性一样，只是
  // 这个在核心里，所以总是有。描述符照类体里写的取值器：不可枚举、可配置、
  // 没有 setter
  Object.defineProperty(Application.prototype, 'nativeModules', {
    configurable: true,
    enumerable: false,
    /** App 自己的和第三方的原生模块 */
    get() {
      return own(this, 'nativeModules', nativeClassObject('NativeModules', 'shared'));
    },
  });
})
