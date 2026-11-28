// 触摸和手势：View 的 touchstart / touchmove / touchend / touchcancel（事件类 MotionEvent）和 longclick；
// 可点、可长按、可用、按下、触感反馈、点击音、不让父视图抢几个状态；performClick、performLongClick、
// performHapticFeedback；GestureDetector、ScaleGestureDetector、VelocityTracker、ViewConfiguration
// （activity.viewConfiguration）。原生那一侧是 TouchDomain.kt。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 照「接类的总则」（2026-11-26，见 docs/project.md 第 4 节）：
// - 视图上的成员都是状态（以 JS 为准，自由时也能写），isPressed 是系统也会改的状态（挂着读原生），
//   三个 perform 是动作（自由时抛 InvalidStateError），触摸是事件（自由时也能加监听器）。
// - 长度是 dp，速度是 dp/秒，角度是度，时刻和 performance.now() 同一个钟。原生那边换算好再交过来。
//
// 2026-11-28 用户定的：
// - 识别器不喂事件：写 detector.view，视图挂上时用那个页面建原生识别器（阈值按那个页面的密度），
//   触摸由原生喂；视图拿下来、页面销毁时放掉，密度变了重建。
// - 视图上有 touch* 监听器，或者挂着有监听器的识别器，原生在按下时替它要下整段手势（事件延后一轮才
//   派发给 JS，等不到 JS 回答）。
// - 不让父视图抢是子视图上的状态 disallowsParentIntercept：原生在按下时就向父视图声明。
// - isClickable 读回写进去的值，原生实际的是「写的值 或 听着 click 或（TextView 的）isTextSelectable」，
//   和先后无关。isLongClickable 和 longclick 同理。
(function (ctx) {
  'use strict';

  const {
    Activity,
    Event,
    EventTarget,
    constructNative,
    define,
    defineEventClass,
    defineNativeClass,
    defineViewState,
    describeValue,
    enumArgument,
    eventClasses,
    kHandle,
    kListeners,
    kOwner,
    kSubscribe,
    kView,
    native,
    nativeCall,
    nativeClassCallValue,
    nativeClassNames,
    nativeGet,
    nativeSet,
    nearestNative,
    requireAttached,
    subscribeNative,
    toInteger,
  } = ctx;
  const { View, TextView } = globalThis;

  // ---- 参数转换 ----

  function requireArgs(args, count, what) {
    if (args.length < count) {
      throw new TypeError("Failed to execute '" + what + "': " + count + ' argument' +
                          (count > 1 ? 's' : '') + ' required, but only ' + args.length + ' present.');
    }
  }
  function toDouble(v, what) {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new TypeError(what + ': expected a finite number, got ' + describeValue(v));
    return n;
  }
  // options 对象：null、undefined 当成空对象；别的不是对象抛 TypeError（Web IDL 的字典）
  function optionsOf(v, what) {
    if (v == null) return {};
    if (typeof v !== 'object' && typeof v !== 'function') {
      throw new TypeError(what + ': parameter is not of type \'object\', got ' + describeValue(v));
    }
    return v;
  }
  // 序列（Web IDL 的 sequence）：要是可迭代的对象，字符串不算
  function toSequence(v, what) {
    if (v === null || typeof v !== 'object' || typeof v[Symbol.iterator] !== 'function') {
      throw new TypeError(what + ': expected an array, got ' + describeValue(v));
    }
    return Array.from(v);
  }

  // ---- 时钟 ----
  //
  // 原生那边的时刻是 SystemClock.uptimeMillis（CLOCK_MONOTONIC 的毫秒），performance.now() 也是这个钟
  // （libc++ 的 steady_clock），只是零点不同。启动时量一次差告诉原生：原生发事件时减掉它，JS 交给
  // VelocityTracker 的事件原生再加回去
  const before = native.now();
  const nativeNow = nativeClassCallValue('@touch', 'now', []);
  nativeClassCallValue('@touch', 'clockOffset', [nativeNow - (before + native.now()) / 2]);

  // ---- 事件类 ----

  const touchTypes = new Set(['touchstart', 'touchmove', 'touchend', 'touchcancel']);

  // 一次触摸：全部手指（pointers）、按下或抬起的是第几根（actionIndex，touchmove / touchcancel 是 null）、
  // 两帧之间攒下的采样（history）。每根手指 { id, x, y, screenX, screenY, pressure, size, touchMajor,
  // touchMinor, toolMajor, toolMinor, orientation, toolType }：x / y 相对视图、screenX / screenY 相对屏幕，
  // 长度是 dp，orientation 是度
  const MotionEvent = defineEventClass('MotionEvent', Event, {
    pointers: ['frozenArray', () => Object.freeze([])],
    actionIndex: ['integer?', null],
    downTime: ['number', 0],
    eventTime: ['number', 0],
    history: ['frozenArray', () => Object.freeze([])],
  });

  // GestureDetector 认出来的手势：带着那一刻的 MotionEvent
  const GestureDetectorEvent = defineEventClass('GestureDetectorEvent', Event, {
    motionEvent: ['MotionEvent?', null],
  });
  // pan：再带按下那一刻的事件，和这一次比上一次挪了多少（dp，方向和手指一致）
  defineEventClass('GestureDetectorPanEvent', GestureDetectorEvent, {
    downEvent: ['MotionEvent?', null],
    deltaX: ['number', 0],
    deltaY: ['number', 0],
  });
  // fling：再带按下那一刻的事件，和松手时的速度（dp/秒）
  defineEventClass('GestureDetectorFlingEvent', GestureDetectorEvent, {
    downEvent: ['MotionEvent?', null],
    velocityX: ['number', 0],
    velocityY: ['number', 0],
  });
  // 缩放：那一刻识别器上的数（识别器会往前走，所以记在事件里）。焦点相对视图，长度是 dp
  defineEventClass('ScaleGestureEvent', Event, {
    focusX: ['number', 0],
    focusY: ['number', 0],
    scaleFactor: ['number', 1],
    currentSpan: ['number', 0],
    currentSpanX: ['number', 0],
    currentSpanY: ['number', 0],
    previousSpan: ['number', 0],
    previousSpanX: ['number', 0],
    previousSpanY: ['number', 0],
    timeDelta: ['number', 0],
    eventTime: ['number', 0],
  });

  // ---- 把 MotionEvent 交给原生（VelocityTracker.addMovement）：照 Web IDL 转换，核完再过桥 ----

  // 一根手指的坐标那几项。没给的取 Java 的 PointerCoords 刚建出来的值，pressure 取 1
  function coordsOf(p, where) {
    const o = p == null ? {} : p;
    const opt = (key, fallback) => (o[key] === undefined ? fallback : toDouble(o[key], where + '.' + key));
    return {
      x: toDouble(o.x, where + '.x'),
      y: toDouble(o.y, where + '.y'),
      pressure: opt('pressure', 1),
      size: opt('size', 0),
      touchMajor: opt('touchMajor', 0),
      touchMinor: opt('touchMinor', 0),
      toolMajor: opt('toolMajor', 0),
      toolMinor: opt('toolMinor', 0),
      orientation: opt('orientation', 0),
    };
  }
  function packMotionEvent(e, where) {
    if (!(e instanceof MotionEvent)) {
      throw new TypeError(where + ': expected a MotionEvent, got ' + describeValue(e));
    }
    if (!touchTypes.has(e.type)) {
      throw new TypeError(where + ': the event type must be touchstart, touchmove, touchend or touchcancel, got ' +
                          JSON.stringify(e.type));
    }
    const count = e.pointers.length;
    if (count === 0) throw new TypeError(where + ': the MotionEvent has no pointers');
    // 按下、抬起要知道是哪一根；一根手指时就是它
    let actionIndex = 0;
    if (e.type === 'touchstart' || e.type === 'touchend') {
      if (e.actionIndex === null) {
        if (count > 1) {
          throw new TypeError(where + ': a ' + e.type + ' with ' + count + ' pointers needs an actionIndex');
        }
      } else {
        actionIndex = e.actionIndex;
        if (actionIndex < 0 || actionIndex >= count) {
          throw new RangeError(where + ': actionIndex ' + actionIndex + ' is out of range for ' + count + ' pointer(s)');
        }
      }
    }
    const ids = new Set();
    const pointers = e.pointers.map((p, i) => {
      const at = where + ': pointers[' + i + ']';
      const o = p == null ? {} : p;
      // 没给 id 用它在数组里的位置
      const id = o.id === undefined ? i : toInteger(o.id, at + '.id');
      if (id < 0 || id > 31) throw new RangeError(at + '.id must be between 0 and 31, got ' + id);
      if (ids.has(id)) throw new RangeError(at + '.id ' + id + ' is used by another pointer');
      ids.add(id);
      const toolType = o.toolType === undefined ? 'finger' : enumArgument('toolType', o.toolType, at + '.toolType');
      return { id, toolType, ...coordsOf(o, at) };
    });
    const history = e.history.map((h, k) => {
      const at = where + ': history[' + k + ']';
      const o = h == null ? {} : h;
      const samples = toSequence(o.pointers, at + '.pointers');
      if (samples.length !== count) {
        throw new RangeError(at + ' has ' + samples.length + ' pointer(s), but the event has ' + count);
      }
      return {
        eventTime: toDouble(o.eventTime, at + '.eventTime'),
        pointers: samples.map((p, i) => coordsOf(p, at + '.pointers[' + i + ']')),
      };
    });
    return { type: e.type, actionIndex, downTime: e.downTime, eventTime: e.eventTime, pointers, history };
  }

  // ---- View 上的状态 ----

  // 原生实际的「可点」：写的值，或者听着 click / longclick，或者 TextView 可选中（Java 的
  // setTextIsSelectable 会顺手改这两个）。读出来的永远是写的值
  const clickables = { isClickable: 'click', isLongClickable: 'longclick' };
  function clickableOut(view, name, listening) {
    return Boolean(view[name]) || listening || (view instanceof TextView && view.isTextSelectable === true);
  }
  // 监听器或者可选中变了：有替身就按现在的样子重设原生（拿下来的替身上也装着监听器，一样要设）
  function refreshClickable(view, name, listening) {
    const standIn = view[kView].standIn;
    if (standIn === null) return;
    nativeSet(standIn, name, clickableOut(view, name, listening));
  }
  const listens = (view, type) => view[kListeners].has(type);

  // 挂上时的先后：排在文字组的 isTextSelectable（580）后面
  const plainState = (name, initial, order) => defineViewState(View, name, {
    order,
    initial,
    convert: (v) => Boolean(v),
    apply: (standIn, value) => nativeSet(standIn, name, value),
  });
  plainState('isEnabled', true, 800);
  for (const [name, type] of Object.entries(clickables)) {
    defineViewState(View, name, {
      order: 810,
      initial: false,
      convert: (v) => Boolean(v),
      apply: (standIn, value, page, view) => nativeSet(standIn, name, clickableOut(view, name, listens(view, type))),
    });
  }
  plainState('isHapticFeedbackEnabled', true, 820);
  plainState('isSoundEffectsEnabled', true, 820);
  // 按下时向父视图（和再往上的）声明这一次手势不许抢走
  plainState('disallowsParentIntercept', false, 830);
  // 按下：系统也会改（手指按下、松开），挂着时读原生，拿下来时读回 JS
  defineViewState(View, 'isPressed', {
    order: 840,
    initial: false,
    convert: (v) => Boolean(v),
    apply: (standIn, value) => nativeSet(standIn, 'isPressed', value),
    read: (standIn) => nativeGet(standIn, 'isPressed'),
  });

  // 文字组的 isTextSelectable 写了之后，可点、可长按按现在的样子重设（Java 会顺手改掉它们）
  const selectable = Object.getOwnPropertyDescriptor(TextView.prototype, 'isTextSelectable');
  Object.defineProperty(TextView.prototype, 'isTextSelectable', {
    get: selectable.get,
    set(v) {
      selectable.set.call(this, v);
      if (this[kView].activity === null) return;
      for (const [name, type] of Object.entries(clickables)) refreshClickable(this, name, listens(this, type));
    },
    enumerable: false,
    configurable: true,
  });

  // ---- View 上的事件 ----

  // 接在原来的订阅后面：触摸和 longclick 告诉原生，别的交给原来那一个。click、longclick 的监听器
  // 从无到有、从有到无时，原生实际的可点跟着变（Java 装监听器会顺手设成可点）
  const baseSubscribe = View.prototype[kSubscribe];
  define(View.prototype, kSubscribe, function (type, on) {
    if (touchTypes.has(type) || type === 'longclick') {
      subscribeNative(this, type, on);
    } else {
      baseSubscribe.call(this, type, on);
    }
    if (type === 'click') refreshClickable(this, 'isClickable', on);
    else if (type === 'longclick') refreshClickable(this, 'isLongClickable', on);
  });

  // ---- View 上的动作：参数先查，再查挂没挂 ----

  // 当成被点了一下：有 click 监听时是 true（click 事件延后一轮到）
  define(View.prototype, 'performClick', function performClick() {
    return nativeCall(requireAttached(this, 'performClick'), 'performClick', []);
  });
  // 当成被长按了一下：有 longclick 监听时是 true
  define(View.prototype, 'performLongClick', function performLongClick() {
    return nativeCall(requireAttached(this, 'performLongClick'), 'performLongClick', []);
  });
  // 震一下。feedbackConstant 是字符串（'longPress'、'confirm'……）。真的震了是 true；关了
  // isHapticFeedbackEnabled（又没带 ignoreViewSetting）时是 false
  define(View.prototype, 'performHapticFeedback', function performHapticFeedback(feedbackConstant, options) {
    requireArgs(arguments, 1, 'performHapticFeedback');
    const constant = enumArgument('hapticFeedback', feedbackConstant, 'performHapticFeedback');
    const o = optionsOf(options, 'performHapticFeedback');
    const flags = [Boolean(o.ignoreViewSetting), Boolean(o.ignoreGlobalSetting)];
    return nativeCall(requireAttached(this, 'performHapticFeedback'), 'performHapticFeedback', [constant, ...flags]);
  });

  // ---- 识别器 ----
  //
  // 和视图一样分两个对象：JS 拿着的识别器不绑原生；它挂的视图挂上时，按那个页面建一个替身绑原生的
  // 识别器，交给原生的视图去喂。视图上的识别器记在一个不公开的状态里（视图持有它们）：挂上时建、
  // 密度变了重建（units: 'dp'）、离开页面时放掉（release）

  const kDetector = Symbol('detector');
  const kDetectors = Symbol('detectors');
  const noDetectors = Object.freeze([]);

  function detectorOf(obj, what) {
    const rec = obj == null ? undefined : obj[kDetector];
    if (rec === undefined) throw new TypeError(what + ': Illegal invocation');
    return rec;
  }

  // 按视图的页面建原生识别器（已经是这个页面、这个密度的就留着），把写过的状态和监听器装上
  function buildDetector(detector, activity, page) {
    const rec = detector[kDetector];
    const old = rec.standIn;
    if (old !== null && old.activity === activity && old.density === page.density) return;
    rec.standIn = null;
    const standIn = Object.create(null);
    standIn[kOwner] = detector;
    standIn.activity = activity;
    standIn.density = page.density;
    const handle = native.construct(rec.nativeClass, [null], [activity[kHandle]], standIn);
    if (!handle) throw new TypeError('cannot construct ' + rec.nativeClass);
    Object.defineProperty(standIn, kHandle, { value: handle });
    rec.standIn = standIn;
    for (const [name, value] of rec.values) nativeSet(standIn, name, value);
    for (const type of detector[kListeners].keys()) {
      if (rec.types.has(type)) native.subscribe(handle, type, true);
    }
  }

  // 状态名是 Symbol，10-view.js 的警告拼不出它的名字，自己接住
  function applyDetectors(viewStandIn, list, page) {
    try {
      for (const detector of list) buildDetector(detector, viewStandIn.activity, page);
      nativeCall(viewStandIn, '@touchDetectors', list.map((d) => d[kDetector].standIn));
    } catch (err) {
      console.warn('[Nacre] could not attach the gesture detectors of a view (' + String(err) + '), skipped');
    }
  }
  function releaseDetectors(view, list) {
    const viewStandIn = view[kView].standIn;
    try {
      if (viewStandIn !== null) nativeCall(viewStandIn, '@touchDetectors', []);
    } catch (err) {
      console.warn('[Nacre] could not detach the gesture detectors of a view (' + String(err) + '), skipped');
    }
    for (const detector of list) detector[kDetector].standIn = null;
  }

  defineViewState(View, kDetectors, {
    order: 850,
    initial: noDetectors,
    units: 'dp',
    convert: (list) => list,
    apply: applyDetectors,
    release: releaseDetectors,
  });
  const detectorsState = Object.getOwnPropertyDescriptor(View.prototype, kDetectors);

  function newDetectorRecord(newTarget, types) {
    return {
      nativeClass: nativeClassNames.get(nearestNative(newTarget)),
      types,                // 原生真的会发的事件
      view: null,           // 挂在哪个视图上
      values: new Map(),    // 写过的状态
      standIn: null,        // 替身：视图挂着时有
    };
  }

  // detector.view：一个识别器一个视图，一个视图可以挂几个；挂到别的视图是移过去
  function setDetectorView(detector, view, what) {
    const rec = detectorOf(detector, what);
    const next = view == null ? null : view;
    if (next !== null && (!(next instanceof View) || next[kView] === undefined)) {
      throw new TypeError("Failed to set the 'view' property on '" + what + "': the value is not of type 'View'.");
    }
    if (next === rec.view) return;
    const old = rec.view;
    rec.view = next;
    // 先从原来的视图上拿下来（原生那边先不再喂它），再放掉它的原生识别器
    if (old !== null) detectorsState.set.call(old, Object.freeze(detectorsState.get.call(old).filter((d) => d !== detector)));
    rec.standIn = null;
    if (next !== null) detectorsState.set.call(next, Object.freeze([...detectorsState.get.call(next), detector]));
  }

  // 识别器上的布尔状态：以 JS 为准，有原生识别器时也设过去
  function detectorState(Cls, name, initial) {
    Object.defineProperty(Cls.prototype, name, {
      get() {
        const rec = detectorOf(this, name);
        return rec.values.has(name) ? rec.values.get(name) : initial;
      },
      set(v) {
        const rec = detectorOf(this, name);
        const value = Boolean(v);
        rec.values.set(name, value);
        if (rec.standIn !== null) nativeSet(rec.standIn, name, value);
      },
      enumerable: false,
      configurable: true,
    });
  }

  function subscribeDetector(detector, type, on) {
    const rec = detector[kDetector];
    if (rec !== undefined && rec.types.has(type) && rec.standIn !== null) native.subscribe(rec.standIn[kHandle], type, on);
  }

  // ---- GestureDetector ----

  const gestureTypes = new Set(['down', 'showpress', 'singletapup', 'pan', 'fling', 'longpress',
                                'singletapconfirmed', 'doubletap', 'doubletapevent']);

  // 原生记下的一份数据 → MotionEvent
  const motionEventOf = (raw) => (raw == null ? null : new MotionEvent(raw.type, raw));

  // 手势里要嵌 MotionEvent，原生发的是内部事件 @gesture（detail 里是记下的数据和事件类名），
  // 这里建成对外的事件再派发。在构造时挂上
  function relayGesture(e) {
    const d = e.detail;
    const Cls = eventClasses.get(d.eventClass) || GestureDetectorEvent;
    const init = { motionEvent: motionEventOf(d.motionEvent) };
    if (d.downEvent !== undefined) init.downEvent = motionEventOf(d.downEvent);
    for (const key of ['deltaX', 'deltaY', 'velocityX', 'velocityY']) {
      if (d[key] !== undefined) init[key] = d[key];
    }
    this.dispatchEvent(new Cls(d.type, init));
  }

  class GestureDetector extends EventTarget {
    // 不收参数（多给的不管）
    constructor() {
      super();
      Object.defineProperty(this, kDetector, { value: newDetectorRecord(new.target, gestureTypes) });
      EventTarget.prototype.addEventListener.call(this, '@gesture', relayGesture);
    }

    get view() { return detectorOf(this, 'view').view; }
    set view(v) { setDetectorView(this, v, 'GestureDetector'); }

    [kSubscribe](type, on) { subscribeDetector(this, type, on); }
  }
  defineNativeClass('GestureDetector', GestureDetector);
  // 按住不动认不认长按
  detectorState(GestureDetector, 'isLongpressEnabled', true);

  // ---- ScaleGestureDetector ----

  const scaleTypes = new Set(['scalebegin', 'scale', 'scaleend']);

  class ScaleGestureDetector extends EventTarget {
    constructor() {
      super();
      Object.defineProperty(this, kDetector, { value: newDetectorRecord(new.target, scaleTypes) });
    }

    get view() { return detectorOf(this, 'view').view; }
    set view(v) { setDetectorView(this, v, 'ScaleGestureDetector'); }

    // 正在缩放。只有视图挂着（有原生识别器）时才有，不然是 null
    get isInProgress() {
      const rec = detectorOf(this, 'isInProgress');
      return rec.standIn === null ? null : nativeGet(rec.standIn, 'isInProgress');
    }

    [kSubscribe](type, on) { subscribeDetector(this, type, on); }
  }
  defineNativeClass('ScaleGestureDetector', ScaleGestureDetector);
  // 点两下、第二下按住上下拖来缩放
  detectorState(ScaleGestureDetector, 'isQuickScaleEnabled', true);
  // 手写笔按着侧键拖来缩放
  detectorState(ScaleGestureDetector, 'isStylusScaleEnabled', true);

  // ---- VelocityTracker ----

  // 直接 new。不用 recycle：包装被回收时原生跟着放手
  class VelocityTracker {
    constructor() {
      constructNative(this, new.target, 'VelocityTracker', []);
    }

    // 记一个触摸事件（触摸的监听器里收到的，或者 JS 自己 new 的）。touchstart 会清掉之前的
    addMovement(event) {
      requireArgs(arguments, 1, 'addMovement');
      nativeCall(this, 'addMovement', [packMotionEvent(event, 'addMovement')]);
    }

    // 某根手指现在的速度，dp/秒。pointerId 省略是当前那根；maxVelocity 是上限（同一个单位）。
    // 这根手指没有数据（还没记过、clear() 之后）是 null
    getVelocity(options) {
      const o = optionsOf(options, 'getVelocity');
      let pointerId = null;
      if (o.pointerId !== undefined) {
        pointerId = toInteger(o.pointerId, 'getVelocity: pointerId');
        if (pointerId < 0 || pointerId > 31) {
          throw new RangeError('getVelocity: pointerId must be between 0 and 31, got ' + pointerId);
        }
      }
      let maxVelocity = null;
      if (o.maxVelocity !== undefined) {
        maxVelocity = toDouble(o.maxVelocity, 'getVelocity: maxVelocity');
        if (maxVelocity < 0) throw new RangeError('getVelocity: maxVelocity must not be negative, got ' + maxVelocity);
      }
      const v = nativeCall(this, 'getVelocity', [pointerId, maxVelocity]);
      return v === null ? null : Object.freeze({ x: v.x, y: v.y });
    }

    clear() {
      nativeCall(this, 'clear', []);
    }
  }
  defineNativeClass('VelocityTracker', VelocityTracker);

  // ---- ViewConfiguration：一个页面上判断手势用的阈值，每次读一份快照 ----

  const kToken = Symbol('viewConfiguration');
  const configurationFields = ['touchSlop', 'doubleTapSlop', 'pagingTouchSlop', 'windowTouchSlop', 'hoverSlop',
                               'minimumScalingSpan', 'minimumFlingVelocity', 'maximumFlingVelocity',
                               'ambiguousGestureMultiplier'];
  const timeoutFields = { tapTimeout: 'getTapTimeout', doubleTapTimeout: 'getDoubleTapTimeout',
                          longPressTimeout: 'getLongPressTimeout', jumpTapTimeout: 'getJumpTapTimeout',
                          pressedStateDuration: 'getPressedStateDuration' };

  class ViewConfiguration {
    #values;
    constructor(token, values) {
      if (token !== kToken) throw new TypeError('Illegal constructor: use activity.viewConfiguration');
      this.#values = values;
    }
    // 每个字段一个只读的 getter（距离是 dp，速度是 dp/秒）；几个时限是类上的只读属性（毫秒），
    // 每次读都问系统（长按的时限用户能在无障碍设置里改）
    static {
      for (const name of configurationFields) {
        Object.defineProperty(this.prototype, name, {
          get() { return this.#values[name]; },
          enumerable: true,
          configurable: true,
        });
      }
      for (const [name, method] of Object.entries(timeoutFields)) {
        Object.defineProperty(this, name, {
          get() { return nativeClassCallValue('ViewConfiguration', method, []); },
          enumerable: false,
          configurable: true,
        });
      }
    }
  }

  Object.defineProperty(Activity.prototype, 'viewConfiguration', {
    get() {
      const raw = nativeGet(this, 'viewConfiguration');
      const values = Object.create(null);
      for (const name of configurationFields) values[name] = raw[name];
      return Object.freeze(new ViewConfiguration(kToken, values));
    },
    enumerable: true,
    configurable: true,
  });

  define(globalThis, 'ViewConfiguration', ViewConfiguration);

})
