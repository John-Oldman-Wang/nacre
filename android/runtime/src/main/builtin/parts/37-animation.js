// 动画：插值器（BaseInterpolator 一族）、Animator / ValueAnimator / ObjectAnimator、
// view.animate() 的 ViewPropertyAnimator；全局的 requestAnimationFrame / cancelAnimationFrame；
// 系统的动画时长缩放（ValueAnimator.durationScale 和 application 上的
// animatordurationscalechange 事件）。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 规矩（2026-11-24 定）：
// - 形状照 Java：链式的 view.animate().alpha(0).setDuration(300)；参数按位置传。
// - 通知是事件，不是回调、也不是 Promise：animator 会反复用（view.animate() 每次给同一个），
//   结束是会发生好几次的事。事件名照 AnimatorListener：start、end、cancel、repeat、pause、
//   resume、update；被取消时先 cancel 再 end（Web 的 finish 被取消时不发，含义不同，不借）。
//   事件不带数据，值读 animatedValue。withStartAction / withEndAction / setListener 不接。
// - Java 里返回 this 的 setter（setDuration……）属性和链式方法两种写法都给；返回 void 的只有属性。
// - 插值器是原生类，构造参数照 Java；JS 函数不能当插值器（JS 不实现 Java 的类）。
// - requestAnimationFrame 照 Web：回调拿到这一帧的时刻（毫秒，和 performance.now() 同一个
//   起点）。和 iOS 的 CADisplayLink 的 tick 一样，是普通的事件，延后一轮派发。
//
// 原生那一侧是 android/runtime 的 AnimationDomain.kt。
(function (ctx) {
  'use strict';

  const {
    EventTarget,
    Event,
    colorArgument,
    colorText,
    constructNative,
    define,
    defineNativeClass,
    describeValue,
    kHandle,
    kSubscribe,
    native,
    nativeCall,
    nativeCallObject,
    nativeClassCallValue,
    nativeClassNames,
    nativeClassObject,
    nativeGet,
    nativeSet,
    own,
    requireInstance,
    subscribeNative,
    toInteger,
    toNumber,
    toText,
  } = ctx;
  const { View } = globalThis;

  // ---- 助手 ----

  function requireArgs(args, count, what) {
    if (args.length < count) {
      throw new TypeError("Failed to execute '" + what + "': " + count + ' argument' +
                          (count > 1 ? 's' : '') + ' required, but only ' + args.length + ' present.');
    }
  }
  function addAccessors(proto, accessors) {
    for (const [name, [get, set]] of Object.entries(accessors)) {
      Object.defineProperty(proto, name, { get, set, enumerable: false, configurable: true });
    }
  }
  // 名字可以是 Symbol（kSubscribe），所以用 Reflect.ownKeys，不用 Object.entries
  function addMethods(proto, methods) {
    for (const name of Reflect.ownKeys(methods)) {
      Object.defineProperty(proto, name, {
        value: methods[name], writable: true, enumerable: false, configurable: true,
      });
    }
  }
  // 原型链上离 cls 最近的原生类
  function nearestNative(cls) {
    let c = cls;
    while (typeof c === 'function' && !nativeClassNames.has(c)) c = Object.getPrototypeOf(c);
    return c;
  }
  const integerProp = (name) => [
    function () { return nativeGet(this, name); },
    function (v) { nativeSet(this, name, toInteger(v, name)); },
  ];
  const readOnly = (name) => [function () { return nativeGet(this, name); }, undefined];
  // 一串数（ofFloat 的值……）：至少一个，每个照 Web IDL 转
  function numbers(values, where) {
    if (values.length < 1) throw new TypeError(where + ': at least one value is required');
    return values.map((v) => toNumber(v, where));
  }
  function integers(values, where) {
    if (values.length < 1) throw new TypeError(where + ': at least one value is required');
    return values.map((v) => toInteger(v, where));
  }
  function colors(values, where) {
    if (values.length < 1) throw new TypeError(where + ': at least one value is required');
    return values.map((v) => colorArgument(where, v));
  }
  // 原生对象（ObjectAnimator 的目标可以是任何原生对象）
  function requireNativeObject(v, where) {
    if (v == null || v[kHandle] === undefined) {
      throw new TypeError(where + ': expected a native object, got ' + describeValue(v));
    }
    return v;
  }

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

  // 构造参数都是可选的数（个数不超过 max），照 Java 的几个构造
  function defineInterpolator(name, max, required = 0) {
    const cls = {
      [name]: class extends BaseInterpolator {
        constructor(...args) {
          super();
          const where = "Failed to construct '" + name + "'";
          if (args.length < required) requireArgs(args, required, name);
          const values = args.slice(0, max).map((v) => toNumber(v, where));
          constructNative(this, new.target, name, values);
        }
      },
    }[name];
    defineNativeClass(name, cls);
    return cls;
  }
  defineInterpolator('LinearInterpolator', 0);
  // factor：越大越陡，默认 1（t²）
  defineInterpolator('AccelerateInterpolator', 1);
  defineInterpolator('DecelerateInterpolator', 1);
  defineInterpolator('AccelerateDecelerateInterpolator', 0);
  // tension：往回走（越过终点）多少，默认 2
  defineInterpolator('AnticipateInterpolator', 1);
  defineInterpolator('OvershootInterpolator', 1);
  // tension、extraTension（默认 1.5）
  defineInterpolator('AnticipateOvershootInterpolator', 2);
  defineInterpolator('BounceInterpolator', 0);
  // cycles：来回几次，必填
  defineInterpolator('CycleInterpolator', 1, 1);

  // 贝塞尔曲线：(controlX, controlY) 是二次的，(x1, y1, x2, y2) 是三次的（CSS 的 cubic-bezier）。
  // 曲线往回绕时 Java 抛 IllegalArgumentException
  class PathInterpolator extends BaseInterpolator {
    constructor(...args) {
      super();
      if (args.length !== 2 && args.length !== 4) {
        throw new TypeError("Failed to construct 'PathInterpolator': expected 2 or 4 numbers, got " + args.length);
      }
      const where = "Failed to construct 'PathInterpolator'";
      constructNative(this, new.target, 'PathInterpolator', args.map((v) => toNumber(v, where)));
    }
  }
  defineNativeClass('PathInterpolator', PathInterpolator);

  const interpolatorOrNull = (v, where) => (v == null ? null : requireInstance(v, BaseInterpolator, where));

  // ---- Animator / ValueAnimator / ObjectAnimator ----

  // 正在跑的 animator：Java 那边的动画调度拿着它，JS 这边也拿着它的包装，到 end 为止。
  // 不拿的话，JS 不留变量的 animator 跑着跑着包装被回收，监听器跟着没了
  const running = new Set();
  const release = (e) => { running.delete(e.target); };
  function hold(animator) {
    running.add(animator);
    animator.addEventListener('end', release);
  }

  // 只有 update 要告诉原生（每帧一次，有人订才装）；别的原生总是发
  const animatorSubscribe = {
    [kSubscribe](type, on) {
      if (type === 'update') subscribeNative(this, type, on);
    },
  };

  class Animator extends EventTarget {
    constructor() {
      super();
      if (nearestNative(new.target) === Animator) {
        throw new TypeError('Illegal constructor: Animator is abstract and cannot be constructed; ' +
                            'use ValueAnimator or ObjectAnimator');
      }
    }

    start() { hold(this); nativeCall(this, 'start', []); }
    // 停在当前的值，先发 cancel 再发 end
    cancel() { nativeCall(this, 'cancel', []); }
    // 跳到终点，发 end
    end() { hold(this); nativeCall(this, 'end', []); }
    pause() { nativeCall(this, 'pause', []); }
    resume() { nativeCall(this, 'resume', []); }

    // 返回自己（Java 的 setDuration 返回 this），能接着链
    setDuration(duration) {
      requireArgs(arguments, 1, 'setDuration');
      this.duration = duration;
      return this;
    }
  }
  addAccessors(Animator.prototype, {
    // 毫秒。负数由 Java 抛 IllegalArgumentException
    duration: integerProp('duration'),
    startDelay: integerProp('startDelay'),
    // 写 null 时 Java 换成 LinearInterpolator。animator 持有它
    interpolator: [
      function () { return own(this, 'interpolator', nativeCallObject(this, 'getInterpolator', [])); },
      function (v) {
        const i = interpolatorOrNull(v, 'interpolator');
        nativeCall(this, 'setInterpolator', [i]);
        own(this, 'interpolator', i);
      },
    ],
    // 加上延迟和重复的总时长，毫秒；无限重复是 'infinite'
    totalDuration: readOnly('totalDuration'),
    isRunning: readOnly('isRunning'),
    isStarted: readOnly('isStarted'),
    isPaused: readOnly('isPaused'),
  });
  addMethods(Animator.prototype, animatorSubscribe);
  defineNativeClass('Animator', Animator);

  const kFactory = Symbol('factory');

  class ValueAnimator extends Animator {
    // new ValueAnimator() 是空的，用 setFloatValues / setIntValues 给值；常用的是 ofFloat 这些工厂
    constructor(token, kind, values) {
      super();
      constructNative(this, new.target, 'ValueAnimator', token === kFactory ? [kind, values] : []);
    }

    static ofFloat(...values) {
      return new ValueAnimator(kFactory, 'ofFloat', numbers(values, 'ofFloat'));
    }
    static ofInt(...values) {
      return new ValueAnimator(kFactory, 'ofInt', integers(values, 'ofInt'));
    }
    // 颜色动画：值是 CSS 的颜色字符串，animatedValue 读出来也是
    static ofArgb(...values) {
      return new ValueAnimator(kFactory, 'ofArgb', colors(values, 'ofArgb'));
    }

    // 系统的动画时长缩放（开发者选项、无障碍的「移除动画」）。0 是动画一开始就结束
    static get durationScale() { return nativeClassCallValue('@animation', 'durationScale', []); }
    static areAnimatorsEnabled() { return nativeClassCallValue('@animation', 'areAnimatorsEnabled', []); }

    // 倒着播回起点
    reverse() { hold(this); nativeCall(this, 'reverse', []); }

    // 跳到某个进度（0–1），不用开始播
    setCurrentFraction(fraction) {
      requireArgs(arguments, 1, 'setCurrentFraction');
      nativeCall(this, 'setCurrentFraction', [toNumber(fraction, 'setCurrentFraction')]);
    }
    setFloatValues(...values) {
      nativeCall(this, 'setFloatValues', [numbers(values, 'setFloatValues')]);
    }
    setIntValues(...values) {
      nativeCall(this, 'setIntValues', [integers(values, 'setIntValues')]);
    }
  }
  addAccessors(ValueAnimator.prototype, {
    // 次数，或者 'infinite'
    repeatCount: [
      function () { return nativeGet(this, 'repeatCount'); },
      function (v) { nativeSet(this, 'repeatCount', typeof v === 'string' ? v : toInteger(v, 'repeatCount')); },
    ],
    repeatMode: [
      function () { return nativeGet(this, 'repeatMode'); },
      function (v) { nativeSet(this, 'repeatMode', toText(v)); },
    ],
    // 当前的值：数；颜色动画是 CSS 的颜色字符串
    animatedValue: [
      function () {
        const v = nativeGet(this, 'animatedValue');
        return v !== null && typeof v === 'object' ? colorText(v.argb) : v;
      },
      undefined,
    ],
    animatedFraction: readOnly('animatedFraction'),
    // 播到第几毫秒。写它跳到那里
    currentPlayTime: integerProp('currentPlayTime'),
  });
  defineNativeClass('ValueAnimator', ValueAnimator);

  // 按属性名改任何原生对象的属性（Java 用反射找 setXxx）。Java 对目标是弱引用，所以不记所有权边。
  // 属性名不存在时 Java 只打日志，不抛
  class ObjectAnimator extends ValueAnimator {
    constructor(token, kind, target, propertyName, values) {
      super();
      const args = token === kFactory ? [kind, target, propertyName, values] : [];
      constructNative(this, new.target, 'ObjectAnimator', args);
    }

    static ofFloat(target, propertyName, ...values) {
      requireArgs(arguments, 3, 'ofFloat');
      return new ObjectAnimator(kFactory, 'ofFloat', requireNativeObject(target, 'ofFloat'),
                                toText(propertyName), numbers(values, 'ofFloat'));
    }
    static ofInt(target, propertyName, ...values) {
      requireArgs(arguments, 3, 'ofInt');
      return new ObjectAnimator(kFactory, 'ofInt', requireNativeObject(target, 'ofInt'),
                                toText(propertyName), integers(values, 'ofInt'));
    }
    static ofArgb(target, propertyName, ...values) {
      requireArgs(arguments, 3, 'ofArgb');
      return new ObjectAnimator(kFactory, 'ofArgb', requireNativeObject(target, 'ofArgb'),
                                toText(propertyName), colors(values, 'ofArgb'));
    }

    // 同一个目标、同一个属性上有别的 ObjectAnimator 在跑时，开始时把它取消。Java 只有 setter
    setAutoCancel(cancel) {
      requireArgs(arguments, 1, 'setAutoCancel');
      nativeCall(this, 'setAutoCancel', [Boolean(cancel)]);
    }
  }
  addAccessors(ObjectAnimator.prototype, {
    target: [
      function () { return nativeCallObject(this, 'getTarget', []); },
      function (v) { nativeCall(this, 'setTarget', [requireNativeObject(v, 'target')]); },
    ],
    propertyName: [
      function () { return nativeGet(this, 'propertyName'); },
      function (v) { nativeSet(this, 'propertyName', toText(v)); },
    ],
  });
  defineNativeClass('ObjectAnimator', ObjectAnimator);

  // ---- ViewPropertyAnimator：view.animate() ----

  // 原生真的会发的事件。start、end、cancel 要原生装上那一个监听的位子，update 另装
  const vpaEvents = new Set(['start', 'end', 'cancel', 'update']);

  class ViewPropertyAnimator extends EventTarget {
    constructor() {
      throw new TypeError('Illegal constructor: ViewPropertyAnimator is created by view.animate()');
    }

    // 返回自己的 setter：属性和链式方法都有
    setDuration(duration) {
      requireArgs(arguments, 1, 'setDuration');
      this.duration = duration;
      return this;
    }
    setStartDelay(delay) {
      requireArgs(arguments, 1, 'setStartDelay');
      this.startDelay = delay;
      return this;
    }
    setInterpolator(interpolator) {
      requireArgs(arguments, 1, 'setInterpolator');
      this.interpolator = interpolator;
      return this;
    }
    // 动画期间给视图开一层硬件图层，结束时关掉
    withLayer() {
      nativeCall(this, 'withLayer', []);
      return this;
    }
    // 不调也会在下一帧自己开始
    start() { nativeCall(this, 'start', []); }
    // 停在当前的值，先发 cancel 再发 end
    cancel() { nativeCall(this, 'cancel', []); }

    [kSubscribe](type, on) {
      if (vpaEvents.has(type)) subscribeNative(this, type, on);
    }
  }
  addAccessors(ViewPropertyAnimator.prototype, {
    duration: integerProp('duration'),
    startDelay: integerProp('startDelay'),
    interpolator: [
      function () { return own(this, 'interpolator', nativeCallObject(this, 'getInterpolator', [])); },
      function (v) {
        const i = interpolatorOrNull(v, 'interpolator');
        nativeCall(this, 'setInterpolator', [i]);
        own(this, 'interpolator', i);
      },
    ],
  });
  // 设到某值（alpha）、加一个量（alphaBy）：一个数，返回自己
  const vpaMethodNames = [
    'alpha', 'translationX', 'translationY', 'translationZ', 'x', 'y', 'z',
    'scaleX', 'scaleY', 'rotation', 'rotationX', 'rotationY',
  ];
  const vpaMethods = {};
  for (const base of vpaMethodNames) {
    for (const name of [base, base + 'By']) {
      vpaMethods[name] = {
        [name](value) {
          requireArgs(arguments, 1, name);
          nativeCall(this, name, [toNumber(value, name)]);
          return this;
        },
      }[name];
    }
  }
  addMethods(ViewPropertyAnimator.prototype, vpaMethods);
  defineNativeClass('ViewPropertyAnimator', ViewPropertyAnimator);

  addMethods(View.prototype, {
    // 同一个视图每次给的是同一个。视图持有它
    animate() {
      return own(this, 'animator', nativeCallObject(this, 'animate', []));
    },
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

  // ---- 动画时长缩放变了：application 上的 animatordurationscalechange ----

  clock.addEventListener('durationscalechange', () => {
    ctx.application.dispatchEvent(new Event('animatordurationscalechange'));
  });
  // 接在 application 原来的订阅后面
  const appProto = ctx.Application.prototype;
  const appSubscribe = appProto[kSubscribe];
  addMethods(appProto, {
    [kSubscribe](type, on) {
      if (type === 'animatordurationscalechange') subscribeNative(clock, 'durationscalechange', on);
      else appSubscribe.call(this, type, on);
    },
  });
})
