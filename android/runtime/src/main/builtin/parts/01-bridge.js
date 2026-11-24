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
  // 多值边：去掉一个
  function disown(owner, name, value) {
    const slot = ownership.get(owner);
    const list = slot === undefined ? undefined : slot.get(name);
    if (!list) return;
    const i = list.indexOf(value);
    if (i >= 0) list.splice(i, 1);
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
  // 可空的字符串：null 和 undefined 是 null，别的 String()
  function toTextOrNull(v) {
    return v == null ? null : String(v);
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
  // 写不进去时原生自己抛。枚举属性写了不认识的值：原生不抛，把那句话交回来，值没动，
  // 打成警告（和 iOS 一样）
  function nativeSet(obj, name, value) {
    requireNative(obj, name);
    const warning = native.setProp(obj[kHandle], name, value);
    if (warning !== undefined) console.warn('[Nacre] ' + warning + ', ignored');
  }
  function nativeCall(obj, name, args) {
    requireNative(obj, name);
    const { values, handles } = splitArgs(args);
    return JSON.parse(native.call(obj[kHandle], name, values, handles));
  }
  // 返回 Promise 的方法：结果由原生在后台做完之后兑现
  function nativeCallAsync(obj, name, args) {
    requireNative(obj, name);
    const { values, handles } = splitArgs(args);
    return native.callAsync(obj[kHandle], name, values, handles);
  }
  function nativeCallObject(obj, name, args) {
    requireNative(obj, name);
    const { values, handles } = splitArgs(args);
    const result = native.callObj(obj[kHandle], name, values, handles);
    return result === undefined ? null : result;
  }
  // 返回值不是原生对象的类方法（core 的 Intl 用它，类名 NacreIntl 只是桥上的地址）
  function nativeClassCallValue(className, name, args) {
    const { values, handles } = splitArgs(args);
    return JSON.parse(native.classCallValue(className, name, values, handles));
  }
  // 返回一个原生对象的类方法（Typeface.create）。null 是 null
  function nativeClassCallObject(className, name, args) {
    const { values, handles } = splitArgs(args);
    const result = native.classCall(className, name, values, handles);
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

  // ---- JS 层的继承（2026-11-23 定）----
  //
  // JS 的类可以继承原生类，但继承只在 JS 这一层：原生那边建的永远是原型链上最近的
  // 那个原生类，原生世界里没有 JS 子类这个类型。子类覆写的方法只对 JS 自己的调用
  // 生效，系统不会来调；系统要告诉 JS 什么，只走事件。所以原生不持有任何 JS 对象。

  // 原型链上离 cls 最近的原生类（cls 自己是原生类就是它自己）
  function nearestNative(cls) {
    let c = cls;
    while (typeof c === 'function' && !nativeClassNames.has(c)) c = Object.getPrototypeOf(c);
    return typeof c === 'function' ? c : undefined;
  }

  // core 的内置脚本（23-fetch 的 Blob）在构造时调它来拦继承。Android 是 JS 层的继承，
  // 不拦：和 Web 一样，Blob 能继承
  function finalCheck() {}

  // 只能由系统建的类（Activity、Context）：自己和它们的 JS 子类都不能 new。
  // 包装工厂不走构造函数，所以这里无条件抛
  function nativeOnly(newTarget) {
    const name = nativeClassNames.get(nearestNative(newTarget)) || 'this class';
    throw new TypeError('Illegal constructor: ' + name + ' is created by the system, not by new');
  }

  // 抽象类（ViewGroup）：最近的原生类是它，就没有东西可建
  function abstractOnly(newTarget, cls) {
    if (nearestNative(newTarget) === cls) {
      throw new TypeError(
        'Illegal constructor: ' + nativeClassNames.get(cls) +
        ' is abstract and cannot be constructed; extend a concrete class such as LinearLayout');
    }
  }

  // JS 构造原生对象：先有 this，再让原生造出对象并和 this 绑定。构造链上每个原生类
  // 都调一次，只有「new.target 最近的原生类」那一层真的去建
  function constructNative(wrapper, newTarget, className, args) {
    if (nativeClassNames.get(nearestNative(newTarget)) !== className) return;
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

  // ---- 原生发来的事件 ----
  //
  // 原生发事件时带着「用哪个类建」（eventClass，core 的 05-events.js 登记过的名字）。
  // 负载是一个字典时每一项是一个字段；不是字典时（一段文字、一个 Blob）挂在这个类
  // 登记的那个字段上，按事件类认，不按事件名（message、error 这些名字太泛）
  const payloadField = new Map([
    ['MessageEvent', 'data'],
    ['ErrorEvent', 'message'],
  ]);
  // 事件带的字段要换算时在这里登记：事件类名 → (init, 发事件的对象) => init
  const eventFieldConverters = new Map([
    // WebSocket 的消息：origin 是连接地址的源，照 Web
    ['MessageEvent', (init, socket) => {
      let origin = '';
      try { origin = new ctx.URL(socket.url).origin; } catch (err) { origin = ''; }
      return { ...init, origin };
    }],
  ]);
  // 这几类的事件原生总是发，不看有没有人订
  const alwaysEmitted = new Set(['WebSocket']);

  native.setObjectEventSink(function (wrapper, type, payload, rebuilt, cancelable, answerField,
                                      eventClass) {
    // 包装是为这次派发现建的，说明原来那个已经被回收，挂在上面的监听器也没了。
    // 正常不该发生：原生还在发事件，就说明有人持有它，镜像里却没有对应的边
    if (rebuilt && !alwaysEmitted.has(wrapper.constructor.name)) {
      console.warn('[Nacre] ' + wrapper.constructor.name + ' fired "' + type +
                   '" after its JS wrapper was collected; its listeners are gone ' +
                   'and this event was dropped.');
      return false;
    }
    let EventClass = ctx.Event;
    if (typeof eventClass === 'string') {
      const found = ctx.eventClasses.get(eventClass);
      if (found !== undefined) {
        EventClass = found;
      } else {
        console.warn('[Nacre] the native side fired "' + type + '" as ' + eventClass +
                     ', which is not a known event class; dispatching a plain Event');
      }
    }
    let init = {};
    if (payload !== undefined && payload !== null) {
      const field = payloadField.get(eventClass);
      if (field !== undefined) {
        init[field] = payload;
      } else if (typeof payload === 'object' && Object.getPrototypeOf(payload) === Object.prototype) {
        init = { ...payload };
      }
    }
    const convert = eventFieldConverters.get(eventClass);
    if (convert !== undefined) init = convert(init, wrapper);
    init.cancelable = false;
    wrapper.dispatchEvent(new EventClass(type, init));
    // WebSocket 关掉了：系统不再拿着它，这边也放开。放在派发之后，监听器里还要用它。
    // 连接失败走的也是这里：原生在 error 之后总会补一个 close
    if (type === 'close' && ctx.WebSocketClass !== undefined && wrapper instanceof ctx.WebSocketClass) {
      disown(ctx.application, 'webSockets', wrapper);
    }
    return false;
  });

  Object.assign(ctx, {
    abstractOnly,
    constructNative,
    defineNativeClass,
    describeValue,
    disown,
    finalCheck,
    nativeCall,
    nativeCallAsync,
    nativeCallObject,
    nativeClassNames,
    nativeClassCallObject,
    nativeClassCallValue,
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
    toTextOrNull,
  });
})
