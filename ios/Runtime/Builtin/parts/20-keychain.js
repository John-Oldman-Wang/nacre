// Keychain
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const { defineNativeClass, has, nativeCallAsync, nativeOnly } = ctx;

  // ---------- Keychain ----------
  //
  // 和 storage 的形状一样，但**全是 Promise**：Keychain 读写走 securityd 的
  // XPC，是进程间通信不是内存读写，设备锁着时还会阻塞——而 JS 在主线程。
  //
  // 和前两步真正的区别是**安全语义是 API 的一部分**：accessible 决定存的
  // 东西什么时候能读到、换了新设备还在不在，而它**存进去就改不了**。
  function keychainKey(value, what) {
    if (typeof value !== 'string' || value === '') {
      throw new TypeError(what + ': key must be a non-empty string');
    }
    return value;
  }
  function accessibleOf(options, what) {
    const o = options || {};
    if (o.accessible === undefined) return null;   // 原生侧用默认值
    if (typeof o.accessible !== 'string') {
      throw new TypeError(what + ': accessible must be a string');
    }
    return o.accessible;
  }

  defineNativeClass('Keychain', class Keychain extends NSObject {
    constructor() { nativeOnly(new.target); }

    /** 没有这个键给 null，不 reject——和 storage.get 一致 */
    get(key) {
      return nativeCallAsync(this, 'get', [keychainKey(key, 'get')]);
    }
    /** 没有这个键给 null */
    getBytes(key) {
      return nativeCallAsync(this, 'getBytes', [keychainKey(key, 'getBytes')]);
    }
    /**
     * accessible 不写就是 'whenUnlockedThisDeviceOnly'：设备解锁时能读，
     * **不跟着备份迁移到新设备**。要换手机还保持登录就显式写别的。
     */
    set(key, value, options) {
      const k = keychainKey(key, 'set');
      if (typeof value !== 'string') {
        throw new TypeError('set: value must be a string; use setBytes for binary');
      }
      return nativeCallAsync(this, 'set', [k, value, accessibleOf(options, 'set')])
        .then(() => undefined);
    }
    setBytes(key, blob, options) {
      const k = keychainKey(key, 'setBytes');
      if (!(blob instanceof Blob)) {
        throw new TypeError('setBytes: the second argument must be a Blob');
      }
      return nativeCallAsync(this, 'setBytes', [k, blob, accessibleOf(options, 'setBytes')])
        .then(() => undefined);
    }
    /** 本来就没有也算成功 */
    remove(key) {
      return nativeCallAsync(this, 'remove', [keychainKey(key, 'remove')])
        .then(() => undefined);
    }
    has(key) {
      return nativeCallAsync(this, 'has', [keychainKey(key, 'has')]);
    }
    keys() {
      return nativeCallAsync(this, 'keys', []);
    }
    /** 删掉这个 App 存的全部条目 */
    clear() {
      return nativeCallAsync(this, 'clear', []).then(() => undefined);
    }
  });


})
