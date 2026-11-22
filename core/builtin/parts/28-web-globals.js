// Web 标准的五个全局：TextEncoder、TextDecoder、atob、btoa、structuredClone
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 上层 API，Web 原样：浏览器、Node、Deno 都有这五个全局，很多 npm 包一引入
// 就调它们。它们不是 ECMAScript 的一部分，V8 不带，要运行时自己补。
//
// 算的那部分全在引擎的 C++ 里（core/engine/WebGlobals.cpp）：UTF-8 的编码和对象
// 的序列化是 V8 自带的，解码的状态机和 Base64 是照标准写的 C++。这里只做
// 三件事：把参数按 Web IDL 转好、定类的形状、建带名字的 Error。
//
// 参数转换照 Web IDL，**不套项目里「不可空的字符串，null 给空串」那一条**
// （docs/project.md 原则 13）：这五个的价值就是和 Web 原样一致，
// btoa(null) 在哪里都是 'bnVsbA=='。和 URL、fetch 的做法一样。
(function (ctx) {
  'use strict';

  const { define, kHandle, kListeners, native } = ctx;

  function namedError(name, message) {
    return new ctx.DOMException(message, name);
  }

  // Web IDL 的字典参数：undefined 和 null 当成空的，别的不是对象的值抛 TypeError
  function dictionary(value, who) {
    if (value === undefined || value === null) return {};
    if (typeof value !== 'object' && typeof value !== 'function') {
      throw new TypeError(who + ': the options must be an object');
    }
    return value;
  }

  function tag(cls, name) {
    Object.defineProperty(cls.prototype, Symbol.toStringTag, {
      value: name, writable: false, enumerable: false, configurable: true,
    });
  }

  // ---------- TextEncoder ----------
  //
  // 字符串按 Web IDL 的 ToString 转（模板字符串正是这个转换：对象走 toString，
  // Symbol 抛 TypeError）。String(v) 不行，它把 Symbol 转成 'Symbol(…)' 不抛。
  //
  // #brand 没有别的用处，只用来认「这是不是一个 TextEncoder」：在别的对象上
  // 调这些方法抛 TypeError，和 Web 一致
  class TextEncoder {
    #brand = true;
    static #check(self) {
      if (typeof self !== 'object' || self === null || !(#brand in self)) {
        throw new TypeError('Illegal invocation');
      }
    }

    get encoding() {
      TextEncoder.#check(this);
      return 'utf-8';
    }

    // 不给参数（或者给 undefined）是空串；null 是 'null'
    encode(input = '') {
      TextEncoder.#check(this);
      return native.utf8Encode(`${input}`);
    }

    // 目标不是 Uint8Array 时原生那边抛 TypeError
    encodeInto(source, destination) {
      TextEncoder.#check(this);
      if (arguments.length < 2) {
        throw new TypeError('TextEncoder.encodeInto: 2 arguments required, but only ' +
                            arguments.length + ' present');
      }
      const result = native.utf8EncodeInto(`${source}`, destination);
      return { read: result[0], written: result[1] };
    }
  }
  tag(TextEncoder, 'TextEncoder');

  // ---------- TextDecoder ----------
  //
  // 只做 UTF-8。标签认 WHATWG 给 UTF-8 列的那六个写法，别的编码在构造时抛
  // RangeError。
  const UTF8_LABELS = new Set([
    'unicode-1-1-utf-8', 'unicode11utf8', 'unicode20utf8', 'utf-8', 'utf8', 'x-unicode20utf8',
  ]);
  // 和 WebGlobals.cpp 约定的位，改一边要改另一边
  const FLAG_FATAL = 1;
  const FLAG_IGNORE_BOM = 2;
  const FLAG_STREAM = 4;

  // 标签的比较：去掉首尾的 ASCII 空白（制表、换行、换页、回车、空格），
  // 不分 ASCII 的大小写。不用 trim 和 toLowerCase——它们认的范围比 ASCII 大
  function normalizeLabel(label) {
    return label
      .replace(/^[\t\n\f\r ]+|[\t\n\f\r ]+$/g, '')
      .replace(/[A-Z]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 32));
  }

  class TextDecoder {
    #flags = 0;
    // 两次 decode 之间的状态（没凑齐的那几个字节、BOM 看过没有），原生那边读写
    #state = new Uint8Array(5);
    static #check(self) {
      if (typeof self !== 'object' || self === null || !(#flags in self)) {
        throw new TypeError('Illegal invocation');
      }
    }

    constructor(label = 'utf-8', options = undefined) {
      // 次序照 Web IDL：先把参数全部转换完（label 转字符串，options 按字典序读
      // fatal、ignoreBOM），再看标签认不认。所以 options 不是对象时抛的是
      // TypeError，哪怕标签也不对
      const name = `${label}`;
      const o = dictionary(options, 'TextDecoder');
      const fatal = Boolean(o.fatal);
      const ignoreBOM = Boolean(o.ignoreBOM);
      if (!UTF8_LABELS.has(normalizeLabel(name))) {
        throw new RangeError(
          'TextDecoder: the encoding ' + JSON.stringify(name) + ' is not supported. ' +
          'This runtime only decodes UTF-8; expected one of: utf-8, utf8, unicode-1-1-utf-8, ' +
          'unicode11utf8, unicode20utf8, x-unicode20utf8');
      }
      this.#flags = (fatal ? FLAG_FATAL : 0) | (ignoreBOM ? FLAG_IGNORE_BOM : 0);
    }

    get encoding() {
      TextDecoder.#check(this);
      return 'utf-8';
    }
    get fatal() {
      TextDecoder.#check(this);
      return (this.#flags & FLAG_FATAL) !== 0;
    }
    get ignoreBOM() {
      TextDecoder.#check(this);
      return (this.#flags & FLAG_IGNORE_BOM) !== 0;
    }

    // input 的类型在原生那边查：不是缓冲区也不是视图就抛 TypeError
    decode(input = undefined, options = undefined) {
      TextDecoder.#check(this);
      const flags = this.#flags;
      const o = dictionary(options, 'TextDecoder.decode');
      const stream = Boolean(o.stream);
      return native.utf8Decode(input, this.#state, flags | (stream ? FLAG_STREAM : 0));
    }
  }
  tag(TextDecoder, 'TextDecoder');

  define(globalThis, 'TextEncoder', TextEncoder);
  define(globalThis, 'TextDecoder', TextDecoder);

  // ---------- btoa / atob ----------
  //
  // 原生那边不合法时返回 undefined，这里据此抛。两种不合法分别是：btoa 的
  // 字符串里有超过 0xFF 的字符；atob 的输入不是合法的 Base64
  define(globalThis, 'btoa', function btoa(data) {
    if (arguments.length < 1) {
      throw new TypeError('btoa: 1 argument required, but only 0 present');
    }
    const encoded = native.base64Encode(`${data}`);
    if (encoded === undefined) {
      throw namedError('InvalidCharacterError',
        'btoa: the string contains characters outside of the Latin1 range (code points above 0xFF). ' +
        'To encode arbitrary text, convert it to UTF-8 bytes with TextEncoder first');
    }
    return encoded;
  });
  define(globalThis, 'atob', function atob(data) {
    if (arguments.length < 1) {
      throw new TypeError('atob: 1 argument required, but only 0 present');
    }
    const decoded = native.base64Decode(`${data}`);
    if (decoded === undefined) {
      throw namedError('InvalidCharacterError', 'atob: the string is not correctly encoded Base64');
    }
    return decoded;
  });

  // ---------- structuredClone ----------
  //
  // 克隆本身是 V8 的序列化做的。它不认识的是我们自己的对象：原生对象的包装、
  // 结构体、事件、URL 这些在 V8 眼里都是普通的 JS 对象，不拦的话会被克隆成
  // 一个丢了原型和内部状态的空壳，而且不报错。所以 V8 每碰到一个原型不是
  // Object.prototype 的普通对象就来问一次下面这个函数；说「是」的抛
  // DataCloneError。和网页一致：这些类在网页上的对应物（DOM 节点、URL、
  // Headers、Event）也都不能克隆。
  //
  // 用户自己写的类不在此列：它的实例照标准克隆成普通对象。
  //
  // 两种认法：
  //   1. 有句柄的是原生对象的包装，有监听器表的是 EventTarget——所有原生类
  //      和事件源都盖住了，包括以后接进来的、能力包里的
  //   2. 其余纯 JS 的类按名字列。Web 标准的在这里；平台自己的（iOS 的结构体
  //      那种）由平台的 part 放进 ctx.platformCloneClasses。**新加一个纯 JS 的类
  //      要往对应的表里添一行**，不然它会被克隆成普通对象
  const PLATFORM_CLASSES = [
    'EventTarget', 'Event',
    'URL', 'URLSearchParams', 'Headers', 'Request', 'Response', 'AbortController',
    'TextEncoder', 'TextDecoder', 'Crypto', 'Performance',
  ];
  // 第一次用到时才按名字去取：表里有几个类是后面的 part 和能力包定义的，
  // 这个 part 执行的时候它们还不存在
  let platformPrototypes = null;
  function collectPlatformPrototypes() {
    const found = new Set();
    const add = (cls) => {
      if (typeof cls === 'function' && cls.prototype !== null && typeof cls.prototype === 'object') {
        found.add(cls.prototype);
      }
    };
    for (const name of PLATFORM_CLASSES) add(globalThis[name]);
    for (const name of ctx.platformCloneClasses || []) add(globalThis[name]);
    if (typeof Intl === 'object' && Intl !== null) {
      add(Intl.NumberFormat);
      add(Intl.DateTimeFormat);
    }
    return found;
  }
  function isPlatformObject(object) {
    if (object[kHandle] !== undefined || object[kListeners] !== undefined) return true;
    if (platformPrototypes === null) platformPrototypes = collectPlatformPrototypes();
    for (let p = object; p !== null; p = Object.getPrototypeOf(p)) {
      if (platformPrototypes.has(p)) return true;
    }
    return false;
  }

  define(globalThis, 'structuredClone', function structuredClone(value, options = undefined) {
    if (arguments.length < 1) {
      throw new TypeError('structuredClone: 1 argument required, but only 0 present');
    }
    // transfer 是 Web IDL 的 sequence：不给就是空的，给了必须是能迭代的对象
    // （字符串能迭代，但它不是对象，照样不行）
    const transfer = dictionary(options, 'structuredClone').transfer;
    if (transfer !== undefined) {
      if (transfer === null || (typeof transfer !== 'object' && typeof transfer !== 'function') ||
          typeof transfer[Symbol.iterator] !== 'function') {
        throw new TypeError('structuredClone: options.transfer must be an array');
      }
      if (Array.from(transfer).length > 0) {
        throw namedError('DataCloneError',
          'structuredClone: options.transfer is not supported yet; ' +
          'leave it out and the ArrayBuffer is copied instead');
      }
    }
    return native.structuredClone(value, isPlatformObject,
                                  (message) => namedError('DataCloneError', message));
  });
})
