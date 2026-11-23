// 桥：原生对象的包装、所有权镜像、过桥通道、参数转换。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 照 iOS 的 01-bridge.js 写的，只留第一条竖切用到的那几样。原生那一侧是
// android/runtime 的 NativeBridge.kt：交给引擎的「指针」是它发的编号，同一个
// Java 对象永远是同一个编号，所以这里拿到的永远是同一个包装。
(function (ctx) {
  'use strict';

  const { define, initWrapper, kHandle, native } = ctx;

  const nativeClasses = Object.create(null);
  // 反查：类 → 原生类名。构造时用它判断「被 new 的是不是运行时自己的类」
  const nativeClassNames = new WeakMap();

  function defineNativeClass(name, cls) {
    nativeClasses[name] = cls;
    nativeClassNames.set(cls, name);
    define(globalThis, name, cls);
    return cls;
  }

  // ---- 所有权镜像 ----
  //
  // 原生的 A 持有 B，A 的包装就也持有 B 的包装：布局持有子视图，页面持有内容视图。
  // 界面上的东西没有变量引用，包装和挂在上面的监听器也不会被回收。
  // 这张表只给 GC 当根，不参与任何查询，读都走原生（见 docs/internals/wrapper.md）
  const ownership = new WeakMap();  // owner 包装 -> Map(边名 -> 包装 | 包装数组)

  function ownSlot(owner) {
    let slot = ownership.get(owner);
    if (!slot) ownership.set(owner, (slot = new Map()));
    return slot;
  }
  // 单值边：owner.name 持有 value
  function own(owner, name, value) {
    if (value == null) {
      const slot = ownership.get(owner);
      if (slot) slot.delete(name);
    } else {
      ownSlot(owner).set(name, value);
    }
    return value;
  }
  // 多值边：加一个
  function ownOne(owner, name, value) {
    if (value == null) return;
    const slot = ownSlot(owner);
    const list = slot.get(name);
    if (!list) slot.set(name, [value]);
    else if (!list.includes(value)) list.push(value);
  }

  // ---- 参数转换：照 Web IDL（project.md 第 13 条）----

  function describeValue(v) {
    if (v === null) return 'null';
    if (typeof v === 'object' || typeof v === 'function') {
      return (v.constructor && v.constructor.name) || typeof v;
    }
    return typeof v === 'string' ? JSON.stringify(v) : String(v);
  }
  // 不可空的字符串：null 和 undefined 给空串，别的 String()
  function toText(v) {
    return v == null ? '' : String(v);
  }
  // 整数：Number() 后向零取整，不是有限数抛 TypeError
  function toInteger(v, where) {
    const n = Number(v);
    if (!Number.isFinite(n)) {
      throw new TypeError(where + ': expected a finite number, got ' + describeValue(v));
    }
    return Math.trunc(n);
  }
  // 要求是某个原生类的实例
  function requireInstance(v, Cls, where) {
    if (!(v instanceof Cls) || v[kHandle] === undefined) {
      throw new TypeError(where + ': expected a ' + nativeClassNames.get(Cls) + ', got ' + describeValue(v));
    }
    return v;
  }

  // ---- 过桥 ----

  // 「没有原生对象」：绕过构造函数建出来的（Object.create(X.prototype)），和 Chrome 一样报
  // Illegal invocation
  function requireNative(obj, what) {
    if (obj == null || obj[kHandle] === undefined) throw new TypeError(what + ': Illegal invocation');
  }

  function splitArgs(args) {
    const values = [];
    const handles = [];
    for (const a of args) {
      const isObject = a != null && a[kHandle] !== undefined;
      values.push(isObject ? null : a);
      handles.push(isObject ? a[kHandle] : 0);
    }
    return { values, handles };
  }

  function nativeGet(obj, name) {
    requireNative(obj, name);
    return JSON.parse(native.getProp(obj[kHandle], name));
  }
  // 写不进去时原生自己抛
  function nativeSet(obj, name, value) {
    requireNative(obj, name);
    native.setProp(obj[kHandle], name, value);
  }
  function nativeCall(obj, name, args) {
    requireNative(obj, name);
    const { values, handles } = splitArgs(args);
    return JSON.parse(native.call(obj[kHandle], name, values, handles));
  }
  function nativeCallObject(obj, name, args) {
    requireNative(obj, name);
    const { values, handles } = splitArgs(args);
    const result = native.callObj(obj[kHandle], name, values, handles);
    return result === undefined ? null : result;
  }
  // 类级的对象属性：没有实例，用类名定位
  function nativeClassObject(className, name) {
    const result = native.classObjProp(className, name);
    return result === undefined ? null : result;
  }
  // 某个事件类型的监听器从无到有、从有到无时告诉原生。只管通知，不碰对象的寿命
  function subscribeNative(target, type, on) {
    requireNative(target, 'addEventListener');
    native.subscribe(target[kHandle], type, on);
  }

  // ---- 构造 ----

  // 原生类一律 final，和 iOS 一样：JS 不实现 Java 的类（project.md 第 4 节「继承」）。
  // 拦不到 `class X extends TextView {}` 那一行本身，只能在 new 的时候说
  function finalCheck(newTarget) {
    if (nativeClassNames.has(newTarget)) return;
    let base = Object.getPrototypeOf(newTarget);
    while (typeof base === 'function' && !nativeClassNames.has(base)) {
      base = Object.getPrototypeOf(base);
    }
    const name = (newTarget && newTarget.name) || 'this class';
    const baseName = nativeClassNames.get(base) || 'a native class';
    throw new TypeError(
      'Illegal constructor: ' + name + ' extends ' + baseName +
      ', but subclassing native classes is not supported yet');
  }

  // 只能由系统或运行时建的类（Activity、Context）。包装工厂不走构造函数，所以无条件抛
  function nativeOnly(newTarget) {
    finalCheck(newTarget);
    throw new TypeError(
      'Illegal constructor: ' + (nativeClassNames.get(newTarget) || 'this class') +
      ' is created by the system, not by new');
  }

  // 继承链上的抽象类（ViewGroup）：自己不能 new，但不能挡住能 new 的子类
  function abstractOnly(newTarget, cls) {
    if (newTarget === cls) {
      throw new TypeError(
        'Illegal constructor: ' + nativeClassNames.get(cls) + ' is abstract and cannot be constructed');
    }
  }

  // JS 构造原生对象：先有 this，再让原生造出对象并和 this 绑定。构造链上每个类都调
  // 一次，只有「正在被 new 的那个类」真的去建
  function constructNative(wrapper, builtAs, className, args) {
    if (nativeClasses[className] !== builtAs) return;
    const { values, handles } = splitArgs(args);
    const handle = native.construct(className, values, handles, wrapper);
    if (!handle) throw new TypeError('cannot construct ' + className + ' with these arguments');
    Object.defineProperty(wrapper, kHandle, { value: handle });
  }

  // 原生先有、包装后建的那一路：引擎按原生给的类名找类，不走构造函数
  native.setWrapperFactory(function (className, handle) {
    const Cls = nativeClasses[className];
    if (Cls === undefined) return null;
    const wrapper = initWrapper(Object.create(Cls.prototype));
    Object.defineProperty(wrapper, kHandle, { value: handle });
    return wrapper;
  });

  // 原生发来的事件。现在只有不带数据的（click），派发一个普通的 Event，不可取消
  native.setObjectEventSink(function (wrapper, type, payload, rebuilt) {
    // 包装是为这次派发现建的，说明原来那个已经被回收，挂在上面的监听器也没了。
    // 正常不该发生：原生还在发事件，就说明有人持有它，镜像里却没有对应的边
    if (rebuilt) {
      console.warn('[Nacre] ' + wrapper.constructor.name + ' fired "' + type +
                   '" after its JS wrapper was collected; its listeners are gone ' +
                   'and this event was dropped.');
      return false;
    }
    wrapper.dispatchEvent(new ctx.Event(type, { cancelable: false }));
    return false;
  });

  Object.assign(ctx, {
    abstractOnly,
    constructNative,
    defineNativeClass,
    describeValue,
    finalCheck,
    nativeCall,
    nativeCallObject,
    nativeClassNames,
    nativeClassObject,
    nativeGet,
    nativeOnly,
    nativeSet,
    own,
    ownOne,
    requireInstance,
    requireNative,
    subscribeNative,
    toInteger,
    toText,
  });
})
