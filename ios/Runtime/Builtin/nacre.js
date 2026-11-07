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
            console.error('事件监听器抛出异常: ' + (e && e.stack ? e.stack : e));
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
  // 带参数的方法。selector 是完整的 ObjC selector，JS 层的
  // 「第一段 + options」在各自的方法里还原成它。
  // 对象参数在 JSON 里留 null，句柄按同样的下标单独传。
  function splitArgs(args) {
    const list = args || [];
    const values = [];
    const handles = [];
    for (const a of list) {
      const isObject = a != null && a[kHandle] !== undefined;
      values.push(isObject ? null : a);
      handles.push(isObject ? a[kHandle] : 0);
    }
    return { values, handles };
  }
  function nativeCall(obj, selector, args) {
    requireNative(obj, selector);
    const { values, handles } = splitArgs(args);
    return JSON.parse(
      native.call(obj[kHandle], selector, JSON.stringify(values), handles));
  }
  function nativeCallObject(obj, selector, args) {
    requireNative(obj, selector);
    const { values, handles } = splitArgs(args);
    const result =
      native.callObj(obj[kHandle], selector, JSON.stringify(values), handles);
    return result === undefined ? null : result;
  }
  function nativeGetObjectArray(obj, name) {
    requireNative(obj, name);
    return native.getObjArray(obj[kHandle], name);
  }
  // 带参数的类方法，比如 UIFont.systemFontOfSize(17)
  function nativeClassCall(className, selector, args) {
    const { values, handles } = splitArgs(args);
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
    const handles = (args || []).map((a) => (a == null ? 0 : a[kHandle]));
    const handle = native.construct(className, handles, wrapper);
    if (handle) Object.defineProperty(wrapper, kHandle, { value: handle });
  }

  // 只有被原生侧创建时才允许构造。用于系统给的对象（场景、session）。
  // 原生对象还没创建时，除了 windowScene 之外的访问都没有事实可依据，
  // 与其返回一个编出来的值，不如直接报错
  function requireNative(obj, what) {
    if (obj[kHandle] === undefined) {
      throw new TypeError(what + '：这个对象还没连接到场景，原生对象尚未创建');
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
            name + ' 是只读的：结构体按值传递，要改请整体赋一个新的');
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
      throw new TypeError(what + ' 需要一个 ' + fields.join(' / ') + ' 俱全的对象');
    }
    const out = {};
    for (const f of fields) {
      const n = Number(value[f]);
      if (!Number.isFinite(n)) {
        throw new TypeError(what + ' 缺少字段 ' + f + '，或者它不是有限的数字');
      }
      out[f] = n;
    }
    return out;
  }
  const RECT_FIELDS = ['x', 'y', 'width', 'height'];
  const POINT_FIELDS = ['x', 'y'];
  const SIZE_FIELDS = ['width', 'height'];
  const toRect = (o) => (o == null ? null : new CGRect(o.x, o.y, o.width, o.height));
  const toPoint = (o) => (o == null ? null : new CGPoint(o.x, o.y));
  const toSize = (o) => (o == null ? null : new CGSize(o.width, o.height));

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
      const i = nativeGet(this, 'safeAreaInsets');
      return i == null ? null : new UIEdgeInsets(i.top, i.left, i.bottom, i.right);
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
      throw new TypeError('convertPoint 需要 { toView } 或 { fromView }');
    }
    convertRect(rect, options) {
      const r = structArg(rect, RECT_FIELDS, 'convertRect');
      const o = options || {};
      if ('toView' in o) return toRect(nativeCall(this, 'convertRect:toView:', [r, o.toView]));
      if ('fromView' in o) return toRect(nativeCall(this, 'convertRect:fromView:', [r, o.fromView]));
      throw new TypeError('convertRect 需要 { toView } 或 { fromView }');
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
    get subviews() { return nativeGetObjectArray(this, 'subviews'); }
    get window() {
      requireNative(this, 'window');
      return nativeGetObject(this, 'window');
    }
    addSubview(view) { nativeCall(this, 'addSubview:', [view]); }
    insertSubview(view, options) {
      const o = options || {};
      if ('atIndex' in o) {
        return nativeCall(this, 'insertSubview:atIndex:', [view, o.atIndex]);
      }
      if ('belowSubview' in o) {
        return nativeCall(this, 'insertSubview:belowSubview:', [view, o.belowSubview]);
      }
      if ('aboveSubview' in o) {
        return nativeCall(this, 'insertSubview:aboveSubview:', [view, o.aboveSubview]);
      }
      throw new TypeError(
        'insertSubview 需要 { atIndex } / { belowSubview } / { aboveSubview } 之一');
    }
    removeFromSuperview() { nativeCall(this, 'removeFromSuperview', []); }
    bringSubviewToFront(view) { nativeCall(this, 'bringSubviewToFront:', [view]); }
    sendSubviewToBack(view) { nativeCall(this, 'sendSubviewToBack:', [view]); }
    isDescendantOfView(view) {
      return nativeCall(this, 'isDescendantOfView:', [view]);
    }
    viewWithTag(tag) { return nativeCallObject(this, 'viewWithTag:', [tag]); }
    setNeedsLayout() { nativeCall(this, 'setNeedsLayout', []); }
    layoutIfNeeded() { nativeCall(this, 'layoutIfNeeded', []); }
    setNeedsDisplay() { nativeCall(this, 'setNeedsDisplay', []); }

    // ---- 外观 ----
    // 背景色。nil 表示透明，JS 侧用 null 表示。
    get backgroundColor() {
      requireNative(this, 'backgroundColor');
      return nativeGetObject(this, 'backgroundColor');
    }
    set backgroundColor(value) {
      requireNative(this, 'backgroundColor');
      nativeSetObject(this, 'backgroundColor', value);
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
      if (!('size' in o)) throw new TypeError('fontWithName 需要 { size }');
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

  // 文字。
  defineNativeClass('UILabel', class UILabel extends UIView {
    constructor() {
      super();
      if (allowNativeConstruct) return;
      constructNative(this, 'UILabel', []);
    }
    get text() { requireNative(this, 'text'); return nativeGet(this, 'text'); }
    set text(value) { requireNative(this, 'text'); nativeSet(this, 'text', value); }
    get font() { requireNative(this, 'font'); return nativeGetObject(this, 'font'); }
    set font(value) { requireNative(this, 'font'); nativeSetObject(this, 'font', value); }
    get textColor() {
      requireNative(this, 'textColor');
      return nativeGetObject(this, 'textColor');
    }
    set textColor(value) {
      requireNative(this, 'textColor');
      nativeSetObject(this, 'textColor', value);
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
      return nativeGetObject(this, 'highlightedTextColor');
    }
    set highlightedTextColor(value) {
      requireNative(this, 'highlightedTextColor');
      nativeSetObject(this, 'highlightedTextColor', value);
    }
    get isEnabled() { requireNative(this, 'isEnabled'); return nativeGet(this, 'isEnabled'); }
    set isEnabled(value) {
      requireNative(this, 'isEnabled');
      nativeSet(this, 'isEnabled', value);
    }
    get shadowColor() {
      requireNative(this, 'shadowColor');
      return nativeGetObject(this, 'shadowColor');
    }
    set shadowColor(value) {
      requireNative(this, 'shadowColor');
      nativeSetObject(this, 'shadowColor', value);
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
    get session() { return nativeGetObject(this, 'session'); }
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
    get view() { return nativeGetObject(this, 'view'); }
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
      if (scene != null) constructNative(this, 'UIWindow', [scene]);
    }

    // 换 scene 就是换显示目标。典型 App 一绑到死，需要改的场景是把窗口
    // 移到外接显示器（setScreen: 废弃后的替代品就是它）。
    // 首次赋值还兼做「创建原生对象」的触发点。
    get windowScene() {
      return this[kHandle] === undefined ? null : nativeGetObject(this, 'windowScene');
    }
    set windowScene(value) {
      if (this[kHandle] === undefined) {
        if (value != null) constructNative(this, 'UIWindow', [value]);
        return;
      }
      nativeSetObject(this, 'windowScene', value);
    }

    // 窗口唯一的内容入口，不设就没内容
    get rootViewController() {
      requireNative(this, 'rootViewController');
      return nativeGetObject(this, 'rootViewController');
    }
    set rootViewController(value) {
      requireNative(this, 'rootViewController');
      nativeSetObject(this, 'rootViewController', value);
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
    get scenes() { return native.scenes(); }

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
            ? 'URL 解析失败：' + JSON.stringify(String(url)) +
              '。没有 base 时必须是绝对 URL——这个运行时不通过 HTTP 加载，没有 location'
            : 'URL 解析失败：' + JSON.stringify(String(url)) +
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
      if (p === null) throw new TypeError('URL 解析失败：' + JSON.stringify(String(v)));
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
    for (const 片 of text.split('&')) {
      if (片 === '') continue;
      const i = 片.indexOf('=');
      if (i < 0) out.push([decodeFormComponent(片), '']);
      else out.push([decodeFormComponent(片.slice(0, i)), decodeFormComponent(片.slice(i + 1))]);
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
              throw new TypeError('URLSearchParams 的数组形式要求每项是 [名, 值]');
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
        const 有值 = value !== undefined;
        const v = 有值 ? String(value) : null;
        this[kPairs] = this[kPairs].filter(
          (pair) => !(pair[0] === n && (!有值 || pair[1] === v)));
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
        const 有值 = value !== undefined;
        const v = 有值 ? String(value) : null;
        return this[kPairs].some(
          (pair) => pair[0] === n && (!有值 || pair[1] === v));
      }
      // set 的语义：替换第一个同名的，删掉其余同名的，位置保持
      set(name, value) {
        const n = String(name);
        const v = String(value);
        let 放好了 = false;
        const out = [];
        for (const pair of this[kPairs]) {
          if (pair[0] !== n) { out.push(pair); continue; }
          if (放好了) continue;
          out.push([n, v]);
          放好了 = true;
        }
        if (!放好了) out.push([n, v]);
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
      throw new TypeError('不是合法的首部名：' + JSON.stringify(n));
    }
    return n.toLowerCase();
  }
  function normalizeHeaderValue(value) {
    // 首尾的空白要去掉；中间的 NUL / CR / LF 会撕裂报文，必须拒绝
    const v = String(value).replace(/^[\t\n\r ]+|[\t\n\r ]+$/g, '');
    if (/[\0\r\n]/.test(v)) {
      throw new TypeError('首部值里不能有 NUL、CR 或 LF');
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
          throw new TypeError('Headers 的数组形式要求每项是 [名, 值]');
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
      const 预处理 = list.map((item) => {
        if (item instanceof Blob) {
          throw new TypeError('第一版的 Blob 还不能由别的 Blob 拼成');
        }
        return item;
      });
      const handle = native.createBlob(预处理, type, '');
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
          throw new TypeError('AbortSignal 不能直接构造，用 new AbortController()');
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
          const err = new Error('等待超时');
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
      const err = new Error('操作已中止');
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

  function 读body(target, kind) {
    if (target[kBodyUsed]) {
      // Web 规范：body 只能读一次。读过第二次要抛，不能静默给空的
      return Promise.reject(new TypeError('body 已经读过了，不能再读一次'));
    }
    target[kBodyUsed] = true;
    const id = target[kRequestId];
    if (!id) return Promise.reject(new TypeError('这个对象没有 body'));
    return native.fetchReadBody(id, kind);
  }

  class Body {
    get bodyUsed() { return this[kBodyUsed]; }
    arrayBuffer() { return 读body(this, 'arrayBuffer'); }
    text() { return 读body(this, 'text'); }
    async json() { return JSON.parse(await 读body(this, 'text')); }
    blob() { return 读body(this, 'blob'); }
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
      const 来自请求 = input instanceof Request;
      this[kRequestId] = 0;
      this[kBodyUsed] = false;
      this.url = 来自请求 ? input.url : new URL(String(input)).href;
      this.method = ('method' in o ? String(o.method) : 来自请求 ? input.method : 'GET')
                      .toUpperCase();
      this.headers = new Headers(
        'headers' in o ? o.headers : 来自请求 ? input.headers : undefined);
      const body = 'body' in o ? o.body : 来自请求 ? input[kBodyText] : undefined;
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
      throw new TypeError(who + ' 的第一个参数要是函数');
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
      throw new TypeError('queueMicrotask 的参数要是函数');
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
