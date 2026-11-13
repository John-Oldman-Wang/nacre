// crypto，以及把公开的名字挂上 globalThis
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    Application,
    ErrorEvent,
    Event,
    EventTarget,
    PromiseRejectionEvent,
    application,
    define,
    native,
  } = ctx;

  const INTEGER_ARRAYS = [
    Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array,
    Int32Array, Uint32Array, BigInt64Array, BigUint64Array,
  ];
  // Web 用 DOMException，我们没有那个类，照 fetch 的做法给 Error 改名字
  function namedError(name, message) {
    const err = new Error(message);
    err.name = name;
    return err;
  }
  function fillRandom(array) {
    if (!native.randomFill(array)) {
      throw namedError('OperationError', 'the system random source failed');
    }
    return array;
  }
  const HEX = [];
  for (let i = 0; i < 256; i++) HEX.push((i + 0x100).toString(16).slice(1));

  let allowCrypto = false;
  class Crypto {
    constructor() {
      if (!allowCrypto) throw new TypeError('Illegal constructor');
    }
    // 填满传进来的数组，再把它原样返回。两种拒绝是 Web 规定的
    getRandomValues(array) {
      if (!ArrayBuffer.isView(array)) {
        throw new TypeError('getRandomValues needs an integer typed array');
      }
      if (!INTEGER_ARRAYS.some((T) => array instanceof T)) {
        throw namedError('TypeMismatchError',
          'getRandomValues needs an integer typed array; ' +
          'Float arrays and DataView are not accepted');
      }
      if (array.byteLength > 65536) {
        throw namedError('QuotaExceededError',
          'getRandomValues can fill at most 65536 bytes per call, got ' + array.byteLength);
      }
      return fillRandom(array);
    }
    // 第 4 版 UUID：122 个随机位，剩下 6 位是版本号和变体
    randomUUID() {
      const b = fillRandom(new Uint8Array(16));
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      return HEX[b[0]] + HEX[b[1]] + HEX[b[2]] + HEX[b[3]] + '-' +
             HEX[b[4]] + HEX[b[5]] + '-' + HEX[b[6]] + HEX[b[7]] + '-' +
             HEX[b[8]] + HEX[b[9]] + '-' +
             HEX[b[10]] + HEX[b[11]] + HEX[b[12]] + HEX[b[13]] + HEX[b[14]] + HEX[b[15]];
    }
  }
  allowCrypto = true;
  const crypto = new Crypto();
  allowCrypto = false;
  define(globalThis, 'Crypto', Crypto);
  define(globalThis, 'crypto', crypto);

  define(globalThis, 'Event', Event);
  define(globalThis, 'ErrorEvent', ErrorEvent);
  define(globalThis, 'PromiseRejectionEvent', PromiseRejectionEvent);
  define(globalThis, 'EventTarget', EventTarget);
  define(globalThis, 'Application', Application);
  define(globalThis, 'application', application);

  delete globalThis.__nacre_native;

})
