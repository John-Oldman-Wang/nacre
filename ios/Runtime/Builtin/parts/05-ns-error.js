// NSError：iOS 的错误。不能 new，只由运行时建（ctx.makePlatformError）。
//
// 两种用法，见 core 的 05-dom-exception.js：
//   出错的含义是 iOS 特有的 → 直接抛它，name 是分类名（BiometryLockoutError），
//                              映射不到分类时是 'NSError'
//   含义 Web 上有的         → 抛 DOMException，它挂在 cause 上，name 是 'NSError'
// domain 和 code 是系统给的原值。userInfo 不给（2026-11-22 定）。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const { define } = ctx;
  const kFromSystem = Symbol('fromSystem');

  class NSError extends Error {
    #name;
    #domain;
    #code;
    constructor(token, name, message, domain, code) {
      if (token !== kFromSystem) {
        throw new TypeError('NSError cannot be constructed; the runtime creates it from a system error');
      }
      super(message);
      this.#name = name;
      this.#domain = domain;
      this.#code = code;
    }
    get name() { return this.#name; }
    get domain() { return this.#domain; }
    get code() { return this.#code; }
  }
  for (const key of ['name', 'domain', 'code']) {
    Object.defineProperty(NSError.prototype, key, {
      ...Object.getOwnPropertyDescriptor(NSError.prototype, key), enumerable: true,
    });
  }
  Object.defineProperty(NSError.prototype, Symbol.toStringTag, {
    value: 'NSError', writable: false, enumerable: false, configurable: true,
  });

  // name 不给（undefined）时是 'NSError'；detail 是 { domain, code }，没有时给空串和 0
  ctx.makePlatformError = function (name, message, detail) {
    const domain = detail && typeof detail.domain === 'string' ? detail.domain : '';
    const code = detail && typeof detail.code === 'number' ? detail.code : 0;
    const label = typeof name === 'string' && name !== '' ? name : 'NSError';
    return new NSError(kFromSystem, label, message, domain, code);
  };
  ctx.NSError = NSError;
  define(globalThis, 'NSError', NSError);
});
