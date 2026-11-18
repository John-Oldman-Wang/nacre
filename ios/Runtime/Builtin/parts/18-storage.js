// 本地存储
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    defineNativeClass,
    has,
    kSubscribe,
    nativeCall,
    nativeOnly,
    subscribeNative,
  } = ctx;

  // ---------- 本地存储 ----------
  //
  // NSUserDefaults 存的是 plist 值。JS 侧逐层验一遍再过桥：不验的话
  // JSON.stringify 会把函数和 undefined 悄悄变成 null，而 null 在这里的含义
  // 是「删除」——写错一个类型就**静默删掉一个键**。原生侧还有第二道
  // （NSPropertyListSerialization），因为 ObjC 存非 plist 对象是抛 NSException，
  // 在我们这里就是崩溃。
  function plistValue(value, path, seen) {
    const t = typeof value;
    if (t === 'string' || t === 'boolean') return;
    if (t === 'number') {
      if (!Number.isFinite(value)) {
        throw new TypeError(path + ': NaN and Infinity cannot be stored');
      }
      return;
    }
    if (value !== null && t === 'object') {
      if (seen.has(value)) throw new TypeError(path + ': circular structures cannot be stored');
      seen.add(value);
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) plistValue(value[i], path + '[' + i + ']', seen);
      } else {
        const proto = Object.getPrototypeOf(value);
        if (proto !== Object.prototype && proto !== null) {
          const what = (value.constructor && value.constructor.name) || 'an object';
          throw new TypeError(path + ': only plain objects can be stored, got ' + what);
        }
        for (const k of Object.keys(value)) plistValue(value[k], path + '.' + k, seen);
      }
      seen.delete(value);
      return;
    }
    const what = value === null ? 'null' : t;
    throw new TypeError(
      path + ': ' + what + ' cannot be stored; only strings, finite numbers, booleans, ' +
      'arrays and plain objects of those');
  }

  function storageKey(key, what) {
    if (typeof key !== 'string') {
      throw new TypeError(what + ': key must be a string');
    }
    return key;
  }

  defineNativeClass('NSUserDefaults', class NSUserDefaults extends NSObject {
    constructor() { nativeOnly(new.target); }

    // objectForKey: / setObject:forKey: 在 JS 里就叫 get / set——ObjC 的 10 个
    // 取值器和 5 个设值器在动态类型下塌缩成这一对，既然必须重排，"object"
    // 这个词在 JS 里也没有意义（JS 里一切都是值）。裸映射不另留一份，
    // 否则就是同一件事两种写法。
    get(key) {
      return nativeCall(this, 'objectForKey:', [storageKey(key, 'get')]);
    }
    /** 写 null 等于删除，和 ObjC 的 setObject:nil 一致 */
    set(key, value) {
      const k = storageKey(key, 'set');
      if (value === null) { this.remove(k); return; }
      if (value === undefined) {
        throw new TypeError('set: value is undefined; pass null to remove the key');
      }
      plistValue(value, 'set(' + JSON.stringify(k) + ')', new Set());
      nativeCall(this, 'setObject:forKey:', [value, k]);
    }
    remove(key) {
      nativeCall(this, 'removeObjectForKey:', [storageKey(key, 'remove')]);
    }
    /** 没写过但 registerDefaults 注册过的键也算有 */
    has(key) {
      return this.get(storageKey(key, 'has')) !== null;
    }
    /** 注册「没写过时读到什么」。只影响读，不写盘，每次启动都要重新注册 */
    registerDefaults(table) {
      if (table === null || typeof table !== 'object' || Array.isArray(table)) {
        throw new TypeError('registerDefaults: needs a plain object');
      }
      plistValue(table, 'registerDefaults', new Set());
      nativeCall(this, 'registerDefaults:', [table]);
    }

    // 带类型的取值器。它们和 get **行为不同**——做 plist 的类型强制：存进去
    // 的是字符串 '42'，integerForKey 给 42 而 get 给 '42'。所以两边都留。
    // 带类型的 setter 不暴露：JS 的数字就是 double，setInteger 和 set 存进去
    // 的东西一样，那才是同一件事两种写法。
    stringForKey(key) {
      return nativeCall(this, 'stringForKey:', [storageKey(key, 'stringForKey')]);
    }
    integerForKey(key) {
      return nativeCall(this, 'integerForKey:', [storageKey(key, 'integerForKey')]);
    }
    doubleForKey(key) {
      return nativeCall(this, 'doubleForKey:', [storageKey(key, 'doubleForKey')]);
    }
    boolForKey(key) {
      return nativeCall(this, 'boolForKey:', [storageKey(key, 'boolForKey')]);
    }
    arrayForKey(key) {
      return nativeCall(this, 'arrayForKey:', [storageKey(key, 'arrayForKey')]);
    }
    dictionaryForKey(key) {
      return nativeCall(this, 'dictionaryForKey:', [storageKey(key, 'dictionaryForKey')]);
    }
    stringArrayForKey(key) {
      return nativeCall(this, 'stringArrayForKey:', [storageKey(key, 'stringArrayForKey')]);
    }

    // change 事件。原生侧挂的是 NSUserDefaultsDidChangeNotification，
    // 它**只在本进程改**的时候发
    [kSubscribe](type, on) { subscribeNative(this, type, on); }
  });


})
