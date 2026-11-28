// 动画：插值器（BaseInterpolator 一族）、Animator / ValueAnimator / ObjectAnimator、view.animate()；
// 全局的 requestAnimationFrame / cancelAnimationFrame；系统的动画时长缩放（application.animatorDurationScale
// 和 animatordurationscalechange 事件）。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 照「接类的总则」（2026-11-26，docs/project.md 第 4 节）：
//
// - 插值器是原生类，和页面无关，new 的时候就建原生对象。可选参数是 options（new AccelerateInterpolator({ factor })），
//   建出来不能改，没有可读的成员（和 Java 一样）。
// - ValueAnimator / ObjectAnimator 也和页面无关，new 的时候就建原生对象。用 options 建；设置（values、duration、
//   startDelay、interpolator、repeatCount、repeatMode……）是状态，读回写进去的值；animatedValue、animatedFraction、
//   currentPlayTime、isRunning、isStarted、isPaused 读原生。它们会反复用，所以结束是事件（照 AnimatorListener：
//   start、end、cancel、repeat、pause、resume、update，被取消时先 cancel 再 end）。
// - ObjectAnimator 只认运行时登记过的属性（要知道单位才能换算 dp），目标是视图；start() 时目标要挂着（动作）。
// - view.animate(to, options) 返回 Promise<boolean>：跑完兑现 true，被打断兑现 false。没有 ViewPropertyAnimator 这个类。
// - 动画改的视图属性是系统也会改的状态（登记时带 read，见 30-appearance.js、36-scroll.js）：挂着时读原生。
//   一次动画结束时把 JS 里的值对上：跑完的是终点，被打断的是原生当时的值。视图离开页面时它身上的动画都取消。
// - 长度是 dp，时长是毫秒，角度是度；无限次数是 Infinity。
//
// 原生那一侧是 android/runtime 的 AnimationDomain.kt。
(function (ctx) {
  'use strict';

  const {
    EventTarget,
    Event,
    IGNORE,
    attachedNative,
    constructNative,
    define,
    defineNativeClass,
    defineViewState,
    describeValue,
    enumArgument,
    enumProperty,
    kHandle,
    kSubscribe,
    kView,
    native,
    nativeCall,
    nativeCallAsync,
    nativeClassCallValue,
    nativeClassNames,
    nativeClassObject,
    nativeGet,
    nativeSet,
    nearestNative,
    notAttached,
    pageOf,
    parseColor,
    colorText,
    px,
    pxFloat,
    subscribeNative,
    toText,
  } = ctx;
  const { View } = globalThis;

  // ---- 参数转换（照 Web IDL）----

  function requireArgs(args, count, what) {
    if (args.length < count) {
      throw new TypeError("Failed to execute '" + what + "': " + count + ' argument' +
                          (count > 1 ? 's' : '') + ' required, but only ' + args.length + ' present.');
    }
  }
  function toNumber(v, what) {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new TypeError(what + ': expected a finite number, got ' + describeValue(v));
    return n;
  }
  function nonNegative(v, what) {
    const n = toNumber(v, what);
    if (n < 0) throw new RangeError(what + ': expected a number not less than 0, got ' + n);
    return n;
  }
  function unit(v, what) {
    const n = toNumber(v, what);
    if (n < 0 || n > 1) throw new RangeError(what + ': expected a number between 0 and 1, got ' + n);
    return n;
  }
  const isObject = (v) => v !== null && (typeof v === 'object' || typeof v === 'function');
  // options：undefined、null 是空的；别的不是对象抛 TypeError
  function dictionary(v, where) {
    if (v == null) return {};
    if (!isObject(v)) throw new TypeError(where + ": parameter 1 is not of type 'object'.");
    return v;
  }
  function required(dict, key, where) {
    const v = dict[key];
    if (v === undefined) throw new TypeError(where + ': required member ' + key + ' is undefined.');
    return v;
  }
  function toSequence(v, what) {
    if (v === null || typeof v !== 'object' || typeof v[Symbol.iterator] !== 'function') {
      throw new TypeError(what + ': expected an array, got ' + describeValue(v));
    }
    return Array.from(v);
  }
  // 原型链上离 v 的类最近的原生类是 Cls 的子类，并且真的建了原生对象
  function requireNativeInstance(v, Cls, what) {
    if (!(v instanceof Cls) || v[kHandle] === undefined) {
      throw new TypeError(what + ': expected a ' + nativeClassNames.get(Cls) + ', got ' + describeValue(v));
    }
    return v;
  }
  const isView = (v) => v instanceof View && v[kView] !== undefined;

  // ---- 插值器 ----

  class BaseInterpolator {
    constructor() {
      if (nearestNative(new.target) === BaseInterpolator) {
        throw new TypeError('Illegal constructor: BaseInterpolator is abstract and cannot be constructed; ' +
                            'use LinearInterpolator, PathInterpolator or another interpolator');
      }
    }

    // 时间的进度（0–1）→ 值的进度（可以超出 0–1：回弹、预备动作）
    getInterpolation(input) {
      requireArgs(arguments, 1, 'getInterpolation');
      return nativeCall(this, 'getInterpolation', [toNumber(input, 'getInterpolation')]);
    }
  }
  defineNativeClass('BaseInterpolator', BaseInterpolator);

  // 可选参数是 options：keys 是 [名字, 默认值]，按这个顺序交给原生的构造
  function defineInterpolator(name, keys) {
    const cls = {
      [name]: class extends BaseInterpolator {
        constructor(options) {
          super();
          const where = "Failed to construct '" + name + "'";
          const o = dictionary(options, where);
          const values = keys.map(([key, initial]) => (o[key] === undefined ? initial : toNumber(o[key], where)));
          constructNative(this, new.target, name, values);
        }
      },
    }[name];
    defineNativeClass(name, cls);
    return cls;
  }
  defineInterpolator('LinearInterpolator', []);
  // factor：越大越陡，默认 1（t²）
  defineInterpolator('AccelerateInterpolator', [['factor', 1]]);
  defineInterpolator('DecelerateInterpolator', [['factor', 1]]);
  defineInterpolator('AccelerateDecelerateInterpolator', []);
  // tension：往回走（越过终点）多少，默认 2
  defineInterpolator('AnticipateInterpolator', [['tension', 2]]);
  defineInterpolator('OvershootInterpolator', [['tension', 2]]);
  // extraTension：默认 1.5
  defineInterpolator('AnticipateOvershootInterpolator', [['tension', 2], ['extraTension', 1.5]]);
  defineInterpolator('BounceInterpolator', []);

  // 来回几次，必填（只有一个参数，不用 options）
  class CycleInterpolator extends BaseInterpolator {
    constructor(cycles) {
      super();
      const where = "Failed to construct 'CycleInterpolator'";
      if (arguments.length < 1) throw new TypeError(where + ': 1 argument required, but only 0 present.');
      constructNative(this, new.target, 'CycleInterpolator', [toNumber(cycles, where)]);
    }
  }
  defineNativeClass('CycleInterpolator', CycleInterpolator);

  // 三次贝塞尔曲线，和 CSS 的 cubic-bezier 一样：x 要在 0–1 里（不然曲线可能往回绕，Java 那边抛），y 不限
  class PathInterpolator extends BaseInterpolator {
    constructor(options) {
      super();
      const where = "Failed to construct 'PathInterpolator'";
      if (arguments.length < 1) throw new TypeError(where + ': 1 argument required, but only 0 present.');
      if (!isObject(options)) throw new TypeError(where + ": parameter 1 is not of type 'object'.");
      const x1 = unit(required(options, 'x1', where), where + ': x1');
      const y1 = toNumber(required(options, 'y1', where), where + ': y1');
      const x2 = unit(required(options, 'x2', where), where + ': x2');
      const y2 = toNumber(required(options, 'y2', where), where + ': y2');
      constructNative(this, new.target, 'PathInterpolator', [x1, y1, x2, y2]);
    }
  }
  defineNativeClass('PathInterpolator', PathInterpolator);

  const interpolatorOrNull = (v, what) => (v == null ? null : requireNativeInstance(v, BaseInterpolator, what));

  // ---- ObjectAnimator 认的属性：名字 → 单位、怎么查值 ----
  //
  // 名字就是视图上那个状态的名字，也是 Java 的属性名（原生用反射找 setXxx）。dp 的在 start() 时按
  // 目标所在页面的密度换成像素；scrollX / scrollY 在 Java 里收整数
  const animatable = new Map([
    ['alpha', { units: null, convert: unit, int: false }],
    ['translationX', { units: 'dp', convert: toNumber, int: false }],
    ['translationY', { units: 'dp', convert: toNumber, int: false }],
    ['translationZ', { units: 'dp', convert: toNumber, int: false }],
    ['scaleX', { units: null, convert: toNumber, int: false }],
    ['scaleY', { units: null, convert: toNumber, int: false }],
    ['rotation', { units: null, convert: toNumber, int: false }],
    ['rotationX', { units: null, convert: toNumber, int: false }],
    ['rotationY', { units: null, convert: toNumber, int: false }],
    ['elevation', { units: 'dp', convert: toNumber, int: false }],
    ['scrollX', { units: 'dp', convert: toNumber, int: true }],
    ['scrollY', { units: 'dp', convert: toNumber, int: true }],
  ]);
  const animatableNames = [...animatable.keys()];
  function propertyMessage(what, name) {
    return what + ' has no value ' + JSON.stringify(name) + '; expected one of: ' + animatableNames.join(' / ');
  }

  // 视图上那个状态的 setter（不走子类可能覆写的那个）
  function writeViewState(view, name, value) {
    Object.getOwnPropertyDescriptor(View.prototype, name).set.call(view, value);
  }
  function readViewState(view, name) {
    return Object.getOwnPropertyDescriptor(View.prototype, name).get.call(view);
  }

  // ---- 视图离开页面时，它身上的动画都取消 ----
  //
  // 用一个不公开的视图状态（名字是 Symbol）接 10-view.js 的 release：视图拿下来、页面销毁时调。
  // 有过动画的视图才写它（写过的状态才会 release）
  const kAnimated = Symbol('animated');
  const viewAnimations = new WeakMap();  // 视图 -> Set(取消它的函数)
  defineViewState(View, kAnimated, {
    order: 10000,
    initial: false,
    convert: (v) => v,
    apply: () => {},
    release: (view) => {
      const set = viewAnimations.get(view);
      if (set === undefined) return;
      for (const cancel of [...set]) cancel();
    },
  });
  const animatedState = Object.getOwnPropertyDescriptor(View.prototype, kAnimated);
  function track(view, cancel) {
    if (animatedState.get.call(view) !== true) animatedState.set.call(view, true);
    let set = viewAnimations.get(view);
    if (set === undefined) viewAnimations.set(view, (set = new Set()));
    set.add(cancel);
    return () => set.delete(cancel);
  }

  // ---- Animator / ValueAnimator / ObjectAnimator ----

  // 正在跑的 animator：Java 那边的动画调度拿着它，JS 这边也拿着它的包装，到 end 为止。
  // 不拿的话，JS 不留变量的 animator 跑着跑着包装被回收，监听器跟着没了
  const running = new Set();
  const releaseRunning = (e) => { running.delete(e.target); };
  function hold(animator) {
    running.add(animator);
    animator.addEventListener('end', releaseRunning);
  }

  // 只有 update 要告诉原生（每帧一次，有人订才装）；别的原生总是发
  const kState = Symbol('animator');

  class Animator extends EventTarget {
    constructor() {
      super();
      if (nearestNative(new.target) === Animator) {
        throw new TypeError('Illegal constructor: Animator is abstract and cannot be constructed; ' +
                            'use ValueAnimator or ObjectAnimator');
      }
    }

    start() { this[kPrepare]('start'); hold(this); nativeCall(this, 'start', []); }
    // 停在当前的值，先发 cancel 再发 end
    cancel() { nativeCall(this, 'cancel', []); }
    // 跳到终点，发 end
    end() { this[kPrepare]('end'); hold(this); nativeCall(this, 'end', []); }
    pause() { nativeCall(this, 'pause', []); }
    resume() { nativeCall(this, 'resume', []); }

    [kSubscribe](type, on) {
      if (type === 'update') subscribeNative(this, type, on);
    }
  }
  defineNativeClass('Animator', Animator);
  // 子类在开始播之前要做的（ObjectAnimator：查目标挂没挂、把目标和值交给原生）
  const kPrepare = Symbol('prepare');
  Animator.prototype[kPrepare] = function () {};

  // 设置类的状态：存在 JS 里、读回写进去的值，写的时候当场设到原生
  //   convert (v, what, animator, inConstructor) => 要存的值；属性位写错名字返回 IGNORE
  //   apply   (animator, value) => 设到原生
  function defineAnimatorState(Cls, name, spec) {
    Object.defineProperty(Cls.prototype, name, {
      get() {
        const st = this == null ? undefined : this[kState];
        if (st === undefined) throw new TypeError(name + ': Illegal invocation');
        return st.has(name) ? st.get(name) : spec.initial;
      },
      set(v) {
        const st = this == null ? undefined : this[kState];
        if (st === undefined) throw new TypeError(name + ': Illegal invocation');
        const value = spec.convert(v, name, this, false);
        if (value === IGNORE) return;
        spec.apply(this, value);
        st.set(name, value);
      },
      enumerable: false,
      configurable: true,
    });
    return spec;
  }

  // values：一串数，或者一串 CSS 的颜色字符串（颜色动画）；至少一个。读出来是冻结的
  function convertValues(v, what, animator, inConstructor) {
    const list = toSequence(v, what);
    if (list.length < 1) throw new RangeError(what + ': at least 1 value is required, got 0');
    const strings = list.filter((item) => typeof item === 'string').length;
    if (strings > 0 && strings < list.length) {
      throw new TypeError(what + ': values must be all numbers or all colors');
    }
    if (strings === 0) return Object.freeze(list.map((item) => toNumber(item, what)));
    for (const text of list) {
      if (parseColor(text) !== null) continue;
      const message = what + ': ' + JSON.stringify(text) + ' is not a valid color';
      if (inConstructor) throw new TypeError(message);
      console.warn('[Nacre] ' + message + ', ignored');
      return IGNORE;
    }
    return Object.freeze(list.slice());
  }
  const isColors = (values) => typeof values[0] === 'string';

  const animatorStates = {
    values: {
      initial: null,
      convert: convertValues,
      apply: (a, value) => {
        if (a[kIsObjectAnimator]) return;  // ObjectAnimator 的值在 start() 时按页面的密度交
        if (isColors(value)) nativeCall(a, '@values', ['argb', value.map((c) => parseColor(c))]);
        else nativeCall(a, '@values', ['float', value]);
      },
    },
    duration: {
      initial: 300,
      convert: nonNegative,
      apply: (a, value) => nativeSet(a, 'duration', Math.round(value)),
    },
    startDelay: {
      initial: 0,
      convert: nonNegative,
      apply: (a, value) => nativeSet(a, 'startDelay', Math.round(value)),
    },
    // null 是 Android 默认的曲线（先加速后减速）
    interpolator: {
      initial: null,
      convert: (v, what) => interpolatorOrNull(v, what),
      apply: (a, value) => nativeCall(a, 'setInterpolator', [value]),
    },
    // 次数（向零取整），或者 Infinity
    repeatCount: {
      initial: 0,
      convert: (v, what) => {
        const n = Number(v);
        if (Number.isNaN(n) || n === -Infinity) throw new TypeError(what + ': expected a number, got ' + describeValue(v));
        const count = n === Infinity ? n : Math.trunc(n);
        if (count < 0) throw new RangeError(what + ': expected a number not less than 0, got ' + n);
        return count;
      },
      apply: (a, value) => nativeSet(a, 'repeatCount', value === Infinity ? -1 : value),
    },
    repeatMode: {
      initial: 'restart',
      convert: (v, what, a, inConstructor) =>
        (inConstructor ? enumArgument('repeatMode', v, what) : enumProperty('repeatMode', v, what)),
      apply: (a, value) => nativeSet(a, 'repeatMode', value),
    },
  };

  const kIsObjectAnimator = Symbol('objectAnimator');

  class ValueAnimator extends Animator {
    // options：{ values（必填）, duration, startDelay, interpolator, repeatCount, repeatMode }
    constructor(options) {
      super();
      const name = nativeClassNames.get(nearestNative(new.target));
      const where = "Failed to construct '" + name + "'";
      if (arguments.length < 1) throw new TypeError(where + ': 1 argument required, but only 0 present.');
      if (!isObject(options)) throw new TypeError(where + ": parameter 1 is not of type 'object'.");
      // 先全部查完，再建原生对象、设上
      const pending = [];
      for (const [key, spec] of Object.entries(animatorStates)) {
        const v = key === 'values' ? required(options, 'values', where) : options[key];
        if (v === undefined) continue;
        pending.push([key, spec.convert(v, where + ': ' + key, this, true)]);
      }
      Object.defineProperty(this, kState, { value: new Map() });
      constructNative(this, new.target, name, []);
      for (const [key, value] of pending) {
        animatorStates[key].apply(this, value);
        this[kState].set(key, value);
      }
    }

    // 倒着播回起点
    reverse() { this[kPrepare]('reverse'); hold(this); nativeCall(this, 'reverse', []); }

    // 当前的值：数；颜色动画是 CSS 的颜色字符串；还没算过是 null
    get animatedValue() {
      const v = nativeGet(this, 'animatedValue');
      if (v !== null && typeof v === 'object') return colorText(v.argb);
      return v;
    }
    // 插值之后的进度
    get animatedFraction() { return nativeGet(this, 'animatedFraction'); }
    // 播到第几毫秒（不含延迟）。写它跳到那一刻
    get currentPlayTime() { return nativeGet(this, 'currentPlayTime'); }
    set currentPlayTime(v) {
      const ms = nonNegative(v, 'currentPlayTime');
      this[kPrepare]('currentPlayTime');
      nativeSet(this, 'currentPlayTime', Math.round(ms));
    }
    get isRunning() { return nativeGet(this, 'isRunning'); }
    get isStarted() { return nativeGet(this, 'isStarted'); }
    get isPaused() { return nativeGet(this, 'isPaused'); }
  }
  for (const [key, spec] of Object.entries(animatorStates)) defineAnimatorState(ValueAnimator, key, spec);
  defineNativeClass('ValueAnimator', ValueAnimator);

  // 改一个视图的一个属性。目标弱引用（Java 那边也是），开始播时要挂着
  class ObjectAnimator extends ValueAnimator {
    // options：ValueAnimator 的那些，加上 target（视图）、propertyName（登记过的属性名）、autoCancel；
    // values 只收数，单位是那个属性的（长度 dp）
    constructor(options) {
      super(options);
      const where = "Failed to construct 'ObjectAnimator'";
      const target = required(options, 'target', where);
      if (!isView(target)) throw new TypeError(where + ': target: expected a View, got ' + describeValue(target));
      const propertyName = toText(required(options, 'propertyName', where));
      if (!animatable.has(propertyName)) throw new TypeError(propertyMessage(where + ': propertyName', propertyName));
      checkValues(this[kState].get('values'), propertyName, where + ': values');
      this[kState].set('target', target);
      this[kState].set('propertyName', propertyName);
      if (options.autoCancel !== undefined) this.autoCancel = options.autoCancel;
      // 跑完、被取消，都把目标上那个属性的 JS 值对上
      this.addEventListener('end', syncTarget);
    }
  }
  Object.defineProperty(ObjectAnimator.prototype, kIsObjectAnimator, { value: true });
  // 值要合这个属性的范围（alpha 是 0–1），不收颜色
  function checkValues(values, propertyName, what) {
    if (isColors(values)) throw new TypeError(what + ': ' + propertyName + ' takes numbers, not colors');
    const { convert } = animatable.get(propertyName);
    for (const v of values) convert(v, what);
  }
  defineAnimatorState(ObjectAnimator, 'target', {
    initial: null,
    convert: (v, what) => {
      if (!isView(v)) throw new TypeError(what + ': expected a View, got ' + describeValue(v));
      return v;
    },
    apply: () => {},  // 开始播时交给原生
  });
  defineAnimatorState(ObjectAnimator, 'propertyName', {
    initial: null,
    convert: (v, what) => {
      const name = toText(v);
      if (animatable.has(name)) return name;
      console.warn('[Nacre] ' + propertyMessage(what, name) + ', ignored');
      return IGNORE;
    },
    apply: () => {},
  });
  // 同一个目标、同一个属性上有别的 ObjectAnimator 在跑时，开始时把它取消
  defineAnimatorState(ObjectAnimator, 'autoCancel', {
    initial: false,
    convert: (v) => Boolean(v),
    apply: (a, value) => nativeSet(a, 'autoCancel', value),
  });
  // values 只收数（换了 ValueAnimator 的那一个）
  {
    const base = Object.getOwnPropertyDescriptor(ValueAnimator.prototype, 'values');
    Object.defineProperty(ObjectAnimator.prototype, 'values', {
      get: base.get,
      set(v) {
        const values = convertValues(v, 'values', this, false);
        if (values === IGNORE) return;
        checkValues(values, this[kState].get('propertyName'), 'values');
        this[kState].set('values', values);
      },
      enumerable: false,
      configurable: true,
    });
  }
  defineNativeClass('ObjectAnimator', ObjectAnimator);

  // 开始播之前：目标要挂着（动作，自由时抛 InvalidStateError）；按它所在页面的密度把值交给原生
  const configured = new WeakMap();  // animator -> { view, density, units, untrack }
  ObjectAnimator.prototype[kPrepare] = function (what) {
    const st = this[kState];
    const view = st.get('target');
    const standIn = attachedNative(view);
    if (standIn === null) throw notAttached(what);
    const name = st.get('propertyName');
    const spec = animatable.get(name);
    checkValues(st.get('values'), name, what);
    const page = pageOf(view.activity);
    const values = st.get('values').map((v) => (spec.units !== 'dp' ? v : spec.int ? px(page, v) : pxFloat(page, v)));
    nativeCall(this, '@configure', [standIn, name, spec.int ? 'int' : 'float', values]);
    const old = configured.get(this);
    if (old !== undefined) old.untrack();
    // 目标离开页面时取消这一次播放；播完（end）时摘掉
    const untrack = track(view, () => { nativeCall(this, 'cancel', []); });
    configured.set(this, { view, page, spec, name, untrack });
  };
  // 读出来的 animatedValue 换回属性的单位
  {
    const base = Object.getOwnPropertyDescriptor(ValueAnimator.prototype, 'animatedValue');
    Object.defineProperty(ObjectAnimator.prototype, 'animatedValue', {
      get() {
        const v = base.get.call(this);
        const c = configured.get(this);
        return c === undefined || typeof v !== 'number' || c.spec.units !== 'dp' ? v : v / c.page.density;
      },
      enumerable: false,
      configurable: true,
    });
  }

  // 一次播放结束（跑完、被取消、目标离开页面都会来）：目标上那个属性的 JS 值对上。原生的值是 values 里
  // 某一个（照 float、像素算对得上）就记那个精确的值，不然记原生的值换算回来的
  function syncTarget(e) {
    const animator = e.target;
    const c = configured.get(animator);
    if (c === undefined) return;
    c.untrack();
    const view = c.view;
    if (attachedNative(view) === null) return;  // 离开页面时已经读回过了
    const current = readViewState(view, c.name);
    const page = pageOf(view.activity);
    const toNative = (v) => (c.spec.units !== 'dp' ? v : c.spec.int ? px(page, v) : pxFloat(page, v));
    const nativeOf = (v) => (c.spec.int ? toNative(v) : Math.fround(toNative(v)));
    const exact = animator[kState].get('values').find((v) => nativeOf(v) === nativeOf(current));
    writeViewState(view, c.name, exact !== undefined ? exact : current);
  }

  // ---- view.animate(to, options) ----
  //
  // to：要动到的值（alpha、translationX/Y/Z、scaleX/Y、rotation/X/Y；长度 dp）。options：duration（默认 300）、
  // delay（默认 0）、interpolator（null 是默认的先加速后减速）、signal。同一个属性上后开始的接走先开始的：
  // 一个动画的属性全被接走就算被打断（兑现 false），只被接走一部分的接着跑剩下的
  const viewAnimatable = ['alpha', 'translationX', 'translationY', 'translationZ', 'scaleX', 'scaleY',
                          'rotation', 'rotationX', 'rotationY'];
  const owners = new WeakMap();  // 视图 -> Map(属性名 -> 动画的编号)
  let nextAnimation = 1;

  function animateView(view, to, options) {
    const where = "Failed to execute 'animate' on 'View'";
    if (!isObject(to)) throw new TypeError(where + ": parameter 1 is not of type 'object'.");
    const props = [];
    for (const name of viewAnimatable) {
      const v = to[name];
      if (v === undefined) continue;
      props.push([name, animatable.get(name).convert(v, where + ': ' + name)]);
    }
    const o = dictionary(options, where);
    const duration = o.duration === undefined ? 300 : nonNegative(o.duration, where + ': duration');
    const delay = o.delay === undefined ? 0 : nonNegative(o.delay, where + ': delay');
    const interpolator = interpolatorOrNull(o.interpolator, where + ': interpolator');
    const signal = o.signal === undefined ? undefined : o.signal;
    if (signal !== undefined && !(signal instanceof globalThis.AbortSignal)) {
      throw new TypeError(where + ': signal: expected an AbortSignal, got ' + describeValue(signal));
    }
    const standIn = attachedNative(view);
    if (standIn === null) throw notAttached('animate');
    if (signal !== undefined && signal.aborted) return Promise.resolve(false);
    if (props.length === 0) return Promise.resolve(true);

    const id = nextAnimation++;
    const page = pageOf(view.activity);
    let mine = owners.get(view);
    if (mine === undefined) owners.set(view, (mine = new Map()));
    for (const [name] of props) mine.set(name, id);
    const cancel = () => { nativeClassCallValue('@animation', 'cancelViewAnimation', [id]); };
    const untrack = track(view, cancel);
    if (signal !== undefined) signal.addEventListener('abort', cancel, { once: true });
    const values = props.map(([name, v]) => (animatable.get(name).units === 'dp' ? pxFloat(page, v) : v));
    const cleanup = () => {
      untrack();
      if (signal !== undefined) signal.removeEventListener('abort', cancel);
    };
    return nativeCallAsync(standIn, '@animate', [id, props.map(([name]) => name), values,
                                                 Math.round(duration), Math.round(delay), interpolator])
      .then((finished) => {
        cleanup();
        // 还归这一次的属性：跑完的对上终点，被打断的对上原生当时的值（挂着时读到的就是它）
        const attached = attachedNative(view) !== null;
        for (const [name, target] of props) {
          if (mine.get(name) !== id) continue;
          mine.delete(name);
          if (finished) writeViewState(view, name, target);
          else if (attached) writeViewState(view, name, readViewState(view, name));
        }
        return finished;
      }, (err) => {
        cleanup();
        for (const [name] of props) if (mine.get(name) === id) mine.delete(name);
        throw err;
      });
  }
  define(View.prototype, 'animate', function animate(to, options) {
    try {
      if (arguments.length < 1) requireArgs(arguments, 1, 'animate');
      return animateView(this, to, options);
    } catch (err) {
      return Promise.reject(err);
    }
  });

  // ---- requestAnimationFrame ----

  // 帧时钟：不挂在全局的内部类，包装由这里拿着
  class NacreFrameClock extends EventTarget {
    constructor() {
      throw new TypeError('Illegal constructor');
    }
    // 订阅由这个文件自己管，不经过 addEventListener 告诉原生
    [kSubscribe]() {}
  }
  defineNativeClass('NacreFrameClock', NacreFrameClock);
  delete globalThis.NacreFrameClock;
  const clock = nativeClassObject('@animation', 'frameClock');

  // 原生的时刻（System.nanoTime 的毫秒）和 performance.now() 的差。两个是同一个单调时钟
  // （libc++ 的 steady_clock 和 System.nanoTime 都是 CLOCK_MONOTONIC），差是固定的
  const before = native.now();
  const nativeNow = nativeClassCallValue('@animation', 'now', []);
  const offset = nativeNow - (before + native.now()) / 2;

  let callbacks = new Map();  // 编号 → 回调，按请求的顺序
  let current = null;         // 正在跑的这一帧的那一批（这期间取消的也不再调）
  let nextHandle = 1;

  clock.addEventListener('frame', (e) => {
    const time = e.detail - offset;
    current = callbacks;
    callbacks = new Map();
    for (const [handle, callback] of current) {
      if (!current.has(handle)) continue;
      try {
        callback(time);
      } catch (err) {
        // 一个回调抛了不影响别的回调，照未捕获的异常报（和定时器一样）
        native.reportError(err);
      }
    }
    current = null;
    // 回调里又请求的，排到下一帧
    if (callbacks.size > 0) nativeCall(clock, 'request', []);
  });

  define(globalThis, 'requestAnimationFrame', function requestAnimationFrame(callback) {
    if (arguments.length < 1) {
      throw new TypeError("Failed to execute 'requestAnimationFrame': 1 argument required, but only 0 present.");
    }
    if (typeof callback !== 'function') {
      throw new TypeError("Failed to execute 'requestAnimationFrame': parameter 1 is not of type 'Function'.");
    }
    const handle = nextHandle++;
    if (callbacks.size === 0) nativeCall(clock, 'request', []);
    callbacks.set(handle, callback);
    return handle;
  });

  // 不认识的编号静默忽略，和 Web 一样
  define(globalThis, 'cancelAnimationFrame', function cancelAnimationFrame(handle) {
    const h = Number(handle);
    callbacks.delete(h);
    if (current !== null) current.delete(h);
  });

  // ---- 动画时长缩放：application.animatorDurationScale 和 animatordurationscalechange ----
  //
  // 系统设置（开发者选项的「动画时长缩放」、无障碍的「移除动画」）。0 是动画一开始就结束。只读，每次读原生
  const appProto = ctx.Application.prototype;
  Object.defineProperty(appProto, 'animatorDurationScale', {
    get() { return nativeClassCallValue('@animation', 'durationScale', []); },
    enumerable: false,
    configurable: true,
  });
  clock.addEventListener('durationscalechange', () => {
    ctx.application.dispatchEvent(new Event('animatordurationscalechange'));
  });
  // 接在 application 原来的订阅后面
  const appSubscribe = appProto[kSubscribe];
  Object.defineProperty(appProto, kSubscribe, {
    value(type, on) {
      if (type === 'animatordurationscalechange') subscribeNative(clock, 'durationscalechange', on);
      else appSubscribe.call(this, type, on);
    },
    writable: true,
    enumerable: false,
    configurable: true,
  });
})
