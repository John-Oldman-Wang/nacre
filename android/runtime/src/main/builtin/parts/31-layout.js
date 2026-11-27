// 布局这一组：ViewGroup.LayoutParams 一族、LinearLayout 的成员、FrameLayout、ConstraintLayout，
// View 上读布局结果的成员、layoutchange 事件。原生那一侧是
// android/runtime 的 LayoutDomain.kt。单位都是像素，照 Android 原样。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 往 10-view.js 的类（View、ViewGroup、LinearLayout）上加成员在这里加，不改那个文件。
//
// 过渡期（2026-11-26）：视图树挪到了 JS 里（10-view.js），这里原来那几个直接改原生的树的
// 方法（addView 的五种写法、removeView 一族、indexOfChild、bringChildToFront、updateViewLayout）、
// View.parent、LinearLayout.orientation 和新机制冲突，已经去掉；剩下的还是旧写法，只在挂着的
// 视图上能用，第二步按新规矩重写。
(function (ctx) {
  'use strict';

  const {
    Event,
    constructNative,
    define,
    defineEventClass,
    defineNativeClass,
    describeValue,
    kHandle,
    kSubscribe,
    nativeCall,
    nativeCallObject,
    nativeClassCallValue,
    nativeClassNames,
    nativeGet,
    nativeSet,
    own,
    requireInstance,
    subscribeNative,
    toInteger,
    toTextOrNull,
  } = ctx;
  const { View, ViewGroup, LinearLayout } = globalThis;

  // ---- 参数转换（照 Web IDL）----

  function toNumber(v, where) {
    const n = Number(v);
    if (!Number.isFinite(n)) {
      throw new TypeError(where + ': expected a finite number, got ' + describeValue(v));
    }
    return n;
  }

  // 宽高：不小于 0 的像素，或者名字（matchParent / wrapContent / matchConstraint）。
  // 名字对不对由原生核，JS 这边不放名字表
  function toDimension(v, where) {
    if (typeof v === 'string') {
      const t = v.trim();
      if (t === '' || !Number.isFinite(Number(t))) return v;
      v = Number(t);
    }
    const n = toInteger(v, where);
    if (n < 0) {
      throw new RangeError(where + ': ' + n + ' is negative; give a size in pixels, ' +
                           'or a name such as "matchParent" / "wrapContent"');
    }
    return n;
  }

  // 位掩码（Gravity、showDividers）：字符串数组。单个字符串不当成数组
  function toNameList(v, where) {
    if (v == null || typeof v === 'string' || typeof v[Symbol.iterator] !== 'function') {
      throw new TypeError(where + ': expected an array of names, got ' + describeValue(v));
    }
    return Array.from(v, String);
  }

  // 约束的目标：视图的 id、'parent'，null 是没设
  function toAnchor(v, where) {
    if (v == null) return null;
    if (typeof v === 'string') {
      const t = v.trim();
      if (t === '' || !Number.isFinite(Number(t))) return v;
    }
    return toInteger(v, where);
  }

  // ---- 往原型上加成员的几个助手 ----

  function getter(Cls, name, get, set) {
    Object.defineProperty(Cls.prototype, name, { get, set, enumerable: false, configurable: true });
  }
  const readOnly = (Cls, name) => getter(Cls, name, function () { return nativeGet(this, name); });
  const intProp = (Cls, name) => getter(Cls, name,
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, toInteger(v, name)); });
  const numberProp = (Cls, name) => getter(Cls, name,
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, toNumber(v, name)); });
  const boolProp = (Cls, name) => getter(Cls, name,
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, Boolean(v)); });
  // 可空：null / undefined 是「没设」
  const nullableIntProp = (Cls, name) => getter(Cls, name,
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, v == null ? null : toInteger(v, name)); });
  const nullableNumberProp = (Cls, name) => getter(Cls, name,
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, v == null ? null : toNumber(v, name)); });
  const enumProp = (Cls, name) => getter(Cls, name,
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, String(v)); });
  const method = (Cls, name, fn) => define(Cls.prototype, name, fn);

  function requireArgs(name, given, count) {
    if (given < count) {
      throw new TypeError("Failed to execute '" + name + "': " + count + ' argument' +
                          (count > 1 ? 's' : '') + ' required, but only ' + given + ' present.');
    }
  }

  // ---- 嵌套的类：LinearLayout.LayoutParams 这样挂在外面那个类上，不挂全局 ----
  //
  // defineNativeClass 会顺手把类挂到全局上（名字带点），这里摘掉，再挂成静态成员
  function defineNested(Outer, name, Cls) {
    const fullName = Outer.name + '.' + name;
    defineNativeClass(fullName, Cls);
    delete globalThis[fullName];
    define(Outer, name, Cls);
  }

  // 原型链上离 cls 最近的原生类
  function nearestNative(cls) {
    let c = cls;
    while (typeof c === 'function' && !nativeClassNames.has(c)) c = Object.getPrototypeOf(c);
    return typeof c === 'function' ? c : undefined;
  }

  // LayoutParams 的构造：(宽, 高[, 第三个]) 或者 (要拷贝的 LayoutParams)。构造链上
  // 每一层都调一次，只有离 new.target 最近的那一层真的去建
  function constructParams(wrapper, newTarget, Cls, args, third) {
    if (nearestNative(newTarget) !== Cls) return;
    const name = nativeClassNames.get(Cls);
    const where = 'new ' + name;
    if (args.length === 1 && args[0] instanceof LayoutParams && args[0][kHandle] !== undefined) {
      constructNative(wrapper, newTarget, name, [args[0]]);
      return;
    }
    if (args.length < 2) {
      throw new TypeError("Failed to construct '" + name + "': 2 arguments (width, height) or " +
                          '1 LayoutParams to copy required, but only ' + args.length + ' present.');
    }
    const values = [toDimension(args[0], where), toDimension(args[1], where)];
    if (third !== undefined && args.length > 2 && args[2] !== undefined) values.push(third(args[2], where));
    constructNative(wrapper, newTarget, name, values);
  }

  // ---- ViewGroup.LayoutParams 一族 ----
  //
  // 是原生对象的包装：写到视图上的就是同一个对象。改了字段不会自己重新排版，要调
  // view.requestLayout()，或者再赋一次 view.layoutParams（照 Android）

  class LayoutParams {
    constructor(...args) { constructParams(this, new.target, LayoutParams, args); }
  }
  defineNested(ViewGroup, 'LayoutParams', LayoutParams);
  for (const name of ['width', 'height']) {
    getter(LayoutParams, name,
      function () { return nativeGet(this, name); },
      function (v) { nativeSet(this, name, toDimension(v, name)); });
  }

  class MarginLayoutParams extends LayoutParams {
    constructor(...args) {
      super(...args);
      constructParams(this, new.target, MarginLayoutParams, args);
    }
    setMargins(left, top, right, bottom) {
      requireArgs('setMargins', arguments.length, 4);
      const values = [toInteger(left, 'setMargins'), toInteger(top, 'setMargins'),
                      toInteger(right, 'setMargins'), toInteger(bottom, 'setMargins')];
      nativeCall(this, 'setMargins', values);
    }
  }
  defineNested(ViewGroup, 'MarginLayoutParams', MarginLayoutParams);
  for (const name of ['leftMargin', 'topMargin', 'rightMargin', 'bottomMargin', 'marginStart', 'marginEnd']) {
    intProp(MarginLayoutParams, name);
  }
  readOnly(MarginLayoutParams, 'isMarginRelative');

  // gravity：字符串数组；null 是没指定（跟着布局自己的 gravity）
  function gravityProp(Cls) {
    getter(Cls, 'gravity',
      function () { return nativeGet(this, 'gravity'); },
      function (v) { nativeSet(this, 'gravity', v == null ? null : toNameList(v, 'gravity')); });
  }

  class LinearLayoutParams extends MarginLayoutParams {
    constructor(...args) {
      super(...args);
      constructParams(this, new.target, LinearLayoutParams, args, (w, where) => toNumber(w, where));
    }
  }
  Object.defineProperty(LinearLayoutParams, 'name', { value: 'LayoutParams' });
  defineNested(LinearLayout, 'LayoutParams', LinearLayoutParams);
  numberProp(LinearLayoutParams, 'weight');
  gravityProp(LinearLayoutParams);

  // ---- View：读布局结果、参数、id、量尺寸 ----

  for (const name of ['left', 'top', 'right', 'bottom', 'width', 'height', 'measuredWidth', 'measuredHeight',
                      'isLaidOut', 'isLayoutRequested']) {
    readOnly(View, name);
  }
  intProp(View, 'minimumWidth');
  intProp(View, 'minimumHeight');
  nullableIntProp(View, 'id');

  getter(View, 'layoutParams',
    function () { return nativeCallObject(this, 'getLayoutParams', []); },
    function (params) {
      requireInstance(params, LayoutParams, 'layoutParams');
      nativeCall(this, '@setLayoutParams', [params]);
      own(this, 'layoutParams', params);
    });

  method(View, 'measure', function measure(widthMeasureSpec, heightMeasureSpec) {
    requireArgs('measure', arguments.length, 2);
    nativeCall(this, 'measure', [toInteger(widthMeasureSpec, 'measure'), toInteger(heightMeasureSpec, 'measure')]);
  });
  method(View, 'requestLayout', function requestLayout() { nativeCall(this, 'requestLayout', []); });
  method(View, 'forceLayout', function forceLayout() { nativeCall(this, 'forceLayout', []); });
  method(View, 'getLocationOnScreen', function getLocationOnScreen() {
    return nativeCall(this, 'getLocationOnScreen', []);
  });
  method(View, 'getLocationInWindow', function getLocationInWindow() {
    return nativeCall(this, 'getLocationInWindow', []);
  });

  define(View, 'generateViewId', function generateViewId() {
    return nativeClassCallValue('View', 'generateViewId', []);
  });

  // 量尺寸的规格：一个整数里装着尺寸和模式。只有这三个静态方法，不是类
  const kMaxSpecSize = (1 << 30) - 1;
  define(View, 'MeasureSpec', Object.freeze({
    makeMeasureSpec(size, mode) {
      requireArgs('makeMeasureSpec', arguments.length, 2);
      const n = toInteger(size, 'makeMeasureSpec');
      if (n < 0 || n > kMaxSpecSize) {
        throw new RangeError('makeMeasureSpec: size ' + n + ' is out of range [0, ' + kMaxSpecSize + ']');
      }
      return nativeClassCallValue('View.MeasureSpec', 'makeMeasureSpec', [n, String(mode)]);
    },
    getMode(measureSpec) {
      return nativeClassCallValue('View.MeasureSpec', 'getMode', [toInteger(measureSpec, 'getMode')]);
    },
    getSize(measureSpec) {
      return nativeClassCallValue('View.MeasureSpec', 'getSize', [toInteger(measureSpec, 'getSize')]);
    },
  }));

  // ---- 布局变化的事件 ----

  defineEventClass('LayoutChangeEvent', Event, {
    left: ['integer', 0], top: ['integer', 0], right: ['integer', 0], bottom: ['integer', 0],
    oldLeft: ['integer', 0], oldTop: ['integer', 0], oldRight: ['integer', 0], oldBottom: ['integer', 0],
  });

  // 接在原来的订阅后面：layoutchange 告诉原生，别的交给原来那一个
  const subscribeBefore = View.prototype[kSubscribe];
  View.prototype[kSubscribe] = function (type, on) {
    if (type === 'layoutchange') subscribeNative(this, type, on);
    else subscribeBefore.call(this, type, on);
  };

  // ---- LinearLayout ----

  getter(LinearLayout, 'gravity',
    function () { return nativeGet(this, 'gravity'); },
    function (v) { nativeSet(this, 'gravity', toNameList(v, 'gravity')); });
  method(LinearLayout, 'setHorizontalGravity', function setHorizontalGravity(gravity) {
    requireArgs('setHorizontalGravity', arguments.length, 1);
    nativeCall(this, 'setHorizontalGravity', [toNameList(gravity, 'setHorizontalGravity')]);
  });
  method(LinearLayout, 'setVerticalGravity', function setVerticalGravity(gravity) {
    requireArgs('setVerticalGravity', arguments.length, 1);
    nativeCall(this, 'setVerticalGravity', [toNameList(gravity, 'setVerticalGravity')]);
  });
  numberProp(LinearLayout, 'weightSum');
  boolProp(LinearLayout, 'isBaselineAligned');
  intProp(LinearLayout, 'baselineAlignedChildIndex');
  boolProp(LinearLayout, 'isMeasureWithLargestChildEnabled');
  getter(LinearLayout, 'showDividers',
    function () { return nativeGet(this, 'showDividers'); },
    function (v) { nativeSet(this, 'showDividers', toNameList(v, 'showDividers')); });
  intProp(LinearLayout, 'dividerPadding');

  // ---- FrameLayout ----

  class FrameLayout extends ViewGroup {
    constructor(context) {
      super(context);
      constructNative(this, new.target, 'FrameLayout', [context]);
    }
  }
  defineNativeClass('FrameLayout', FrameLayout);
  boolProp(FrameLayout, 'measureAllChildren');

  class FrameLayoutParams extends MarginLayoutParams {
    constructor(...args) {
      super(...args);
      constructParams(this, new.target, FrameLayoutParams, args, (g, where) => toNameList(g, where));
    }
  }
  Object.defineProperty(FrameLayoutParams, 'name', { value: 'LayoutParams' });
  defineNested(FrameLayout, 'LayoutParams', FrameLayoutParams);
  gravityProp(FrameLayoutParams);

  // ---- ConstraintLayout（AndroidX）----

  class ConstraintLayout extends ViewGroup {
    constructor(context) {
      super(context);
      constructNative(this, new.target, 'ConstraintLayout', [context]);
    }
  }
  defineNativeClass('ConstraintLayout', ConstraintLayout);
  for (const name of ['minWidth', 'minHeight', 'maxWidth', 'maxHeight']) intProp(ConstraintLayout, name);

  // 约束写在参数的字段上（不接 ConstraintSet）：指向别的视图用它的 id，指向父视图写 'parent'
  class ConstraintLayoutParams extends MarginLayoutParams {
    constructor(...args) {
      super(...args);
      constructParams(this, new.target, ConstraintLayoutParams, args);
    }
  }
  Object.defineProperty(ConstraintLayoutParams, 'name', { value: 'LayoutParams' });
  defineNested(ConstraintLayout, 'LayoutParams', ConstraintLayoutParams);
  for (const name of ['leftToLeft', 'leftToRight', 'rightToLeft', 'rightToRight', 'topToTop', 'topToBottom',
                      'bottomToTop', 'bottomToBottom', 'baselineToBaseline', 'baselineToTop', 'baselineToBottom',
                      'startToEnd', 'startToStart', 'endToStart', 'endToEnd', 'circleConstraint']) {
    getter(ConstraintLayoutParams, name,
      function () { return nativeGet(this, name); },
      function (v) { nativeSet(this, name, toAnchor(v, name)); });
  }
  for (const name of ['circleRadius', 'baselineMargin', 'matchConstraintMinWidth', 'matchConstraintMinHeight',
                      'matchConstraintMaxWidth', 'matchConstraintMaxHeight']) {
    intProp(ConstraintLayoutParams, name);
  }
  for (const name of ['goneLeftMargin', 'goneTopMargin', 'goneRightMargin', 'goneBottomMargin',
                      'goneStartMargin', 'goneEndMargin', 'goneBaselineMargin']) {
    nullableIntProp(ConstraintLayoutParams, name);
  }
  for (const name of ['horizontalBias', 'verticalBias', 'circleAngle', 'matchConstraintPercentWidth',
                      'matchConstraintPercentHeight']) {
    numberProp(ConstraintLayoutParams, name);
  }
  nullableNumberProp(ConstraintLayoutParams, 'horizontalWeight');
  nullableNumberProp(ConstraintLayoutParams, 'verticalWeight');
  boolProp(ConstraintLayoutParams, 'constrainedWidth');
  boolProp(ConstraintLayoutParams, 'constrainedHeight');
  getter(ConstraintLayoutParams, 'dimensionRatio',
    function () { return nativeGet(this, 'dimensionRatio'); },
    function (v) { nativeSet(this, 'dimensionRatio', toTextOrNull(v)); });
  for (const name of ['horizontalChainStyle', 'verticalChainStyle', 'matchConstraintDefaultWidth',
                      'matchConstraintDefaultHeight', 'wrapBehaviorInParent']) {
    enumProp(ConstraintLayoutParams, name);
  }
})
