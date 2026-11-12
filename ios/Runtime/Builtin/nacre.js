// Nacre 运行时的内置脚本：在 main.js 之前执行，装上层 API。
// 这里定义的 EventTarget / Event 不是 ECMAScript 的一部分，V8 不提供，由运行时补。
'use strict';

(function (native) {
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
  // 订阅是一条**所有权边**：原生那边登记了对这个对象的兴趣，它的 JS 包装
  // 就不能死——包装一死，后面来的事件会落到一个新包装上，监听器全丢。
  const subscribed = new Set();

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
        list = [];
        this[kListeners].set(t, list);
      }
      // 同一个 (type, callback) 只注册一次，和标准一致
      for (const entry of list) if (entry.callback === callback) return;
      list.push({ callback, once });
      // 这个类型从无到有：告诉原生「我要听了」
      if (list.length === 1) this[kSubscribe](t, true);
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
  const kHandle = Symbol('nativeHandle');

  const nativeClasses = Object.create(null);
  // 反查：类 → 原生类名。构造时用它判断「被 new 的是不是运行时自己的类」
  const nativeClassNames = new WeakMap();

  function defineNativeClass(name, cls) {
    nativeClasses[name] = cls;
    nativeClassNames.set(cls, name);
    define(globalThis, name, cls);
    return cls;
  }

  // 原生属性的读写。值走 JSON 编码，所以字符串、数字、布尔、数组、字典都能过。
  // 这样加一个属性不用动 C++，只要在 iOS 层的分发表里加一行。
  function nativeGet(obj, name) {
    return JSON.parse(native.getProp(obj[kHandle], name));
  }
  // 写不进去时原生层自己抛，这里什么都不用做。错误信息也由原生层凑：
  // 可选值列表就在它那张表里，而且它知道是哪个类的哪个属性——按属性名
  // 索引的表会撞（UIControl.state 和 UIGestureRecognizer.state 是两个
  // 毫无关系的枚举）。
  function nativeSet(obj, name, value) {
    native.setProp(obj[kHandle], name,
                   JSON.stringify(value === undefined ? null : value));
  }
  function nativeGetObject(obj, name) {
    const result = native.getObjProp(obj[kHandle], name);
    return result === undefined ? null : result;
  }
  function nativeCallAsync(obj, name, args) {
    const { values, handles } = splitArgs(args, name);
    return native.callAsync(obj[kHandle], name, JSON.stringify(values), handles);
  }
  function nativeSetObject(obj, name, value) {
    native.setObjProp(obj[kHandle], name, value == null ? 0 : value[kHandle]);
  }
  function nativeCallVoid(obj, name) {
    native.callVoid(obj[kHandle], name);
  }

  // ---- 所有权镜像 ----
  //
  // 原生对象的 JS 包装是弱的（Engine 里 SetWeak）。包装被回收之后再从原生
  // 读回来，拿到的是**按原生类名新建的**包装——ES 子类实例会变回基类，挂在
  // 包装上的 JS 状态和事件监听器全丢（EmitObjectEvent 也走同一条路）。
  //
  // 修法是在 JS 侧把原生的所有权边补出来：原生对象 A 持有 B，A 的包装就也
  // 持有 B 的包装。这样从 application 出发可达的原生对象，包装一定活着。
  // 原生用引用计数，weak 边是为了断环；V8 是追踪式 GC，环不要钱——所以边的
  // 强度要按 V8 的需求重定，不能照抄原生。
  //
  // 用 WeakMap 不用包装上的属性：JS 侧完全看不见（getOwnPropertySymbols 也
  // 列不出来），而且 owner 一死整条记录跟着死。
  //
  // 代价是保活可能过久——UIKit 自己改原生的树时（pop 一个控制器之类）我们
  // 看不到。但它**只会多留一份引用，永远不会给错答案**：所有的读都走原生，
  // 这张表只给 GC 当根。读 subviews / scenes 时按原生的真相整层重建，碰到
  // 哪层修哪层。
  const ownership = new WeakMap();  // owner 包装 -> Map(边名 -> 包装 | 包装数组)

  function ownSlot(owner) {
    let slot = ownership.get(owner);
    if (!slot) ownership.set(owner, (slot = new Map()));
    return slot;
  }
  // 单值边：owner.name 持有 value
  function own(owner, name, value) {
    if (owner != null) {
      if (value == null) {
        const slot = ownership.get(owner);
        if (slot) slot.delete(name);
      } else {
        ownSlot(owner).set(name, value);
      }
    }
    return value;
  }
  // 多值边：按原生的真相整层重建
  function ownAll(owner, name, values) {
    if (owner != null) ownSlot(owner).set(name, Array.prototype.slice.call(values));
    return values;
  }
  // 多值边：加一个
  function ownOne(owner, name, value) {
    if (owner == null || value == null) return;
    const slot = ownSlot(owner);
    const list = slot.get(name);
    if (!list) slot.set(name, [value]);
    else if (!list.includes(value)) list.push(value);
  }
  // 多值边：去掉一个
  function disown(owner, name, value) {
    const slot = owner == null ? undefined : ownership.get(owner);
    const list = slot === undefined ? undefined : slot.get(name);
    if (!list) return;
    const i = list.indexOf(value);
    if (i >= 0) list.splice(i, 1);
  }
  // 所有权边上的对象属性。和 nativeGetObject / nativeSetObject 的差别只是
  // 记一笔。回边不走这里：superview、window、windowScene 在原生侧也不是
  // 持有，而且它们的另一端已经被上游的所有权边兜住了。
  // 只问镜像，不过桥。给那些「原生读回来会换一个对象」的属性用：
  // CAShapeLayer.path 存的是 CGPath，每次读都现包一个新的 UIBezierPath，
  // 而写进去的那个对象 JS 这边是有的——镜像里有就还它，身份才稳得住。
  // 返回 undefined 表示镜像里没有（包装被回收重建过），由调用方决定怎么办。
  function ownedValue(owner, name) {
    const slot = owner == null ? undefined : ownership.get(owner);
    return slot === undefined ? undefined : slot.get(name);
  }
  function nativeGetOwned(obj, name) {
    return own(obj, name, nativeGetObject(obj, name));
  }
  function nativeSetOwned(obj, name, value) {
    nativeSetObject(obj, name, value);
    own(obj, name, value);
  }
  // 锚点。原生侧 NSLayoutAnchor 对它的 item 是 **weak**，而且 iOS 上根本读不
  // 回来（NSLayoutAnchor.item 标着 API_UNAVAILABLE(ios)）。所以这条回边只能
  // 在给出锚点的那一刻记下来——实测不补的后果不是数据过期，是 **SIGSEGV**：
  // JS 只留锚点、view 的包装被 GC 之后，拿这个锚点建约束再激活，进程直接段错误。
  function anchorOf(owner, name) {
    requireNative(owner, name);
    const anchor = nativeGetObject(owner, name);
    own(anchor, 'item', owner);
    return anchor;
  }
  // 约束强持有两端的锚点（原生是 copy，实测对不可变的锚点返回自己），
  // 锚点又持有各自的 view，所以一条约束能把两个 view 都兜住。
  function constraintOf(result, first, second) {
    own(result, 'firstAnchor', first);
    own(result, 'secondAnchor', second);
    return result;
  }

  // 换父节点时原生会自动从旧父节点摘掉，镜像要跟上。没有原生对象时返回
  // null——那种 view 还没进任何树。
  // options 对象里某个成员「带没带」。照 Web IDL 的约定：值是 undefined 的
  // 成员视为没带，{ scale: undefined } 等于 {}。
  //
  // 不能写 'key' in o——那只看键在不在，undefined 会被当成有效值一路传到
  // 原生（过 JSON 变成 null，原生拿到 NSNull）。条件表达式里顺手写出来的
  // { atIndex: cond ? 0 : undefined } 是很常见的写法，不该因此出错
  function has(o, key) {
    return o[key] !== undefined;
  }

  function superviewOf(view) {
    if (view == null || view[kHandle] === undefined) return null;
    return nativeGetObject(view, 'superview');
  }
  // 同一件事，手势识别器那一侧：它现在挂在哪个视图上
  function gestureViewOf(recognizer) {
    if (recognizer == null || recognizer[kHandle] === undefined) return null;
    return nativeGetObject(recognizer, 'view');
  }
  // 带参数的方法。selector 是完整的 ObjC selector，JS 层的
  // 「第一段 + options」在各自的方法里还原成它。
  // 对象参数在 JSON 里留 null，句柄按同样的下标单独传。
  // 看着像原生对象、却没有句柄 —— 原生对象还没创建。继承那条路已经在
  // 构造时就拦掉了（见 finalCheck），所以现在只剩一种来头：
  //   new UIWindow()   还没绑场景
  // 不拦的话它会走「普通值」那条路，句柄填 0，原生收到 nil 然后**静默
  // 什么都不做**——实测 parent.addSubview(子类实例) 就是这个下场。
  // 和只读属性静默失败是同一类错，所以一样要抛。
  function rejectUnbacked(value, where) {
    if (value instanceof NSObject) {
      const name = (value.constructor && value.constructor.name) || 'object';
      throw new TypeError(
        where + ': ' + name + ' has no native object yet, so it cannot be passed as an argument');
    }
  }
  function splitArgs(args, where) {
    const list = args || [];
    const values = [];
    const handles = [];
    for (const a of list) {
      const isObject = a != null && a[kHandle] !== undefined;
      if (!isObject) rejectUnbacked(a, where || 'call');
      values.push(isObject ? null : a);
      handles.push(isObject ? a[kHandle] : 0);
    }
    return { values, handles };
  }
  function nativeCall(obj, selector, args) {
    requireNative(obj, selector);
    const { values, handles } = splitArgs(args, selector);
    return JSON.parse(
      native.call(obj[kHandle], selector, JSON.stringify(values), handles));
  }
  function nativeCallObject(obj, selector, args) {
    requireNative(obj, selector);
    const { values, handles } = splitArgs(args, selector);
    const result =
      native.callObj(obj[kHandle], selector, JSON.stringify(values), handles);
    return result === undefined ? null : result;
  }
  // 可写的原生对象数组属性。值按「每个元素一个句柄」传，和方法的数组参数同路
  function nativeSetObjectArray(obj, name, values) {
    requireNative(obj, name);
    const list = Array.from(values || []);
    const handles = list.map((v) => {
      if (v == null) return 0;
      if (v[kHandle] === undefined) rejectUnbacked(v, name);
      return v[kHandle] || 0;
    });
    native.setObjArray(obj[kHandle], name, handles);
  }
  function nativeGetObjectArray(obj, name) {
    requireNative(obj, name);
    return native.getObjArray(obj[kHandle], name);
  }
  // 返回原生对象数组的方法。参数规则和 nativeCall 一样
  function nativeCallObjectArray(obj, selector, args) {
    requireNative(obj, selector);
    const { values, handles } = splitArgs(args, selector);
    return native.callObjArray(obj[kHandle], selector, JSON.stringify(values), handles);
  }
  // 带参数的类方法，比如 UIFont.systemFontOfSize(17)
  function nativeClassCall(className, selector, args) {
    const { values, handles } = splitArgs(args, className + '.' + selector);
    const result =
      native.classCall(className, selector, JSON.stringify(values), handles);
    return result === undefined ? null : result;
  }
  // 返回值不是原生对象的类方法，比如 CATransaction.begin()
  function nativeClassCallValue(className, selector, args) {
    const { values, handles } = splitArgs(args, className + '.' + selector);
    return JSON.parse(
      native.classCallValue(className, selector, JSON.stringify(values), handles));
  }
  // 类级属性（ObjC 的 @property(class, readonly)）。没有实例，用类名定位。
  function nativeClassObject(className, name) {
    const result = native.classObjProp(className, name);
    return result === undefined ? null : result;
  }
  // JS 构造原生对象：先有 this，再让原生造出对象并和 this 绑定。
  // 和包装工厂方向相反——那边是原生对象先有、JS 包装后建。
  function constructNative(wrapper, builtAs, className, args) {
    // 构造链上每个类都调一次，只有「正在被 new 的那个类」真的去建。
    // 新加一个类照抄这一行就行，不用判断「会不会被别的类继承」——
    // 以前那条规则漏过一次（UINavigationController），也抄错过一次（UIButton）。
    if (nativeClasses[className] !== builtAs) return;
    // 和方法通道同一个拆法：标量进 values，对象进 handles，对象位在
    // values 里留 null。**原来只传 handles**，所以 new 一个要字符串或
    // 数字的类做不了——CAMediaTimingFunction、弹簧的感知时长初始化器、
    // WebSocket 的 url 都撞过这堵墙
    const { values, handles } = splitArgs(args, 'new ' + className);
    const handle = native.construct(className, JSON.stringify(values), handles, wrapper);
    // 建不出来就抛，别留一个没句柄的空壳——那种对象之后每碰一下都报
    // 「还没连接到场景」，根本看不出真正的原因在构造这一步
    if (!handle) {
      throw new TypeError('cannot construct ' + className + ' with these arguments');
    }
    Object.defineProperty(wrapper, kHandle, { value: handle });
  }

  // 只有被原生侧创建时才允许构造。用于系统给的对象（场景、session）。
  // 原生对象还没创建时，除了 windowScene 之外的访问都没有事实可依据，
  // 与其返回一个编出来的值，不如直接报错
  // 「没有原生对象」有两种，病因完全不同，所以分开报：
  //   走过构造函数但还没绑   → 只剩 new UIWindow() 等场景这一种，是**合法**状态
  //   没走过任何构造函数     → Object.create(X.prototype) 出来的，原型链对但
  //                            一个内部状态都没有。Chrome 对这种报 Illegal
  //                            invocation，我们跟它一致
  // 判据是 kListeners：它由 EventTarget 的构造函数（和包装工厂）装上，
  // 绕过构造的对象上没有。
  function requireNative(obj, what) {
    if (obj[kHandle] !== undefined) return;
    if (obj[kListeners] === undefined) {
      throw new TypeError(what + ': Illegal invocation');
    }
    throw new TypeError(
      what + ': this object is not connected to a scene yet, so no native object exists');
  }

  // 原生类一律是 final。运行时还没有把覆写转发回 JS 的机制（M2），子类的
  // super() 建不出原生对象——以前它静默给一个空壳，等到第一次读属性才在
  // 三十行之外抛「还没连接到场景」，指向完全无关的地方。现在在构造那一刻说。
  // 所有原生类的构造链都经过 NSObject，所以拦这一处就够。
  //
  // 拦不到 `class X extends UIView {}` 那一行本身：JS 没有「拒绝被继承」的
  // 钩子，extends 只是读 prototype 再 setPrototypeOf，没有可以挂的陷阱。
  // 所以错误信息里把两个类名都点出来，让它指得回去。
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

  // 只能由运行时的包装工厂建的类（UIColor、CALayer、场景…）。
  // 工厂不走构造函数，所以这里无条件抛。
  function nativeOnly(newTarget) {
    finalCheck(newTarget);   // 是子类化就先报子类化，那个错更接近原因
    throw new TypeError(
      'Illegal constructor: ' + (nativeClassNames.get(newTarget) || 'this class') +
      ' is created by the runtime, not by new');
  }

  // 继承链上的空壳：ObjC 侧没有可用的 init，自己不可直接构造，
  // 但不能挡住可构造的子类。new.target 在子类的 super() 里是子类。
  function shellOnly(newTarget, cls, name) {
    if (newTarget === cls) {
      throw new TypeError('Illegal constructor: ' + name + ' cannot be constructed');
    }
  }

  // ---- 结构体 ----
  // ObjC 里结构体按值传递，`view.frame.x = 10` 是编译错误（改的是一个
  // 临时副本）。JS 没有值类型，用普通对象表示的话这行会**静默无效**，
  // 所以每个字段都定义成带 setter 的访问器，赋值直接抛。
  // 不用 Object.freeze：冻结只在严格模式下抛，而用户的 JS 是普通脚本。
  function defineStructFields(target, fields) {
    for (const [name, value] of fields) {
      Object.defineProperty(target, name, {
        enumerable: true,
        get: () => value,
        set() {
          throw new TypeError(
            name + ' is read-only: structs are values, assign a whole new one instead');
        },
      });
    }
    Object.preventExtensions(target);
  }
  function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  const CGPoint = define(globalThis, 'CGPoint', class CGPoint {
    constructor(x, y) {
      defineStructFields(this, [['x', num(x)], ['y', num(y)]]);
    }
    toString() { return 'CGPoint(' + this.x + ', ' + this.y + ')'; }
  });

  const CGSize = define(globalThis, 'CGSize', class CGSize {
    constructor(width, height) {
      defineStructFields(this, [['width', num(width)], ['height', num(height)]]);
    }
    toString() { return 'CGSize(' + this.width + ', ' + this.height + ')'; }
  });

  // 帧率区间。preferred 给 0 表示跟硬件走（默认就是三个 0）
  const CAFrameRateRange = define(globalThis, 'CAFrameRateRange', class CAFrameRateRange {
    constructor(minimum, maximum, preferred) {
      defineStructFields(this, [['minimum', num(minimum)], ['maximum', num(maximum)],
                                ['preferred', num(preferred === undefined ? 0 : preferred)]]);
    }
    toString() {
      return 'CAFrameRateRange(' + this.minimum + ', ' + this.maximum + ', ' +
             this.preferred + ')';
    }
  });

  // 线上格式是扁平的四个数，和 ObjC 的 {origin, size} 嵌套结构对应关系
  // 由 origin / size 两个取值器给出——它们在原型上，所以不参与
  // JSON.stringify，线上只走扁平的四个字段。
  const CGRect = define(globalThis, 'CGRect', class CGRect {
    constructor(x, y, width, height) {
      defineStructFields(this, [['x', num(x)], ['y', num(y)],
                                ['width', num(width)], ['height', num(height)]]);
    }
    get origin() { return new CGPoint(this.x, this.y); }
    get size() { return new CGSize(this.width, this.height); }
    toString() {
      return 'CGRect(' + this.x + ', ' + this.y + ', ' +
             this.width + ', ' + this.height + ')';
    }
  });

  const UIEdgeInsets = define(globalThis, 'UIEdgeInsets', class UIEdgeInsets {
    constructor(top, left, bottom, right) {
      defineStructFields(this, [['top', num(top)], ['left', num(left)],
                                ['bottom', num(bottom)], ['right', num(right)]]);
    }
    toString() {
      return 'UIEdgeInsets(' + this.top + ', ' + this.left + ', ' +
             this.bottom + ', ' + this.right + ')';
    }
  });

  // 带方向的边距。和 UIEdgeInsets 的区别只在左右：leading 是文字开始的
  // 那一侧（从左往右的语言里是左），trailing 是结束的那一侧
  const NSDirectionalEdgeInsets = define(globalThis, 'NSDirectionalEdgeInsets',
                                         class NSDirectionalEdgeInsets {
    constructor(top, leading, bottom, trailing) {
      defineStructFields(this, [['top', num(top)], ['leading', num(leading)],
                                ['bottom', num(bottom)], ['trailing', num(trailing)]]);
    }
    toString() {
      return 'NSDirectionalEdgeInsets(' + this.top + ', ' + this.leading + ', ' +
             this.bottom + ', ' + this.trailing + ')';
    }
  });

  // 2×3 的仿射矩阵：
  //
  //   | a  b  0 |
  //   | c  d  0 |
  //   | tx ty 1 |
  //
  // ObjC 侧造它的是一组 **C 函数**（CGAffineTransformMakeScale 之类），不是
  // 方法。但那几个函数全是**纯算术**——scale 就是把 a、d 填上，rotation 就是
  // 一对 sin/cos——所以不用把它们跨桥暴露，JS 自己算得出来。过桥的只有六个
  // 数。这一条省掉了「C 函数怎么暴露」那个一直悬着的问题。
  const CGAffineTransform = define(globalThis, 'CGAffineTransform',
                                   class CGAffineTransform {
    constructor(a, b, c, d, tx, ty) {
      defineStructFields(this, [['a', num(a)], ['b', num(b)], ['c', num(c)],
                                ['d', num(d)], ['tx', num(tx)], ['ty', num(ty)]]);
    }

    /** 单位矩阵：什么都不变 */
    static get identity() { return new CGAffineTransform(1, 0, 0, 1, 0, 0); }
    /** 缩放。只给一个参数时两轴相同 */
    static scale(sx, sy) {
      const x = num(sx);
      return new CGAffineTransform(x, 0, 0, sy === undefined ? x : num(sy), 0, 0);
    }
    /** 平移 */
    static translation(tx, ty) {
      return new CGAffineTransform(1, 0, 0, 1, num(tx), num(ty));
    }
    /** 旋转，**弧度**不是角度（和 Core Graphics 一致） */
    static rotation(radians) {
      const r = num(radians);
      const cos = Math.cos(r);
      const sin = Math.sin(r);
      return new CGAffineTransform(cos, sin, -sin, cos, 0, 0);
    }

    /** 先应用 this 再应用 other，等价于 CGAffineTransformConcat(this, other) */
    concat(other) {
      const o = structArg(other, TRANSFORM_FIELDS, 'concat');
      return new CGAffineTransform(
        this.a * o.a + this.b * o.c,
        this.a * o.b + this.b * o.d,
        this.c * o.a + this.d * o.c,
        this.c * o.b + this.d * o.d,
        this.tx * o.a + this.ty * o.c + o.tx,
        this.tx * o.b + this.ty * o.d + o.ty);
    }
    /** 逆矩阵。不可逆（行列式为 0）时返回 null，不抛也不悄悄给单位矩阵 */
    invert() {
      const det = this.a * this.d - this.b * this.c;
      if (det === 0) return null;
      return new CGAffineTransform(
        this.d / det, -this.b / det, -this.c / det, this.a / det,
        (this.c * this.ty - this.d * this.tx) / det,
        (this.b * this.tx - this.a * this.ty) / det);
    }
    get isIdentity() {
      return this.a === 1 && this.b === 0 && this.c === 0 &&
             this.d === 1 && this.tx === 0 && this.ty === 0;
    }
    toString() {
      return 'CGAffineTransform(' + this.a + ', ' + this.b + ', ' + this.c +
             ', ' + this.d + ', ' + this.tx + ', ' + this.ty + ')';
    }
  });

  // 读出来的永远是结构体类的实例；写进去的可以是实例，也可以是带同样
  // 字段的普通对象（写入宽、读出窄，和颜色同一套规则）。
  // 缺字段直接抛，不默认补 0——那是静默出错。
  function structArg(value, fields, what) {
    if (value == null || typeof value !== 'object') {
      throw new TypeError(
        what + ' needs an object with all of: ' + fields.join(', '));
    }
    const out = {};
    for (const f of fields) {
      const n = Number(value[f]);
      if (!Number.isFinite(n)) {
        throw new TypeError(
          what + ' is missing ' + f + ', or it is not a finite number');
      }
      out[f] = n;
    }
    return out;
  }
  const RECT_FIELDS = ['x', 'y', 'width', 'height'];
  const POINT_FIELDS = ['x', 'y'];
  const SIZE_FIELDS = ['width', 'height'];
  const FRAME_RATE_FIELDS = ['minimum', 'maximum', 'preferred'];
  const INSETS_FIELDS = ['top', 'left', 'bottom', 'right'];
  const DIRECTIONAL_INSETS_FIELDS = ['top', 'leading', 'bottom', 'trailing'];
  const TRANSFORM_FIELDS = ['a', 'b', 'c', 'd', 'tx', 'ty'];
  const toRect = (o) => (o == null ? null : new CGRect(o.x, o.y, o.width, o.height));
  const toPoint = (o) => (o == null ? null : new CGPoint(o.x, o.y));
  const toSize = (o) => (o == null ? null : new CGSize(o.width, o.height));
  const toFrameRateRange = (o) =>
    (o == null ? null : new CAFrameRateRange(o.minimum, o.maximum, o.preferred));
  const toTransform = (o) =>
    (o == null ? null : new CGAffineTransform(o.a, o.b, o.c, o.d, o.tx, o.ty));
  const toInsets = (o) =>
    (o == null ? null : new UIEdgeInsets(o.top, o.left, o.bottom, o.right));
  const toDirectionalInsets = (o) =>
    (o == null ? null
               : new NSDirectionalEdgeInsets(o.top, o.leading, o.bottom, o.trailing));

  // ---- 继承链的空壳 ----
  // 照搬 ObjC 的继承关系，现在先空着，以后往上加成员时子类自动继承。
  // NSObject 是 ObjC 的根类，所以也是这里所有原生类的根。
  // 让它继承 EventTarget：原生对象要发事件是常态，按原则 3 抽到基类，
  // 不让每个类各自发明一套回调。
  const NSObject = defineNativeClass('NSObject', class NSObject extends EventTarget {
    constructor() {
      // 所有原生类的构造链都经过这里，所以「不许继承」拦这一处
      finalCheck(new.target);
      shellOnly(new.target, NSObject, 'NSObject');
      super();
    }
  });
  // UIResponder 在 ObjC 里的定义就是「能接收事件的对象」，和 EventTarget 语义吻合。
  const UIResponder = defineNativeClass('UIResponder', class UIResponder extends NSObject {
    constructor() { shellOnly(new.target, UIResponder, 'UIResponder'); super(); }

    // ---- first responder ----
    // 输入框弹不弹键盘就看它。返回值是「成没成」——系统可能拒绝，
    // 比如视图还没上屏，所以别忽略它
    becomeFirstResponder() { return nativeCall(this, 'becomeFirstResponder', []); }
    resignFirstResponder() { return nativeCall(this, 'resignFirstResponder', []); }
    get isFirstResponder() { return nativeGet(this, 'isFirstResponder'); }
    get canBecomeFirstResponder() { return nativeGet(this, 'canBecomeFirstResponder'); }
  });
  const UIScene = defineNativeClass('UIScene', class UIScene extends UIResponder {
    constructor() { shellOnly(new.target, UIScene, 'UIScene'); super(); }
  });
  // 图层。每个 UIView 背后都有一个（view.layer），真正把东西画出来的是它。
  //
  // 也可以自己建一个挂上去（new CALayer() + addSublayer），渐变、形状、
  // 图表都是这么做的。**子图层不走 Auto Layout**：iOS 上 CALayer 的
  // autoresizingMask 和 layoutManager 都标了 API_UNAVAILABLE(ios)，约束也
  // 只作用于 view，所以子图层的 frame 得自己设——view 的大小变了也要自己
  // 重设一次。见 docs/api/ca-layer.md。
  //
  // frame / bounds / opacity / isHidden 这些名字 UIView 上也有。view 自己
  // 那一层用 view 的写法（它才是参与布局的那个）；独立建的子图层上 view
  // 没有对应物，只能用这里的。
  // 路径。只管形状，不管怎么画——画出来是 CAShapeLayer 的事。
  //
  // 角度一律是**弧度**，而且 UIKit 的 y 轴朝下：0 弧度在正右方，角度增大
  // 是**顺时针**，和数学课上的方向相反。
  //
  // 没有 -fill / -stroke / -addClip，也没有路径自己那套 lineWidth /
  // lineCapStyle / lineJoinStyle / miterLimit / flatness：它们都只服务于
  // 那两个绘制方法，而绘制要当前 CGContext（= 覆写 drawRect:，还没有）。
  // 路径画在 CAShapeLayer 上时，生效的是**图层**的同名属性。
  const UIBezierPath = defineNativeClass('UIBezierPath', class UIBezierPath extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'UIBezierPath', []);
    }

    // ---- 现成的形状 ----
    static bezierPathWithRect(rect) {
      return nativeClassCall('UIBezierPath', 'bezierPathWithRect:',
                             [structArg(rect, RECT_FIELDS, 'bezierPathWithRect')]);
    }
    // 内切椭圆。正方形进去就是个正圆
    static bezierPathWithOvalInRect(rect) {
      return nativeClassCall('UIBezierPath', 'bezierPathWithOvalInRect:',
                             [structArg(rect, RECT_FIELDS, 'bezierPathWithOvalInRect')]);
    }
    // 两种写法：{ cornerRadius } 四个角一样圆，
    // { byRoundingCorners, cornerRadii } 挑角，半径是 CGSize（横纵可以不同）
    static bezierPathWithRoundedRect(rect, options) {
      const o = options || {};
      const r = structArg(rect, RECT_FIELDS, 'bezierPathWithRoundedRect');
      if (has(o, 'byRoundingCorners')) {
        return nativeClassCall(
          'UIBezierPath', 'bezierPathWithRoundedRect:byRoundingCorners:cornerRadii:',
          [r, o.byRoundingCorners,
           structArg(o.cornerRadii, SIZE_FIELDS, 'cornerRadii')]);
      }
      if (has(o, 'cornerRadius')) {
        return nativeClassCall('UIBezierPath', 'bezierPathWithRoundedRect:cornerRadius:',
                               [r, o.cornerRadius]);
      }
      throw new TypeError('bezierPathWithRoundedRect needs { cornerRadius } ' +
                          'or { byRoundingCorners, cornerRadii }');
    }
    // 一段圆弧。四个选项都要给——原生这里没有默认值，我们也不发明一个
    static bezierPathWithArcCenter(center, options) {
      const o = options || {};
      for (const key of ['radius', 'startAngle', 'endAngle', 'clockwise']) {
        if (!(key in o)) {
          throw new TypeError('bezierPathWithArcCenter needs { radius, startAngle, ' +
                              'endAngle, clockwise }; missing ' + key);
        }
      }
      return nativeClassCall(
        'UIBezierPath', 'bezierPathWithArcCenter:radius:startAngle:endAngle:clockwise:',
        [structArg(center, POINT_FIELDS, 'bezierPathWithArcCenter'),
         o.radius, o.startAngle, o.endAngle, o.clockwise]);
    }

    // ---- 自己画 ----
    // 抬笔移到某处，开一段新的子路径
    moveToPoint(point) {
      nativeCall(this, 'moveToPoint:', [structArg(point, POINT_FIELDS, 'moveToPoint')]);
    }
    // 从 currentPoint 连一条直线过去。没有 currentPoint 时什么都不画
    addLineToPoint(point) {
      nativeCall(this, 'addLineToPoint:', [structArg(point, POINT_FIELDS, 'addLineToPoint')]);
    }
    // 三次贝塞尔：两个控制点
    addCurveToPoint(point, options) {
      const o = options || {};
      nativeCall(this, 'addCurveToPoint:controlPoint1:controlPoint2:', [
        structArg(point, POINT_FIELDS, 'addCurveToPoint'),
        structArg(o.controlPoint1, POINT_FIELDS, 'controlPoint1'),
        structArg(o.controlPoint2, POINT_FIELDS, 'controlPoint2'),
      ]);
    }
    // 二次贝塞尔：一个控制点
    addQuadCurveToPoint(point, options) {
      const o = options || {};
      nativeCall(this, 'addQuadCurveToPoint:controlPoint:', [
        structArg(point, POINT_FIELDS, 'addQuadCurveToPoint'),
        structArg(o.controlPoint, POINT_FIELDS, 'controlPoint'),
      ]);
    }
    // 接一段圆弧。已经有 currentPoint 的话会先连一条直线到弧的起点
    addArcWithCenter(center, options) {
      const o = options || {};
      for (const key of ['radius', 'startAngle', 'endAngle', 'clockwise']) {
        if (!(key in o)) {
          throw new TypeError('addArcWithCenter needs { radius, startAngle, ' +
                              'endAngle, clockwise }; missing ' + key);
        }
      }
      nativeCall(this, 'addArcWithCenter:radius:startAngle:endAngle:clockwise:', [
        structArg(center, POINT_FIELDS, 'addArcWithCenter'),
        o.radius, o.startAngle, o.endAngle, o.clockwise,
      ]);
    }
    // 连回这段子路径的起点。填充时开口路径会被当成闭合的，但描边看得出区别
    closePath() { nativeCall(this, 'closePath', []); }
    removeAllPoints() { nativeCall(this, 'removeAllPoints', []); }
    // 把另一条路径整段接过来。接的是副本，之后改它不影响这一条
    appendPath(path) { nativeCall(this, 'appendPath:', [path]); }
    // **就地**变换，不返回新路径
    applyTransform(transform) {
      nativeCall(this, 'applyTransform:',
                 [structArg(transform, TRANSFORM_FIELDS, 'applyTransform')]);
    }
    // 反向的一条新路径。方向只在 nonZero 填充规则下看得出来
    bezierPathByReversingPath() {
      return nativeCallObject(this, 'bezierPathByReversingPath', []);
    }

    // ---- 问它 ----
    // 只看**填充区域**，描边不算；开口路径按闭合之后算
    containsPoint(point) {
      return nativeCall(this, 'containsPoint:',
                        [structArg(point, POINT_FIELDS, 'containsPoint')]);
    }
    get isEmpty() {
      requireNative(this, 'isEmpty');
      return nativeGet(this, 'isEmpty');
    }
    // 把路径包住的最小矩形。算的是**路径本身**，不含线宽
    get bounds() {
      requireNative(this, 'bounds');
      return toRect(nativeGet(this, 'bounds'));
    }
    // 笔尖在哪。空路径时是 (0, 0)
    get currentPoint() {
      requireNative(this, 'currentPoint');
      return toPoint(nativeGet(this, 'currentPoint'));
    }
    // 填充规则。默认 false = nonZero。注意画在图层上时不看这个，
    // 看的是 CAShapeLayer.fillRule——这条只影响 containsPoint 的判定
    get usesEvenOddFillRule() {
      requireNative(this, 'usesEvenOddFillRule');
      return nativeGet(this, 'usesEvenOddFillRule');
    }
    set usesEvenOddFillRule(value) {
      requireNative(this, 'usesEvenOddFillRule');
      nativeSet(this, 'usesEvenOddFillRule', value);
    }
  });

  const CALayer = defineNativeClass('CALayer', class CALayer extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'CALayer', []);
    }

    // ---- 几何 ----
    // 自己建的图层默认是 0×0，不设 frame 什么都看不见
    get frame() {
      requireNative(this, 'frame');
      return toRect(nativeGet(this, 'frame'));
    }
    set frame(value) {
      requireNative(this, 'frame');
      nativeSet(this, 'frame', structArg(value, RECT_FIELDS, 'frame'));
    }
    get bounds() {
      requireNative(this, 'bounds');
      return toRect(nativeGet(this, 'bounds'));
    }
    set bounds(value) {
      requireNative(this, 'bounds');
      nativeSet(this, 'bounds', structArg(value, RECT_FIELDS, 'bounds'));
    }
    // 图层在父图层里的位置。默认锚点在正中，所以这是中心点而不是左上角
    get position() {
      requireNative(this, 'position');
      return toPoint(nativeGet(this, 'position'));
    }
    set position(value) {
      requireNative(this, 'position');
      nativeSet(this, 'position', structArg(value, POINT_FIELDS, 'position'));
    }
    // 不动 sublayers 的顺序就能改叠放次序。默认 0
    get zPosition() {
      requireNative(this, 'zPosition');
      return nativeGet(this, 'zPosition');
    }
    set zPosition(value) {
      requireNative(this, 'zPosition');
      nativeSet(this, 'zPosition', value);
    }

    // ---- 层级 ----
    get superlayer() { return nativeGetObject(this, 'superlayer'); }
    // 读的同时按原生的真相重建这一层的持有列表（见「所有权镜像」）
    get sublayers() {
      return ownAll(this, 'sublayers', nativeGetObjectArray(this, 'sublayers'));
    }
    addSublayer(layer) {
      const from = superlayerOf(layer);
      nativeCall(this, 'addSublayer:', [layer]);
      disown(from, 'sublayers', layer);
      ownOne(this, 'sublayers', layer);
    }
    insertSublayer(layer, options) {
      const o = options || {};
      const from = superlayerOf(layer);
      if (has(o, 'atIndex')) {
        nativeCall(this, 'insertSublayer:atIndex:', [layer, o.atIndex]);
      } else if (has(o, 'above')) {
        nativeCall(this, 'insertSublayer:above:', [layer, o.above]);
      } else if (has(o, 'below')) {
        nativeCall(this, 'insertSublayer:below:', [layer, o.below]);
      } else {
        throw new TypeError(
          'insertSublayer needs one of { atIndex } / { above } / { below }');
      }
      disown(from, 'sublayers', layer);
      ownOne(this, 'sublayers', layer);
    }
    removeFromSuperlayer() {
      const from = superlayerOf(this);
      nativeCall(this, 'removeFromSuperlayer', []);
      disown(from, 'sublayers', this);
    }

    // ---- 动画 ----
    //
    // **addAnimation 会拷贝一份动画。** 加完再改原来那个对象不会有任何
    // 效果，animationForKey 读回来的也是那份拷贝，不是你给的对象。
    //
    // JS 侧记一条持有边，让图层的包装拖住动画的包装：原生那边拖住的是
    // 拷贝，而事件要派发给**原来那个**——包装没了就没人收了。
    addAnimation(animation, options) {
      const o = options || {};
      nativeCall(this, 'addAnimation:forKey:',
                 [animation, has(o, 'forKey') ? o.forKey : null]);
      ownOne(this, 'animations', animation);
    }
    removeAllAnimations() {
      nativeCall(this, 'removeAllAnimations', []);
      ownAll(this, 'animations', []);
    }
    // 持有边不在这里拆：读回来的是拷贝，认不出原来是哪个对象。
    // 多留一份引用是无害的（所有权镜像一路的取舍），少留才会出错
    removeAnimationForKey(key) {
      nativeCall(this, 'removeAnimationForKey:', [key]);
    }
    // 没有动画时给 []，不是 null
    animationKeys() { return nativeCall(this, 'animationKeys', []); }
    // 给的是**图层持有的那份拷贝**。头文件原话：改它的任何属性都是未定义行为
    animationForKey(key) { return nativeCallObject(this, 'animationForKey:', [key]); }

    // ---- 外观 ----
    get opacity() {
      requireNative(this, 'opacity');
      return nativeGet(this, 'opacity');
    }
    set opacity(value) {
      requireNative(this, 'opacity');
      nativeSet(this, 'opacity', value);
    }
    get isHidden() {
      requireNative(this, 'isHidden');
      return nativeGet(this, 'isHidden');
    }
    set isHidden(value) {
      requireNative(this, 'isHidden');
      nativeSet(this, 'isHidden', value);
    }
    // 子图层超出自己 bounds 的部分裁不裁掉。配 cornerRadius 用
    get masksToBounds() {
      requireNative(this, 'masksToBounds');
      return nativeGet(this, 'masksToBounds');
    }
    set masksToBounds(value) {
      requireNative(this, 'masksToBounds');
      nativeSet(this, 'masksToBounds', value);
    }
    // **默认是 1，不是屏幕的 scale**，画出来会糊。实测 view.layer 在
    // 场景接入时**也是 1**，所以它当不了屏幕 scale 的替代品
    get contentsScale() {
      requireNative(this, 'contentsScale');
      return nativeGet(this, 'contentsScale');
    }
    set contentsScale(value) {
      requireNative(this, 'contentsScale');
      nativeSet(this, 'contentsScale', value);
    }
    get backgroundColor() { return colorString(nativeGetOwned(this, 'backgroundColor')); }
    set backgroundColor(value) { {
      const color = colorArg(value, 'backgroundColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'backgroundColor', color);
    }; }

    // ---- 圆角 ----
    get cornerRadius() {
      requireNative(this, 'cornerRadius');
      return nativeGet(this, 'cornerRadius');
    }
    set cornerRadius(value) {
      requireNative(this, 'cornerRadius');
      nativeSet(this, 'cornerRadius', value);
    }
    // 'continuous' 是 Apple 自己在用的那种圆角（超椭圆），过渡比正圆弧顺。
    // 图标、卡片都是它；默认是 'circular'
    get cornerCurve() {
      requireNative(this, 'cornerCurve');
      return nativeGet(this, 'cornerCurve');
    }
    set cornerCurve(value) {
      requireNative(this, 'cornerCurve');
      nativeSet(this, 'cornerCurve', value);
    }
    // 哪几个角要圆。位掩码，所以是字符串数组。
    // UIKit 的 y 轴朝下，minY 是上边——minXMinY 就是左上角
    get maskedCorners() {
      requireNative(this, 'maskedCorners');
      return nativeGet(this, 'maskedCorners');
    }
    set maskedCorners(value) {
      requireNative(this, 'maskedCorners');
      nativeSet(this, 'maskedCorners', value);
    }

    // ---- 边框 ----
    get borderWidth() {
      requireNative(this, 'borderWidth');
      return nativeGet(this, 'borderWidth');
    }
    set borderWidth(value) {
      requireNative(this, 'borderWidth');
      nativeSet(this, 'borderWidth', value);
    }
    // ObjC 这里是 CGColorRef，JS 侧统一用 UIColor。**读出来是新建的对象**，
    // 而且动态色在写入的那一刻就被定死了，详见 ca-layer.md
    get borderColor() { return colorString(nativeGetOwned(this, 'borderColor')); }
    set borderColor(value) { {
      const color = colorArg(value, 'borderColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'borderColor', color);
    }; }

    // ---- 阴影 ----
    // 默认 opacity 是 0，所以只设颜色看不见任何东西
    get shadowColor() { return colorString(nativeGetOwned(this, 'shadowColor')); }
    set shadowColor(value) { {
      const color = colorArg(value, 'shadowColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'shadowColor', color);
    }; }
    get shadowOpacity() {
      requireNative(this, 'shadowOpacity');
      return nativeGet(this, 'shadowOpacity');
    }
    set shadowOpacity(value) {
      requireNative(this, 'shadowOpacity');
      nativeSet(this, 'shadowOpacity', value);
    }
    get shadowRadius() {
      requireNative(this, 'shadowRadius');
      return nativeGet(this, 'shadowRadius');
    }
    set shadowRadius(value) {
      requireNative(this, 'shadowRadius');
      nativeSet(this, 'shadowRadius', value);
    }
    get shadowOffset() {
      requireNative(this, 'shadowOffset');
      return toSize(nativeGet(this, 'shadowOffset'));
    }
    set shadowOffset(value) {
      requireNative(this, 'shadowOffset');
      nativeSet(this, 'shadowOffset', structArg(value, SIZE_FIELDS, 'shadowOffset'));
    }
  });

  function superlayerOf(layer) {
    if (layer == null || layer[kHandle] === undefined) return null;
    return nativeGetObject(layer, 'superlayer');
  }

  // 渐变。一条直线（axial）、从中心往外（radial）、或者绕中心转一圈（conic）。
  //
  // 它是个图层，所以和别的图层一样要自己设 frame。颜色至少给两个，不然
  // 什么都看不见。
  defineNativeClass('CAGradientLayer', class CAGradientLayer extends CALayer {
    constructor() {
      super();
      constructNative(this, new.target, 'CAGradientLayer', []);
    }

    // 渐变经过的颜色，按顺序。写进去的是字符串（或 UIColor），**读出来是
    // 字符串，但不一定是写进去的那个串**：原生存的是 CGColor，动态色在
    // 写入那一刻就被定死了，读回来只剩当时解析出的那个具体颜色
    get colors() {
      return nativeGetObjectArray(this, 'colors').map(colorString);
    }
    set colors(value) {
      const list = [];
      for (const v of Array.from(value || [])) {
        const color = colorArg(v, 'colors');
        if (color === undefined) return;   // 不合法，警告过了，整条都不写
        list.push(color);
      }
      nativeSetObjectArray(this, 'colors', list);
      ownAll(this, 'colors', list);
    }
    // 每个颜色落在 0…1 的哪一处。null 表示均匀分布（默认），
    // 个数要和 colors 对得上
    get locations() {
      requireNative(this, 'locations');
      return nativeGet(this, 'locations');
    }
    set locations(value) {
      requireNative(this, 'locations');
      nativeSet(this, 'locations', value);
    }
    // 单位坐标，不是点：(0,0) 是左上角，(1,1) 是右下角。默认从 (0.5,0) 到
    // (0.5,1)，也就是从上到下。radial 时 startPoint 是圆心、endPoint 定半径；
    // conic 时 startPoint 是圆心、endPoint 定起始角度
    get startPoint() {
      requireNative(this, 'startPoint');
      return toPoint(nativeGet(this, 'startPoint'));
    }
    set startPoint(value) {
      requireNative(this, 'startPoint');
      nativeSet(this, 'startPoint', structArg(value, POINT_FIELDS, 'startPoint'));
    }
    get endPoint() {
      requireNative(this, 'endPoint');
      return toPoint(nativeGet(this, 'endPoint'));
    }
    set endPoint(value) {
      requireNative(this, 'endPoint');
      nativeSet(this, 'endPoint', structArg(value, POINT_FIELDS, 'endPoint'));
    }
    get type() {
      requireNative(this, 'type');
      return nativeGet(this, 'type');
    }
    set type(value) {
      requireNative(this, 'type');
      nativeSet(this, 'type', value);
    }
  });

  // 画一条路径的图层。折线、扇形、饼图、K 线都靠它。
  //
  // 它不自己量尺寸：path 的坐标就是**图层自己坐标系里的点**，和 frame
  // 的大小没有关系，路径超出去的部分照样画（除非 masksToBounds）。
  defineNativeClass('CAShapeLayer', class CAShapeLayer extends CALayer {
    constructor() {
      super();
      constructNative(this, new.target, 'CAShapeLayer', []);
    }

    // 要画的路径。null 表示什么都不画。
    //
    // **写进去的那个对象会原样还回来**：原生存的是 CGPath，读回来只能
    // 现包一个新的 UIBezierPath，所以 JS 这边记了一份。包装被回收重建过
    // 之后镜像就没了，那时读到的是按原生重建的新对象——和 sublayers
    // 是同一条规矩：按原生的真相整层重建。
    //
    // 还有一条：路径是**存下来的副本**。写进去之后再改那条 UIBezierPath，
    // 图层不会跟着变，要再赋值一次。
    get path() {
      const mine = ownedValue(this, 'path');
      return mine === undefined ? nativeGetObject(this, 'path') : mine;
    }
    set path(value) {
      nativeSetOwned(this, 'path', value);
    }

    // ---- 填 ----
    // 默认是黑色，**不是透明**：只想要一条线的话记得设成 null
    get fillColor() { return colorString(nativeGetOwned(this, 'fillColor')); }
    set fillColor(value) { {
      if (value == null) { nativeSetOwned(this, 'fillColor', null); return; }
      const color = colorArg(value, 'fillColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'fillColor', color);
    }; }
    // 路径自交或者嵌套时才看得出区别。默认 'nonZero'
    get fillRule() {
      requireNative(this, 'fillRule');
      return nativeGet(this, 'fillRule');
    }
    set fillRule(value) {
      requireNative(this, 'fillRule');
      nativeSet(this, 'fillRule', value);
    }

    // ---- 描 ----
    // 默认是 null，所以只设 lineWidth 看不见线
    get strokeColor() { return colorString(nativeGetOwned(this, 'strokeColor')); }
    set strokeColor(value) { {
      if (value == null) { nativeSetOwned(this, 'strokeColor', null); return; }
      const color = colorArg(value, 'strokeColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'strokeColor', color);
    }; }
    // 默认 1。线是**骑在路径上**的，两边各占一半
    get lineWidth() {
      requireNative(this, 'lineWidth');
      return nativeGet(this, 'lineWidth');
    }
    set lineWidth(value) {
      requireNative(this, 'lineWidth');
      nativeSet(this, 'lineWidth', value);
    }
    // 线头：'butt'（默认，齐根切）/ 'round' / 'square'
    get lineCap() {
      requireNative(this, 'lineCap');
      return nativeGet(this, 'lineCap');
    }
    set lineCap(value) {
      requireNative(this, 'lineCap');
      nativeSet(this, 'lineCap', value);
    }
    // 拐角：'miter'（默认，尖角）/ 'round' / 'bevel'
    get lineJoin() {
      requireNative(this, 'lineJoin');
      return nativeGet(this, 'lineJoin');
    }
    set lineJoin(value) {
      requireNative(this, 'lineJoin');
      nativeSet(this, 'lineJoin', value);
    }
    // 尖角尖到什么程度就削平。默认 10
    get miterLimit() {
      requireNative(this, 'miterLimit');
      return nativeGet(this, 'miterLimit');
    }
    set miterLimit(value) {
      requireNative(this, 'miterLimit');
      nativeSet(this, 'miterLimit', value);
    }
    // 只描路径的一段，0…1。配动画能做「线一点点画出来」，
    // 现在没有动画，直接设也能做进度条
    get strokeStart() {
      requireNative(this, 'strokeStart');
      return nativeGet(this, 'strokeStart');
    }
    set strokeStart(value) {
      requireNative(this, 'strokeStart');
      nativeSet(this, 'strokeStart', value);
    }
    get strokeEnd() {
      requireNative(this, 'strokeEnd');
      return nativeGet(this, 'strokeEnd');
    }
    set strokeEnd(value) {
      requireNative(this, 'strokeEnd');
      nativeSet(this, 'strokeEnd', value);
    }
    // 虚线：画多长、空多长，按顺序循环。null 是实线（默认）
    get lineDashPattern() {
      requireNative(this, 'lineDashPattern');
      return nativeGet(this, 'lineDashPattern');
    }
    set lineDashPattern(value) {
      requireNative(this, 'lineDashPattern');
      nativeSet(this, 'lineDashPattern', value);
    }
    // 虚线从哪里开始。默认 0
    get lineDashPhase() {
      requireNative(this, 'lineDashPhase');
      return nativeGet(this, 'lineDashPhase');
    }
    set lineDashPhase(value) {
      requireNative(this, 'lineDashPhase');
      nativeSet(this, 'lineDashPhase', value);
    }
  });

  // WebSocket。
  //
  // 上层标准，和 fetch 一个定位——底下是 NSURLSessionWebSocketTask，但那个
  // 类不暴露。形状照 Web，**两处比 Web 多**：
  //
  //   headers   浏览器的构造器给不了首部，那是 Web 的历史限制不是协议的。
  //             真实业务里 Authorization 是刚需
  //   ping()    协议级的 ping，RFC 6455 规定对端必须回 Pong，不需要服务端
  //             应用配合。浏览器不给这个 API，只能做应用层心跳
  //
  // readyState **用数字**，是我们唯一一处为 Web 兼容破掉「枚举一律字符串」
  // 那条规矩的地方——从 Web / React Native 搬过来的代码里
  // `ws.readyState === WebSocket.OPEN` 要能直接跑。理由记在 project.md。
  defineNativeClass('WebSocket', class WebSocket extends NSObject {
    constructor(url, options) {
      super();
      constructNative(this, new.target, 'WebSocket', [String(url), options || {}]);
    }

    static get CONNECTING() { return 0; }
    static get OPEN() { return 1; }
    static get CLOSING() { return 2; }
    static get CLOSED() { return 3; }

    [kSubscribe](type, on) {
      requireNative(this, 'addEventListener');
      native.subscribe(this[kHandle], type, on);
      if (on) subscribed.add(this);
      else if (this[kListeners].size === 0) subscribed.delete(this);
    }

    /**
     * 发一条。字符串、Blob、ArrayBuffer 或者 TypedArray。
     * 返回的 Promise 在**发出去之后**兑现，不等对端确认。
     *
     * 后两种在这里包成 Blob 再走——原生侧只认字符串和 Blob，而 Blob 的
     * 构造本来就吃 ArrayBuffer / TypedArray（字节按下标单独过桥）
     */
    send(data) {
      const payload = (data instanceof ArrayBuffer || ArrayBuffer.isView(data))
        ? new Blob([data]) : data;
      return nativeCallAsync(this, 'send', [payload]);
    }
    /**
     * 协议级 ping。pong 回来就兑现，连接死了就拒绝——不需要服务端应用做
     * 任何事，这是它比应用层心跳强的地方
     */
    ping() { return nativeCallAsync(this, 'ping', []); }
    /** 关。已经在关或关完了再调是空操作，和 Web 一致 */
    close(code, reason) {
      nativeCall(this, 'close', [code === undefined ? null : code,
                                 reason === undefined ? null : reason]);
    }

    get url() { requireNative(this, 'url'); return nativeGet(this, 'url'); }
    /** 0 CONNECTING / 1 OPEN / 2 CLOSING / 3 CLOSED */
    get readyState() { requireNative(this, 'readyState'); return nativeGet(this, 'readyState'); }
    /** 服务端选中的子协议。没有就是空串 */
    get protocol() { requireNative(this, 'protocol'); return nativeGet(this, 'protocol'); }
    /** 一条消息最大多少字节。超了接收会失败。**Web 没有这个** */
    get maximumMessageSize() {
      requireNative(this, 'maximumMessageSize');
      return nativeGet(this, 'maximumMessageSize');
    }
    set maximumMessageSize(value) {
      requireNative(this, 'maximumMessageSize');
      nativeSet(this, 'maximumMessageSize', value);
    }
  });

  // ---------- 动画 ----------
  //
  // 时间曲线。两种来源：五个内置名字，或者四个控制点的三次贝塞尔。
  // 不给 new——ObjC 的 initWithControlPoints 要四个浮点数，而构造通道
  // 只传对象句柄，传不了标量。
  defineNativeClass('CAMediaTimingFunction', class CAMediaTimingFunction extends NSObject {
    constructor() { nativeOnly(new.target); }

    static functionWithName(name) {
      return nativeClassCall('CAMediaTimingFunction', 'functionWithName:', [name]);
    }
    static functionWithControlPoints(c1x, c1y, c2x, c2y) {
      return nativeClassCall('CAMediaTimingFunction', 'functionWithControlPoints:',
                             [c1x, c1y, c2x, c2y]);
    }
    // ObjC 那边是出参（float[2]），这里改成返回一个点。0 和 3 是端点
    // （永远是 (0,0) 和 (1,1)），1 和 2 才是控制点
    controlPointAtIndex(index) {
      return toPoint(nativeCall(this, 'controlPointAtIndex:', [index]));
    }
  });

  // 动画的基类。不可直接构造——ObjC 的 +animation 能建，但一个没有
  // keyPath 的动画什么都做不了，没有理由给出来。
  //
  // 它是 EventTarget：'start' 和 'stop' 两个事件来自 CAAnimationDelegate。
  // stop 事件带一个 finished——**那个事实在动画对象上读不出来**，所以
  // 必须带在事件上（事件带不带数据的判据就是这个）。
  const CAAnimation = defineNativeClass('CAAnimation', class CAAnimation extends NSObject {
    constructor() { shellOnly(new.target, CAAnimation, 'CAAnimation'); super(); }

    [kSubscribe](type, on) {
      requireNative(this, 'addEventListener');
      native.subscribe(this[kHandle], type, on);
      if (on) subscribed.add(this);
      else if (this[kListeners].size === 0) subscribed.delete(this);
    }

    // ---- 时间（来自 CAMediaTiming） ----
    // 秒。**0 不是「不动画」**：加到图层上时 0 会被换成当前事务的
    // animationDuration，没有的话是 0.25 秒
    get duration() { requireNative(this, 'duration'); return nativeGet(this, 'duration'); }
    set duration(value) { requireNative(this, 'duration'); nativeSet(this, 'duration', value); }
    // 相对于父级时间轴的开始时刻。默认 0 = 立刻
    get beginTime() { requireNative(this, 'beginTime'); return nativeGet(this, 'beginTime'); }
    set beginTime(value) { requireNative(this, 'beginTime'); nativeSet(this, 'beginTime', value); }
    // 时间流速。2 是两倍快，0 是停住。默认 1
    get speed() { requireNative(this, 'speed'); return nativeGet(this, 'speed'); }
    set speed(value) { requireNative(this, 'speed'); nativeSet(this, 'speed', value); }
    get timeOffset() { requireNative(this, 'timeOffset'); return nativeGet(this, 'timeOffset'); }
    set timeOffset(value) { requireNative(this, 'timeOffset'); nativeSet(this, 'timeOffset', value); }
    // 重复几次。可以是小数（1.5 = 跑一遍半）。要无限循环用 Infinity。
    //
    // **JSON 没有 Infinity**（JSON.stringify 给的是 null），所以它在桥上
    // 是字符串 'infinity'，两头各换一次。JS 看到的类型还是 number
    get repeatCount() {
      requireNative(this, 'repeatCount');
      return infinityIn(nativeGet(this, 'repeatCount'));
    }
    set repeatCount(value) {
      requireNative(this, 'repeatCount');
      nativeSet(this, 'repeatCount', infinityOut(value));
    }
    get repeatDuration() {
      requireNative(this, 'repeatDuration');
      return infinityIn(nativeGet(this, 'repeatDuration'));
    }
    set repeatDuration(value) {
      requireNative(this, 'repeatDuration');
      nativeSet(this, 'repeatDuration', infinityOut(value));
    }
    // 跑完再倒着跑回来。配 repeatCount 做脉动
    get autoreverses() { requireNative(this, 'autoreverses'); return nativeGet(this, 'autoreverses'); }
    set autoreverses(value) { requireNative(this, 'autoreverses'); nativeSet(this, 'autoreverses', value); }
    // 动画的活动区间之外，属性显示成什么。默认 'removed'
    get fillMode() { requireNative(this, 'fillMode'); return nativeGet(this, 'fillMode'); }
    set fillMode(value) { requireNative(this, 'fillMode'); nativeSet(this, 'fillMode', value); }

    // ---- 曲线和收尾 ----
    get timingFunction() { return nativeGetOwned(this, 'timingFunction'); }
    set timingFunction(value) { nativeSetOwned(this, 'timingFunction', value); }
    // 默认 true：跑完就把动画摘掉，属性**弹回模型值**。这是最常被当成
    // bug 的行为——正确的做法是在加动画的同时把模型值也设成终点值
    get removedOnCompletion() {
      requireNative(this, 'removedOnCompletion');
      return nativeGet(this, 'removedOnCompletion');
    }
    set removedOnCompletion(value) {
      requireNative(this, 'removedOnCompletion');
      nativeSet(this, 'removedOnCompletion', value);
    }
  });

  // 动画某一个属性。自己不可构造，用 CABasicAnimation。
  const CAPropertyAnimation = defineNativeClass('CAPropertyAnimation',
                                                class CAPropertyAnimation extends CAAnimation {
    constructor() {
      shellOnly(new.target, CAPropertyAnimation, 'CAPropertyAnimation');
      super();
    }

    // 动哪个属性。只认运行时认得动画的那些名字，写别的当场抛并列出全表
    get keyPath() { requireNative(this, 'keyPath'); return nativeGet(this, 'keyPath'); }
    set keyPath(value) { requireNative(this, 'keyPath'); nativeSet(this, 'keyPath', value); }
  });

  // 从一个值走到另一个值。
  //
  // fromValue / toValue / byValue 该放什么类型**由 keyPath 决定**：
  // 'opacity' 要数字，'position' 要 CGPoint，'strokeColor' 要颜色，
  // 'path' 要 UIBezierPath。所以要**先设 keyPath**，否则赋值时抛。
  const CABasicAnimation = defineNativeClass('CABasicAnimation', class CABasicAnimation extends CAPropertyAnimation {
    constructor() {
      super();
      constructNative(this, new.target, 'CABasicAnimation', []);
    }

    // 常用写法：一步建好并带上 keyPath
    static animationWithKeyPath(keyPath) {
      return nativeClassCall('CABasicAnimation', 'animationWithKeyPath:', [keyPath]);
    }

    // 三个取值器都把 nativeGet / nativeSet 的名字**写成字面量**，不抽进
    // 助手里——check-api.sh 靠正则认这些名字，抽进去它就看不见了。
    // 和枚举表不抽宏是同一条取舍：能被检查看见比少写几行重要
    get fromValue() {
      const object = nativeGetObject(this, 'fromValue');
      return object === null ? animScalarOut(nativeGet(this, 'fromValue'))
                             : animObjectOut(object);
    }
    set fromValue(value) {
      if (value === null || value === undefined) {
        nativeSetOwned(this, 'fromValue', null);
        nativeSet(this, 'fromValue', null);
        return;
      }
      const object = animObjectIn(value, 'fromValue');
      if (object === null) return;             // 颜色写错了，警告过了
      if (object !== undefined) { nativeSetOwned(this, 'fromValue', object); return; }
      nativeSet(this, 'fromValue', animScalarIn(value, 'fromValue'));
    }
    get toValue() {
      const object = nativeGetObject(this, 'toValue');
      return object === null ? animScalarOut(nativeGet(this, 'toValue'))
                             : animObjectOut(object);
    }
    set toValue(value) {
      if (value === null || value === undefined) {
        nativeSetOwned(this, 'toValue', null);
        nativeSet(this, 'toValue', null);
        return;
      }
      const object = animObjectIn(value, 'toValue');
      if (object === null) return;
      if (object !== undefined) { nativeSetOwned(this, 'toValue', object); return; }
      nativeSet(this, 'toValue', animScalarIn(value, 'toValue'));
    }
    // 相对量：toValue = fromValue + byValue
    get byValue() {
      const object = nativeGetObject(this, 'byValue');
      return object === null ? animScalarOut(nativeGet(this, 'byValue'))
                             : animObjectOut(object);
    }
    set byValue(value) {
      if (value === null || value === undefined) {
        nativeSetOwned(this, 'byValue', null);
        nativeSet(this, 'byValue', null);
        return;
      }
      const object = animObjectIn(value, 'byValue');
      if (object === null) return;
      if (object !== undefined) { nativeSetOwned(this, 'byValue', object); return; }
      nativeSet(this, 'byValue', animScalarIn(value, 'byValue'));
    }
  });

  // 多个关键帧，或者沿一条路径走。
  //
  // values 和 CABasicAnimation 的 toValue 一样，类型由 keyPath 决定，
  // 所以同样要**先设 keyPath**。给了 path 之后 values 就不起作用了。
  defineNativeClass('CAKeyframeAnimation',
                    class CAKeyframeAnimation extends CAPropertyAnimation {
    constructor() {
      super();
      constructNative(this, new.target, 'CAKeyframeAnimation', []);
    }
    static animationWithKeyPath(keyPath) {
      return nativeClassCall('CAKeyframeAnimation', 'animationWithKeyPath:', [keyPath]);
    }

    // 一串关键帧值。颜色和路径走对象数组通道，数字和结构体走标量通道——
    // 和 toValue 一个分工：JS 看形状挑通道，原生按 keyPath 核类型
    get values() {
      const objects = nativeGetObjectArray(this, 'values');
      if (objects.length > 0) return ownAll(this, 'values', objects).map(animObjectOut);
      const list = nativeGet(this, 'values');
      return list === null ? null : list.map(animScalarOut);
    }
    set values(value) {
      if (value === null || value === undefined) {
        nativeSet(this, 'values', null);
        return;
      }
      const list = Array.from(value);
      const first = list.length > 0 ? list[0] : undefined;
      if (typeof first === 'string' || first instanceof UIColor ||
          first instanceof UIBezierPath) {
        const objects = [];
        for (const item of list) {
          const object = animObjectIn(item, 'values');
          if (object === null || object === undefined) return;  // 不合法，警告过了
          objects.push(object);
        }
        nativeSetObjectArray(this, 'values', objects);
        ownAll(this, 'values', objects);
        return;
      }
      nativeSet(this, 'values', list.map((item) => animScalarIn(item, 'values')));
    }

    // 沿着这条路径走。**给了它 values 就作废**（头文件原话）。
    // 和 CAShapeLayer.path 一样：写进去的那个对象原样还回来
    get path() {
      const mine = ownedValue(this, 'path');
      return mine === undefined ? nativeGetObject(this, 'path') : mine;
    }
    set path(value) { nativeSetOwned(this, 'path', value); }

    // 每帧落在 0…1 的哪一处。null 是均匀分布
    get keyTimes() { requireNative(this, 'keyTimes'); return nativeGet(this, 'keyTimes'); }
    set keyTimes(value) { requireNative(this, 'keyTimes'); nativeSet(this, 'keyTimes', value); }
    // 每**段**一条曲线，所以个数是 values.length - 1
    get timingFunctions() {
      return ownAll(this, 'timingFunctions', nativeGetObjectArray(this, 'timingFunctions'));
    }
    set timingFunctions(value) {
      const list = Array.from(value || []);
      nativeSetObjectArray(this, 'timingFunctions', list);
      ownAll(this, 'timingFunctions', list);
    }
    // 'linear'（默认）/ 'discrete' / 'paced' / 'cubic' / 'cubicPaced'。
    // paced 和 cubicPaced 会**忽略 keyTimes 和 timingFunctions**
    get calculationMode() {
      requireNative(this, 'calculationMode');
      return nativeGet(this, 'calculationMode');
    }
    set calculationMode(value) {
      requireNative(this, 'calculationMode');
      nativeSet(this, 'calculationMode', value);
    }
    // 沿路径走时跟不跟着切线转。默认 null = 不转，**只在给了 path 时有意义**
    get rotationMode() {
      requireNative(this, 'rotationMode');
      return nativeGet(this, 'rotationMode');
    }
    set rotationMode(value) {
      requireNative(this, 'rotationMode');
      nativeSet(this, 'rotationMode', value);
    }
    // 下面三个只有 cubic / cubicPaced 用得上（Kochanek-Bartels 样条），
    // 每个值在 -1…1。没给的按 0 算，全不给就是 Catmull-Rom
    get tensionValues() {
      requireNative(this, 'tensionValues');
      return nativeGet(this, 'tensionValues');
    }
    set tensionValues(value) {
      requireNative(this, 'tensionValues');
      nativeSet(this, 'tensionValues', value);
    }
    get continuityValues() {
      requireNative(this, 'continuityValues');
      return nativeGet(this, 'continuityValues');
    }
    set continuityValues(value) {
      requireNative(this, 'continuityValues');
      nativeSet(this, 'continuityValues', value);
    }
    get biasValues() { requireNative(this, 'biasValues'); return nativeGet(this, 'biasValues'); }
    set biasValues(value) { requireNative(this, 'biasValues'); nativeSet(this, 'biasValues', value); }
  });

  // 弹簧。它是 CABasicAnimation 的子类，所以 fromValue / toValue 照用，
  // 只是**走过去的方式**由四个物理参数决定，不由 duration 和曲线决定。
  //
  // iOS 17 的 initWithPerceptualDuration:bounce: 还没做：构造通道只传
  // 对象句柄，传不了标量。perceptualDuration 和 bounce 读得出来，
  // 是系统按当前参数反算的。
  defineNativeClass('CASpringAnimation', class CASpringAnimation extends CABasicAnimation {
    constructor() {
      super();
      constructNative(this, new.target, 'CASpringAnimation', []);
    }
    static animationWithKeyPath(keyPath) {
      return nativeClassCall('CASpringAnimation', 'animationWithKeyPath:', [keyPath]);
    }

    // 挂在弹簧末端的质量，要大于 0。默认 1。越大越沉、晃得越久
    get mass() { requireNative(this, 'mass'); return nativeGet(this, 'mass'); }
    set mass(value) { requireNative(this, 'mass'); nativeSet(this, 'mass', value); }
    // 劲度系数，要大于 0。默认 100。越大越快
    get stiffness() { requireNative(this, 'stiffness'); return nativeGet(this, 'stiffness'); }
    set stiffness(value) { requireNative(this, 'stiffness'); nativeSet(this, 'stiffness', value); }
    // 阻尼，要 >= 0。默认 10。越大越不晃，够大就直接停住不回弹
    get damping() { requireNative(this, 'damping'); return nativeGet(this, 'damping'); }
    set damping(value) { requireNative(this, 'damping'); nativeSet(this, 'damping', value); }
    // 初速度。默认 0 = 静止。正值朝着终点冲，负值反着来
    get initialVelocity() {
      requireNative(this, 'initialVelocity');
      return nativeGet(this, 'initialVelocity');
    }
    set initialVelocity(value) {
      requireNative(this, 'initialVelocity');
      nativeSet(this, 'initialVelocity', value);
    }
    // 允不允许真正的过阻尼。默认 false，那时过阻尼被当成临界阻尼
    get allowsOverdamping() {
      requireNative(this, 'allowsOverdamping');
      return nativeGet(this, 'allowsOverdamping');
    }
    set allowsOverdamping(value) {
      requireNative(this, 'allowsOverdamping');
      nativeSet(this, 'allowsOverdamping', value);
    }

    // 下面三个只读，系统按当前四个参数算出来的。
    // **duration 对弹簧不起作用**，要知道多久停下来看 settlingDuration
    get settlingDuration() {
      requireNative(this, 'settlingDuration');
      return nativeGet(this, 'settlingDuration');
    }
    get perceptualDuration() {
      requireNative(this, 'perceptualDuration');
      return nativeGet(this, 'perceptualDuration');
    }
    get bounce() { requireNative(this, 'bounce'); return nativeGet(this, 'bounce'); }
  });

  // 一组动画一起跑。组自己的 duration / repeatCount 管整组，
  // 成员的时间都落在组的时间轴里。
  defineNativeClass('CAAnimationGroup', class CAAnimationGroup extends CAAnimation {
    constructor() {
      super();
      constructNative(this, new.target, 'CAAnimationGroup', []);
    }

    // 原生侧 group 持有这些动画，JS 侧也要有对应的一条边，
    // 否则 JS 丢掉引用后包装会被 GC，再读回来挂的监听器就没了
    get animations() {
      return ownAll(this, 'animations', nativeGetObjectArray(this, 'animations'));
    }
    set animations(value) {
      const list = Array.from(value || []);
      nativeSetObjectArray(this, 'animations', list);
      ownAll(this, 'animations', list);
    }
  });

  // JSON 带不动 Infinity，所以过桥时换成一个字符串。负无穷不处理：
  // 这两个属性都是「次数」和「时长」，负的没有意义
  const infinityIn = (value) => (value === 'infinity' ? Infinity : value);
  const infinityOut = (value) => (value === Infinity ? 'infinity' : value);

  // 值走哪条通道，由**值的形状**决定（这件事 JS 自己知道）；
  // 值配不配得上 keyPath，由**原生层**判断（只有它知道那张表）。

  // 对象通道读回来的：颜色给字符串，路径原样给
  function animObjectOut(object) {
    return object instanceof UIColor ? colorString(object) : object;
  }
  // 标量通道读回来的：数字原样，结构体按字段认是哪一种
  function animScalarOut(value) {
    if (value === null || typeof value === 'number') return value;
    if ('width' in value) return 'x' in value ? toRect(value) : toSize(value);
    return toPoint(value);
  }
  // 写进去的值该不该走对象通道。undefined = 不该，null = 不合法（已警告）
  function animObjectIn(value, what) {
    if (value instanceof UIBezierPath) return value;
    if (typeof value !== 'string' && !(value instanceof UIColor)) return undefined;
    const color = colorArg(value, what);
    return color === undefined ? null : color;
  }
  // 结构体参数：按字段认，不用调用方说是哪种。原生那边还会再按 keyPath 核一遍
  function animScalarIn(value, what) {
    if (typeof value === 'number') return value;
    if (value != null && typeof value === 'object') {
      if ('width' in value) {
        return 'x' in value ? structArg(value, RECT_FIELDS, what)
                            : structArg(value, SIZE_FIELDS, what);
      }
      if ('x' in value) return structArg(value, POINT_FIELDS, what);
    }
    throw new TypeError(
      what + ' needs a number, a CGPoint / CGSize / CGRect, a color, or a UIBezierPath');
  }

  // run loop。只给 mainRunLoop 一个：JS 跑在主线程，currentRunLoop 永远
  // 等于它。暴露它是因为 CADisplayLink.addToRunLoop 躲不开这个参数。
  defineNativeClass('NSRunLoop', class NSRunLoop extends NSObject {
    constructor() { nativeOnly(new.target); }
    static get mainRunLoop() { return nativeClassObject('NSRunLoop', 'mainRunLoop'); }
  });

  // 这台设备。只有类级的单例 currentDevice，全部只读。
  //
  // 现在只有不会变的那几项。电量、设备朝向、距离感应带变化通知，另起一步
  defineNativeClass('UIDevice', class UIDevice extends NSObject {
    constructor() { nativeOnly(new.target); }
    static get currentDevice() { return nativeClassObject('UIDevice', 'currentDevice'); }

    // 拿不到用户给设备起的名字（iOS 16 起）。头文件说它是 model 的同义词：
    // 真机上属实（都是 iPhone），模拟器上是模拟器的名字（iPhone Air）
    get name() { requireNative(this, 'name'); return nativeGet(this, 'name'); }
    get model() { requireNative(this, 'model'); return nativeGet(this, 'model'); }
    get localizedModel() {
      requireNative(this, 'localizedModel');
      return nativeGet(this, 'localizedModel');
    }
    get systemName() { requireNative(this, 'systemName'); return nativeGet(this, 'systemName'); }
    // 字符串，形如 '26.1'。要比大小先拆开转成数，别直接比字符串
    get systemVersion() {
      requireNative(this, 'systemVersion');
      return nativeGet(this, 'systemVersion');
    }
    get userInterfaceIdiom() {
      requireNative(this, 'userInterfaceIdiom');
      return nativeGet(this, 'userInterfaceIdiom');
    }
    // 同一个开发者的 App 在这台设备上共用的 UUID。App 全卸掉再装会变
    get identifierForVendor() {
      requireNative(this, 'identifierForVendor');
      return nativeGet(this, 'identifierForVendor');
    }
  });

  // ---- 触感反馈 ----
  //
  // 让手机震一下。三种：撞击（按钮按下、东西落位）、选择（滚轮换了一格）、
  // 通知（成功 / 警告 / 失败）。
  //
  // **没有 new**。ObjC 的 -init 在头文件里已经标成将废弃，替代品是和视图
  // 绑定的工厂方法，这里只给后者。
  function noFeedbackInit(newTarget, hint) {
    finalCheck(newTarget);   // 是子类化就先报子类化
    throw new TypeError(
      'Illegal constructor: ' + (nativeClassNames.get(newTarget) || 'this class') +
      ' has no public initializer; use ' + hint);
  }
  const UIFeedbackGenerator = defineNativeClass('UIFeedbackGenerator',
                                                class UIFeedbackGenerator extends NSObject {
    constructor() {
      noFeedbackInit(new.target, 'one of its subclasses, e.g. ' +
        'UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView: view })');
    }
    // 提前让触感引擎就绪。马上就要触发时先调它，延迟更小
    prepare() { nativeCall(this, 'prepare', []); }
  });

  defineNativeClass('UIImpactFeedbackGenerator',
                    class UIImpactFeedbackGenerator extends UIFeedbackGenerator {
    constructor() {
      noFeedbackInit(new.target,
        'UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView: view })');
    }
    static feedbackGeneratorWithStyle(style, options) {
      const o = options || {};
      if (!(has(o, 'forView'))) {
        throw new TypeError('feedbackGeneratorWithStyle needs { forView }');
      }
      return nativeClassCall('UIImpactFeedbackGenerator',
                             'feedbackGeneratorWithStyle:forView:', [style, o.forView]);
    }
    impactOccurred() { nativeCall(this, 'impactOccurred', []); }
    // 0 到 1，1 是这种力度的满强度
    impactOccurredWithIntensity(intensity) {
      nativeCall(this, 'impactOccurredWithIntensity:', [intensity]);
    }
  });

  defineNativeClass('UISelectionFeedbackGenerator',
                    class UISelectionFeedbackGenerator extends UIFeedbackGenerator {
    constructor() {
      noFeedbackInit(new.target, 'UISelectionFeedbackGenerator.feedbackGeneratorForView(view)');
    }
    static feedbackGeneratorForView(view) {
      return nativeClassCall('UISelectionFeedbackGenerator', 'feedbackGeneratorForView:', [view]);
    }
    selectionChanged() { nativeCall(this, 'selectionChanged', []); }
  });

  defineNativeClass('UINotificationFeedbackGenerator',
                    class UINotificationFeedbackGenerator extends UIFeedbackGenerator {
    constructor() {
      noFeedbackInit(new.target,
        'UINotificationFeedbackGenerator.feedbackGeneratorForView(view)');
    }
    static feedbackGeneratorForView(view) {
      return nativeClassCall('UINotificationFeedbackGenerator', 'feedbackGeneratorForView:',
                             [view]);
    }
    notificationOccurred(type) { nativeCall(this, 'notificationOccurred:', [type]); }
  });

  // 系统剪贴板。只有类级的单例 generalPasteboard，现在只管字符串。
  //
  // 读 string 是真的去取内容——内容来自别的 App 时系统可能先问用户，
  // 所以另外给了两个不取内容的查询：hasStrings 和 changeCount
  defineNativeClass('UIPasteboard', class UIPasteboard extends NSObject {
    constructor() { nativeOnly(new.target); }
    static get generalPasteboard() {
      return nativeClassObject('UIPasteboard', 'generalPasteboard');
    }

    [kSubscribe](type, on) {
      requireNative(this, 'addEventListener');
      native.subscribe(this[kHandle], type, on);
      if (on) {
        subscribed.add(this);
      } else if (this[kListeners].size === 0) {
        subscribed.delete(this);
      }
    }

    get string() { requireNative(this, 'string'); return nativeGet(this, 'string'); }
    set string(value) { requireNative(this, 'string'); nativeSet(this, 'string', value); }
    get hasStrings() { requireNative(this, 'hasStrings'); return nativeGet(this, 'hasStrings'); }
    get changeCount() {
      requireNative(this, 'changeCount');
      return nativeGet(this, 'changeCount');
    }
  });

  // 和屏幕刷新同步的回调。
  //
  // ```js
  // const link = new CADisplayLink();
  // link.addEventListener('tick', (e) => { box.layer.position = next(e.frame); });
  // link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
  // …
  // link.invalidate();
  // ```
  //
  // **两道闸都要开**：挂了监听器，还要 addToRunLoop，少一个都不发。
  //
  // ObjC 那边是 +displayLinkWithTarget:selector:，而 target / selector 在 JS
  // 里没有对应物，所以运行时自己当 target，JS 侧只看到事件——和控件事件
  // 一个做法。
  //
  // 日常动画**优先用 animate / CAAnimation**：那些跑在 render server 里，
  // 主线程卡住照样走；display link 驱动的每帧都要 JS，主线程一忙就掉帧。
  defineNativeClass('CADisplayLink', class CADisplayLink extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'CADisplayLink', []);
    }

    [kSubscribe](type, on) {
      requireNative(this, 'addEventListener');
      native.subscribe(this[kHandle], type, on);
      if (on) subscribed.add(this);
      else if (this[kListeners].size === 0) subscribed.delete(this);
    }

    // 'default' 只在平时跑，**滚动时会停**；'common' 滚动时也跑。
    // 这是 display link 最常见的坑
    addToRunLoop(runLoop, options) {
      const o = options || {};
      nativeCall(this, 'addToRunLoop:forMode:',
                 [runLoop, has(o, 'forMode') ? o.forMode : 'default']);
      ownOne(this, 'runLoops', runLoop);
    }
    removeFromRunLoop(runLoop, options) {
      const o = options || {};
      nativeCall(this, 'removeFromRunLoop:forMode:',
                 [runLoop, has(o, 'forMode') ? o.forMode : 'default']);
    }
    // 从所有模式里摘掉。摘完就再也启动不了，要新的就再 new 一个
    invalidate() { nativeCall(this, 'invalidate', []); }

    // 下面三个都是**秒**，和 ObjC 一致。基准是设备启动，不是 Date.now()，
    // 只能拿来算差值
    get timestamp() { requireNative(this, 'timestamp'); return nativeGet(this, 'timestamp'); }
    get duration() { requireNative(this, 'duration'); return nativeGet(this, 'duration'); }
    // 该为哪一帧渲染。做预测用这个，不是 timestamp
    get targetTimestamp() {
      requireNative(this, 'targetTimestamp');
      return nativeGet(this, 'targetTimestamp');
    }
    // 暂停不等于摘掉：还挂在 run loop 上，设回 false 就继续
    get isPaused() { requireNative(this, 'isPaused'); return nativeGet(this, 'isPaused'); }
    set isPaused(value) { requireNative(this, 'isPaused'); nativeSet(this, 'isPaused', value); }
    // 想要多少帧率。默认三个 0 = 跟硬件走
    get preferredFrameRateRange() {
      requireNative(this, 'preferredFrameRateRange');
      return toFrameRateRange(nativeGet(this, 'preferredFrameRateRange'));
    }
    set preferredFrameRateRange(value) {
      requireNative(this, 'preferredFrameRateRange');
      nativeSet(this, 'preferredFrameRateRange',
                structArg(value, FRAME_RATE_FIELDS, 'preferredFrameRateRange'));
    }
  });

  // 事务。它管的是**隐式动画**：在 UIKit 的动画块外面改独立子图层的属性，
  // Core Animation 默认给一个 0.25 秒的动画。setDisableActions 是关掉它的
  // 唯一办法，begin / commit 成对出现。
  //
  // 全是类方法，没有实例，所以不给构造。
  class CATransaction {
    constructor() {
      throw new TypeError(
        'Illegal constructor: CATransaction is a set of class methods, not an object');
    }
    static begin() { nativeClassCallValue('CATransaction', 'begin', []); }
    static commit() { nativeClassCallValue('CATransaction', 'commit', []); }
    static flush() { nativeClassCallValue('CATransaction', 'flush', []); }
    static disableActions() {
      return nativeClassCallValue('CATransaction', 'disableActions', []);
    }
    static setDisableActions(value) {
      nativeClassCallValue('CATransaction', 'setDisableActions:', [value]);
    }
    static animationDuration() {
      return nativeClassCallValue('CATransaction', 'animationDuration', []);
    }
    static setAnimationDuration(value) {
      nativeClassCallValue('CATransaction', 'setAnimationDuration:', [value]);
    }
    static animationTimingFunction() {
      return nativeClassCall('CATransaction', 'animationTimingFunction', []);
    }
    static setAnimationTimingFunction(value) {
      nativeClassCallValue('CATransaction', 'setAnimationTimingFunction:', [value]);
    }
  }
  define(globalThis, 'CATransaction', CATransaction);

  // ---------- Auto Layout ----------
  //
  // 一条约束就是一句等式：
  //
  //     item1.attr1  <关系>  multiplier × item2.attr2 + constant
  //
  // 求解器拿所有约束算出每个 view 的 frame。所以用了约束就**别再写 frame**
  // ——两边在写同一个值，谁最后写谁赢，而且下次布局还会被覆盖。
  //
  // 锚点是「某个 view 的某条边」的对象化。比 7 参的 constraintWithItem:…
  // 好在两点：短，而且**类型安全**——横向锚点连不上纵向锚点。原生那边是
  // 抛 NSInvalidArgumentException，我们在桥上先查、变成 TypeError。
  //
  // 锚点不能构造，只能从 view 或 UILayoutGuide 上取。

  // 「第一段 + options」还原成完整 selector。顺序显式写死，不遍历 options
  // ——键序靠不住，而 multiplier 和 constant 的先后决定了参数下标。
  function anchorConstraint(anchor, first, other, options) {
    const o = options || {};
    let selector = first + ':';
    const args = [other];
    if (has(o, 'multiplier')) { selector += 'multiplier:'; args.push(o.multiplier); }
    if (has(o, 'constant')) { selector += 'constant:'; args.push(o.constant); }
    return constraintOf(nativeCallObject(anchor, selector, args), anchor, other);
  }
  // 按状态设置时的 { forState: [...] }。缺了就抛，不默默当成 normal——
  // 「给哪个状态设的」是这类方法的核心语义，猜错了界面就不对。
  // 按状态存的东西（UIButton 的标题色 / 图 / 背景图）既不是父子边也不是
  // 属性边，所以躲过了 ownOne 和 nativeSetOwned 两张网。用「名字:状态」
  // 做所有权边的键：重设同一个状态时旧的会被顶掉，不留多余引用。
  // 实测过漏这条的后果：丢掉 JS 引用、GC 之后 imageForState 读回来是个
  // 全新的包装，挂在上面的东西全没了。Chrome 在同样的位置不丢（Attr 节点、
  // adoptedStyleSheets、getAnimations 实测都保住），所以这里也不该丢。
  function stateKey(what, state) {
    return what + ':' + (Array.isArray(state) ? state.join('|') : state);
  }

  function stateOption(options, what) {
    const o = options || {};
    if (!(has(o, 'forState'))) throw new TypeError(what + ' needs { forState }');
    return o.forState;
  }

  // 系统标准间距。差多少由系统按上下文定（8pt 起步，但靠近屏幕边缘、不同
  // 控件之间都不一样），这是 iOS 独有的能力，Web 里没有对应物。
  // multiplier 省略时按 1 ——它是乘法的单位元，省略的含义没有歧义。
  function systemSpacingConstraint(anchor, first, other, options) {
    const o = options || {};
    const multiplier = has(o, 'multiplier') ? o.multiplier : 1;
    return constraintOf(
      nativeCallObject(anchor, first + ':multiplier:', [other, multiplier]),
      anchor, other);
  }

  const NSLayoutAnchor = defineNativeClass('NSLayoutAnchor',
      class NSLayoutAnchor extends NSObject {
    constructor() { nativeOnly(new.target); }

    constraintEqualToAnchor(other, options) {
      return anchorConstraint(this, 'constraintEqualToAnchor', other, options);
    }
    constraintGreaterThanOrEqualToAnchor(other, options) {
      return anchorConstraint(this, 'constraintGreaterThanOrEqualToAnchor', other, options);
    }
    constraintLessThanOrEqualToAnchor(other, options) {
      return anchorConstraint(this, 'constraintLessThanOrEqualToAnchor', other, options);
    }
  });

  // 横向：leading / trailing / left / right / centerX
  defineNativeClass('NSLayoutXAxisAnchor', class NSLayoutXAxisAnchor extends NSLayoutAnchor {
    constructor() { nativeOnly(new.target); }

    constraintEqualToSystemSpacingAfterAnchor(other, options) {
      return systemSpacingConstraint(
        this, 'constraintEqualToSystemSpacingAfterAnchor', other, options);
    }
    constraintGreaterThanOrEqualToSystemSpacingAfterAnchor(other, options) {
      return systemSpacingConstraint(
        this, 'constraintGreaterThanOrEqualToSystemSpacingAfterAnchor', other, options);
    }
    constraintLessThanOrEqualToSystemSpacingAfterAnchor(other, options) {
      return systemSpacingConstraint(
        this, 'constraintLessThanOrEqualToSystemSpacingAfterAnchor', other, options);
    }
    // 两个锚点之间的距离，本身又是一个可约束的量
    anchorWithOffsetToAnchor(other) {
      const dimension = nativeCallObject(this, 'anchorWithOffsetToAnchor:', [other]);
      own(dimension, 'from', this);
      own(dimension, 'to', other);
      return dimension;
    }
  });

  // 纵向：top / bottom / centerY / firstBaseline / lastBaseline
  defineNativeClass('NSLayoutYAxisAnchor', class NSLayoutYAxisAnchor extends NSLayoutAnchor {
    constructor() { nativeOnly(new.target); }

    constraintEqualToSystemSpacingBelowAnchor(other, options) {
      return systemSpacingConstraint(
        this, 'constraintEqualToSystemSpacingBelowAnchor', other, options);
    }
    constraintGreaterThanOrEqualToSystemSpacingBelowAnchor(other, options) {
      return systemSpacingConstraint(
        this, 'constraintGreaterThanOrEqualToSystemSpacingBelowAnchor', other, options);
    }
    constraintLessThanOrEqualToSystemSpacingBelowAnchor(other, options) {
      return systemSpacingConstraint(
        this, 'constraintLessThanOrEqualToSystemSpacingBelowAnchor', other, options);
    }
    anchorWithOffsetToAnchor(other) {
      const dimension = nativeCallObject(this, 'anchorWithOffsetToAnchor:', [other]);
      own(dimension, 'from', this);
      own(dimension, 'to', other);
      return dimension;
    }
  });

  // 尺寸：width / height。只有它能和常数比，也只有它能带 multiplier
  defineNativeClass('NSLayoutDimension', class NSLayoutDimension extends NSLayoutAnchor {
    constructor() { nativeOnly(new.target); }

    constraintEqualToConstant(value) {
      return nativeCallObject(this, 'constraintEqualToConstant:', [value]);
    }
    constraintGreaterThanOrEqualToConstant(value) {
      return nativeCallObject(this, 'constraintGreaterThanOrEqualToConstant:', [value]);
    }
    constraintLessThanOrEqualToConstant(value) {
      return nativeCallObject(this, 'constraintLessThanOrEqualToConstant:', [value]);
    }
  });

  defineNativeClass('NSLayoutConstraint', class NSLayoutConstraint extends NSObject {
    constructor() { nativeOnly(new.target); }

    // 唯一的开关。激活时约束被装到两端的最近公共祖先上——所以**没有公共
    // 祖先就激活不了**，原生那边是抛异常，这里转成 TypeError。
    get isActive() { requireNative(this, 'isActive'); return nativeGet(this, 'isActive'); }
    set isActive(value) { requireNative(this, 'isActive'); nativeSet(this, 'isActive', value); }

    // 约束里唯一可写的数值，做动画改的就是它
    get constant() { requireNative(this, 'constant'); return nativeGet(this, 'constant'); }
    set constant(value) { requireNative(this, 'constant'); nativeSet(this, 'constant', value); }

    // **写接受字符串或数字，读永远返回数字。** UILayoutPriority 是 float，
    // 具名值只有七个，749 这种值没有名字——读出来硬编成字符串只能编一个。
    get priority() { requireNative(this, 'priority'); return nativeGet(this, 'priority'); }
    set priority(value) { requireNative(this, 'priority'); nativeSet(this, 'priority', value); }

    // 调试用。UIKit 报约束冲突时会把它打出来
    get identifier() { requireNative(this, 'identifier'); return nativeGet(this, 'identifier'); }
    set identifier(value) { requireNative(this, 'identifier'); nativeSet(this, 'identifier', value); }

    // 建好就定死的部分
    get multiplier() { requireNative(this, 'multiplier'); return nativeGet(this, 'multiplier'); }
    get relation() { requireNative(this, 'relation'); return nativeGet(this, 'relation'); }
    get firstAttribute() {
      requireNative(this, 'firstAttribute');
      return nativeGet(this, 'firstAttribute');
    }
    get secondAttribute() {
      requireNative(this, 'secondAttribute');
      return nativeGet(this, 'secondAttribute');
    }
    // firstItem / secondItem 不暴露：原生是 assign，view 一死就是野指针，
    // 头文件自己写着「Access to these properties is not recommended」。
    // 要两端的 view，从锚点走。
    get firstAnchor() { return nativeGetOwned(this, 'firstAnchor'); }
    get secondAnchor() { return nativeGetOwned(this, 'secondAnchor'); }

    // 批量比逐个 isActive = true 好：中间态不会短暂地不可满足
    static activateConstraints(constraints) {
      nativeClassCall('NSLayoutConstraint', 'activateConstraints:',
                      Array.from(constraints));
    }
    static deactivateConstraints(constraints) {
      nativeClassCall('NSLayoutConstraint', 'deactivateConstraints:',
                      Array.from(constraints));
    }
  });

  // 不画东西的矩形。用来占位、分组、做间距，比塞一个透明 UIView 省一个图层。
  // 比 UIView 少两个锚点：没有基线，因为它没有文字。
  const UILayoutGuide = defineNativeClass('UILayoutGuide', class UILayoutGuide extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'UILayoutGuide', []);
    }
    get owningView() { return nativeGetOwned(this, 'owningView'); }
    // 求解之后这个 guide 占的位置，在 owningView 的坐标系里
    get layoutFrame() {
      requireNative(this, 'layoutFrame');
      return toRect(nativeGet(this, 'layoutFrame'));
    }
    get identifier() { requireNative(this, 'identifier'); return nativeGet(this, 'identifier'); }
    set identifier(value) { requireNative(this, 'identifier'); nativeSet(this, 'identifier', value); }

    get leadingAnchor() { return anchorOf(this, 'leadingAnchor'); }
    get trailingAnchor() { return anchorOf(this, 'trailingAnchor'); }
    get leftAnchor() { return anchorOf(this, 'leftAnchor'); }
    get rightAnchor() { return anchorOf(this, 'rightAnchor'); }
    get topAnchor() { return anchorOf(this, 'topAnchor'); }
    get bottomAnchor() { return anchorOf(this, 'bottomAnchor'); }
    get widthAnchor() { return anchorOf(this, 'widthAnchor'); }
    get heightAnchor() { return anchorOf(this, 'heightAnchor'); }
    get centerXAnchor() { return anchorOf(this, 'centerXAnchor'); }
    get centerYAnchor() { return anchorOf(this, 'centerYAnchor'); }
  });

  // 键盘避让的那条 guide。ObjC 的继承链是
  // UIKeyboardLayoutGuide : UITrackingLayoutGuide : UILayoutGuide，照着放。
  // UITrackingLayoutGuide 那组「按边缘远近自动启停约束」的方法 v1 没做
  const UITrackingLayoutGuide =
    defineNativeClass('UITrackingLayoutGuide', class UITrackingLayoutGuide
                      extends UILayoutGuide {
      constructor() { nativeOnly(new.target); }
    });

  // **键盘收起时它贴安全区底边，弹出时贴键盘顶边**，所以一条约束管两种
  // 状态——不用听键盘通知，也不用自己算动画曲线
  defineNativeClass('UIKeyboardLayoutGuide', class UIKeyboardLayoutGuide
                    extends UITrackingLayoutGuide {
    constructor() { nativeOnly(new.target); }

    /** iPad 的浮动/拆分键盘也跟。默认 false */
    get followsUndockedKeyboard() { return nativeGet(this, 'followsUndockedKeyboard'); }
    set followsUndockedKeyboard(value) {
      nativeSet(this, 'followsUndockedKeyboard', value);
    }
    /** 下滑收键盘时提前多少开始。默认 0 */
    get keyboardDismissPadding() { return nativeGet(this, 'keyboardDismissPadding'); }
    set keyboardDismissPadding(value) {
      nativeSet(this, 'keyboardDismissPadding', value);
    }
  });

  const UIView = defineNativeClass('UIView', class UIView extends UIResponder {
    constructor() {
      super();
      constructNative(this, new.target, 'UIView', []);
    }

    // ---- 几何 ----
    get frame() {
      requireNative(this, 'frame');
      return toRect(nativeGet(this, 'frame'));
    }
    set frame(value) {
      requireNative(this, 'frame');
      nativeSet(this, 'frame', structArg(value, RECT_FIELDS, 'frame'));
    }
    get bounds() {
      requireNative(this, 'bounds');
      return toRect(nativeGet(this, 'bounds'));
    }
    set bounds(value) {
      requireNative(this, 'bounds');
      nativeSet(this, 'bounds', structArg(value, RECT_FIELDS, 'bounds'));
    }
    get center() {
      requireNative(this, 'center');
      return toPoint(nativeGet(this, 'center'));
    }
    set center(value) {
      requireNative(this, 'center');
      nativeSet(this, 'center', structArg(value, POINT_FIELDS, 'center'));
    }
    get safeAreaInsets() {
      requireNative(this, 'safeAreaInsets');
      return toInsets(nativeGet(this, 'safeAreaInsets'));
    }
    // 内边距。两个属性是同一份数据的两个视图：directional 那个的
    // leading / trailing 跟着文字方向走，另一个的 left / right 写死。
    // 读出来的值**不一定等于写进去的**：insetsLayoutMarginsFromSafeArea
    // 为 true 时系统会把安全区加上去
    get layoutMargins() {
      requireNative(this, 'layoutMargins');
      return toInsets(nativeGet(this, 'layoutMargins'));
    }
    set layoutMargins(value) {
      requireNative(this, 'layoutMargins');
      nativeSet(this, 'layoutMargins', structArg(value, INSETS_FIELDS, 'layoutMargins'));
    }
    get directionalLayoutMargins() {
      requireNative(this, 'directionalLayoutMargins');
      return toDirectionalInsets(nativeGet(this, 'directionalLayoutMargins'));
    }
    set directionalLayoutMargins(value) {
      requireNative(this, 'directionalLayoutMargins');
      nativeSet(this, 'directionalLayoutMargins',
                structArg(value, DIRECTIONAL_INSETS_FIELDS, 'directionalLayoutMargins'));
    }
    get insetsLayoutMarginsFromSafeArea() {
      requireNative(this, 'insetsLayoutMarginsFromSafeArea');
      return nativeGet(this, 'insetsLayoutMarginsFromSafeArea');
    }
    set insetsLayoutMarginsFromSafeArea(value) {
      requireNative(this, 'insetsLayoutMarginsFromSafeArea');
      nativeSet(this, 'insetsLayoutMarginsFromSafeArea', value);
    }
    get preservesSuperviewLayoutMargins() {
      requireNative(this, 'preservesSuperviewLayoutMargins');
      return nativeGet(this, 'preservesSuperviewLayoutMargins');
    }
    set preservesSuperviewLayoutMargins(value) {
      requireNative(this, 'preservesSuperviewLayoutMargins');
      nativeSet(this, 'preservesSuperviewLayoutMargins', value);
    }
    sizeThatFits(size) {
      return toSize(nativeCall(this, 'sizeThatFits:',
                               [structArg(size, SIZE_FIELDS, 'sizeThatFits')]));
    }
    sizeToFit() { nativeCall(this, 'sizeToFit', []); }
    convertPoint(point, options) {
      const p = structArg(point, POINT_FIELDS, 'convertPoint');
      const o = options || {};
      if (has(o, 'toView')) return toPoint(nativeCall(this, 'convertPoint:toView:', [p, o.toView]));
      if (has(o, 'fromView')) return toPoint(nativeCall(this, 'convertPoint:fromView:', [p, o.fromView]));
      throw new TypeError('convertPoint needs { toView } or { fromView }');
    }
    convertRect(rect, options) {
      const r = structArg(rect, RECT_FIELDS, 'convertRect');
      const o = options || {};
      if (has(o, 'toView')) return toRect(nativeCall(this, 'convertRect:toView:', [r, o.toView]));
      if (has(o, 'fromView')) return toRect(nativeCall(this, 'convertRect:fromView:', [r, o.fromView]));
      throw new TypeError('convertRect needs { toView } or { fromView }');
    }
    hitTest(point) {
      return nativeCallObject(this, 'hitTest:withEvent:',
                              [structArg(point, POINT_FIELDS, 'hitTest')]);
    }

    // ---- 层级 ----
    get superview() {
      requireNative(this, 'superview');
      return nativeGetObject(this, 'superview');
    }
    // 读的同时按原生的真相重建这一层的持有列表（见「所有权镜像」）
    get subviews() {
      return ownAll(this, 'subviews', nativeGetObjectArray(this, 'subviews'));
    }
    get window() {
      requireNative(this, 'window');
      return nativeGetObject(this, 'window');
    }
    addSubview(view) {
      const from = superviewOf(view);
      nativeCall(this, 'addSubview:', [view]);
      disown(from, 'subviews', view);
      ownOne(this, 'subviews', view);
    }
    insertSubview(view, options) {
      const o = options || {};
      const from = superviewOf(view);
      if (has(o, 'atIndex')) {
        nativeCall(this, 'insertSubview:atIndex:', [view, o.atIndex]);
      } else if (has(o, 'belowSubview')) {
        nativeCall(this, 'insertSubview:belowSubview:', [view, o.belowSubview]);
      } else if (has(o, 'aboveSubview')) {
        nativeCall(this, 'insertSubview:aboveSubview:', [view, o.aboveSubview]);
      } else {
        throw new TypeError(
          'insertSubview needs one of { atIndex } / { belowSubview } / { aboveSubview }');
      }
      disown(from, 'subviews', view);
      ownOne(this, 'subviews', view);
    }
    removeFromSuperview() {
      const from = superviewOf(this);
      nativeCall(this, 'removeFromSuperview', []);
      disown(from, 'subviews', this);
    }
    // 手势识别器。视图强持有它们，和子视图是同一种边。
    // 一个识别器同一时刻只能挂在一个视图上：挂到新的视图，UIKit 会把它
    // 从旧的那个上摘下来，所以这里也跟着断旧边
    get gestureRecognizers() {
      return ownAll(this, 'gestureRecognizers',
                    nativeGetObjectArray(this, 'gestureRecognizers'));
    }
    addGestureRecognizer(recognizer) {
      const from = gestureViewOf(recognizer);
      nativeCall(this, 'addGestureRecognizer:', [recognizer]);
      disown(from, 'gestureRecognizers', recognizer);
      ownOne(this, 'gestureRecognizers', recognizer);
    }
    removeGestureRecognizer(recognizer) {
      nativeCall(this, 'removeGestureRecognizer:', [recognizer]);
      disown(this, 'gestureRecognizers', recognizer);
    }
    bringSubviewToFront(view) { nativeCall(this, 'bringSubviewToFront:', [view]); }
    sendSubviewToBack(view) { nativeCall(this, 'sendSubviewToBack:', [view]); }
    isDescendantOfView(view) {
      return nativeCall(this, 'isDescendantOfView:', [view]);
    }
    viewWithTag(tag) { return nativeCallObject(this, 'viewWithTag:', [tag]); }
    setNeedsLayout() { nativeCall(this, 'setNeedsLayout', []); }
    layoutIfNeeded() { nativeCall(this, 'layoutIfNeeded', []); }
    setNeedsDisplay() { nativeCall(this, 'setNeedsDisplay', []); }

    // 圆角、边框、阴影都在这上面。view 和 layer 是一对一的，取两次是同一个对象
    get layer() { return nativeGetOwned(this, 'layer'); }

    // ---- Auto Layout ----
    //
    // **用约束之前先把这个关掉**，否则系统会把 frame 翻译成一组
    // required 优先级的约束，和你写的那些直接打架。默认是 true，
    // 因为老代码全靠 frame。
    // 仿射变换。**非单位矩阵时 frame 就没有意义了**（UIKit 的规定），
    // 要改位置和大小请用 bounds 和 center
    get transform() {
      requireNative(this, 'transform');
      return toTransform(nativeGet(this, 'transform'));
    }
    set transform(value) {
      requireNative(this, 'transform');
      nativeSet(this, 'transform', structArg(value, TRANSFORM_FIELDS, 'transform'));
    }
    get translatesAutoresizingMaskIntoConstraints() {
      requireNative(this, 'translatesAutoresizingMaskIntoConstraints');
      return nativeGet(this, 'translatesAutoresizingMaskIntoConstraints');
    }
    set translatesAutoresizingMaskIntoConstraints(value) {
      requireNative(this, 'translatesAutoresizingMaskIntoConstraints');
      nativeSet(this, 'translatesAutoresizingMaskIntoConstraints', value);
    }

    get leadingAnchor() { return anchorOf(this, 'leadingAnchor'); }
    get trailingAnchor() { return anchorOf(this, 'trailingAnchor'); }
    // left / right 是物理左右，leading / trailing 跟书写方向走。
    // 除非真的是「屏幕左边」，否则用 leading / trailing
    get leftAnchor() { return anchorOf(this, 'leftAnchor'); }
    get rightAnchor() { return anchorOf(this, 'rightAnchor'); }
    get topAnchor() { return anchorOf(this, 'topAnchor'); }
    get bottomAnchor() { return anchorOf(this, 'bottomAnchor'); }
    get widthAnchor() { return anchorOf(this, 'widthAnchor'); }
    get heightAnchor() { return anchorOf(this, 'heightAnchor'); }
    get centerXAnchor() { return anchorOf(this, 'centerXAnchor'); }
    get centerYAnchor() { return anchorOf(this, 'centerYAnchor'); }
    // 按文字基线对齐，不是按边框。两行字号不同的文字并排时差别很明显
    get firstBaselineAnchor() { return anchorOf(this, 'firstBaselineAnchor'); }
    get lastBaselineAnchor() { return anchorOf(this, 'lastBaselineAnchor'); }

    // 刘海、Home 指示条、状态栏让出来的那块
    get safeAreaLayoutGuide() { return nativeGetOwned(this, 'safeAreaLayoutGuide'); }
    get layoutMarginsGuide() { return nativeGetOwned(this, 'layoutMarginsGuide'); }
    /**
     * 键盘避让。**收起时它贴安全区底边，弹出时贴键盘顶边**，所以把内容的
     * 底边约束到它的 topAnchor，一条约束管两种状态：
     *
     *     field.bottomAnchor
     *       .constraintEqualToAnchor(view.keyboardLayoutGuide.topAnchor,
     *                                { constant: -16 }).isActive = true;
     */
    get keyboardLayoutGuide() { return nativeGetOwned(this, 'keyboardLayoutGuide'); }
    /**
     * 让这棵子树里的 first responder 交出身份——收键盘最常用的那一个。
     * force 为 true 时不管对方愿不愿意。
     */
    endEditing(force) { return nativeCall(this, 'endEditing:', [!!force]); }
    // 一行字的舒适宽度，长文本用它比用 safeArea 好读
    get readableContentGuide() { return nativeGetOwned(this, 'readableContentGuide'); }

    // 装在这个 view 上的约束。注意**不是**「影响这个 view 的约束」——
    // 约束装在两端的最近公共祖先上，所以约束子视图的那些在父视图这里
    get constraints() {
      return ownAll(this, 'constraints', nativeGetObjectArray(this, 'constraints'));
    }
    get layoutGuides() {
      return ownAll(this, 'layoutGuides', nativeGetObjectArray(this, 'layoutGuides'));
    }
    addLayoutGuide(guide) {
      nativeCall(this, 'addLayoutGuide:', [guide]);
      ownOne(this, 'layoutGuides', guide);
    }
    removeLayoutGuide(guide) {
      nativeCall(this, 'removeLayoutGuide:', [guide]);
      disown(this, 'layoutGuides', guide);
    }

    // 固有尺寸变了要主动说一声，否则求解器还用着上一次的值
    invalidateIntrinsicContentSize() {
      nativeCall(this, 'invalidateIntrinsicContentSize', []);
    }

    // 内容抱紧 / 抗压缩。同一条约束的两个方向：
    //   抱紧  = 「别把我拉得比固有尺寸大」的坚持程度
    //   抗压缩 = 「别把我压得比固有尺寸小」的坚持程度
    // 想要 flex-1 的效果，就把那一个的抱紧优先级调低，它会去吃掉剩余空间
    contentHuggingPriorityForAxis(axis) {
      return nativeCall(this, 'contentHuggingPriorityForAxis:', [axis]);
    }
    setContentHuggingPriority(priority, options) {
      const o = options || {};
      if (!(has(o, 'forAxis'))) {
        throw new TypeError('setContentHuggingPriority needs { forAxis }');
      }
      nativeCall(this, 'setContentHuggingPriority:forAxis:', [priority, o.forAxis]);
    }
    contentCompressionResistancePriorityForAxis(axis) {
      return nativeCall(this, 'contentCompressionResistancePriorityForAxis:', [axis]);
    }
    setContentCompressionResistancePriority(priority, options) {
      const o = options || {};
      if (!(has(o, 'forAxis'))) {
        throw new TypeError('setContentCompressionResistancePriority needs { forAxis }');
      }
      nativeCall(this, 'setContentCompressionResistancePriority:forAxis:',
                 [priority, o.forAxis]);
    }

    // 按约束算出来该多大。sizeThatFits 问的是 view 自己的意见，
    // 这个问的是**整棵子树的约束**解出来多大
    systemLayoutSizeFittingSize(size, options) {
      const target = structArg(size, SIZE_FIELDS, 'systemLayoutSizeFittingSize');
      const o = options || {};
      if (has(o, 'withHorizontalFittingPriority') || has(o, 'verticalFittingPriority')) {
        return toSize(nativeCall(
          this,
          'systemLayoutSizeFittingSize:withHorizontalFittingPriority:verticalFittingPriority:',
          [target, o.withHorizontalFittingPriority, o.verticalFittingPriority]));
      }
      return toSize(nativeCall(this, 'systemLayoutSizeFittingSize:', [target]));
    }

    // ---- 排版调试 ----
    // UIKit 在我们这个环境里对约束冲突**一声不吭**（stdout / stderr / os_log
    // 三路实测全空），JS 开发者也没有 Xcode 控制台可看，所以这三个是唯一的
    // 自查手段。
    get hasAmbiguousLayout() {
      requireNative(this, 'hasAmbiguousLayout');
      return nativeGet(this, 'hasAmbiguousLayout');
    }
    // 在几个同样合法的解之间跳一下，肉眼就能看出哪里没约束够
    exerciseAmbiguityInLayout() {
      nativeCall(this, 'exerciseAmbiguityInLayout', []);
    }
    constraintsAffectingLayoutForAxis(axis) {
      return nativeCallObjectArray(this, 'constraintsAffectingLayoutForAxis:', [axis]);
    }

    // ---- 外观 ----
    // 背景色。nil 表示透明，JS 侧用 null 表示。
    get backgroundColor() {
      requireNative(this, 'backgroundColor');
      return colorString(nativeGetOwned(this, 'backgroundColor'));
    }
    set backgroundColor(value) {
      requireNative(this, 'backgroundColor');
      {
      const color = colorArg(value, 'backgroundColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'backgroundColor', color);
    };
    }
    get alpha() { requireNative(this, 'alpha'); return nativeGet(this, 'alpha'); }
    set alpha(value) { requireNative(this, 'alpha'); nativeSet(this, 'alpha', value); }
    get isHidden() { requireNative(this, 'isHidden'); return nativeGet(this, 'isHidden'); }
    set isHidden(value) { requireNative(this, 'isHidden'); nativeSet(this, 'isHidden', value); }
    get clipsToBounds() {
      requireNative(this, 'clipsToBounds');
      return nativeGet(this, 'clipsToBounds');
    }
    set clipsToBounds(value) {
      requireNative(this, 'clipsToBounds');
      nativeSet(this, 'clipsToBounds', value);
    }
    get isOpaque() { requireNative(this, 'isOpaque'); return nativeGet(this, 'isOpaque'); }
    set isOpaque(value) { requireNative(this, 'isOpaque'); nativeSet(this, 'isOpaque', value); }
    get isUserInteractionEnabled() {
      requireNative(this, 'isUserInteractionEnabled');
      return nativeGet(this, 'isUserInteractionEnabled');
    }
    set isUserInteractionEnabled(value) {
      requireNative(this, 'isUserInteractionEnabled');
      nativeSet(this, 'isUserInteractionEnabled', value);
    }
    get tag() { requireNative(this, 'tag'); return nativeGet(this, 'tag'); }
    set tag(value) { requireNative(this, 'tag'); nativeSet(this, 'tag', value); }
    get contentMode() {
      requireNative(this, 'contentMode');
      return nativeGet(this, 'contentMode');
    }
    set contentMode(value) {
      requireNative(this, 'contentMode');
      nativeSet(this, 'contentMode', value);
    }
    // 「我天生多大」。UILabel 按文字算，普通 UIView 返回 (-1, -1)
    // 表示没有固有尺寸——这是 UIViewNoIntrinsicMetric。
    get intrinsicContentSize() {
      requireNative(this, 'intrinsicContentSize');
      return toSize(nativeGet(this, 'intrinsicContentSize'));
    }
  });

  // 字体。不能直接构造，走类方法。
  defineNativeClass('UIFont', class UIFont extends NSObject {
    constructor() { nativeOnly(new.target); }
    static systemFontOfSize(size, options) {
      const o = options || {};
      if (has(o, 'weight')) {
        return nativeClassCall('UIFont', 'systemFontOfSize:weight:', [size, o.weight]);
      }
      return nativeClassCall('UIFont', 'systemFontOfSize:', [size]);
    }
    static boldSystemFontOfSize(size) {
      return nativeClassCall('UIFont', 'boldSystemFontOfSize:', [size]);
    }
    static italicSystemFontOfSize(size) {
      return nativeClassCall('UIFont', 'italicSystemFontOfSize:', [size]);
    }
    static monospacedSystemFontOfSize(size, options) {
      const o = options || {};
      return nativeClassCall('UIFont', 'monospacedSystemFontOfSize:weight:',
                             [size, has(o, 'weight') ? o.weight : 'regular']);
    }
    static monospacedDigitSystemFontOfSize(size, options) {
      const o = options || {};
      return nativeClassCall('UIFont', 'monospacedDigitSystemFontOfSize:weight:',
                             [size, has(o, 'weight') ? o.weight : 'regular']);
    }
    static fontWithName(name, options) {
      const o = options || {};
      if (!(has(o, 'size'))) throw new TypeError('fontWithName needs { size }');
      return nativeClassCall('UIFont', 'fontWithName:size:', [name, o.size]);
    }
    // 动态字体：跟随系统的「文字大小」设置
    static preferredFontForTextStyle(style) {
      return nativeClassCall('UIFont', 'preferredFontForTextStyle:', [style]);
    }
    get familyName() { return nativeGet(this, 'familyName'); }
    get fontName() { return nativeGet(this, 'fontName'); }
    get pointSize() { return nativeGet(this, 'pointSize'); }
    get ascender() { return nativeGet(this, 'ascender'); }
    get descender() { return nativeGet(this, 'descender'); }
    get capHeight() { return nativeGet(this, 'capHeight'); }
    get xHeight() { return nativeGet(this, 'xHeight'); }
    get lineHeight() { return nativeGet(this, 'lineHeight'); }
    get leading() { return nativeGet(this, 'leading'); }
  });

  // 图片。和 UIFont 一样走类方法，不能 new——四条取图路径都是工厂方法，
  // 而且都可能返回 null（名字不存在、文件读不到、字节解不出来），
  // 这是合法答案，不是错误。
  //
  // UIImage 是**不可变**的：改渲染模式、做九宫格都返回一张新图。
  defineNativeClass('UIImage', class UIImage extends NSObject {
    constructor() { nativeOnly(new.target); }

    // Asset Catalog 和 bundle 里的普通文件都能命中，认子目录路径
    // （'assets/logo' 可以，但不会递归搜）。@2x/@3x 由系统按屏幕自动选。
    static imageNamed(name) {
      return nativeClassCall('UIImage', 'imageNamed:', [name]);
    }
    // SF Symbols，上千个图标，不占包体积
    static systemImageNamed(name) {
      return nativeClassCall('UIImage', 'systemImageNamed:', [name]);
    }
    // 完整路径，只认真实文件，不碰 Asset Catalog
    static imageWithContentsOfFile(path) {
      return nativeClassCall('UIImage', 'imageWithContentsOfFile:', [path]);
    }
    // 吃 Blob：fetch 下来的字节直接变成图，全程不进 V8 堆
    static imageWithData(blob, options) {
      const o = options || {};
      if (has(o, 'scale')) {
        return nativeClassCall('UIImage', 'imageWithData:scale:', [blob, o.scale]);
      }
      return nativeClassCall('UIImage', 'imageWithData:', [blob]);
    }

    // size 是**点**不是像素。像素 = size × scale
    get size() { return toSize(nativeGet(this, 'size')); }
    get scale() { return nativeGet(this, 'scale'); }
    get imageOrientation() { return nativeGet(this, 'imageOrientation'); }
    get isSymbolImage() { return nativeGet(this, 'isSymbolImage'); }
    get renderingMode() { return nativeGet(this, 'renderingMode'); }
    get capInsets() { return toInsets(nativeGet(this, 'capInsets')); }
    get resizingMode() { return nativeGet(this, 'resizingMode'); }
    get alignmentRectInsets() {
      return toInsets(nativeGet(this, 'alignmentRectInsets'));
    }
    get duration() { return nativeGet(this, 'duration'); }

    // 九宫格：四条边不参与拉伸，只拉中间。小图铺大容器的正解——
    // 把图放大只会糊，这个不会。
    resizableImage(options) {
      const o = options || {};
      if (!(has(o, 'withCapInsets'))) {
        throw new TypeError('resizableImage needs { withCapInsets }');
      }
      const insets = structArg(o.withCapInsets, INSETS_FIELDS, 'withCapInsets');
      if (has(o, 'resizingMode')) {
        return nativeCallObject(this, 'resizableImageWithCapInsets:resizingMode:',
                                [insets, o.resizingMode]);
      }
      return nativeCallObject(this, 'resizableImageWithCapInsets:', [insets]);
    }
    imageWithRenderingMode(mode) {
      return nativeCallObject(this, 'imageWithRenderingMode:', [mode]);
    }

    // 解码默认发生在绘制时，也就是主线程。这两个把解码挪到后台，
    // 解完再给一张准备好的图。JS 本来就在主线程抢时间，大图要走这条。
    prepareForDisplay() {
      return nativeCallAsync(this, 'prepareForDisplay', []);
    }
    prepareThumbnail(size) {
      return nativeCallAsync(this, 'prepareThumbnailOfSize:',
                             [structArg(size, SIZE_FIELDS, 'prepareThumbnail')]);
    }
  });

  // 会接收触摸、并把触摸翻译成「控件事件」的视图。按钮、开关、滑块、
  // 输入框都是它的子类。
  //
  // 它是 iOS 四套事件机制里唯一**直接注册**的那套——不走 responder chain、
  // 不受手势抢占影响，所以最接近 addEventListener。另外三套（hit-testing、
  // responder chain、手势识别器）见 docs/internals/events.md。
  defineNativeClass('UIControl', class UIControl extends UIView {
    constructor() {
      super();
      constructNative(this, new.target, 'UIControl', []);
    }

    // ---- 状态 ----
    // 关掉之后不接收触摸，子类还会画成灰的
    get isEnabled() { requireNative(this, 'isEnabled'); return nativeGet(this, 'isEnabled'); }
    set isEnabled(value) { requireNative(this, 'isEnabled'); nativeSet(this, 'isEnabled', value); }
    // 由 App 自己用，UIKit 不会自动改
    get isSelected() { requireNative(this, 'isSelected'); return nativeGet(this, 'isSelected'); }
    set isSelected(value) { requireNative(this, 'isSelected'); nativeSet(this, 'isSelected', value); }
    // 手指按下时 UIKit 自动置上，抬起时清掉
    get isHighlighted() {
      requireNative(this, 'isHighlighted');
      return nativeGet(this, 'isHighlighted');
    }
    set isHighlighted(value) {
      requireNative(this, 'isHighlighted');
      nativeSet(this, 'isHighlighted', value);
    }
    // 只读，由上面三个合成。位掩码，所以是字符串数组；都没置上时是 ['normal']
    get state() { requireNative(this, 'state'); return nativeGet(this, 'state'); }
    // 只读，只在跟踪触摸期间有意义
    get isTracking() { requireNative(this, 'isTracking'); return nativeGet(this, 'isTracking'); }
    get isTouchInside() {
      requireNative(this, 'isTouchInside');
      return nativeGet(this, 'isTouchInside');
    }

    // ---- 内容对齐 ----
    get contentHorizontalAlignment() {
      requireNative(this, 'contentHorizontalAlignment');
      return nativeGet(this, 'contentHorizontalAlignment');
    }
    set contentHorizontalAlignment(value) {
      requireNative(this, 'contentHorizontalAlignment');
      nativeSet(this, 'contentHorizontalAlignment', value);
    }
    get contentVerticalAlignment() {
      requireNative(this, 'contentVerticalAlignment');
      return nativeGet(this, 'contentVerticalAlignment');
    }
    set contentVerticalAlignment(value) {
      requireNative(this, 'contentVerticalAlignment');
      nativeSet(this, 'contentVerticalAlignment', value);
    }

    // 主动触发，一次可以触发多个。注意 dispatchEvent 不走这条——
    // 那个是 EventTarget 的语义，只派发给 JS 监听器
    sendActionsForControlEvents(types) {
      nativeCall(this, 'sendActionsForControlEvents:', [types]);
    }

    // 惰性订阅：某个类型第一次有监听器时才告诉原生。
    // touchDragInside 在手指移动时每帧都发，没人听还过桥是白费。
    [kSubscribe](type, on) {
      requireNative(this, 'addEventListener');
      native.subscribe(this[kHandle], type, on);
      if (on) {
        subscribed.add(this);
      } else if (this[kListeners].size === 0) {
        subscribed.delete(this);
      }
    }
  });

  // 按钮。标题、颜色、图片都是**按状态**设的——同一个按钮在 normal /
  // highlighted / disabled 下可以不一样。
  defineNativeClass('UIButton', class UIButton extends UIControl {
    constructor() {
      super();
      constructNative(this, new.target, 'UIButton', []);
    }

    // 系统外观的按钮走这条；new UIButton() 得到的是 custom（什么都不画）
    static buttonWithType(type) {
      return nativeClassCall('UIButton', 'buttonWithType:', [type]);
    }

    get buttonType() { requireNative(this, 'buttonType'); return nativeGet(this, 'buttonType'); }
    // 语义角色，影响系统给它的配色
    get role() { requireNative(this, 'role'); return nativeGet(this, 'role'); }
    set role(value) { requireNative(this, 'role'); nativeSet(this, 'role', value); }

    // ---- 按状态设 ----
    // forState 是状态数组，和 control.state 读出来的形状一致。
    // 一般只设 ['normal']，别的状态没设就回退到它
    setTitle(title, options) {
      nativeCall(this, 'setTitle:forState:', [title, stateOption(options, 'setTitle')]);
    }
    setTitleColor(color, options) {
      const state = stateOption(options, 'setTitleColor');
      const value = colorArg(color, 'setTitleColor');
      if (value === undefined) return;   // 不合法，警告过了
      nativeCall(this, 'setTitleColor:forState:', [value, state]);
      own(this, stateKey('titleColor', state), value);
    }
    setImage(image, options) {
      const state = stateOption(options, 'setImage');
      nativeCall(this, 'setImage:forState:', [image, state]);
      own(this, stateKey('image', state), image);
    }
    setBackgroundImage(image, options) {
      const state = stateOption(options, 'setBackgroundImage');
      nativeCall(this, 'setBackgroundImage:forState:', [image, state]);
      own(this, stateKey('backgroundImage', state), image);
    }

    // 取值这一侧**只认单个状态**，这是 UIKit 的规定（头文件原话
    // "these getters only take a single state value"）
    titleForState(state) { return nativeCall(this, 'titleForState:', [[state]]); }
    titleColorForState(state) {
      return colorString(own(this, stateKey('titleColor', state),
                             nativeCallObject(this, 'titleColorForState:', [[state]])));
    }
    imageForState(state) {
      return own(this, stateKey('image', state),
                 nativeCallObject(this, 'imageForState:', [[state]]));
    }
    backgroundImageForState(state) {
      return own(this, stateKey('backgroundImage', state),
                 nativeCallObject(this, 'backgroundImageForState:', [[state]]));
    }

    // ---- 当前状态下实际用的那些 ----
    get currentTitle() { requireNative(this, 'currentTitle'); return nativeGet(this, 'currentTitle'); }
    get currentTitleColor() {
      return colorString(nativeGetOwned(this, 'currentTitleColor'));
    }
    get currentImage() { return nativeGetOwned(this, 'currentImage'); }
    get currentBackgroundImage() { return nativeGetOwned(this, 'currentBackgroundImage'); }

    // 画标题和图的那两个子视图。字体、行数这些要通过它们设
    get titleLabel() { return nativeGetOwned(this, 'titleLabel'); }
    get imageView() { return nativeGetOwned(this, 'imageView'); }
  });

  // 文字。
  defineNativeClass('UILabel', class UILabel extends UIView {
    constructor() {
      super();
      constructNative(this, new.target, 'UILabel', []);
    }
    get text() { requireNative(this, 'text'); return nativeGet(this, 'text'); }
    set text(value) { requireNative(this, 'text'); nativeSet(this, 'text', value); }
    get font() { requireNative(this, 'font'); return nativeGetOwned(this, 'font'); }
    set font(value) { requireNative(this, 'font'); nativeSetOwned(this, 'font', value); }
    get textColor() {
      requireNative(this, 'textColor');
      return colorString(nativeGetOwned(this, 'textColor'));
    }
    set textColor(value) {
      requireNative(this, 'textColor');
      {
      const color = colorArg(value, 'textColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'textColor', color);
    };
    }
    get textAlignment() {
      requireNative(this, 'textAlignment');
      return nativeGet(this, 'textAlignment');
    }
    set textAlignment(value) {
      requireNative(this, 'textAlignment');
      nativeSet(this, 'textAlignment', value);
    }
    get lineBreakMode() {
      requireNative(this, 'lineBreakMode');
      return nativeGet(this, 'lineBreakMode');
    }
    set lineBreakMode(value) {
      requireNative(this, 'lineBreakMode');
      nativeSet(this, 'lineBreakMode', value);
    }
    get numberOfLines() {
      requireNative(this, 'numberOfLines');
      return nativeGet(this, 'numberOfLines');
    }
    set numberOfLines(value) {
      requireNative(this, 'numberOfLines');
      nativeSet(this, 'numberOfLines', value);
    }
    get adjustsFontSizeToFitWidth() {
      requireNative(this, 'adjustsFontSizeToFitWidth');
      return nativeGet(this, 'adjustsFontSizeToFitWidth');
    }
    set adjustsFontSizeToFitWidth(value) {
      requireNative(this, 'adjustsFontSizeToFitWidth');
      nativeSet(this, 'adjustsFontSizeToFitWidth', value);
    }
    get minimumScaleFactor() {
      requireNative(this, 'minimumScaleFactor');
      return nativeGet(this, 'minimumScaleFactor');
    }
    set minimumScaleFactor(value) {
      requireNative(this, 'minimumScaleFactor');
      nativeSet(this, 'minimumScaleFactor', value);
    }
    get baselineAdjustment() {
      requireNative(this, 'baselineAdjustment');
      return nativeGet(this, 'baselineAdjustment');
    }
    set baselineAdjustment(value) {
      requireNative(this, 'baselineAdjustment');
      nativeSet(this, 'baselineAdjustment', value);
    }
    get isHighlighted() {
      requireNative(this, 'isHighlighted');
      return nativeGet(this, 'isHighlighted');
    }
    set isHighlighted(value) {
      requireNative(this, 'isHighlighted');
      nativeSet(this, 'isHighlighted', value);
    }
    get highlightedTextColor() {
      requireNative(this, 'highlightedTextColor');
      return colorString(nativeGetOwned(this, 'highlightedTextColor'));
    }
    set highlightedTextColor(value) {
      requireNative(this, 'highlightedTextColor');
      {
      const color = colorArg(value, 'highlightedTextColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'highlightedTextColor', color);
    };
    }
    get isEnabled() { requireNative(this, 'isEnabled'); return nativeGet(this, 'isEnabled'); }
    set isEnabled(value) {
      requireNative(this, 'isEnabled');
      nativeSet(this, 'isEnabled', value);
    }
    get shadowColor() {
      requireNative(this, 'shadowColor');
      return colorString(nativeGetOwned(this, 'shadowColor'));
    }
    set shadowColor(value) {
      requireNative(this, 'shadowColor');
      {
      const color = colorArg(value, 'shadowColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'shadowColor', color);
    };
    }
    get shadowOffset() {
      requireNative(this, 'shadowOffset');
      return toSize(nativeGet(this, 'shadowOffset'));
    }
    set shadowOffset(value) {
      requireNative(this, 'shadowOffset');
      nativeSet(this, 'shadowOffset', structArg(value, SIZE_FIELDS, 'shadowOffset'));
    }
    // 多行文字算固有高度时要先知道宽度，就靠这个
    get preferredMaxLayoutWidth() {
      requireNative(this, 'preferredMaxLayoutWidth');
      return nativeGet(this, 'preferredMaxLayoutWidth');
    }
    set preferredMaxLayoutWidth(value) {
      requireNative(this, 'preferredMaxLayoutWidth');
      nativeSet(this, 'preferredMaxLayoutWidth', value);
    }
  });

  // 单行输入框。它**是 UIControl**，所以 4a 那 16 个控件事件直接可用：
  //   editingDidBegin / editingChanged / editingDidEnd / editingDidEndOnExit
  // 「文字变了」不需要新机制，听 editingChanged 就行。
  //
  // UITextFieldDelegate 里那几个要**同步返回 BOOL** 的（shouldChangeCharacters、
  // shouldReturn…）要 M1b，v1 不做。常见的两个需求能绕：
  //   输入过滤 → 听 editingChanged，事后截断
  //   回车收键盘 → 听 editingDidEndOnExit，自己 resignFirstResponder()
  defineNativeClass('UITextField', class UITextField extends UIControl {
    constructor() {
      super();
      constructNative(this, new.target, 'UITextField', []);
    }

    get text() { requireNative(this, 'text'); return nativeGet(this, 'text'); }
    set text(value) { requireNative(this, 'text'); nativeSet(this, 'text', value); }
    get placeholder() { requireNative(this, 'placeholder'); return nativeGet(this, 'placeholder'); }
    set placeholder(value) {
      requireNative(this, 'placeholder');
      nativeSet(this, 'placeholder', value);
    }
    /** 正在编辑（已经是 first responder 并且键盘起来了） */
    get isEditing() { requireNative(this, 'isEditing'); return nativeGet(this, 'isEditing'); }

    // ---- 键盘长什么样 ----
    get keyboardType() { requireNative(this, 'keyboardType'); return nativeGet(this, 'keyboardType'); }
    set keyboardType(value) {
      requireNative(this, 'keyboardType');
      nativeSet(this, 'keyboardType', value);
    }
    /** 回车键上印什么字 */
    get returnKeyType() { requireNative(this, 'returnKeyType'); return nativeGet(this, 'returnKeyType'); }
    set returnKeyType(value) {
      requireNative(this, 'returnKeyType');
      nativeSet(this, 'returnKeyType', value);
    }
    get keyboardAppearance() {
      requireNative(this, 'keyboardAppearance');
      return nativeGet(this, 'keyboardAppearance');
    }
    set keyboardAppearance(value) {
      requireNative(this, 'keyboardAppearance');
      nativeSet(this, 'keyboardAppearance', value);
    }
    /** 没有内容时回车键变灰 */
    get enablesReturnKeyAutomatically() {
      requireNative(this, 'enablesReturnKeyAutomatically');
      return nativeGet(this, 'enablesReturnKeyAutomatically');
    }
    set enablesReturnKeyAutomatically(value) {
      requireNative(this, 'enablesReturnKeyAutomatically');
      nativeSet(this, 'enablesReturnKeyAutomatically', value);
    }

    // ---- 输入行为 ----
    get isSecureTextEntry() {
      requireNative(this, 'isSecureTextEntry');
      return nativeGet(this, 'isSecureTextEntry');
    }
    set isSecureTextEntry(value) {
      requireNative(this, 'isSecureTextEntry');
      nativeSet(this, 'isSecureTextEntry', value);
    }
    get autocapitalizationType() {
      requireNative(this, 'autocapitalizationType');
      return nativeGet(this, 'autocapitalizationType');
    }
    set autocapitalizationType(value) {
      requireNative(this, 'autocapitalizationType');
      nativeSet(this, 'autocapitalizationType', value);
    }
    get autocorrectionType() {
      requireNative(this, 'autocorrectionType');
      return nativeGet(this, 'autocorrectionType');
    }
    set autocorrectionType(value) {
      requireNative(this, 'autocorrectionType');
      nativeSet(this, 'autocorrectionType', value);
    }
    get spellCheckingType() {
      requireNative(this, 'spellCheckingType');
      return nativeGet(this, 'spellCheckingType');
    }
    set spellCheckingType(value) {
      requireNative(this, 'spellCheckingType');
      nativeSet(this, 'spellCheckingType', value);
    }
    /**
     * 这个框装的是什么。配上 'username' + 'password' 开启密码自动填充，
     * 'oneTimeCode' 开启短信验证码自动填充。不配就全都没有。
     */
    get textContentType() {
      requireNative(this, 'textContentType');
      return nativeGet(this, 'textContentType');
    }
    set textContentType(value) {
      requireNative(this, 'textContentType');
      nativeSet(this, 'textContentType', value);
    }
    get clearsOnBeginEditing() {
      requireNative(this, 'clearsOnBeginEditing');
      return nativeGet(this, 'clearsOnBeginEditing');
    }
    set clearsOnBeginEditing(value) {
      requireNative(this, 'clearsOnBeginEditing');
      nativeSet(this, 'clearsOnBeginEditing', value);
    }

    // ---- 外观 ----
    get borderStyle() { requireNative(this, 'borderStyle'); return nativeGet(this, 'borderStyle'); }
    set borderStyle(value) {
      requireNative(this, 'borderStyle');
      nativeSet(this, 'borderStyle', value);
    }
    /** 右边那个清空按钮什么时候出现 */
    get clearButtonMode() {
      requireNative(this, 'clearButtonMode');
      return nativeGet(this, 'clearButtonMode');
    }
    set clearButtonMode(value) {
      requireNative(this, 'clearButtonMode');
      nativeSet(this, 'clearButtonMode', value);
    }
    get textAlignment() {
      requireNative(this, 'textAlignment');
      return nativeGet(this, 'textAlignment');
    }
    set textAlignment(value) {
      requireNative(this, 'textAlignment');
      nativeSet(this, 'textAlignment', value);
    }
    get adjustsFontSizeToFitWidth() {
      requireNative(this, 'adjustsFontSizeToFitWidth');
      return nativeGet(this, 'adjustsFontSizeToFitWidth');
    }
    set adjustsFontSizeToFitWidth(value) {
      requireNative(this, 'adjustsFontSizeToFitWidth');
      nativeSet(this, 'adjustsFontSizeToFitWidth', value);
    }
    get minimumFontSize() {
      requireNative(this, 'minimumFontSize');
      return nativeGet(this, 'minimumFontSize');
    }
    set minimumFontSize(value) {
      requireNative(this, 'minimumFontSize');
      nativeSet(this, 'minimumFontSize', value);
    }
    get font() { requireNative(this, 'font'); return nativeGetOwned(this, 'font'); }
    set font(value) { requireNative(this, 'font'); nativeSetOwned(this, 'font', value); }
    get textColor() {
      requireNative(this, 'textColor');
      return colorString(nativeGetOwned(this, 'textColor'));
    }
    set textColor(value) {
      requireNative(this, 'textColor');
      const color = colorArg(value, 'textColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'textColor', color);
    }
  });

  // 图片上屏。
  //
  // 「图比容器大/小/比例不一样怎么办」全靠 UIView 的 contentMode，
  // 不是这个类的事——那 13 个取值第 2.5 步就有了。
  // scaleAspectFill 记得配 clipsToBounds，否则溢出会画到容器外面。
  defineNativeClass('UIImageView', class UIImageView extends UIView {
    constructor() {
      super();
      constructNative(this, new.target, 'UIImageView', []);
    }
    get image() { requireNative(this, 'image'); return nativeGetOwned(this, 'image'); }
    set image(value) {
      requireNative(this, 'image');
      nativeSetOwned(this, 'image', value);
    }
    // isHighlighted 为 true 时显示这张，用于按下态
    get highlightedImage() {
      requireNative(this, 'highlightedImage');
      return nativeGetOwned(this, 'highlightedImage');
    }
    set highlightedImage(value) {
      requireNative(this, 'highlightedImage');
      nativeSetOwned(this, 'highlightedImage', value);
    }
    get isHighlighted() {
      requireNative(this, 'isHighlighted');
      return nativeGet(this, 'isHighlighted');
    }
    set isHighlighted(value) {
      requireNative(this, 'isHighlighted');
      nativeSet(this, 'isHighlighted', value);
    }
    // 模板图（renderingMode 为 alwaysTemplate，SF Symbols 默认如此）按这个颜色上色
    get tintColor() {
      requireNative(this, 'tintColor');
      return colorString(nativeGetOwned(this, 'tintColor'));
    }
    set tintColor(value) {
      requireNative(this, 'tintColor');
      {
      const color = colorArg(value, 'tintColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'tintColor', color);
    };
    }
    // 逐帧动画还没做（要先能把 GIF 拆成帧），但这个事实先给出来
    get isAnimating() {
      requireNative(this, 'isAnimating');
      return nativeGet(this, 'isAnimating');
    }
  });

  // 颜色。基础色和语义色都是 ObjC 的类级只读属性，按原名暴露。
  // 语义色（systemBackgroundColor、labelColor 等）是动态颜色：
  // 它在绘制时按当时的外观（深色/浅色）解析，所以取一次就能一直用。
  // 带参数的类方法（colorWithRed:green:blue:alpha:）等方法名映射定了再加。
  // 可滚动的视图。滚动本身由 UIKit 在主线程驱动，JS 只是收通知。
  //
  // 事件只有 type 和 target，状态去对象上读（contentOffset、isDecelerating）。
  // 正因为不带数据，同一轮里的多次 scroll 可以无损合并成一次 —— 和 CSSOM
  // 「每帧最多一个 scroll 事件」是同一个做法。
  defineNativeClass('UIScrollView', class UIScrollView extends UIView {
    constructor() {
      super();
      constructNative(this, new.target, 'UIScrollView', []);
    }

    // 事件全在 UIScrollViewDelegate 上，而 delegate 是一个对象不是一组
    // action，所以订阅状态记在原生侧；一个监听器都没有时 delegate 不挂，
    // 一次桥都不过
    [kSubscribe](type, on) {
      requireNative(this, 'addEventListener');
      native.subscribe(this[kHandle], type, on);
      if (on) subscribed.add(this);
      else if (this[kListeners].size === 0) subscribed.delete(this);
    }

    // ---- 内容和偏移 ----
    get contentOffset() {
      requireNative(this, 'contentOffset');
      return toPoint(nativeGet(this, 'contentOffset'));
    }
    set contentOffset(value) {
      requireNative(this, 'contentOffset');
      nativeSet(this, 'contentOffset', structArg(value, POINT_FIELDS, 'contentOffset'));
    }
    get contentSize() {
      requireNative(this, 'contentSize');
      return toSize(nativeGet(this, 'contentSize'));
    }
    set contentSize(value) {
      requireNative(this, 'contentSize');
      nativeSet(this, 'contentSize', structArg(value, SIZE_FIELDS, 'contentSize'));
    }
    get contentInset() {
      requireNative(this, 'contentInset');
      return toInsets(nativeGet(this, 'contentInset'));
    }
    set contentInset(value) {
      requireNative(this, 'contentInset');
      nativeSet(this, 'contentInset', structArg(value, INSETS_FIELDS, 'contentInset'));
    }
    // contentInset 加上安全区等系统自己补的那部分。只读
    get adjustedContentInset() {
      requireNative(this, 'adjustedContentInset');
      return toInsets(nativeGet(this, 'adjustedContentInset'));
    }
    get contentInsetAdjustmentBehavior() {
      requireNative(this, 'contentInsetAdjustmentBehavior');
      return nativeGet(this, 'contentInsetAdjustmentBehavior');
    }
    set contentInsetAdjustmentBehavior(value) {
      requireNative(this, 'contentInsetAdjustmentBehavior');
      nativeSet(this, 'contentInsetAdjustmentBehavior', value);
    }
    setContentOffset(offset, options) {
      const o = options || {};
      nativeCall(this, 'setContentOffset:animated:',
                 [structArg(offset, POINT_FIELDS, 'setContentOffset'), !!o.animated]);
    }
    scrollRectToVisible(rect, options) {
      const o = options || {};
      nativeCall(this, 'scrollRectToVisible:animated:',
                 [structArg(rect, RECT_FIELDS, 'scrollRectToVisible'), !!o.animated]);
    }

    // ---- 两个 layout guide：scroll 套 stack 的标准写法全靠它们 ----
    // contentLayoutGuide 定内容多大，frameLayoutGuide 定可视范围
    get contentLayoutGuide() { return nativeGetOwned(this, 'contentLayoutGuide'); }
    get frameLayoutGuide() { return nativeGetOwned(this, 'frameLayoutGuide'); }

    // ---- 开关 ----
    get isScrollEnabled() {
      requireNative(this, 'isScrollEnabled');
      return nativeGet(this, 'isScrollEnabled');
    }
    set isScrollEnabled(value) {
      requireNative(this, 'isScrollEnabled');
      nativeSet(this, 'isScrollEnabled', value);
    }
    get isDirectionalLockEnabled() {
      requireNative(this, 'isDirectionalLockEnabled');
      return nativeGet(this, 'isDirectionalLockEnabled');
    }
    set isDirectionalLockEnabled(value) {
      requireNative(this, 'isDirectionalLockEnabled');
      nativeSet(this, 'isDirectionalLockEnabled', value);
    }
    get bounces() { requireNative(this, 'bounces'); return nativeGet(this, 'bounces'); }
    set bounces(value) { requireNative(this, 'bounces'); nativeSet(this, 'bounces', value); }
    get alwaysBounceVertical() {
      requireNative(this, 'alwaysBounceVertical');
      return nativeGet(this, 'alwaysBounceVertical');
    }
    set alwaysBounceVertical(value) {
      requireNative(this, 'alwaysBounceVertical');
      nativeSet(this, 'alwaysBounceVertical', value);
    }
    get alwaysBounceHorizontal() {
      requireNative(this, 'alwaysBounceHorizontal');
      return nativeGet(this, 'alwaysBounceHorizontal');
    }
    set alwaysBounceHorizontal(value) {
      requireNative(this, 'alwaysBounceHorizontal');
      nativeSet(this, 'alwaysBounceHorizontal', value);
    }
    // 翻页：停在 bounds 宽度的整数倍上。Swiper 就靠这个
    get isPagingEnabled() {
      requireNative(this, 'isPagingEnabled');
      return nativeGet(this, 'isPagingEnabled');
    }
    set isPagingEnabled(value) {
      requireNative(this, 'isPagingEnabled');
      nativeSet(this, 'isPagingEnabled', value);
    }
    // 点状态栏回到顶部。同一时刻只能有一个 scroll view 开着它
    get scrollsToTop() {
      requireNative(this, 'scrollsToTop');
      return nativeGet(this, 'scrollsToTop');
    }
    set scrollsToTop(value) {
      requireNative(this, 'scrollsToTop');
      nativeSet(this, 'scrollsToTop', value);
    }
    get delaysContentTouches() {
      requireNative(this, 'delaysContentTouches');
      return nativeGet(this, 'delaysContentTouches');
    }
    set delaysContentTouches(value) {
      requireNative(this, 'delaysContentTouches');
      nativeSet(this, 'delaysContentTouches', value);
    }
    get canCancelContentTouches() {
      requireNative(this, 'canCancelContentTouches');
      return nativeGet(this, 'canCancelContentTouches');
    }
    set canCancelContentTouches(value) {
      requireNative(this, 'canCancelContentTouches');
      nativeSet(this, 'canCancelContentTouches', value);
    }

    // ---- 指示条 ----
    get showsVerticalScrollIndicator() {
      requireNative(this, 'showsVerticalScrollIndicator');
      return nativeGet(this, 'showsVerticalScrollIndicator');
    }
    set showsVerticalScrollIndicator(value) {
      requireNative(this, 'showsVerticalScrollIndicator');
      nativeSet(this, 'showsVerticalScrollIndicator', value);
    }
    get showsHorizontalScrollIndicator() {
      requireNative(this, 'showsHorizontalScrollIndicator');
      return nativeGet(this, 'showsHorizontalScrollIndicator');
    }
    set showsHorizontalScrollIndicator(value) {
      requireNative(this, 'showsHorizontalScrollIndicator');
      nativeSet(this, 'showsHorizontalScrollIndicator', value);
    }
    get indicatorStyle() {
      requireNative(this, 'indicatorStyle');
      return nativeGet(this, 'indicatorStyle');
    }
    set indicatorStyle(value) {
      requireNative(this, 'indicatorStyle');
      nativeSet(this, 'indicatorStyle', value);
    }
    get verticalScrollIndicatorInsets() {
      requireNative(this, 'verticalScrollIndicatorInsets');
      return toInsets(nativeGet(this, 'verticalScrollIndicatorInsets'));
    }
    set verticalScrollIndicatorInsets(value) {
      requireNative(this, 'verticalScrollIndicatorInsets');
      nativeSet(this, 'verticalScrollIndicatorInsets',
                structArg(value, INSETS_FIELDS, 'verticalScrollIndicatorInsets'));
    }
    get horizontalScrollIndicatorInsets() {
      requireNative(this, 'horizontalScrollIndicatorInsets');
      return toInsets(nativeGet(this, 'horizontalScrollIndicatorInsets'));
    }
    set horizontalScrollIndicatorInsets(value) {
      requireNative(this, 'horizontalScrollIndicatorInsets');
      nativeSet(this, 'horizontalScrollIndicatorInsets',
                structArg(value, INSETS_FIELDS, 'horizontalScrollIndicatorInsets'));
    }
    get automaticallyAdjustsScrollIndicatorInsets() {
      requireNative(this, 'automaticallyAdjustsScrollIndicatorInsets');
      return nativeGet(this, 'automaticallyAdjustsScrollIndicatorInsets');
    }
    set automaticallyAdjustsScrollIndicatorInsets(value) {
      requireNative(this, 'automaticallyAdjustsScrollIndicatorInsets');
      nativeSet(this, 'automaticallyAdjustsScrollIndicatorInsets', value);
    }
    flashScrollIndicators() { nativeCall(this, 'flashScrollIndicators', []); }

    // ---- 减速 ----
    // 数字，或 'normal'（0.998）/ 'fast'（0.99）
    get decelerationRate() {
      requireNative(this, 'decelerationRate');
      return nativeGet(this, 'decelerationRate');
    }
    set decelerationRate(value) {
      requireNative(this, 'decelerationRate');
      nativeSet(this, 'decelerationRate', value);
    }

    // ---- 当前状态，只读 ----
    get isTracking() { requireNative(this, 'isTracking'); return nativeGet(this, 'isTracking'); }
    get isDragging() { requireNative(this, 'isDragging'); return nativeGet(this, 'isDragging'); }
    get isDecelerating() {
      requireNative(this, 'isDecelerating');
      return nativeGet(this, 'isDecelerating');
    }
    get isScrollAnimating() {
      requireNative(this, 'isScrollAnimating');
      return nativeGet(this, 'isScrollAnimating');
    }
  });

  // 一维排列容器。它自己不画东西，职责是把「排成一行 / 一列」翻译成约束：
  // 三个等宽等距的块原来要手写 6 条约束，这里是 4 行属性。
  defineNativeClass('UIStackView', class UIStackView extends UIView {
    // new UIStackView() 或 new UIStackView([a, b, c])。数组按「每个参数一个
    // 句柄」传给原生，和 NSLayoutConstraint.activateConstraints 一条路子。
    constructor(arrangedSubviews) {
      super();
      const views = arrangedSubviews == null ? [] : Array.from(arrangedSubviews);
      // 旧的 superview 要在原生动手之前读，之后它们已经挂到 stack 上了
      const from = views.map(superviewOf);
      constructNative(this, new.target, 'UIStackView', views);
      for (let i = 0; i < views.length; i++) {
        disown(from[i], 'subviews', views[i]);
        ownOne(this, 'subviews', views[i]);
      }
    }

    // ---- 排列 ----
    get axis() { requireNative(this, 'axis'); return nativeGet(this, 'axis'); }
    set axis(value) { requireNative(this, 'axis'); nativeSet(this, 'axis', value); }
    get distribution() {
      requireNative(this, 'distribution');
      return nativeGet(this, 'distribution');
    }
    set distribution(value) {
      requireNative(this, 'distribution');
      nativeSet(this, 'distribution', value);
    }
    // 'leading' 和 'top' 是同一个值（'trailing' / 'bottom' 同理）。两个名字
    // 都写得进去，读出来永远是 leading / trailing —— 头文件里 Top = Leading，
    // 别名那一侧没法反查
    get alignment() {
      requireNative(this, 'alignment');
      return nativeGet(this, 'alignment');
    }
    set alignment(value) {
      requireNative(this, 'alignment');
      nativeSet(this, 'alignment', value);
    }
    // 数字，或 'system' 要系统标准间距
    get spacing() { requireNative(this, 'spacing'); return nativeGet(this, 'spacing'); }
    set spacing(value) { requireNative(this, 'spacing'); nativeSet(this, 'spacing', value); }
    get isBaselineRelativeArrangement() {
      requireNative(this, 'isBaselineRelativeArrangement');
      return nativeGet(this, 'isBaselineRelativeArrangement');
    }
    set isBaselineRelativeArrangement(value) {
      requireNative(this, 'isBaselineRelativeArrangement');
      nativeSet(this, 'isBaselineRelativeArrangement', value);
    }
    get isLayoutMarginsRelativeArrangement() {
      requireNative(this, 'isLayoutMarginsRelativeArrangement');
      return nativeGet(this, 'isLayoutMarginsRelativeArrangement');
    }
    set isLayoutMarginsRelativeArrangement(value) {
      requireNative(this, 'isLayoutMarginsRelativeArrangement');
      nativeSet(this, 'isLayoutMarginsRelativeArrangement', value);
    }

    // ---- 排列里的子视图 ----
    // arrangedSubviews 是 subviews 的子集，但顺序是排列顺序，不是 z 序
    get arrangedSubviews() {
      return ownAll(this, 'arrangedSubviews',
                    nativeGetObjectArray(this, 'arrangedSubviews'));
    }
    // 进了排列就一定也是 subview，所以持有边和 addSubview 走同一条
    addArrangedSubview(view) {
      const from = superviewOf(view);
      nativeCall(this, 'addArrangedSubview:', [view]);
      disown(from, 'subviews', view);
      ownOne(this, 'subviews', view);
    }
    // 只移出排列，view 仍然是 subview（只是不再被排版），所以那条持有边不动。
    // 真要移走用 view.removeFromSuperview()，stack 会自己把它从排列里摘掉
    removeArrangedSubview(view) {
      nativeCall(this, 'removeArrangedSubview:', [view]);
    }
    insertArrangedSubview(view, options) {
      const o = options || {};
      if (!(has(o, 'atIndex'))) {
        throw new TypeError('insertArrangedSubview needs { atIndex }');
      }
      const from = superviewOf(view);
      nativeCall(this, 'insertArrangedSubview:atIndex:', [view, o.atIndex]);
      disown(from, 'subviews', view);
      ownOne(this, 'subviews', view);
    }

    // ---- 单独调某一项后面的间距 ----
    // spacing 可以是数字、'system'（系统标准间距）或 'default'（撤回，回到
    // spacing 属性）。两个哨兵在 ObjC 里是 FLT_MIN / FLT_MAX，不让它们进 JS
    setCustomSpacing(spacing, options) {
      const o = options || {};
      if (!(has(o, 'afterView'))) {
        throw new TypeError('setCustomSpacing needs { afterView }');
      }
      nativeCall(this, 'setCustomSpacing:afterView:', [spacing, o.afterView]);
    }
    customSpacingAfterView(view) {
      return nativeCall(this, 'customSpacingAfterView:', [view]);
    }
  });

  // ---- 手势识别器 ----
  //
  // iOS 四套事件机制里「平行、抢占」的那一套。它不是视图，是**挂在视图上**的
  // 一个对象：收视图和它所有子视图上的触摸，认出某种手势时通知出来。
  //
  // ObjC 那边是 target-action，一个 action 里自己读 state。这里把状态当
  // 事件名（began / changed / ended / cancelled）——不是为了像 Web，是因为
  // 延后一轮之后 state 可能已经往前走了（手势结束的话已经重置成
  // possible），JS 回头读不到事件发生那一刻的状态。
  //
  // 点按是**离散**手势：只发 ended（ObjC 里叫 recognized，是 ended 的别名）。
  // 长按是**连续**手势：began → changed* → ended / cancelled。
  const UIGestureRecognizer = defineNativeClass('UIGestureRecognizer',
                                                class UIGestureRecognizer extends NSObject {
    constructor() {
      super();
      // 基类自己什么手势都不认，ObjC 里也只是拿来继承的
      if (new.target === UIGestureRecognizer) {
        throw new TypeError(
          'Illegal constructor: UIGestureRecognizer is abstract; construct ' +
          'UITapGestureRecognizer or UILongPressGestureRecognizer instead');
      }
    }

    [kSubscribe](type, on) {
      requireNative(this, 'addEventListener');
      native.subscribe(this[kHandle], type, on);
      if (on) {
        subscribed.add(this);
      } else if (this[kListeners].size === 0) {
        subscribed.delete(this);
      }
    }

    // 回调里读它，读到的是**回调执行那一刻**的状态，不是事件发生那一刻的。
    // 实测：点按的 ended 回调里是 possible（识别器已经重置），长按的 began
    // 回调里手指还按着时是 began。要知道是哪个阶段，看事件名
    get state() { requireNative(this, 'state'); return nativeGet(this, 'state'); }
    // 挂在哪个视图上。回边，不是持有
    get view() {
      requireNative(this, 'view');
      return nativeGetObject(this, 'view');
    }
    get isEnabled() { requireNative(this, 'isEnabled'); return nativeGet(this, 'isEnabled'); }
    set isEnabled(value) { requireNative(this, 'isEnabled'); nativeSet(this, 'isEnabled', value); }
    // 认出手势之后，要不要给视图发 touchesCancelled。默认 true
    get cancelsTouchesInView() {
      requireNative(this, 'cancelsTouchesInView');
      return nativeGet(this, 'cancelsTouchesInView');
    }
    set cancelsTouchesInView(value) {
      requireNative(this, 'cancelsTouchesInView');
      nativeSet(this, 'cancelsTouchesInView', value);
    }
    get delaysTouchesBegan() {
      requireNative(this, 'delaysTouchesBegan');
      return nativeGet(this, 'delaysTouchesBegan');
    }
    set delaysTouchesBegan(value) {
      requireNative(this, 'delaysTouchesBegan');
      nativeSet(this, 'delaysTouchesBegan', value);
    }
    get delaysTouchesEnded() {
      requireNative(this, 'delaysTouchesEnded');
      return nativeGet(this, 'delaysTouchesEnded');
    }
    set delaysTouchesEnded(value) {
      requireNative(this, 'delaysTouchesEnded');
      nativeSet(this, 'delaysTouchesEnded', value);
    }
    get numberOfTouches() {
      requireNative(this, 'numberOfTouches');
      return nativeGet(this, 'numberOfTouches');
    }
  });

  defineNativeClass('UITapGestureRecognizer',
                    class UITapGestureRecognizer extends UIGestureRecognizer {
    constructor() {
      super();
      constructNative(this, new.target, 'UITapGestureRecognizer', []);
    }
    // 要点几下才算。默认 1；2 就是双击
    get numberOfTapsRequired() {
      requireNative(this, 'numberOfTapsRequired');
      return nativeGet(this, 'numberOfTapsRequired');
    }
    set numberOfTapsRequired(value) {
      requireNative(this, 'numberOfTapsRequired');
      nativeSet(this, 'numberOfTapsRequired', value);
    }
    // 要几根手指。默认 1
    get numberOfTouchesRequired() {
      requireNative(this, 'numberOfTouchesRequired');
      return nativeGet(this, 'numberOfTouchesRequired');
    }
    set numberOfTouchesRequired(value) {
      requireNative(this, 'numberOfTouchesRequired');
      nativeSet(this, 'numberOfTouchesRequired', value);
    }
  });

  defineNativeClass('UILongPressGestureRecognizer',
                    class UILongPressGestureRecognizer extends UIGestureRecognizer {
    constructor() {
      super();
      constructNative(this, new.target, 'UILongPressGestureRecognizer', []);
    }
    // 按住多久才算，**秒**。默认 0.5
    get minimumPressDuration() {
      requireNative(this, 'minimumPressDuration');
      return nativeGet(this, 'minimumPressDuration');
    }
    set minimumPressDuration(value) {
      requireNative(this, 'minimumPressDuration');
      nativeSet(this, 'minimumPressDuration', value);
    }
    // 认出来之前手指最多能挪多远，点。默认 10。认出来之后不限
    get allowableMovement() {
      requireNative(this, 'allowableMovement');
      return nativeGet(this, 'allowableMovement');
    }
    set allowableMovement(value) {
      requireNative(this, 'allowableMovement');
      nativeSet(this, 'allowableMovement', value);
    }
    // 按住之前要先完整点几下。默认 0
    get numberOfTapsRequired() {
      requireNative(this, 'numberOfTapsRequired');
      return nativeGet(this, 'numberOfTapsRequired');
    }
    set numberOfTapsRequired(value) {
      requireNative(this, 'numberOfTapsRequired');
      nativeSet(this, 'numberOfTapsRequired', value);
    }
    get numberOfTouchesRequired() {
      requireNative(this, 'numberOfTouchesRequired');
      return nativeGet(this, 'numberOfTouchesRequired');
    }
    set numberOfTouchesRequired(value) {
      requireNative(this, 'numberOfTouchesRequired');
      nativeSet(this, 'numberOfTouchesRequired', value);
    }
  });

  const UIColor = defineNativeClass('UIColor', class UIColor extends NSObject {
    constructor() { nativeOnly(new.target); }
  });
  const COLOR_CONSTANTS = [
    // UIColor.h：基础色
    'blackColor', 'darkGrayColor', 'lightGrayColor', 'whiteColor', 'grayColor',
    'redColor', 'greenColor', 'blueColor', 'cyanColor', 'yellowColor',
    'magentaColor', 'orangeColor', 'purpleColor', 'brownColor', 'clearColor',
    // UIInterface.h：系统色
    'systemRedColor', 'systemGreenColor', 'systemBlueColor', 'systemOrangeColor',
    'systemYellowColor', 'systemPinkColor', 'systemPurpleColor', 'systemTealColor',
    'systemIndigoColor', 'systemBrownColor', 'systemMintColor', 'systemCyanColor',
    'systemGrayColor',
    // UIInterface.h：语义色
    'labelColor', 'secondaryLabelColor', 'tertiaryLabelColor', 'quaternaryLabelColor',
    'placeholderTextColor', 'separatorColor', 'opaqueSeparatorColor', 'linkColor',
    'systemBackgroundColor', 'secondarySystemBackgroundColor',
    'tertiarySystemBackgroundColor',
  ];
  for (const name of COLOR_CONSTANTS) {
    Object.defineProperty(UIColor, name, {
      configurable: true,
      enumerable: false,
      get: () => nativeClassObject('UIColor', name),
    });
  }


  // ---------- 颜色：上层是字符串 ----------
  //
  // 属性读写都是字符串，`UIColor` 类仍然在全局（只挂常量、不可实例化），
  // setter 两种都收。**解析在 JS 侧做**（纯文本运算），过桥的是规范化的 spec。
  //
  // 两张弱表互为反函数：
  //   colorDecls  包装 → 写它时用的那个串     「合法就原样还你」靠它
  //   colorPool   串   → WeakRef<包装>        同一个串永远同一个对象
  // 键挂在**颜色**上而不是 view 上，所以一个颜色给多少个 view 都还是那个串；
  // 声明丢失的唯一条件是「所有持有者都没了」，而那时也没人读得到它。
  const colorDecls = new WeakMap();
  const colorPool = new Map();
  // 按**值**查的回退。实测：UIView.backgroundColor 这类属性对普通 RGB 颜色
  // 读回来不是同一个对象——UIKit 自己规范化了一道（和 layer.borderColor 过
  // CGColor 是同一个现象）。所以光按对象身份存声明不够，还要按值兜一层。
  // 代价是同一个颜色值的不同写法共用一条声明，最后写的那个赢。
  const colorByValue = new Map();
  function colorValueKey(spec) {
    if (spec.kind === 'rgba') {
      const q = (v) => Math.round(v * 1e6);
      return 'rgba:' + q(spec.r) + ',' + q(spec.g) + ',' + q(spec.b) + ',' + q(spec.a);
    }
    // 语义色**不进**这张表：它合成出来就是规范的短名，不需要回退。
    // 放进去的话，别人用全名 'systemRedColor' 写过一次之后，后面所有
    // 直接写 UIColor 对象的地方都会读回那个拼法——不该有这种串台
    return null;   // 语义色、动态色、表达不出来的都不进
  }
  // 表达不出来的颜色（没名字的动态色、图案色、HDR）按代号往返。
  // 强引用：它们是 getter 吐出去的，必须能赋回来。实测一次都不该触发
  const opaqueColors = new Map();
  const opaqueIds = new WeakMap();
  let opaqueNext = 1;
  const colorPoolCleanup =
    typeof FinalizationRegistry === 'function'
      ? new FinalizationRegistry((text) => {
          const ref = colorPool.get(text);
          if (ref !== undefined && ref.deref() === undefined) colorPool.delete(text);
        })
      : null;

  // 短名 ↔ 常量名：'systemBackground' ↔ 'systemBackgroundColor'。
  // 和枚举「去前缀、首字母小写」同一个态度——字符串是写给人看的简写。
  //
  // **只认短名**。写全名 'systemPinkColor' 不合法，照不合法处理（警告 +
  // 保留旧值）。认两种拼法的话「合法就原样还你」就得为语义色开一个例外，
  // 而语义色是共享单例，记住某一个调用方的拼法会串到所有读它的人
  const colorShortToFull = new Map();
  const colorFullToShort = new Map();
  for (const full of COLOR_CONSTANTS) {
    const short = full.endsWith('Color') ? full.slice(0, -5) : full;
    colorShortToFull.set(short, full);
    colorFullToShort.set(full, short);
  }

  function colorWarn(what, text) {
    let hint = '';
    // 写的像个名字（没有 # 也没有括号）就把能用的名字列出来——和枚举
    // 写错时列可选值是同一个态度。写的是 '#GGG' 就不列：那时用户问的
    // 不是「有哪些名字」
    if (typeof text === 'string' && /^[A-Za-z][A-Za-z0-9]*$/.test(text)) {
      hint = '; expected a color name, one of: ' +
             [...colorFullToShort.values()].join(' / ');
    }
    console.warn('[Nacre] ' + what + ': ' + JSON.stringify(text) +
                 ' is not a valid color, ignored' + hint);
  }

  // 按括号深度切顶层逗号——light-dark(rgb(1,2,3), #000) 里面还有逗号
  function splitTopLevel(text) {
    const parts = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (c === ',' && depth === 0) { parts.push(text.slice(start, i)); start = i + 1; }
    }
    parts.push(text.slice(start));
    return parts.map((p) => p.trim());
  }

  /** 0-255 或百分比 → 0..1 */
  function colorChannel(token) {
    const t = token.trim();
    if (t.endsWith('%')) {
      const n = Number(t.slice(0, -1));
      return Number.isFinite(n) ? n / 100 : null;
    }
    const n = Number(t);
    return Number.isFinite(n) ? n / 255 : null;
  }
  /** 0-1 或百分比 */
  function colorAlpha(token) {
    const t = token.trim();
    if (t.endsWith('%')) {
      const n = Number(t.slice(0, -1));
      return Number.isFinite(n) ? n / 100 : null;
    }
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }

  /** 字符串 → spec，认不出给 null */
  function parseColorText(text) {
    const t = String(text).trim();
    if (t === '') return null;

    if (t[0] === '#') {
      const hex = t.slice(1);
      if (!/^[0-9a-fA-F]+$/.test(hex)) return null;
      const expand = (c) => parseInt(c + c, 16) / 255;
      const pair = (i) => parseInt(hex.slice(i, i + 2), 16) / 255;
      if (hex.length === 3 || hex.length === 4) {
        return { kind: 'rgba', r: expand(hex[0]), g: expand(hex[1]), b: expand(hex[2]),
                 a: hex.length === 4 ? expand(hex[3]) : 1 };
      }
      if (hex.length === 6 || hex.length === 8) {
        return { kind: 'rgba', r: pair(0), g: pair(2), b: pair(4),
                 a: hex.length === 8 ? pair(6) : 1 };
      }
      return null;
    }

    const call = /^([a-z-]+)\s*\((.*)\)$/is.exec(t);
    if (call) {
      const fn = call[1].toLowerCase();
      const inner = call[2];
      if (fn === 'rgb' || fn === 'rgba') {
        // 逗号式和空格式都认；空格式的 alpha 写在 / 后面
        let tokens;
        if (inner.includes(',')) {
          tokens = splitTopLevel(inner);
        } else {
          const bySlash = inner.split('/');
          tokens = bySlash[0].trim().split(/\s+/);
          if (bySlash.length > 1) tokens.push(bySlash[1].trim());
        }
        if (tokens.length !== 3 && tokens.length !== 4) return null;
        const r = colorChannel(tokens[0]);
        const g = colorChannel(tokens[1]);
        const b = colorChannel(tokens[2]);
        const a = tokens.length === 4 ? colorAlpha(tokens[3]) : 1;
        if (r === null || g === null || b === null || a === null) return null;
        return { kind: 'rgba', r, g, b, a };
      }
      if (fn === 'light-dark') {
        const parts = splitTopLevel(inner);
        if (parts.length !== 2) return null;
        const light = parseColorText(parts[0]);
        const dark = parseColorText(parts[1]);
        if (light === null || dark === null) return null;
        return { kind: 'lightDark', light, dark };
      }
      if (fn === 'asset') {
        const name = inner.trim();
        return name === '' ? null : { kind: 'asset', name };
      }
      if (fn === 'native') {
        const id = Number(inner.trim());
        return Number.isInteger(id) ? { kind: 'native', id } : null;
      }
      return null;
    }

    const full = colorShortToFull.get(t);
    return full === undefined ? null : { kind: 'name', name: full };
  }

  /** 字符串 → UIColor，认不出给 null。同一个串永远同一个对象 */
  function colorFromString(text) {
    const cached = colorPool.get(text);
    if (cached !== undefined) {
      const hit = cached.deref();
      if (hit !== undefined) return hit;
      colorPool.delete(text);
    }
    const spec = parseColorText(text);
    if (spec === null) return null;
    if (spec.kind === 'native') {
      return opaqueColors.get(spec.id) || null;
    }
    const color = nativeClassCall('UIColor', 'nacreFromSpec', [spec]);
    if (color === null) return null;
    // 语义色**不记声明**。它是原生单例，在它上面记状态就是全局状态。
    // 而且不需要记：只认短名，所以合成出来的短名就是你写的那个
    if (spec.kind !== 'name') {
      colorDecls.set(color, text);
      const key = colorValueKey(spec);
      if (key !== null) colorByValue.set(key, text);
    }
    colorPool.set(text, new WeakRef(color));
    if (colorPoolCleanup) colorPoolCleanup.register(color, text);
    return color;
  }

  function colorTextForSpec(spec, color) {
    if (spec.kind === 'name') return colorFullToShort.get(spec.name) || spec.name;
    if (spec.kind === 'rgba') {
      const byte = (v) => Math.round(Math.min(1, Math.max(0, v)) * 255);
      if (spec.a >= 1) {
        const hex = (v) => byte(v).toString(16).padStart(2, '0');
        return '#' + hex(spec.r) + hex(spec.g) + hex(spec.b);
      }
      return 'rgba(' + byte(spec.r) + ', ' + byte(spec.g) + ', ' + byte(spec.b) + ', ' +
             Math.round(spec.a * 1000) / 1000 + ')';
    }
    // 表达不出来。给个代号，保证往返，并且诚实地说「这个写不出来」
    let id = opaqueIds.get(color);
    if (id === undefined) {
      id = opaqueNext++;
      opaqueIds.set(color, id);
      opaqueColors.set(id, color);
    }
    return 'native(' + id + ')';
  }

  /** UIColor → 字符串。写进去时用的那个串原样还回来 */
  function colorString(color) {
    if (color === null || color === undefined) return null;
    const decl = colorDecls.get(color);
    if (decl !== undefined) return decl;
    // 原生自己给的颜色（UIKit 的默认值、tintColor 继承…）没有声明串，
    // 按它的事实合成一个，并记下来——下次不用再过桥
    const spec = nativeCall(color, 'nacreSpec', []);
    // 对象身份没了，再按值找一次——这条救的是被 UIKit 规范化过的普通颜色
    const key = colorValueKey(spec);
    const byValue = key === null ? undefined : colorByValue.get(key);
    const text = byValue !== undefined ? byValue : colorTextForSpec(spec, color);
    colorDecls.set(color, text);
    return text;
  }

  /**
   * 颜色参数。给 undefined 表示「不合法，别写」——按已定的决定**不抛**，
   * 打一条警告。纯静默的话「写错了读回来还是旧值、一点提示都没有」，
   * 那正是这个项目一路在消灭的错。
   */
  function colorArg(value, what) {
    if (value === null || value === undefined) return null;
    if (value instanceof UIColor) return value;
    if (typeof value !== 'string') { colorWarn(what, value); return undefined; }
    const color = colorFromString(value);
    if (color === null) { colorWarn(what, value); return undefined; }
    return color;
  }

  // 场景的持久身份。场景对象会被系统销毁重建，session 活得更久——
  // persistentIdentifier 用来认出「是不是之前那个窗口」。
  defineNativeClass('UISceneSession', class UISceneSession extends NSObject {
    constructor() { nativeOnly(new.target); }
    // 'UIWindowSceneSessionRoleApplication' 等，决定这个场景该画什么界面
    get role() { return nativeGet(this, 'role'); }
    get persistentIdentifier() { return nativeGet(this, 'persistentIdentifier'); }
    get userInfo() { return nativeGet(this, 'userInfo'); }
    set userInfo(value) { nativeSet(this, 'userInfo', value); }
  });

  // 系统创建并连接的场景。不可构造——SDK 自己就是 init NS_UNAVAILABLE，
  // 注释写着「由 UIKit 调用，不打算让 App 调用」。
  defineNativeClass('UIWindowScene', class UIWindowScene extends UIScene {
    constructor() { nativeOnly(new.target); }

    // 这个场景自己的前后台状态，和 application.state（所有场景的聚合）不是一回事
    get activationState() { return nativeGet(this, 'activationState'); }
    get session() { return nativeGetOwned(this, 'session'); }
    // ObjC 的属性名是 fullScreen，getter 是 isFullScreen，这里用后者
    get isFullScreen() { return nativeGet(this, 'isFullScreen'); }

    // 多任务切换器的卡片上显示的标题
    get title() { return nativeGet(this, 'title'); }
    set title(value) { nativeSet(this, 'title', value); }
    get subtitle() { return nativeGet(this, 'subtitle'); }
    set subtitle(value) { nativeSet(this, 'subtitle', value); }

    // 场景级的打开 URL。application.openURL 是 App 级的，两者都有
    openURL(url, options) { return nativeCallAsync(this, 'openURL', [String(url)]); }
  });

  // 页面。可构造——它是我们造的，不是系统给的。
  defineNativeClass('UIViewController', class UIViewController extends UIResponder {
    constructor() {
      super();
      constructNative(this, new.target, 'UIViewController', []);
    }
    get view() { return nativeGetOwned(this, 'view'); }
    // 导航条上的标题。返回按钮默认取上一页的 title，所以这一个属性就够走通「返回」
    get title() { requireNative(this, 'title'); return nativeGet(this, 'title'); }
    set title(value) { requireNative(this, 'title'); nativeSet(this, 'title', value); }
    // 两条都是 ObjC 侧的 weak 回边，所以 JS 侧翻成 strong
    // 模态事件（willdismiss / diddismiss / dismissattempted）。
    // 注意 UINavigationController 覆写了这个钩子，所以一个被模态呈现的导航
    // 控制器收不到这几条——它那一侧只认导航事件，见文档的「还没做」
    [kSubscribe](type, on) {
      requireNative(this, 'addEventListener');
      native.subscribe(this[kHandle], type, on);
      if (on) subscribed.add(this);
      else if (this[kListeners].size === 0) subscribed.delete(this);
    }

    // ---- 模态呈现 ----
    // completion 是 block，所以这里是 Promise——异步一律 Promise
    presentViewController(viewController, options) {
      const o = options || {};
      const done = nativeCallAsync(this, 'presentViewController',
                                   [viewController, !!o.animated]);
      // 原生侧 presentedViewController 是强引用，JS 侧也要有对应的一条。
      // presentViewController: 是同步建立这层关系的，所以这里就记
      own(this, 'presentedViewController', viewController);
      return done;
    }
    dismissViewController(options) {
      const o = options || {};
      const done = nativeCallAsync(this, 'dismissViewController', [!!o.animated]);
      own(this, 'presentedViewController', null);
      return done;
    }
    get presentedViewController() {
      return nativeGetOwned(this, 'presentedViewController');
    }
    // weak 回边，JS 侧翻成 strong
    get presentingViewController() {
      return nativeGetOwned(this, 'presentingViewController');
    }
    get modalPresentationStyle() {
      requireNative(this, 'modalPresentationStyle');
      return nativeGet(this, 'modalPresentationStyle');
    }
    set modalPresentationStyle(value) {
      requireNative(this, 'modalPresentationStyle');
      nativeSet(this, 'modalPresentationStyle', value);
    }
    get modalTransitionStyle() {
      requireNative(this, 'modalTransitionStyle');
      return nativeGet(this, 'modalTransitionStyle');
    }
    set modalTransitionStyle(value) {
      requireNative(this, 'modalTransitionStyle');
      nativeSet(this, 'modalTransitionStyle', value);
    }
    // 打开之后用户拖不走它，只能走你给的那个出口。
    // 这是 presentationControllerShouldDismiss: 那个同步回调的「预先声明」版本
    get isModalInPresentation() {
      requireNative(this, 'isModalInPresentation');
      return nativeGet(this, 'isModalInPresentation');
    }
    set isModalInPresentation(value) {
      requireNative(this, 'isModalInPresentation');
      nativeSet(this, 'isModalInPresentation', value);
    }

    // 这一页在导航条上的配置，VC 自己懒加载的
    get navigationItem() { return nativeGetOwned(this, 'navigationItem'); }
    get navigationController() { return nativeGetOwned(this, 'navigationController'); }
    get parentViewController() { return nativeGetOwned(this, 'parentViewController'); }
  });

  // 视图树的根。必须绑定到一个场景——initWithWindowScene: 是唯一未废弃的
  // 初始化方法，init 和 initWithFrame: 在 iOS 26 都废弃了。
  // 视图树的根。
  //
  // scene 参数可选，两种用法：
  //   new UIWindow(scene)   参数齐全，立刻创建原生对象（＝ initWithWindowScene:）
  //   new UIWindow()        JS 对象先存在，等 window.windowScene = scene 时才创建
  //
  // 后者让「构造」和「绑定」解耦，而且没有发明新 API——windowScene 本来就是
  // ObjC 的可写属性，没有 scene 的 window 在 ObjC 里也本来就是合法状态
  // （windowScene 是 nullable）。
  // 导航条和工具条上的一个「项」。它不是 UIView，也不是 UIControl——
  // 是一个描述对象，UIKit 自己照着它画按钮。
  const UIBarItem = defineNativeClass('UIBarItem', class UIBarItem extends NSObject {
    constructor() {
      super();
      // UIBarItem 是抽象基类，ObjC 侧没有可用的 init，不给构造
      if (new.target === UIBarItem) {
        throw new TypeError(
          'Illegal constructor: UIBarItem is abstract; construct UIBarButtonItem instead');
      }
    }
    get title() { requireNative(this, 'title'); return nativeGet(this, 'title'); }
    set title(value) { requireNative(this, 'title'); nativeSet(this, 'title', value); }
    get image() { return nativeGetOwned(this, 'image'); }
    set image(value) { nativeSetOwned(this, 'image', value); }
    get isEnabled() {
      requireNative(this, 'isEnabled');
      return nativeGet(this, 'isEnabled');
    }
    set isEnabled(value) {
      requireNative(this, 'isEnabled');
      nativeSet(this, 'isEnabled', value);
    }
    get tag() { requireNative(this, 'tag'); return nativeGet(this, 'tag'); }
    set tag(value) { requireNative(this, 'tag'); nativeSet(this, 'tag', value); }
  });

  // 导航条上的按钮。
  //
  // 三种口味：{ title }、{ customView }，以及类方法 systemItem(name)——
  // systemItem 只能在 init 里给（ObjC 没有对应的可写属性），所以它走类方法，
  // 而 title / style 这些构造完当属性设就行。
  //
  // 它不是 UIControl，但 target/action 是同一套，所以事件名沿用 UIButton 的
  // primaryActionTriggered：在按钮和导航条按钮之间切换时不该还要记两个名字。
  defineNativeClass('UIBarButtonItem', class UIBarButtonItem extends UIBarItem {
    constructor(options) {
      super();
      const o = options || {};
      constructNative(this, new.target, 'UIBarButtonItem',
                      o.customView == null ? [] : [o.customView]);
      if (o.title !== undefined) this.title = o.title;
      if (o.image !== undefined) this.image = o.image;
      if (o.style !== undefined) this.style = o.style;
      if (o.isEnabled !== undefined) this.isEnabled = o.isEnabled;
    }

    /** 系统预置的那二十几个（'add'、'done'、'trash'…） */
    static systemItem(name) {
      return nativeClassCall('UIBarButtonItem', 'systemItemWithName:', [name]);
    }
    /** 占位用的弹性空白 */
    static flexibleSpace() {
      return nativeClassCall('UIBarButtonItem', 'flexibleSpaceItem', []);
    }
    /** 占位用的固定宽度空白 */
    static fixedSpace(width) {
      return nativeClassCall('UIBarButtonItem', 'fixedSpaceItemOfWidth:', [width]);
    }

    [kSubscribe](type, on) {
      requireNative(this, 'addEventListener');
      native.subscribe(this[kHandle], type, on);
      if (on) subscribed.add(this);
      else if (this[kListeners].size === 0) subscribed.delete(this);
    }

    get style() { requireNative(this, 'style'); return nativeGet(this, 'style'); }
    set style(value) { requireNative(this, 'style'); nativeSet(this, 'style', value); }
    get width() { requireNative(this, 'width'); return nativeGet(this, 'width'); }
    set width(value) { requireNative(this, 'width'); nativeSet(this, 'width', value); }
    get isHidden() { requireNative(this, 'isHidden'); return nativeGet(this, 'isHidden'); }
    set isHidden(value) { requireNative(this, 'isHidden'); nativeSet(this, 'isHidden', value); }
    get customView() { return nativeGetOwned(this, 'customView'); }
    set customView(value) { nativeSetOwned(this, 'customView', value); }
  });

  // 导航条上「这一页」的那份配置。不可构造——每个 UIViewController 自带一个。
  defineNativeClass('UINavigationItem', class UINavigationItem extends NSObject {
    constructor() {
      nativeOnly(new.target);
    }
    get title() { requireNative(this, 'title'); return nativeGet(this, 'title'); }
    set title(value) { requireNative(this, 'title'); nativeSet(this, 'title', value); }
    // iOS 26 新加的副标题
    get subtitle() { requireNative(this, 'subtitle'); return nativeGet(this, 'subtitle'); }
    set subtitle(value) { requireNative(this, 'subtitle'); nativeSet(this, 'subtitle', value); }
    // 下一页返回按钮上的字。不设就用这一页的 title
    get backButtonTitle() {
      requireNative(this, 'backButtonTitle');
      return nativeGet(this, 'backButtonTitle');
    }
    set backButtonTitle(value) {
      requireNative(this, 'backButtonTitle');
      nativeSet(this, 'backButtonTitle', value);
    }
    get hidesBackButton() {
      requireNative(this, 'hidesBackButton');
      return nativeGet(this, 'hidesBackButton');
    }
    set hidesBackButton(value) {
      requireNative(this, 'hidesBackButton');
      nativeSet(this, 'hidesBackButton', value);
    }
    // 放一个自定义 view 当标题。设了它，title 就被忽略
    get titleView() { return nativeGetOwned(this, 'titleView'); }
    set titleView(value) { nativeSetOwned(this, 'titleView', value); }

    get leftBarButtonItems() {
      return ownAll(this, 'leftBarButtonItems',
                    nativeGetObjectArray(this, 'leftBarButtonItems'));
    }
    set leftBarButtonItems(value) {
      nativeSetObjectArray(this, 'leftBarButtonItems', value);
      ownAll(this, 'leftBarButtonItems',
             nativeGetObjectArray(this, 'leftBarButtonItems'));
    }
    get rightBarButtonItems() {
      return ownAll(this, 'rightBarButtonItems',
                    nativeGetObjectArray(this, 'rightBarButtonItems'));
    }
    set rightBarButtonItems(value) {
      nativeSetObjectArray(this, 'rightBarButtonItems', value);
      ownAll(this, 'rightBarButtonItems',
             nativeGetObjectArray(this, 'rightBarButtonItems'));
    }
  });

  // 页面栈。push 进去、pop 出来，返回手势和返回按钮都是系统给的。
  //
  // 栈变动之后统一用 ownAll 按原生真相重建持有边：原生侧 nav 强持有栈里的每
  // 个 VC，JS 侧也必须有对应的一条，否则 JS 丢掉引用后包装会被 GC，再从
  // topViewController 读回来就是个全新的包装——挂的状态和监听器全丢。
  // 用 ownAll 而不是逐个记进出，是因为它的语义就是「按原生真相整层重建」，
  // pop / popTo / popToRoot / setViewControllers 一视同仁。
  defineNativeClass('UINavigationController',
                    class UINavigationController extends UIViewController {
    constructor(rootViewController) {
      super();
      constructNative(this, new.target, 'UINavigationController',
                      rootViewController == null ? [] : [rootViewController]);
      this[kSyncStack]();
    }

    // 事件全在 UINavigationControllerDelegate 上，和滚动同构
    [kSubscribe](type, on) {
      requireNative(this, 'addEventListener');
      native.subscribe(this[kHandle], type, on);
      if (on) subscribed.add(this);
      else if (this[kListeners].size === 0) subscribed.delete(this);
    }

    // 栈动过之后重读一次原生真相，把持有边整层重建
    [kSyncStack]() {
      ownAll(this, 'viewControllers', nativeGetObjectArray(this, 'viewControllers'));
    }

    get viewControllers() {
      return ownAll(this, 'viewControllers',
                    nativeGetObjectArray(this, 'viewControllers'));
    }
    set viewControllers(value) {
      nativeSetObjectArray(this, 'viewControllers', value);
      this[kSyncStack]();
    }
    get topViewController() { return nativeGetOwned(this, 'topViewController'); }
    get visibleViewController() {
      return nativeGetOwned(this, 'visibleViewController');
    }

    pushViewController(viewController, options) {
      const o = options || {};
      nativeCall(this, 'pushViewController:animated:', [viewController, !!o.animated]);
      this[kSyncStack]();
    }
    // 返回被弹出的那一个；栈底弹不动时返回 null
    popViewController(options) {
      const o = options || {};
      const popped = nativeCallObject(this, 'popViewControllerAnimated:', [!!o.animated]);
      this[kSyncStack]();
      return popped;
    }
    popToViewController(viewController, options) {
      const o = options || {};
      const popped = nativeCallObjectArray(
        this, 'popToViewController:animated:', [viewController, !!o.animated]);
      this[kSyncStack]();
      return popped;
    }
    popToRootViewController(options) {
      const o = options || {};
      const popped = nativeCallObjectArray(
        this, 'popToRootViewControllerAnimated:', [!!o.animated]);
      this[kSyncStack]();
      return popped;
    }
    // 整栈替换。数组按「每个元素一个句柄」传，animated 跟在后面
    setViewControllers(viewControllers, options) {
      const o = options || {};
      nativeCallObjectArray(this, 'setViewControllers:animated:',
                            [...Array.from(viewControllers), !!o.animated]);
      this[kSyncStack]();
    }

    get isNavigationBarHidden() {
      requireNative(this, 'isNavigationBarHidden');
      return nativeGet(this, 'isNavigationBarHidden');
    }
    set isNavigationBarHidden(value) {
      requireNative(this, 'isNavigationBarHidden');
      nativeSet(this, 'isNavigationBarHidden', value);
    }
    setNavigationBarHidden(hidden, options) {
      const o = options || {};
      nativeCall(this, 'setNavigationBarHidden:animated:', [!!hidden, !!o.animated]);
    }
  });

  defineNativeClass('UIWindow', class UIWindow extends UIView {
    constructor(scene) {
      super();
      // 所有权是「场景持有窗口」——UIWindow.windowScene 在头文件里是 weak，
      // 真正持有窗口的是 UIWindowScene.windows。所以镜像记在场景那一侧。
      if (scene != null) {
        constructNative(this, new.target, 'UIWindow', [scene]);
        ownOne(scene, 'windows', this);
      }
    }

    // 换 scene 就是换显示目标。典型 App 一绑到死，需要改的场景是把窗口
    // 移到外接显示器（setScreen: 废弃后的替代品就是它）。
    // 首次赋值还兼做「创建原生对象」的触发点。
    get windowScene() {
      return this[kHandle] === undefined ? null : nativeGetObject(this, 'windowScene');
    }
    set windowScene(value) {
      if (this[kHandle] === undefined) {
        if (value != null) {
          // 这里不在构造函数里，new.target 是 undefined，直接给类本身
          constructNative(this, UIWindow, 'UIWindow', [value]);
          ownOne(value, 'windows', this);
        }
        return;
      }
      const old = nativeGetObject(this, 'windowScene');
      nativeSetObject(this, 'windowScene', value);
      disown(old, 'windows', this);
      ownOne(value, 'windows', this);
    }

    // 窗口唯一的内容入口，不设就没内容
    get rootViewController() {
      requireNative(this, 'rootViewController');
      return nativeGetOwned(this, 'rootViewController');
    }
    set rootViewController(value) {
      requireNative(this, 'rootViewController');
      nativeSetOwned(this, 'rootViewController', value);
    }

    // 多窗口的叠放顺序。键盘、alert 都是 level 更高的窗口
    get windowLevel() {
      requireNative(this, 'windowLevel');
      return nativeGet(this, 'windowLevel');
    }
    set windowLevel(value) {
      requireNative(this, 'windowLevel');
      nativeSet(this, 'windowLevel', value);
    }

    get isKeyWindow() {
      requireNative(this, 'isKeyWindow');
      return nativeGet(this, 'isKeyWindow');
    }
    get canBecomeKeyWindow() {
      requireNative(this, 'canBecomeKeyWindow');
      return nativeGet(this, 'canBecomeKeyWindow');
    }

    // 程序创建的 UIWindow 默认 hidden=YES，不调这个屏幕就是黑的
    makeKeyAndVisible() {
      requireNative(this, 'makeKeyAndVisible()');
      nativeCallVoid(this, 'makeKeyAndVisible');
    }
    makeKeyWindow() {
      requireNative(this, 'makeKeyWindow()');
      nativeCallVoid(this, 'makeKeyWindow');
    }
  });

  // 带原生对象负载的事件，字段名按类型定。
  //
  // 「事件带不带数据」的判据是**那个信息在对象上读不读得到**：滚动的位置在
  // contentOffset 上读得到，所以 scroll 不带（不带才能无损合并）；导航的
  // 「哪个页面」在 willshow 那一刻从 nav 上读不到（topViewController 还没
  // 换过去），所以带上。
  // 事件负载挂在哪个字段上。值可以是原生对象（willshow 带 viewController）
  // 也可以是普通 JSON 值（动画的 stop 带一个布尔）——sink 一视同仁
  const objectEventField = {
    willshow: 'viewController', didshow: 'viewController', stop: 'finished',
    tick: 'frame', message: 'data', error: 'message',
  };

  // 原生要给某个对象自己派发事件时回调这里（场景的生命周期事件走这条路）
  native.setObjectEventSink(function (wrapper, type, payload) {
    const event = new Event(type);
    const field = objectEventField[type];
    if (field !== undefined && payload !== undefined) {
      defineField(event, field, payload);
    } else if (payload !== undefined && payload !== null &&
               typeof payload === 'object' && 'wasClean' in payload) {
      // WebSocket 关闭。按**负载的形状**认，不按事件名——'close' 这个名字
      // 太泛，将来别的对象也会用
      defineField(event, 'code', payload.code);
      defineField(event, 'reason', payload.reason);
      defineField(event, 'wasClean', payload.wasClean);
    } else if (payload !== undefined && payload !== null &&
               typeof payload === 'object' && 'tapCount' in payload) {
      // 触摸类的控件事件。原生**只给这九个**带负载，所以这里不用镜像
      // 那张表——收到负载就挂上。location 转成 CGPoint，和别处一致；
      // 没有真实触点时（sendActionsForControlEvents）原生给的就是 null
      defineField(event, 'location',
                  payload.location === null ? null : toPoint(payload.location));
      defineField(event, 'tapCount', payload.tapCount);
    } else if (payload !== undefined && payload !== null &&
               typeof payload === 'object' && 'numberOfTouches' in payload) {
      // 手势事件。同样按负载的形状认：began / ended 这些名字太泛
      defineField(event, 'location',
                  payload.location === null ? null : toPoint(payload.location));
      defineField(event, 'numberOfTouches', payload.numberOfTouches);
    }
    wrapper.dispatchEvent(event);
  });

  // C++ 要建包装对象时回调这里。同一个原生指针 C++ 那边会复用已有的包装，
  // 所以 === 成立。
  //
  // **不走构造函数。** 工厂要的只是「一个挂着事件表和句柄的包装」，而原生类
  // 的构造函数在这条路上本来就什么都不做。走它就得留一个全局的「现在允许
  // 构造」开关，而那个开关是个布尔量：不可重入，一旦卡在 true，之后每个
  // new 都会静默返回空壳——全局、永久、无声。
  native.setWrapperFactory(function (className, handle) {
    const Cls = nativeClasses[className];
    if (Cls === undefined) return null;
    const wrapper = initWrapper(Object.create(Cls.prototype));
    Object.defineProperty(wrapper, kHandle, { value: handle });
    return wrapper;
  });

  // ---------- Application ----------

  function deepFreeze(value) {
    if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    for (const key of Object.getOwnPropertyNames(value)) deepFreeze(value[key]);
    return value;
  }

  let allowConstruct = false;
  let infoCache = null;

  // 实时环境值。每次读取都向原生要最新快照并解析一次 JSON——
  // 这些值变化稀疏、读取也不频繁，先用最简单的做法；成为热点再说。
  function env() {
    return JSON.parse(native.environmentJSON());
  }

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
    [kSubscribe](type, on) {
      requireNative(this, 'addEventListener');
      native.subscribe(this[kHandle], type, on);
      if (on) subscribed.add(this);
      else if (this[kListeners].size === 0) subscribed.delete(this);
    }
  });

  // ---------- 文件读写 ----------
  //
  // 全是 Promise。不是因为「异步一律 Promise」那条原则，而是因为 **JS 跑在
  // 主线程**：同步读一个文件会直接卡住 UI。上面的 storage 能同步，是因为
  // UserDefaults 是内存缓存。
  //
  // 这个类的名字不是 ObjC 类名：「读写文件」这个能力在 iOS 里散在
  // NSFileManager / NSData / NSString 三个类上，没有一个原生对象能直接当它
  // 用，所以上层这个对象是我们自己的。底下接的是 NSFileManager.defaultManager。
  function filePath(value, what) {
    if (typeof value !== 'string' || value === '') {
      throw new TypeError(what + ': path must be a non-empty string');
    }
    return value;
  }

  defineNativeClass('FileSystem', class FileSystem extends NSObject {
    constructor() { nativeOnly(new.target); }

    // 四个目录常量，绝对路径。拼接由 JS 自己做——那是纯字符串运算
    /** 会被备份，用户数据放这里 */
    get documents() { return nativeGet(this, 'documents'); }
    /** 系统空间紧张时**会被清掉** */
    get caches() { return nativeGet(this, 'caches'); }
    /** 会被备份，App 自己的数据放这里 */
    get applicationSupport() { return nativeGet(this, 'applicationSupport'); }
    /** 系统随时删 */
    get temporary() { return nativeGet(this, 'temporary'); }

    readText(path) {
      return nativeCallAsync(this, 'readText', [filePath(path, 'readText')]);
    }
    readBytes(path) {
      return nativeCallAsync(this, 'readBytes', [filePath(path, 'readBytes')]);
    }
    writeText(path, text) {
      const p = filePath(path, 'writeText');
      if (typeof text !== 'string') {
        throw new TypeError('writeText: the second argument must be a string');
      }
      return nativeCallAsync(this, 'writeText', [p, text]).then(() => undefined);
    }
    /** 第二个参数收 Blob。要写 ArrayBuffer 就先 new Blob([buffer]) */
    writeBytes(path, blob) {
      const p = filePath(path, 'writeBytes');
      if (!(blob instanceof Blob)) {
        throw new TypeError('writeBytes: the second argument must be a Blob');
      }
      return nativeCallAsync(this, 'writeBytes', [p, blob]).then(() => undefined);
    }
    exists(path) {
      return nativeCallAsync(this, 'exists', [filePath(path, 'exists')]);
    }
    /** 目录连同里面的东西一起删 */
    remove(path) {
      return nativeCallAsync(this, 'remove', [filePath(path, 'remove')]).then(() => undefined);
    }
    /** 中间层自动建，已经存在不报错 */
    makeDirectory(path) {
      return nativeCallAsync(this, 'makeDirectory', [filePath(path, 'makeDirectory')])
        .then(() => undefined);
    }
    /** 只有名字，不含路径 */
    readDirectory(path) {
      return nativeCallAsync(this, 'readDirectory', [filePath(path, 'readDirectory')]);
    }
    /** { size, isDirectory, modified }，modified 是毫秒时间戳 */
    stat(path) {
      return nativeCallAsync(this, 'stat', [filePath(path, 'stat')]);
    }
    move(from, to) {
      return nativeCallAsync(this, 'move', [filePath(from, 'move'), filePath(to, 'move')])
        .then(() => undefined);
    }
    copy(from, to) {
      return nativeCallAsync(this, 'copy', [filePath(from, 'copy'), filePath(to, 'copy')])
        .then(() => undefined);
    }
  });

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

  class Application extends EventTarget {
    constructor() {
      if (!allowConstruct) throw new TypeError('Illegal constructor');
      super();
    }

    // Info.plist 的只读快照。是运行时已解析的那份，不是源文件
    get info() {
      if (infoCache === null) infoCache = deepFreeze(JSON.parse(native.infoJSON()));
      return infoCache;
    }
    get bundleIdentifier() { return this.info.CFBundleIdentifier; }
    get version() { return this.info.CFBundleShortVersionString; }
    get build() { return this.info.CFBundleVersion; }

    // --- 运行状态 ---
    // 前后台切换时会变，所以每次都问原生
    get state() { return env().state; }
    get protectedDataAvailable() { return env().protectedDataAvailable; }

    // --- 环境与偏好 ---
    // 实际能力 = Info.plist 声明 AND 运行环境允许。
    // 要读声明值用 info.UIApplicationSceneManifest.UIApplicationSupportsMultipleScenes
    get supportsMultipleScenes() { return env().supportsMultipleScenes; }
    get layoutDirection() { return env().layoutDirection; }
    get contentSizeCategory() { return env().contentSizeCategory; }
    get backgroundRefreshStatus() { return env().backgroundRefreshStatus; }
    // iOS 27 才有，更低版本上读到 false
    get prefersReducedResourceUsage() {
      const value = env().prefersReducedResourceUsage;
      return value === undefined ? false : value;
    }

    // --- 可写 ---
    // 写入要切到主线程，是异步生效的；读回来的是原生的真实值
    get idleTimerDisabled() { return env().idleTimerDisabled; }
    set idleTimerDisabled(value) { native.setIdleTimerDisabled(Boolean(value)); }

    // 系统已连接的场景。**启动时通常是空的**——场景在 didFinishLaunching
    // 之后才接入，所以 UI 必须靠 sceneconnect 事件驱动，不能在这里取。
    /** 令牌和密码的安全存放。全是 Promise */
    get keychain() {
      return own(this, 'keychain', nativeClassObject('Keychain', 'default'));
    }
    /** 文件读写。全是 Promise——JS 在主线程，同步读会卡 UI */
    get fileSystem() {
      return own(this, 'fileSystem', nativeClassObject('FileSystem', 'default'));
    }
    /** 本地存储。就是 NSUserDefaults 的 standard 实例，App 级单例 */
    get storage() {
      return own(this, 'storage', nativeClassObject('NSUserDefaults', 'standardUserDefaults'));
    }
    get scenes() { return ownAll(this, 'scenes', native.scenes()); }

    // --- 方法 ---
    // 打开 URL：跳 Safari、拨号、跳别的 App。URL 无效或系统拒绝时兑现为 false。
    // options 暂时没有可透传的键，先占位
    openURL(url, options) {
      return native.openURL(String(url));
    }
  }

  allowConstruct = true;
  const application = new Application();
  allowConstruct = false;

  // 运行时派发事件的统一入口。返回值告诉原生侧 JS 有没有调 preventDefault()
  native.setEventSink(function (type, payload) {
    let event;
    if (type === 'error') {
      event = new ErrorEvent(type, Object.assign({ cancelable: true }, payload));
    } else if (type === 'unhandledrejection') {
      event = new PromiseRejectionEvent(type, Object.assign({ cancelable: true }, payload));
    } else {
      // 原生通知派发的事件：运行时刻意延后一轮执行，派发方早已返回，所以不可取消
      event = new Event(type);
      // payload 里的字段原样挂到事件上，比如 sceneconnect 的 event.scene
      if (payload != null) {
        for (const key of Object.keys(payload)) defineField(event, key, payload[key]);
      }
      // 场景的包装由 application 兜着：它是永久的，而场景的包装一旦被回收，
      // 后面派发给这个场景的事件就落到一个新包装上，监听器全丢。
      const scene = payload == null ? null : payload.scene;
      if (type === 'sceneconnect') ownOne(application, 'scenes', scene);
      else if (type === 'scenedisconnect') disown(application, 'scenes', scene);
    }
    return application.dispatchEvent(event);
  });

  const kReparse = Symbol('url.reparse');

  // ---------- URL ----------
  //
  // 解析用 NSURLComponents（见 ParseURL）。它遵循 RFC 3986，和 WHATWG URL
  // 有几处实测出来的差异，在这一层补齐：host 小写化、默认端口移除、点段
  // 规范化。补不了的（IDN 转 punycode）记在文档里。
  //
  // 没有 base 这一条不是偷懒：我们不通过 HTTP 加载 JS，没有 location，
  // 相对 URL 无依可循，编一个 base 出来只会错得更隐蔽。

  // 规范化（小写化、默认端口、点段）全在原生层做完了，这里只解码。
  // 搬下去的理由有两条：原生的 standardizedURL 比在 JS 里写循环快，
  // 而且更对——手写版本很容易把 '//double' 吞成 '/double'。
  function parseURLParts(input, base) {
    const json = native.parseURL(String(input), base === undefined ? '' : String(base));
    return json === undefined ? null : JSON.parse(json);
  }

  function serializeURL(p) {
    let out = p.protocol + '//';
    if (p.username) {
      out += p.username;
      if (p.password) out += ':' + p.password;
      out += '@';
    }
    return out + p.host + p.pathname + p.search + p.hash;
  }

  const kParts = Symbol('url.parts');
  const kParams = Symbol('url.searchParams');

  const URL = define(globalThis, 'URL', class URL {
    constructor(url, base) {
      const p = parseURLParts(url, base);
      if (p === null) {
        throw new TypeError(
          base === undefined
            ? 'Invalid URL: ' + JSON.stringify(String(url)) +
              '. Without a base it must be absolute: this runtime does not load over HTTP, so there is no location'
            : 'Invalid URL: ' + JSON.stringify(String(url)) +
              '（base ' + JSON.stringify(String(base)) + '）');
      }
      this[kParts] = p;
      this[kParams] = null;   // 用到才建，建了就和 search 双向绑定
    }
    // 改任何一部分都重新拼再重新解析，保证规范化结果一致
    [kReparse](patch) {
      const p = Object.assign({}, this[kParts], patch);
      const 再解析 = parseURLParts(serializeURL(p));
      if (再解析 !== null) this[kParts] = 再解析;
    }
    get href() { return serializeURL(this[kParts]); }
    set href(v) {
      const p = parseURLParts(v);
      if (p === null) throw new TypeError('Invalid URL: ' + JSON.stringify(String(v)));
      this[kParts] = p;
      if (this[kParams]) syncParams(this[kParams], p.search);
    }
    get origin() { return this[kParts].origin; }
    get protocol() { return this[kParts].protocol; }
    set protocol(v) {
      const t = String(v);
      this[kReparse]({ protocol: t.endsWith(':') ? t : t + ':' });
    }
    get username() { return this[kParts].username; }
    set username(v) { this[kReparse]({ username: String(v) }); }
    get password() { return this[kParts].password; }
    set password(v) { this[kReparse]({ password: String(v) }); }
    get host() { return this[kParts].host; }
    set host(v) { this[kReparse]({ host: String(v) }); }
    get hostname() { return this[kParts].hostname; }
    set hostname(v) {
      const p = this[kParts];
      this[kReparse]({ host: p.port ? String(v) + ':' + p.port : String(v) });
    }
    get port() { return this[kParts].port; }
    set port(v) {
      const t = String(v);
      this[kReparse]({ host: t ? this[kParts].hostname + ':' + t : this[kParts].hostname });
    }
    get pathname() { return this[kParts].pathname; }
    set pathname(v) {
      const t = String(v);
      this[kReparse]({ pathname: t.startsWith('/') ? t : '/' + t });
    }
    get search() { return this[kParts].search; }
    set search(v) {
      const t = String(v);
      this[kParts].search = t === '' || t === '?' ? '' : (t.startsWith('?') ? t : '?' + t);
      if (this[kParams]) syncParams(this[kParams], this[kParts].search);
    }
    get searchParams() {
      if (!this[kParams]) {
        this[kParams] = new URLSearchParams(this[kParts].search);
        this[kParams][kOwnerURL] = this;
      }
      return this[kParams];
    }
    get hash() { return this[kParts].hash; }
    set hash(v) {
      const t = String(v);
      this[kParts].hash = t === '' || t === '#' ? '' : (t.startsWith('#') ? t : '#' + t);
    }
    toString() { return this.href; }
    toJSON() { return this.href; }
    // 不抛的解析，省掉 try/catch。WHATWG 后加的，很好用
    static canParse(url, base) { return parseURLParts(url, base) !== null; }
    static parse(url, base) {
      const p = parseURLParts(url, base);
      if (p === null) return null;
      const u = Object.create(URL.prototype);
      u[kParts] = p;
      u[kParams] = null;
      return u;
    }
  });

  // ---------- URLSearchParams ----------
  //
  // 纯 JS：它就是一个有序的键值对列表加 application/x-www-form-urlencoded
  // 的编解码规则，不需要原生。注意这套编码和 URL 其余部分不同——空格是 '+'。

  const kPairs = Symbol('params.pairs');
  const kOwnerURL = Symbol('params.owner');

  function encodeFormComponent(text) {
    return encodeURIComponent(text)
      .replace(/%20/g, '+')
      .replace(/[!'()~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  }
  function decodeFormComponent(text) {
    try { return decodeURIComponent(text.replace(/\+/g, ' ')); }
    catch { return text; }   // 坏的百分号编码原样返回，和浏览器一致
  }
  function parsePairs(init) {
    const out = [];
    let text = String(init);
    if (text.startsWith('?')) text = text.slice(1);
    if (text === '') return out;
    for (const part of text.split('&')) {
      if (part === '') continue;
      const i = part.indexOf('=');
      if (i < 0) out.push([decodeFormComponent(part), '']);
      else out.push([decodeFormComponent(part.slice(0, i)), decodeFormComponent(part.slice(i + 1))]);
    }
    return out;
  }
  // 参数变了就把宿主 URL 的 search 同步过去（WHATWG 要求双向绑定）
  function flushParams(params) {
    const url = params[kOwnerURL];
    if (!url) return;
    const text = params.toString();
    url[kParts].search = text === '' ? '' : '?' + text;
  }
  function syncParams(params, search) {
    params[kPairs] = parsePairs(search);
  }

  const URLSearchParams = define(globalThis, 'URLSearchParams',
    class URLSearchParams {
      constructor(init) {
        this[kOwnerURL] = null;
        if (init === undefined || init === null) { this[kPairs] = []; return; }
        if (typeof init === 'string') { this[kPairs] = parsePairs(init); return; }
        if (init instanceof URLSearchParams) {
          this[kPairs] = init[kPairs].map((pair) => [pair[0], pair[1]]);
          return;
        }
        if (Array.isArray(init)) {
          this[kPairs] = init.map((pair) => {
            if (!Array.isArray(pair) || pair.length !== 2) {
              throw new TypeError('URLSearchParams in array form needs every entry to be [name, value]');
            }
            return [String(pair[0]), String(pair[1])];
          });
          return;
        }
        this[kPairs] = Object.entries(init).map(([k, v]) => [String(k), String(v)]);
      }
      get size() { return this[kPairs].length; }
      append(name, value) {
        this[kPairs].push([String(name), String(value)]);
        flushParams(this);
      }
      delete(name, value) {
        const n = String(name);
        const hasValue = value !== undefined;
        const v = hasValue ? String(value) : null;
        this[kPairs] = this[kPairs].filter(
          (pair) => !(pair[0] === n && (!hasValue || pair[1] === v)));
        flushParams(this);
      }
      get(name) {
        const n = String(name);
        for (const pair of this[kPairs]) if (pair[0] === n) return pair[1];
        return null;
      }
      getAll(name) {
        const n = String(name);
        return this[kPairs].filter((pair) => pair[0] === n).map((pair) => pair[1]);
      }
      has(name, value) {
        const n = String(name);
        const hasValue = value !== undefined;
        const v = hasValue ? String(value) : null;
        return this[kPairs].some(
          (pair) => pair[0] === n && (!hasValue || pair[1] === v));
      }
      // set 的语义：替换第一个同名的，删掉其余同名的，位置保持
      set(name, value) {
        const n = String(name);
        const v = String(value);
        let placed = false;
        const out = [];
        for (const pair of this[kPairs]) {
          if (pair[0] !== n) { out.push(pair); continue; }
          if (placed) continue;
          out.push([n, v]);
          placed = true;
        }
        if (!placed) out.push([n, v]);
        this[kPairs] = out;
        flushParams(this);
      }
      sort() {
        // 按名字排，同名之间保持原有顺序（规范要求稳定）
        this[kPairs] = this[kPairs]
          .map((pair, i) => [pair, i])
          .sort((a, b) => (a[0][0] < b[0][0] ? -1 : a[0][0] > b[0][0] ? 1 : a[1] - b[1]))
          .map(([pair]) => pair);
        flushParams(this);
      }
      forEach(callback, thisArg) {
        for (const [k, v] of this[kPairs].slice()) callback.call(thisArg, v, k, this);
      }
      *keys() { for (const pair of this[kPairs].slice()) yield pair[0]; }
      *values() { for (const pair of this[kPairs].slice()) yield pair[1]; }
      *entries() { for (const pair of this[kPairs].slice()) yield [pair[0], pair[1]]; }
      [Symbol.iterator]() { return this.entries(); }
      toString() {
        return this[kPairs]
          .map(([k, v]) => encodeFormComponent(k) + '=' + encodeFormComponent(v))
          .join('&');
      }
    });

  // ---------- Headers ----------
  //
  // 纯 JS。名字大小写不敏感（内部一律存小写），同名多值用 ', ' 合并，
  // Set-Cookie 例外——它不能合并，所以单独用 getSetCookie() 取数组。
  //
  // 不做 forbidden header 检查：浏览器禁止 JS 设 Host / Cookie / Origin，
  // 那是防不受信任的页面伪造请求。按[原则 8]，我们的 JS 和原生代码同等
  // 地位，没有要防的对象，拦下来只会挡住正当用途。

  const kHeaderMap = Symbol('headers.map');   // 小写名 -> [值, 值, ...]

  function normalizeHeaderName(name) {
    const n = String(name);
    // HTTP 的 token 规则：这些字符不允许出现在首部名里
    if (n === '' || /[^!#$%&'*+\-.^_`|~0-9A-Za-z]/.test(n)) {
      throw new TypeError('Invalid header name: ' + JSON.stringify(n));
    }
    return n.toLowerCase();
  }
  function normalizeHeaderValue(value) {
    // 首尾的空白要去掉；中间的 NUL / CR / LF 会撕裂报文，必须拒绝
    const v = String(value).replace(/^[\t\n\r ]+|[\t\n\r ]+$/g, '');
    if (/[\0\r\n]/.test(v)) {
      throw new TypeError('Header value cannot contain NUL, CR or LF');
    }
    return v;
  }

  define(globalThis, 'Headers', class Headers {
    constructor(init) {
      this[kHeaderMap] = new Map();
      if (init === undefined || init === null) return;
      if (init instanceof Headers) {
        for (const [k, list] of init[kHeaderMap]) this[kHeaderMap].set(k, list.slice());
        return;
      }
      const 条目 = Array.isArray(init) ? init : Object.entries(init);
      for (const pair of 条目) {
        if (!Array.isArray(pair) || pair.length !== 2) {
          throw new TypeError('Headers in array form needs every entry to be [name, value]');
        }
        this.append(pair[0], pair[1]);
      }
    }
    append(name, value) {
      const k = normalizeHeaderName(name);
      const v = normalizeHeaderValue(value);
      const list = this[kHeaderMap].get(k);
      if (list) list.push(v); else this[kHeaderMap].set(k, [v]);
    }
    set(name, value) {
      this[kHeaderMap].set(normalizeHeaderName(name), [normalizeHeaderValue(value)]);
    }
    delete(name) { this[kHeaderMap].delete(normalizeHeaderName(name)); }
    has(name) { return this[kHeaderMap].has(normalizeHeaderName(name)); }
    // 多值合并成一个串，这是 Web 的语义；要拿原始的多值只有 Set-Cookie 有
    get(name) {
      const list = this[kHeaderMap].get(normalizeHeaderName(name));
      return list ? list.join(', ') : null;
    }
    getSetCookie() { return (this[kHeaderMap].get('set-cookie') || []).slice(); }
    // 迭代按名字排序，而且 Set-Cookie 不合并——规范特地这么定的
    *entries() {
      for (const k of Array.from(this[kHeaderMap].keys()).sort()) {
        const list = this[kHeaderMap].get(k);
        if (k === 'set-cookie') { for (const v of list) yield [k, v]; }
        else yield [k, list.join(', ')];
      }
    }
    *keys() { for (const [k] of this.entries()) yield k; }
    *values() { for (const [, v] of this.entries()) yield v; }
    [Symbol.iterator]() { return this.entries(); }
    forEach(callback, thisArg) {
      for (const [k, v] of this.entries()) callback.call(thisArg, v, k, this);
    }
  });

  // ---------- Blob ----------
  //
  // 字节在原生的 NSData 里，JS 侧只拿一个句柄。复用的就是 UIView / UIColor
  // 那套包装机制——Chrome 为了同样的事要跨进程传 UUID，我们同进程直接持指针。
  //
  // 对视频切片这类场景的意义：fetch 一个切片拿到 Blob，交给播放器，
  // 字节从头到尾不进 V8 堆。

  defineNativeClass('Blob', class Blob extends NSObject {
    constructor(parts, options) {
      super();
      const list = parts === undefined || parts === null ? [] : Array.from(parts);
      const o = options === undefined || options === null ? {} : options;
      const type = has(o, 'type') ? String(o.type) : '';
      // 字符串走 JSON，ArrayBuffer / TypedArray 的字节按下标单独过去，
      // 嵌套的 Blob 第一版不支持（要先把它的字节取出来）
      const prepared = list.map((item) => {
        if (item instanceof Blob) {
          throw new TypeError('Blob parts cannot be Blobs yet');
        }
        return item;
      });
      const handle = native.createBlob(prepared, type, '');
      if (handle) Object.defineProperty(this, kHandle, { value: handle[kHandle] });
    }
    get size() { requireNative(this, 'size'); return nativeGet(this, 'size'); }
    get type() { requireNative(this, 'type'); return nativeGet(this, 'type'); }
    // 字节本来就在内存里，但解码派到后台，所以还是 Promise
    arrayBuffer() { return native.readObjectAsync(this[kHandle], 'arrayBuffer'); }
    text() { return native.readObjectAsync(this[kHandle], 'text'); }
  });

  // ---------- AbortController ----------
  //
  // 当初在事件模型那节写过「不借 AbortSignal，牵出一整套规范，而我们连
  // 定时器都没有」。两个前提都变了：定时器有了，而 NSURLSessionTask.cancel
  // 是实打实的能力，按能力对齐该暴露。

  const kAborted = Symbol('signal.aborted');
  const kReason = Symbol('signal.reason');

  const AbortSignal = define(globalThis, 'AbortSignal',
    class AbortSignal extends EventTarget {
      constructor() {
        super();
        if (!allowAbortSignalConstruct) {
          throw new TypeError('AbortSignal cannot be constructed directly, use new AbortController()');
        }
        this[kAborted] = false;
        this[kReason] = undefined;
      }
      get aborted() { return this[kAborted]; }
      get reason() { return this[kReason]; }
      throwIfAborted() { if (this[kAborted]) throw this[kReason]; }
      /** 已经中止的 signal，省掉建 controller。 */
      static abort(reason) {
        const s = makeSignal();
        abortSignal(s, reason);
        return s;
      }
      /** 到点自动中止。有了定时器之后才做得了这个。 */
      static timeout(ms) {
        const s = makeSignal();
        setTimeout(() => {
          const err = new Error('The operation timed out');
          err.name = 'TimeoutError';
          abortSignal(s, err);
        }, Number(ms) || 0);
        return s;
      }
    });

  let allowAbortSignalConstruct = false;
  function makeSignal() {
    allowAbortSignalConstruct = true;
    try { return new AbortSignal(); }
    finally { allowAbortSignalConstruct = false; }
  }
  function abortSignal(signal, reason) {
    if (signal[kAborted]) return;   // 只中止一次
    signal[kAborted] = true;
    if (reason === undefined) {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';   // Web 用 DOMException，我们没有那个类
      signal[kReason] = err;
    } else {
      signal[kReason] = reason;
    }
    signal.dispatchEvent(new Event('abort'));
  }

  define(globalThis, 'AbortController', class AbortController {
    constructor() {
      Object.defineProperty(this, 'signal', { value: makeSignal(), enumerable: true });
    }
    abort(reason) { abortSignal(this.signal, reason); }
  });

  // ---------- fetch ----------
  //
  // body 的四条路，各自的代价不一样：
  //   arrayBuffer()  原生那块内存直接交给 V8，**零拷贝**
  //   blob()         同上，而且 JS 侧只拿句柄，字节不进 V8 堆
  //   text()         后台 UTF-8 解码，一次拷贝
  //   json()         text 再加一次 JSON.parse（C++ runtime，jitless 不影响）
  //
  // 没有 ReadableStream：body 整个下完才兑现。流式是一整套规范，第一版不做。

  const kRequestId = Symbol('fetch.requestId');
  const kBodyText = Symbol('request.bodyText');
  const kBodyUsed = Symbol('fetch.bodyUsed');
  const kResponseInit = Symbol('fetch.responseInit');

  // 请求结束后要放掉原生那份数据。JS 对象被回收时通知原生层——
  // 否则一个没读 body 的 Response 会把 NSData 一直钉在内存里。
  const bodyRegistry = new FinalizationRegistry((requestId) => {
    native.fetchRelease(requestId);
  });

  function readBody(target, kind) {
    if (target[kBodyUsed]) {
      // Web 规范：body 只能读一次。读过第二次要抛，不能静默给空的
      return Promise.reject(new TypeError('Body has already been read'));
    }
    target[kBodyUsed] = true;
    const id = target[kRequestId];
    if (!id) return Promise.reject(new TypeError('This object has no body'));
    return native.fetchReadBody(id, kind);
  }

  class Body {
    get bodyUsed() { return this[kBodyUsed]; }
    arrayBuffer() { return readBody(this, 'arrayBuffer'); }
    text() { return readBody(this, 'text'); }
    async json() { return JSON.parse(await readBody(this, 'text')); }
    blob() { return readBody(this, 'blob'); }
  }

  const Response = define(globalThis, 'Response', class Response extends Body {
    constructor(body, init) {
      super();
      const o = init === undefined || init === null ? {} : init;
      this[kRequestId] = 0;
      this[kBodyUsed] = false;
      this[kResponseInit] = {
        status: has(o, 'status') ? Number(o.status) : 200,
        statusText: has(o, 'statusText') ? String(o.statusText) : '',
        url: '',
        headers: new Headers(o.headers),
      };
    }
    get status() { return this[kResponseInit].status; }
    get statusText() { return this[kResponseInit].statusText; }
    get url() { return this[kResponseInit].url; }
    get headers() { return this[kResponseInit].headers; }
    // 2xx 才算成功。404 也会走到这里——fetch 只在网络层失败时才拒绝，
    // 这是 Web 的语义，常被误解，所以文档里专门写了一段
    get ok() { return this.status >= 200 && this.status < 300; }
    get redirected() { return false; }   // 重定向由系统处理，我们看不到中间过程
    get type() { return 'basic'; }       // 没有 CORS，一律 basic
  });

  const Request = define(globalThis, 'Request', class Request extends Body {
    constructor(input, init) {
      super();
      const o = init === undefined || init === null ? {} : init;
      const fromRequest = input instanceof Request;
      this[kRequestId] = 0;
      this[kBodyUsed] = false;
      this.url = fromRequest ? input.url : new URL(String(input)).href;
      this.method = (has(o, 'method') ? String(o.method) : fromRequest ? input.method : 'GET')
                      .toUpperCase();
      this.headers = new Headers(
        has(o, 'headers') ? o.headers : fromRequest ? input.headers : undefined);
      const body = has(o, 'body') ? o.body : fromRequest ? input[kBodyText] : undefined;
      this[kBodyText] = body === undefined || body === null ? null : String(body);
      // 不 Object.freeze：bodyUsed 是读 body 时才置上的，冻了就写不进去。
      // Web 的 Request 用内部槽存这个状态，我们用 Symbol 属性，所以不能冻。
    }
    clone() {
      return new Request(this.url, {
        method: this.method, headers: this.headers, body: this[kBodyText],
      });
    }
  });

  define(globalThis, 'fetch', function fetch(input, init) {
    let req;
    try { req = new Request(input, init); }
    catch (err) { return Promise.reject(err); }

    const headerPairs = [];
    for (const [k, v] of req.headers) headerPairs.push([k, v]);
    const options = {
      method: req.method,
      headers: headerPairs,
      body: req[kBodyText],
    };

    const [promise, requestId] = native.fetchStart(req.url, JSON.stringify(options));

    // 取消：signal 一中止就叫原生层 cancel，NSURLSessionTask 会以
    // NSURLErrorCancelled 结束，原生层把它映射成 AbortError
    const signal = init && init.signal;
    if (signal) {
      if (signal.aborted) {
        native.fetchCancel(requestId);
        // 内部那个 promise 也会被原生层拒绝（取消），但它不会交到调用方手里，
        // 不自己消化掉就成了未处理的拒绝——验收用例里真的报出来了
        promise.catch(() => {});
        return Promise.reject(signal.reason);
      }
      signal.addEventListener('abort', () => native.fetchCancel(requestId),
                              { once: true });
    }

    return promise.then((info) => {
      const res = new Response(null, {
        status: info.status,
        headers: info.headers,
      });
      res[kResponseInit].url = info.url;
      res[kRequestId] = requestId;
      // 原生那份 NSData 的生死跟着这个 Response 走
      bodyRegistry.register(res, requestId);
      return res;
    });
  });

  // ---------- 定时器 ----------
  //
  // 这是 Web 的 API，不是我们设计的——按[原则 4]所有「我们设计的」异步 API
  // 都返回 Promise，而 setTimeout 是回调式的。提供它是因为它是生态的底座：
  // async/await 降级后的代码、debounce、测试框架全都假设它存在。
  // 要 Promise 形态自己包一行就有：await new Promise(r => setTimeout(r, 100))
  //
  // 调度在原生层：一个按 (到期时间, 注册序号) 排序的最小堆 + 一个唤醒源。
  // 同时到期按注册顺序执行（HTML 规范要求），一次唤醒最多占用主线程 8ms，
  // 超了就让出去让 run loop 去渲染。
  function normalizeDelay(value) {
    const ms = Number(value);
    return Number.isFinite(ms) && ms > 0 ? ms : 0;
  }
  function addTimer(handler, delay, args, repeats, who) {
    if (typeof handler !== 'function') {
      throw new TypeError(who + ': the first argument must be a function');
    }
    // 额外参数透传是标准行为：setTimeout(fn, 0, a, b) 会用 (a, b) 调 fn
    const callback = args.length === 0 ? handler : () => handler(...args);
    return native.addTimer(callback, normalizeDelay(delay), repeats);
  }

  define(globalThis, 'setTimeout', function setTimeout(handler, delay, ...args) {
    return addTimer(handler, delay, args, false, 'setTimeout');
  });
  define(globalThis, 'setInterval', function setInterval(handler, delay, ...args) {
    return addTimer(handler, delay, args, true, 'setInterval');
  });
  // id 不认识时静默忽略，和 Web 一致
  define(globalThis, 'clearTimeout', function clearTimeout(id) {
    if (id != null) native.removeTimer(Number(id) | 0);
  });
  define(globalThis, 'clearInterval', function clearInterval(id) {
    if (id != null) native.removeTimer(Number(id) | 0);
  });
  // 不是定时器，是微任务——排在当前任务的微任务检查点里，不等下一轮。
  // 同样是生态假设存在的东西。
  define(globalThis, 'queueMicrotask', function queueMicrotask(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('queueMicrotask: the argument must be a function');
    }
    Promise.resolve().then(callback);
  });

  // ---- performance ----
  //
  // 上层 API，Web 原样：Node、Deno、浏览器都有这个全局。只做 now() 和
  // timeOrigin——mark / measure 那一组 JS 自己写得出来。
  //
  // 时钟在引擎的 C++ 里（steady_clock），不依赖 iOS。零点是引擎建出来的
  // 那一刻，早于任何一行 JS
  const perfTimeOrigin = native.timeOrigin();
  let allowPerformance = false;
  class Performance {
    constructor() {
      if (!allowPerformance) throw new TypeError('Illegal constructor');
    }
    // 毫秒，带小数。只能拿来算差值：它不是日期
    now() { return native.now(); }
    // now() 的零点对应的 Unix 毫秒时间戳
    get timeOrigin() { return perfTimeOrigin; }
    toJSON() { return { timeOrigin: perfTimeOrigin }; }
  }
  allowPerformance = true;
  const performance = new Performance();
  allowPerformance = false;
  define(globalThis, 'Performance', Performance);
  define(globalThis, 'performance', performance);

  // ---- crypto ----
  //
  // 上层 API，Web 原样。只有随机数这两个：getRandomValues 和 randomUUID。
  // crypto.subtle（摘要、签名）是另一步。
  //
  // 随机源在原生（SecRandomCopyBytes）。这里只做 Web 规定的那几项检查，
  // 以及 UUID 的拼装——它就是 16 个随机字节改 6 个位
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
})(globalThis.__nacre_native);
