// Nacre 运行时的内置脚本：在 main.js 之前执行，装上层 API。
// 这里定义的 EventTarget / Event 不是 ECMAScript 的一部分，V8 不提供，由运行时补。
'use strict';

(function (native) {
  // 用 IIFE 作用域内的 Symbol 存内部状态：既能跨类访问，又不出现在公开属性上
  const kTarget = Symbol('target');
  const kDefaultPrevented = Symbol('defaultPrevented');
  const kStopImmediate = Symbol('stopImmediate');
  const kListeners = Symbol('listeners');

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

  class EventTarget {
    constructor() {
      Object.defineProperty(this, kListeners, {
        value: new Map(), writable: false, enumerable: false, configurable: false,
      });
    }

    addEventListener(type, callback, options) {
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
    }

    removeEventListener(type, callback) {
      const list = this[kListeners].get(String(type));
      if (list === undefined) return;
      for (let i = 0; i < list.length; i++) {
        if (list[i].callback === callback) { list.splice(i, 1); return; }
      }
    }

    dispatchEvent(event) {
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
  let allowNativeConstruct = false;

  function defineNativeClass(name, cls) {
    nativeClasses[name] = cls;
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
    return native.callAsync(obj[kHandle], name, JSON.stringify(args || []));
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
  function superviewOf(view) {
    if (view == null || view[kHandle] === undefined) return null;
    return nativeGetObject(view, 'superview');
  }
  // 带参数的方法。selector 是完整的 ObjC selector，JS 层的
  // 「第一段 + options」在各自的方法里还原成它。
  // 对象参数在 JSON 里留 null，句柄按同样的下标单独传。
  // 看着像原生对象、却没有句柄 —— 原生对象还没创建。两种来头：
  //   new UIWindow()          还没绑场景
  //   class C extends UIView  子类的 super() 不建原生对象（见构造函数里的
  //                           new.target 那道闸）
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
  // 类级属性（ObjC 的 @property(class, readonly)）。没有实例，用类名定位。
  function nativeClassObject(className, name) {
    const result = native.classObjProp(className, name);
    return result === undefined ? null : result;
  }
  // JS 构造原生对象：先有 this，再让原生造出对象并和 this 绑定。
  // 和包装工厂方向相反——那边是原生对象先有、JS 包装后建。
  function constructNative(wrapper, className, args) {
    const handles = (args || []).map((a) => {
      if (a == null) return 0;
      if (a[kHandle] === undefined) rejectUnbacked(a, 'new ' + className);
      return a[kHandle] || 0;
    });
    const handle = native.construct(className, handles, wrapper);
    if (handle) Object.defineProperty(wrapper, kHandle, { value: handle });
  }

  // 只有被原生侧创建时才允许构造。用于系统给的对象（场景、session）。
  // 原生对象还没创建时，除了 windowScene 之外的访问都没有事实可依据，
  // 与其返回一个编出来的值，不如直接报错
  function requireNative(obj, what) {
    if (obj[kHandle] === undefined) {
      throw new TypeError(
        what + ': this object is not connected to a scene yet, so no native object exists');
    }
  }

  function nativeOnly() {
    if (!allowNativeConstruct) throw new TypeError('Illegal constructor');
  }

  // 继承链上的空壳：自己不可直接构造，但不能挡住可构造的子类。
  // new.target 在子类的 super() 调用里是子类，据此区分。
  function shellOnly(target, cls) {
    if (target === cls && !allowNativeConstruct) {
      throw new TypeError('Illegal constructor');
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
  const INSETS_FIELDS = ['top', 'left', 'bottom', 'right'];
  const toRect = (o) => (o == null ? null : new CGRect(o.x, o.y, o.width, o.height));
  const toPoint = (o) => (o == null ? null : new CGPoint(o.x, o.y));
  const toSize = (o) => (o == null ? null : new CGSize(o.width, o.height));
  const toInsets = (o) =>
    (o == null ? null : new UIEdgeInsets(o.top, o.left, o.bottom, o.right));

  // ---- 继承链的空壳 ----
  // 照搬 ObjC 的继承关系，现在先空着，以后往上加成员时子类自动继承。
  // NSObject 是 ObjC 的根类，所以也是这里所有原生类的根。
  // 让它继承 EventTarget：原生对象要发事件是常态，按原则 3 抽到基类，
  // 不让每个类各自发明一套回调。
  const NSObject = defineNativeClass('NSObject', class NSObject extends EventTarget {
    constructor() { shellOnly(new.target, NSObject); super(); }
  });
  // UIResponder 在 ObjC 里的定义就是「能接收事件的对象」，和 EventTarget 语义吻合。
  const UIResponder = defineNativeClass('UIResponder', class UIResponder extends NSObject {
    constructor() { shellOnly(new.target, UIResponder); super(); }
  });
  const UIScene = defineNativeClass('UIScene', class UIScene extends UIResponder {
    constructor() { shellOnly(new.target, UIScene); super(); }
  });
  // 图层。每个 UIView 背后都有一个，真正把东西画出来的是它。
  //
  // 这里**只暴露 UIView 上没有的**：圆角、边框、阴影。重叠的那些
  // （opacity / backgroundColor / masksToBounds / 几何）不开第二个写法——
  // 同一件事两种写法正是原则 1 要消灭的东西。能力没丢：它们在 UIView 上。
  defineNativeClass('CALayer', class CALayer extends NSObject {
    constructor() { nativeOnly(); super(); }

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
    get borderColor() { return nativeGetOwned(this, 'borderColor'); }
    set borderColor(value) { nativeSetOwned(this, 'borderColor', value); }

    // ---- 阴影 ----
    // 默认 opacity 是 0，所以只设颜色看不见任何东西
    get shadowColor() { return nativeGetOwned(this, 'shadowColor'); }
    set shadowColor(value) { nativeSetOwned(this, 'shadowColor', value); }
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
    if ('multiplier' in o) { selector += 'multiplier:'; args.push(o.multiplier); }
    if ('constant' in o) { selector += 'constant:'; args.push(o.constant); }
    return constraintOf(nativeCallObject(anchor, selector, args), anchor, other);
  }
  // 系统标准间距。差多少由系统按上下文定（8pt 起步，但靠近屏幕边缘、不同
  // 控件之间都不一样），这是 iOS 独有的能力，Web 里没有对应物。
  // multiplier 省略时按 1 ——它是乘法的单位元，省略的含义没有歧义。
  function systemSpacingConstraint(anchor, first, other, options) {
    const o = options || {};
    const multiplier = 'multiplier' in o ? o.multiplier : 1;
    return constraintOf(
      nativeCallObject(anchor, first + ':multiplier:', [other, multiplier]),
      anchor, other);
  }

  const NSLayoutAnchor = defineNativeClass('NSLayoutAnchor',
      class NSLayoutAnchor extends NSObject {
    constructor() { nativeOnly(); super(); }

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
    constructor() { nativeOnly(); super(); }

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
    constructor() { nativeOnly(); super(); }

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
    constructor() { nativeOnly(); super(); }

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
    constructor() { nativeOnly(); super(); }

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
  defineNativeClass('UILayoutGuide', class UILayoutGuide extends NSObject {
    constructor() {
      super();
      if (allowNativeConstruct) return;
      constructNative(this, 'UILayoutGuide', []);
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

  const UIView = defineNativeClass('UIView', class UIView extends UIResponder {
    // 子类的 super() 不能在这里建出一个 UIView 来，所以只在
    // new.target 正是 UIView 时才创建原生对象。
    constructor() {
      super();
      if (allowNativeConstruct || new.target !== UIView) return;
      constructNative(this, 'UIView', []);
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
    sizeThatFits(size) {
      return toSize(nativeCall(this, 'sizeThatFits:',
                               [structArg(size, SIZE_FIELDS, 'sizeThatFits')]));
    }
    sizeToFit() { nativeCall(this, 'sizeToFit', []); }
    convertPoint(point, options) {
      const p = structArg(point, POINT_FIELDS, 'convertPoint');
      const o = options || {};
      if ('toView' in o) return toPoint(nativeCall(this, 'convertPoint:toView:', [p, o.toView]));
      if ('fromView' in o) return toPoint(nativeCall(this, 'convertPoint:fromView:', [p, o.fromView]));
      throw new TypeError('convertPoint needs { toView } or { fromView }');
    }
    convertRect(rect, options) {
      const r = structArg(rect, RECT_FIELDS, 'convertRect');
      const o = options || {};
      if ('toView' in o) return toRect(nativeCall(this, 'convertRect:toView:', [r, o.toView]));
      if ('fromView' in o) return toRect(nativeCall(this, 'convertRect:fromView:', [r, o.fromView]));
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
      if ('atIndex' in o) {
        nativeCall(this, 'insertSubview:atIndex:', [view, o.atIndex]);
      } else if ('belowSubview' in o) {
        nativeCall(this, 'insertSubview:belowSubview:', [view, o.belowSubview]);
      } else if ('aboveSubview' in o) {
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
      if (!('forAxis' in o)) {
        throw new TypeError('setContentHuggingPriority needs { forAxis }');
      }
      nativeCall(this, 'setContentHuggingPriority:forAxis:', [priority, o.forAxis]);
    }
    contentCompressionResistancePriorityForAxis(axis) {
      return nativeCall(this, 'contentCompressionResistancePriorityForAxis:', [axis]);
    }
    setContentCompressionResistancePriority(priority, options) {
      const o = options || {};
      if (!('forAxis' in o)) {
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
      if ('withHorizontalFittingPriority' in o || 'verticalFittingPriority' in o) {
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
      return nativeGetOwned(this, 'backgroundColor');
    }
    set backgroundColor(value) {
      requireNative(this, 'backgroundColor');
      nativeSetOwned(this, 'backgroundColor', value);
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
    constructor() { nativeOnly(); super(); }
    static systemFontOfSize(size, options) {
      const o = options || {};
      if ('weight' in o) {
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
                             [size, 'weight' in o ? o.weight : 'regular']);
    }
    static monospacedDigitSystemFontOfSize(size, options) {
      const o = options || {};
      return nativeClassCall('UIFont', 'monospacedDigitSystemFontOfSize:weight:',
                             [size, 'weight' in o ? o.weight : 'regular']);
    }
    static fontWithName(name, options) {
      const o = options || {};
      if (!('size' in o)) throw new TypeError('fontWithName needs { size }');
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
    constructor() { nativeOnly(); super(); }

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
      if ('scale' in o) {
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
      if (!('withCapInsets' in o)) {
        throw new TypeError('resizableImage needs { withCapInsets }');
      }
      const insets = structArg(o.withCapInsets, INSETS_FIELDS, 'withCapInsets');
      if ('resizingMode' in o) {
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

  // 文字。
  defineNativeClass('UILabel', class UILabel extends UIView {
    constructor() {
      super();
      if (allowNativeConstruct) return;
      constructNative(this, 'UILabel', []);
    }
    get text() { requireNative(this, 'text'); return nativeGet(this, 'text'); }
    set text(value) { requireNative(this, 'text'); nativeSet(this, 'text', value); }
    get font() { requireNative(this, 'font'); return nativeGetOwned(this, 'font'); }
    set font(value) { requireNative(this, 'font'); nativeSetOwned(this, 'font', value); }
    get textColor() {
      requireNative(this, 'textColor');
      return nativeGetOwned(this, 'textColor');
    }
    set textColor(value) {
      requireNative(this, 'textColor');
      nativeSetOwned(this, 'textColor', value);
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
      return nativeGetOwned(this, 'highlightedTextColor');
    }
    set highlightedTextColor(value) {
      requireNative(this, 'highlightedTextColor');
      nativeSetOwned(this, 'highlightedTextColor', value);
    }
    get isEnabled() { requireNative(this, 'isEnabled'); return nativeGet(this, 'isEnabled'); }
    set isEnabled(value) {
      requireNative(this, 'isEnabled');
      nativeSet(this, 'isEnabled', value);
    }
    get shadowColor() {
      requireNative(this, 'shadowColor');
      return nativeGetOwned(this, 'shadowColor');
    }
    set shadowColor(value) {
      requireNative(this, 'shadowColor');
      nativeSetOwned(this, 'shadowColor', value);
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

  // 图片上屏。
  //
  // 「图比容器大/小/比例不一样怎么办」全靠 UIView 的 contentMode，
  // 不是这个类的事——那 13 个取值第 2.5 步就有了。
  // scaleAspectFill 记得配 clipsToBounds，否则溢出会画到容器外面。
  defineNativeClass('UIImageView', class UIImageView extends UIView {
    constructor() {
      super();
      if (allowNativeConstruct) return;
      constructNative(this, 'UIImageView', []);
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
      return nativeGetOwned(this, 'tintColor');
    }
    set tintColor(value) {
      requireNative(this, 'tintColor');
      nativeSetOwned(this, 'tintColor', value);
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
  const UIColor = defineNativeClass('UIColor', class UIColor extends NSObject {
    constructor() { nativeOnly(); super(); }
  });
  for (const name of [
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
  ]) {
    Object.defineProperty(UIColor, name, {
      configurable: true,
      enumerable: false,
      get: () => nativeClassObject('UIColor', name),
    });
  }

  // 场景的持久身份。场景对象会被系统销毁重建，session 活得更久——
  // persistentIdentifier 用来认出「是不是之前那个窗口」。
  defineNativeClass('UISceneSession', class UISceneSession extends NSObject {
    constructor() { nativeOnly(); super(); }
    // 'UIWindowSceneSessionRoleApplication' 等，决定这个场景该画什么界面
    get role() { return nativeGet(this, 'role'); }
    get persistentIdentifier() { return nativeGet(this, 'persistentIdentifier'); }
    get userInfo() { return nativeGet(this, 'userInfo'); }
    set userInfo(value) { nativeSet(this, 'userInfo', value); }
  });

  // 系统创建并连接的场景。不可构造——SDK 自己就是 init NS_UNAVAILABLE，
  // 注释写着「由 UIKit 调用，不打算让 App 调用」。
  defineNativeClass('UIWindowScene', class UIWindowScene extends UIScene {
    constructor() { nativeOnly(); super(); }

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
      if (allowNativeConstruct) return;  // 包装已有原生对象，句柄由工厂挂
      constructNative(this, 'UIViewController', []);
    }
    get view() { return nativeGetOwned(this, 'view'); }
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
  defineNativeClass('UIWindow', class UIWindow extends UIView {
    constructor(scene) {
      super();
      if (allowNativeConstruct) return;
      // 所有权是「场景持有窗口」——UIWindow.windowScene 在头文件里是 weak，
      // 真正持有窗口的是 UIWindowScene.windows。所以镜像记在场景那一侧。
      if (scene != null) {
        constructNative(this, 'UIWindow', [scene]);
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
          constructNative(this, 'UIWindow', [value]);
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

  // 原生要给某个对象自己派发事件时回调这里（场景的生命周期事件走这条路）
  native.setObjectEventSink(function (wrapper, type) {
    wrapper.dispatchEvent(new Event(type));
  });

  // C++ 要建包装对象时回调这里。走正常的 new，EventTarget 的构造函数才会跑。
  // 同一个原生指针 C++ 那边会复用已有的包装，所以 === 成立。
  native.setWrapperFactory(function (className, handle) {
    const Cls = nativeClasses[className];
    if (Cls === undefined) return null;
    allowNativeConstruct = true;
    let wrapper;
    try {
      wrapper = new Cls();
    } finally {
      allowNativeConstruct = false;
    }
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
      if (allowNativeConstruct) return;   // 原生侧造好的（response.blob()）
      const list = parts === undefined || parts === null ? [] : Array.from(parts);
      const o = options === undefined || options === null ? {} : options;
      const type = 'type' in o ? String(o.type) : '';
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
        status: 'status' in o ? Number(o.status) : 200,
        statusText: 'statusText' in o ? String(o.statusText) : '',
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
      this.method = ('method' in o ? String(o.method) : fromRequest ? input.method : 'GET')
                      .toUpperCase();
      this.headers = new Headers(
        'headers' in o ? o.headers : fromRequest ? input.headers : undefined);
      const body = 'body' in o ? o.body : fromRequest ? input[kBodyText] : undefined;
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

  define(globalThis, 'Event', Event);
  define(globalThis, 'ErrorEvent', ErrorEvent);
  define(globalThis, 'PromiseRejectionEvent', PromiseRejectionEvent);
  define(globalThis, 'EventTarget', EventTarget);
  define(globalThis, 'Application', Application);
  define(globalThis, 'application', application);

  delete globalThis.__nacre_native;
})(globalThis.__nacre_native);
