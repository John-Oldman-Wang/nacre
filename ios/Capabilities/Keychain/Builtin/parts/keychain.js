// Keychain 的 JS 那一半。
//
// 这是**能力包自己的 part**：它不在核心里，跟着 NacreKeychain.framework 走
// （Builtin/parts/）。写法和核心的 part 一样——整个文件是一个函数表达式，
// 运行时在核心的 part 全部跑完之后，用同一个 ctx 调它一次。
//
// 所以这里解构出来的名字（defineNativeClass、own、Application……）就是核心
// 给能力包的接口：它们是核心各个 part 末尾 Object.assign(ctx, {…}) 放进去的。
(function (ctx) {
  'use strict';

  const {
    Application,
    defineNativeClass,
    has,
    nativeCallAsync,
    nativeClassObject,
    nativeOnly,
    own,
  } = ctx;

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

  // application.keychain。
  //
  // 这个取值器原来写在 Application 的类体里——那样核心就认识 Keychain，能力
  // 也就拆不出去。现在由能力包自己挂到原型上：**装了这个包才有这个属性**，
  // 没装的时候 'keychain' in application 是 false，而不是一个读了才抛的占位
  // （那样类型是绿的、运行时才炸）。
  //
  // 描述符和类体里写的取值器一致：不可枚举、可配置、没有 setter。
  Object.defineProperty(Application.prototype, 'keychain', {
    configurable: true,
    enumerable: false,
    /** 令牌和密码的安全存放。全是 Promise */
    get() {
      return own(this, 'keychain', nativeClassObject('Keychain', 'default'));
    },
  });
})
