// 触摸和手势：View 的 touchstart / touchmove / touchend / touchcancel（事件类 MotionEvent）和 longclick；
// 可点、可长按、可用、按下、触感反馈、点击音、不让父视图抢几个状态；performClick、performLongClick、
// performHapticFeedback；GestureDetector、ScaleGestureDetector（挂在视图上，触摸由原生喂）、
// VelocityTracker、ViewConfiguration（activity.viewConfiguration）。
//
// 照「接类的总则」（2026-11-26）：视图建出来是自由的，状态以 JS 为准、写什么读什么；动作自由时抛
// InvalidStateError；监听器自由时也能加，挂上时才装到原生上。长度是 dp，速度是 dp/秒，角度是度，
// 时刻和 performance.now() 同一个钟。
//
// 2026-11-28 用户定的：
// - 识别器不喂事件，写 detector.view：视图挂上时用那个页面建原生识别器，触摸由原生喂；拿下来时放掉。
// - 视图上有 touch* 监听器、或者挂着有监听器的识别器，原生在按下时替它要下整段手势；父视图中途抢走时
//   收到 touchcancel。
// - 不让父视图抢是子视图上的状态 disallowsParentIntercept，按下时就向父视图声明。
// - isClickable 读回写进去的值，原生实际的是「写的值 或 听着 click 或 TextView 可选中」，isLongClickable
//   和 longclick 同理。
//
// 最后一段挂到屏幕上，由验收脚本用 adb 真的去点、滑、长按、点两下、单指快速缩放（点一下再按住往下拖）。
// 两根手指 adb 做不到，双指缩放靠人试。

/**
 * 抛了什么：没抛是「没抛」，抛了是错误的 name
 * @param {() => unknown} fn
 */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : typeof err;
  }
}

/**
 * 抛的错误的文字；没抛是空串
 * @param {() => unknown} fn
 */
function thrownMessage(fn) {
  try {
    fn();
    return '';
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 等 fn() 为真，最多等 ms 毫秒，每 step 毫秒看一次。等到了是 true
 * @param {() => boolean} fn @param {number} ms @param {number} [step]
 */
async function waitFor(fn, ms, step = 100) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (fn()) return true;
    await sleep(step);
  }
  return fn();
}

/** @param {number | null | undefined} a @param {number} b @param {number} tolerance */
const near = (a, b, tolerance) => typeof a === 'number' && Math.abs(a - b) <= tolerance;

/** @param {string} what */
const request = (what) => { console.log('[acceptance] ' + what); };

const touchTypes = /** @type {const} */ (['touchstart', 'touchmove', 'touchend', 'touchcancel']);
const gestureTypes = /** @type {const} */ ([
  'down', 'showpress', 'singletapup', 'pan', 'fling', 'longpress', 'singletapconfirmed', 'doubletap', 'doubletapevent',
]);
const scaleTypes = /** @type {const} */ (['scalebegin', 'scale', 'scaleend']);

/**
 * 在视图上听四种触摸事件，记下来
 * @param {View} view
 */
function recordTouches(view) {
  /** @type {MotionEvent[]} */
  const seen = [];
  /** @param {Event} e */
  const listener = (e) => { seen.push(/** @type {MotionEvent} */ (e)); };
  for (const type of touchTypes) view.addEventListener(type, listener);
  return {
    seen,
    names: () => seen.map((e) => e.type).join(','),
    stop: () => { for (const type of touchTypes) view.removeEventListener(type, listener); },
  };
}

/**
 * 在识别器上听一组事件，记下名字和事件
 * @param {EventTarget} detector @param {readonly string[]} types
 */
function recordEvents(detector, types) {
  /** @type {string[]} */
  const names = [];
  /** @type {Event[]} */
  const events = [];
  /** @param {Event} e */
  const listener = (e) => { names.push(e.type); events.push(e); };
  for (const type of types) detector.addEventListener(type, listener);
  return {
    names,
    events,
    clear: () => { names.length = 0; events.length = 0; },
    stop: () => { for (const type of types) detector.removeEventListener(type, listener); },
  };
}

/** @param {import("../main.js").StepContext} ctx */
export async function stepTouch(ctx) {
  const { assert } = ctx;
  const activity = /** @type {Activity} */ (ctx.activity);
  /** @type {any} 故意写错类型的地方用它 */
  let bad;
  const g = /** @type {any} */ (globalThis);

  // ===== 类都在，旧的写法都没有了 =====
  console.log('  --- 触摸：类 ---');
  for (const name of ['MotionEvent', 'GestureDetector', 'ScaleGestureDetector', 'VelocityTracker', 'ViewConfiguration',
    'GestureDetectorEvent', 'GestureDetectorPanEvent', 'GestureDetectorFlingEvent', 'ScaleGestureEvent']) {
    assert(name + ' 在全局', typeof g[name], 'function');
  }
  assert('SystemClock 没有了（时刻和 performance.now() 同一个钟）', 'SystemClock' in globalThis, false);
  assert('VelocityTracker.obtain 没有了（直接 new）', 'obtain' in VelocityTracker, false);
  assert('ViewConfiguration.get 没有了（改成 activity.viewConfiguration）', 'get' in ViewConfiguration, false);
  for (const name of ['getTapTimeout', 'getDoubleTapTimeout', 'getLongPressTimeout', 'getJumpTapTimeout',
    'getPressedStateDuration']) {
    assert('ViewConfiguration.' + name + ' 没有了（改成属性）', name in ViewConfiguration, false);
  }
  for (const name of ['computeCurrentVelocity', 'getXVelocity', 'getYVelocity', 'recycle']) {
    assert('VelocityTracker 上没有 ' + name + ' 了（合成 getVelocity）', name in VelocityTracker.prototype, false);
  }
  assert('GestureDetector 上没有 onTouchEvent 了（写 view，原生自己喂）',
         'onTouchEvent' in GestureDetector.prototype, false);
  assert('ScaleGestureDetector 上没有 onTouchEvent 了', 'onTouchEvent' in ScaleGestureDetector.prototype, false);
  for (const name of ['focusX', 'focusY', 'currentSpan', 'currentSpanX', 'currentSpanY', 'previousSpan',
    'previousSpanX', 'previousSpanY', 'scaleFactor', 'timeDelta', 'eventTime']) {
    assert('ScaleGestureDetector 上没有 ' + name + ' 了（只看事件）', name in ScaleGestureDetector.prototype, false);
  }
  assert('ViewGroup 上没有 requestDisallowInterceptTouchEvent 了（改成子视图上的 disallowsParentIntercept）',
         'requestDisallowInterceptTouchEvent' in ViewGroup.prototype, false);

  // ===== MotionEvent：事件类 =====
  console.log('  --- 触摸：MotionEvent ---');
  const empty = new MotionEvent('touchstart');
  assert('MotionEvent 是 Event', empty instanceof Event, true);
  assert('new MotionEvent 的 type', empty.type, 'touchstart');
  assert('pointers 默认空数组', Array.isArray(empty.pointers) && empty.pointers.length === 0, true);
  assert('actionIndex 默认 null', empty.actionIndex, null);
  assert('downTime 默认 0', empty.downTime, 0);
  assert('eventTime 默认 0', empty.eventTime, 0);
  assert('history 默认空数组', Array.isArray(empty.history) && empty.history.length === 0, true);
  assert('MotionEvent 不可取消', empty.cancelable, false);
  const given = new MotionEvent('touchmove', {
    pointers: [{ id: 0, x: 10, y: 20 }], actionIndex: /** @type {any} */ ('1'), downTime: 5, eventTime: /** @type {any} */ ('9'),
  });
  assert('init 的 pointers', given.pointers[0].x, 10);
  assert('pointers 是冻结的数组', Object.isFrozen(given.pointers), true);
  assert("actionIndex 写 '1' 照 Web IDL 转成 1", given.actionIndex, 1);
  assert("eventTime 写 '9' 转成 9", given.eventTime, 9);
  assert('actionIndex 写 null 是 null', new MotionEvent('touchmove', { actionIndex: null }).actionIndex, null);
  assert("downTime 写 'abc' 抛 TypeError",
         thrown(() => new MotionEvent('touchstart', { downTime: /** @type {any} */ ('abc') })), 'TypeError');
  assert('pointers 写 5 抛 TypeError',
         thrown(() => new MotionEvent('touchstart', { pointers: /** @type {any} */ (5) })), 'TypeError');
  assert('不给 type 抛 TypeError', thrown(() => new /** @type {any} */ (MotionEvent)()), 'TypeError');
  assert('字段只读：写 actionIndex 抛 TypeError', thrown(() => { /** @type {any} */ (given).actionIndex = 3; }), 'TypeError');

  // ===== 识别器的事件类 =====
  assert('GestureDetectorEvent 能 new，motionEvent 默认 null', new GestureDetectorEvent('down').motionEvent, null);
  assert('GestureDetectorEvent 的 motionEvent 收 MotionEvent',
         new GestureDetectorEvent('down', { motionEvent: given }).motionEvent === given, true);
  assert('GestureDetectorEvent 的 motionEvent 给普通对象抛 TypeError',
         thrown(() => new GestureDetectorEvent('down', { motionEvent: /** @type {any} */ ({}) })), 'TypeError');
  const panEvent = new GestureDetectorPanEvent('pan');
  assert('GestureDetectorPanEvent 是 GestureDetectorEvent', panEvent instanceof GestureDetectorEvent, true);
  assert('GestureDetectorPanEvent 的默认值',
         [panEvent.deltaX, panEvent.deltaY, panEvent.downEvent, panEvent.motionEvent].join(','), '0,0,,');
  assert('GestureDetectorPanEvent 没有 distanceX 了（改成 deltaX）', 'distanceX' in panEvent, false);
  const flingEvent = new GestureDetectorFlingEvent('fling', { velocityX: 12, velocityY: /** @type {any} */ ('-3') });
  assert('GestureDetectorFlingEvent 的速度', [flingEvent.velocityX, flingEvent.velocityY].join(','), '12,-3');
  const scaleEvent = new ScaleGestureEvent('scale');
  assert('ScaleGestureEvent 的 scaleFactor 默认 1', scaleEvent.scaleFactor, 1);
  assert('ScaleGestureEvent 的其余字段默认 0',
         [scaleEvent.focusX, scaleEvent.focusY, scaleEvent.currentSpan, scaleEvent.currentSpanX, scaleEvent.currentSpanY,
          scaleEvent.previousSpan, scaleEvent.previousSpanX, scaleEvent.previousSpanY, scaleEvent.timeDelta,
          scaleEvent.eventTime].join(','), '0,0,0,0,0,0,0,0,0,0');

  // ===== ViewConfiguration =====
  console.log('  --- 触摸：ViewConfiguration ---');
  const vc = activity.viewConfiguration;
  assert('activity.viewConfiguration 是 ViewConfiguration', vc instanceof ViewConfiguration, true);
  assert('每次读是新的一份快照', activity.viewConfiguration !== vc, true);
  assert('快照是冻结的', Object.isFrozen(vc), true);
  assert('ViewConfiguration 不能 new', thrown(() => new /** @type {any} */ (ViewConfiguration)()), 'TypeError');
  assert('没有 scaledTouchSlop 了（去掉 scaled 前缀）', 'scaledTouchSlop' in vc, false);
  /** @type {[string, number][]} */
  const lengths = [
    ['touchSlop', vc.touchSlop], ['doubleTapSlop', vc.doubleTapSlop], ['pagingTouchSlop', vc.pagingTouchSlop],
    ['windowTouchSlop', vc.windowTouchSlop], ['minimumScalingSpan', vc.minimumScalingSpan],
    ['minimumFlingVelocity', vc.minimumFlingVelocity], ['maximumFlingVelocity', vc.maximumFlingVelocity],
  ];
  for (const [name, value] of lengths) {
    assert(name + ' 是正数（' + value + '）', typeof value === 'number' && value > 0, true);
  }
  assert('hoverSlop 不小于 0（' + vc.hoverSlop + '）', typeof vc.hoverSlop === 'number' && vc.hoverSlop >= 0, true);
  assert('ambiguousGestureMultiplier 不小于 1（' + vc.ambiguousGestureMultiplier + '）',
         vc.ambiguousGestureMultiplier >= 1, true);
  // AOSP 的默认：拖动阈值 8 dp，翻页的是它的两倍，双击的距离 100 dp，最小、最大甩出速度 50、8000 dp/秒
  // （系统按密度取整成像素，换回 dp 差一点点）
  assert('touchSlop 约 8 dp（' + vc.touchSlop + '）', near(vc.touchSlop, 8, 0.5), true);
  assert('翻页的阈值是拖动阈值的两倍', near(vc.pagingTouchSlop, vc.touchSlop * 2, 0.5), true);
  assert('双击的距离约 100 dp（' + vc.doubleTapSlop + '）', near(vc.doubleTapSlop, 100, 0.5), true);
  assert('最小甩出速度约 50 dp/秒（' + vc.minimumFlingVelocity + '）', near(vc.minimumFlingVelocity, 50, 0.5), true);
  assert('最大甩出速度约 8000 dp/秒（' + vc.maximumFlingVelocity + '）', near(vc.maximumFlingVelocity, 8000, 1), true);
  assert('快照的字段只读', thrown(() => { /** @type {any} */ (vc).touchSlop = 1; }), 'TypeError');
  /** @type {[string, number][]} */
  const timeouts = [
    ['tapTimeout', ViewConfiguration.tapTimeout], ['doubleTapTimeout', ViewConfiguration.doubleTapTimeout],
    ['longPressTimeout', ViewConfiguration.longPressTimeout], ['jumpTapTimeout', ViewConfiguration.jumpTapTimeout],
    ['pressedStateDuration', ViewConfiguration.pressedStateDuration],
  ];
  for (const [name, value] of timeouts) {
    assert('ViewConfiguration.' + name + ' 是正整数（' + value + ' 毫秒）', Number.isInteger(value) && value > 0, true);
  }
  assert('长按比轻点的时限长', ViewConfiguration.longPressTimeout > ViewConfiguration.tapTimeout, true);
  assert('时限是只读的', thrown(() => { /** @type {any} */ (ViewConfiguration).tapTimeout = 1; }), 'TypeError');

  // ===== View 上的状态：自由时 =====
  console.log('  --- 触摸：View 的状态 ---');
  const v = new TextView();
  const anyV = /** @type {any} */ (v);
  /** @type {[string, boolean][]} */
  const defaults = [['isClickable', false], ['isLongClickable', false], ['isEnabled', true], ['isPressed', false],
    ['isHapticFeedbackEnabled', true], ['isSoundEffectsEnabled', true], ['disallowsParentIntercept', false]];
  for (const [name, value] of defaults) {
    assert('TextView 的 ' + name + ' 默认 ' + value, anyV[name], value);
  }
  for (const Cls of [View, LinearLayout, FrameLayout, ScrollView]) {
    const other = /** @type {any} */ (new Cls());
    assert(Cls.name + ' 的几个默认值和 TextView 一样',
           defaults.every(([name, value]) => other[name] === value), true);
  }
  for (const [name] of defaults) {
    const before = anyV[name];
    anyV[name] = 1;
    assert(name + ' 写 1 照 Web IDL 转成 true', anyV[name], true);
    anyV[name] = '';
    assert(name + " 写 '' 转成 false", anyV[name], false);
    anyV[name] = 'false';
    assert(name + " 写 'false' 转成 true（和 Web 一样）", anyV[name], true);
    anyV[name] = null;
    assert(name + ' 写 null 转成 false', anyV[name], false);
    anyV[name] = before;
  }
  // 听 click、longclick 不改读出来的值（原生实际可点，见后面挂上的那一段）
  const noop = () => {};
  v.addEventListener('click', noop);
  v.addEventListener('longclick', noop);
  assert('听着 click 时 isClickable 还是读出写进去的 false', v.isClickable, false);
  assert('听着 longclick 时 isLongClickable 还是读出写进去的 false', v.isLongClickable, false);
  v.removeEventListener('click', noop);
  v.removeEventListener('longclick', noop);
  v.isTextSelectable = true;
  assert('isTextSelectable 写 true 不改读出来的 isClickable', v.isClickable, false);
  assert('isTextSelectable 写 true 不改读出来的 isLongClickable', v.isLongClickable, false);
  v.isTextSelectable = false;
  for (const type of touchTypes) v.addEventListener(type, noop);
  assert('自由时能加触摸的监听器，不改 isClickable', v.isClickable, false);
  for (const type of touchTypes) v.removeEventListener(type, noop);

  // ===== 动作：自由时抛 InvalidStateError，参数先查 =====
  console.log('  --- 触摸：动作 ---');
  assert('自由时 performClick() 抛 InvalidStateError', thrown(() => v.performClick()), 'InvalidStateError');
  assert('自由时 performLongClick() 抛 InvalidStateError', thrown(() => v.performLongClick()), 'InvalidStateError');
  assert("自由时 performHapticFeedback('confirm') 抛 InvalidStateError",
         thrown(() => v.performHapticFeedback('confirm')), 'InvalidStateError');
  assert('performHapticFeedback 不给参数抛 TypeError（先查参数）',
         thrown(() => /** @type {any} */ (v).performHapticFeedback()), 'TypeError');
  assert('常量写错抛 TypeError（自由时也先查参数）',
         thrown(() => v.performHapticFeedback(/** @type {any} */ ('buzz'))), 'TypeError');
  const hapticMessage = thrownMessage(() => v.performHapticFeedback(/** @type {any} */ ('buzz')));
  assert('常量写错的报错列出全部可选值（' + hapticMessage + '）',
         hapticMessage.includes('longPress / virtualKey / keyboardTap'), true);
  assert('options 给数抛 TypeError',
         thrown(() => v.performHapticFeedback('confirm', /** @type {any} */ (5))), 'TypeError');

  // ===== VelocityTracker（造的事件）=====
  console.log('  --- 触摸：VelocityTracker ---');
  const tracker = new VelocityTracker();
  assert('new VelocityTracker()', tracker instanceof VelocityTracker, true);
  assert('还没有数据时 getVelocity() 是 null', tracker.getVelocity(), null);
  let t0 = Math.floor(performance.now());
  /**
   * 造一个事件：一根手指（id 0），坐标是 dp
   * @param {'touchstart' | 'touchmove' | 'touchend' | 'touchcancel'} type
   * @param {number} time @param {number} x @param {number} y @param {number} down
   */
  const one = (type, time, x, y, down) =>
    new MotionEvent(type, { downTime: down, eventTime: time, actionIndex: type === 'touchmove' ? null : 0,
                            pointers: [{ id: 0, x, y }] });
  tracker.addMovement(one('touchstart', t0, 100, 300, t0));
  for (let i = 1; i <= 5; i++) tracker.addMovement(one('touchmove', t0 + i * 10, 100 + i * 10, 300, t0));
  const velocity = tracker.getVelocity();
  assert('匀速每 10 毫秒 10 dp：x 方向约 1000 dp/秒（' + (velocity && velocity.x) + '）',
         velocity !== null && near(velocity.x, 1000, 50), true);
  assert('y 方向约 0', velocity !== null && near(velocity.y, 0, 1), true);
  assert('getVelocity() 返回冻结的 { x, y }', velocity !== null && Object.isFrozen(velocity), true);
  const byId = tracker.getVelocity({ pointerId: 0 });
  assert('getVelocity({ pointerId: 0 }) 和不给一样', byId !== null && velocity !== null && byId.x === velocity.x, true);
  assert('没有数据的手指 getVelocity({ pointerId: 7 }) 是 null', tracker.getVelocity({ pointerId: 7 }), null);
  const capped = tracker.getVelocity({ maxVelocity: 500 });
  assert('maxVelocity: 500 限到 500', capped && capped.x, 500);
  assert("pointerId: '0' 照 Web IDL 转成 0", tracker.getVelocity({ pointerId: /** @type {any} */ ('0') }) !== null, true);
  assert('getVelocity(null) 和不给一样', tracker.getVelocity(null) !== null, true);
  assert('pointerId 32 抛 RangeError（只有 0–31）', thrown(() => tracker.getVelocity({ pointerId: 32 })), 'RangeError');
  assert('pointerId -1 抛 RangeError', thrown(() => tracker.getVelocity({ pointerId: -1 })), 'RangeError');
  assert("pointerId 'abc' 抛 TypeError",
         thrown(() => tracker.getVelocity({ pointerId: /** @type {any} */ ('abc') })), 'TypeError');
  assert('maxVelocity 是负数抛 RangeError', thrown(() => tracker.getVelocity({ maxVelocity: -1 })), 'RangeError');
  assert("maxVelocity 'abc' 抛 TypeError",
         thrown(() => tracker.getVelocity({ maxVelocity: /** @type {any} */ ('abc') })), 'TypeError');
  assert('options 给数抛 TypeError', thrown(() => tracker.getVelocity(/** @type {any} */ (5))), 'TypeError');
  tracker.clear();
  assert('clear() 之后是 null', tracker.getVelocity(), null);
  assert('addMovement 不给参数抛 TypeError', thrown(() => /** @type {any} */ (tracker).addMovement()), 'TypeError');
  assert('addMovement({}) 抛 TypeError', thrown(() => tracker.addMovement(/** @type {any} */ ({}))), 'TypeError');
  assert('addMovement 没有手指的事件抛 TypeError',
         thrown(() => tracker.addMovement(new MotionEvent('touchmove'))), 'TypeError');
  assert('addMovement 不是触摸的事件名抛 TypeError',
         thrown(() => tracker.addMovement(new MotionEvent('click', { pointers: [{ id: 0, x: 0, y: 0 }] }))), 'TypeError');
  assert('actionIndex 超出手指个数抛 RangeError',
         thrown(() => tracker.addMovement(new MotionEvent('touchstart', {
           pointers: [{ id: 0, x: 0, y: 0 }], actionIndex: 1 }))), 'RangeError');
  assert('两根手指的 touchstart 不说是哪一根（actionIndex 是 null）抛 TypeError',
         thrown(() => tracker.addMovement(new MotionEvent('touchstart', {
           pointers: [{ id: 0, x: 0, y: 0 }, { id: 1, x: 5, y: 5 }] }))), 'TypeError');
  assert('手指的 id 大于 31 抛 RangeError',
         thrown(() => tracker.addMovement(new MotionEvent('touchstart', { pointers: [{ id: 32, x: 0, y: 0 }] }))),
         'RangeError');
  assert('手指的 id 重复抛 RangeError',
         thrown(() => tracker.addMovement(new MotionEvent('touchmove', {
           pointers: [{ id: 1, x: 0, y: 0 }, { id: 1, x: 5, y: 5 }] }))), 'RangeError');
  assert("手指的 x 写 'abc' 抛 TypeError",
         thrown(() => tracker.addMovement(new MotionEvent('touchstart', {
           pointers: [{ id: 0, x: /** @type {any} */ ('abc'), y: 0 }] }))), 'TypeError');
  assert("手指的 x 写 '5' 照 Web IDL 转成数",
         thrown(() => tracker.addMovement(new MotionEvent('touchstart', {
           pointers: [{ id: 0, x: /** @type {any} */ ('5'), y: 0 }] }))), '没抛');
  assert("手指的 toolType 写 'pen' 抛 TypeError",
         thrown(() => tracker.addMovement(new MotionEvent('touchstart', {
           pointers: [{ id: 0, x: 0, y: 0, toolType: 'pen' }] }))), 'TypeError');
  assert('history 里一个采样的手指个数不对抛 RangeError',
         thrown(() => tracker.addMovement(new MotionEvent('touchmove', {
           pointers: [{ id: 0, x: 0, y: 0 }],
           history: [{ eventTime: 1, pointers: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }] }))), 'RangeError');
  tracker.clear();

  // 两帧之间攒下的采样（history）也算进速度：只给最后一个事件、前面的放进 history
  const batched = new VelocityTracker();
  t0 = Math.floor(performance.now());
  batched.addMovement(one('touchstart', t0, 0, 0, t0));
  batched.addMovement(new MotionEvent('touchmove', {
    downTime: t0, eventTime: t0 + 50, pointers: [{ id: 0, x: 0, y: 100 }],
    history: [10, 20, 30, 40].map((dt) => ({ eventTime: t0 + dt, pointers: [{ x: 0, y: dt * 2 }] })),
  }));
  const batchedVelocity = batched.getVelocity();
  assert('history 的采样算进速度：y 方向约 2000 dp/秒（' + (batchedVelocity && batchedVelocity.y) + '）',
         batchedVelocity !== null && near(batchedVelocity.y, 2000, 100), true);

  // ===== 识别器：自由时 =====
  console.log('  --- 触摸：识别器 ---');
  const quiet = new GestureDetector();
  assert('new GestureDetector() 不收参数', quiet instanceof GestureDetector, true);
  assert('多给的参数不管', thrown(() => new /** @type {any} */ (GestureDetector)(activity)), '没抛');
  assert('GestureDetector 是 EventTarget', quiet instanceof EventTarget, true);
  assert('view 默认 null', quiet.view, null);
  assert('isLongpressEnabled 默认 true', quiet.isLongpressEnabled, true);
  bad = quiet;
  bad.isLongpressEnabled = 0;
  assert('isLongpressEnabled 写 0 转成 false', quiet.isLongpressEnabled, false);
  quiet.isLongpressEnabled = true;
  assert('view 写 {} 抛 TypeError', thrown(() => { bad.view = {}; }), 'TypeError');
  assert('view 写 5 抛 TypeError', thrown(() => { bad.view = 5; }), 'TypeError');
  const holderA = new TextView();
  const holderB = new TextView();
  quiet.view = holderA;
  assert('view 写一个视图读回它', quiet.view === holderA, true);
  quiet.view = holderB;
  assert('写别的视图是移过去', quiet.view === holderB, true);
  bad.view = undefined;
  assert('view 写 undefined 是 null', quiet.view, null);
  class MyDetector extends GestureDetector {}
  assert('JS 的类可以继承 GestureDetector', new MyDetector() instanceof GestureDetector, true);

  const scaler = new ScaleGestureDetector();
  assert('ScaleGestureDetector 是 EventTarget', scaler instanceof EventTarget, true);
  assert('ScaleGestureDetector 的 view 默认 null', scaler.view, null);
  assert('没挂上时 isInProgress 是 null', scaler.isInProgress, null);
  assert('isInProgress 只读', thrown(() => { /** @type {any} */ (scaler).isInProgress = true; }), 'TypeError');
  assert('isQuickScaleEnabled 默认 true', scaler.isQuickScaleEnabled, true);
  assert('isStylusScaleEnabled 默认 true', scaler.isStylusScaleEnabled, true);
  bad = scaler;
  bad.isQuickScaleEnabled = 0;
  assert('isQuickScaleEnabled 写 0 转成 false', scaler.isQuickScaleEnabled, false);
  bad.isStylusScaleEnabled = '';
  assert("isStylusScaleEnabled 写 '' 转成 false", scaler.isStylusScaleEnabled, false);
  scaler.isQuickScaleEnabled = true;
  scaler.isStylusScaleEnabled = true;
  scaler.view = holderA;
  assert('挂在自由的视图上 isInProgress 还是 null', scaler.isInProgress, null);
  scaler.view = null;

  // ===== 挂到屏幕上：真的触摸 =====
  console.log('  --- 触摸：挂到屏幕上 ---');
  const density = activity.configuration.density;
  const screen = new LinearLayout();
  screen.orientation = 'vertical';
  screen.paddingTop = 110;

  /**
   * 一行字，上下留白，方便点
   * @param {string} text @param {ViewGroup} [parent]
   */
  const row = (text, parent = screen) => {
    const t = new TextView();
    t.text = text;
    t.paddingTop = 12;
    t.paddingBottom = 12;
    t.paddingStart = 16;
    parent.addView(t);
    return t;
  };

  // 自由时加的监听器、挂的识别器，挂上之后照样有用
  const onlyTouch = row('只听触摸');
  const onlyTouchRec = recordTouches(onlyTouch);
  const drag = row('拖我');
  const dragRec = recordTouches(drag);
  const dragDetector = new GestureDetector();
  const dragGestures = recordEvents(dragDetector, gestureTypes);
  dragDetector.view = drag;
  const dragTracker = new VelocityTracker();
  for (const type of touchTypes) drag.addEventListener(type, (e) => { dragTracker.addMovement(/** @type {MotionEvent} */ (e)); });
  const clickMe = row('点它');
  const disabled = row('不可用');
  const presser = row('长按我');
  const gesture = row('手势');
  const gestureDetector = new GestureDetector();
  const gestures = recordEvents(gestureDetector, gestureTypes);
  gestureDetector.view = gesture;
  const zoom = row('缩放');
  zoom.paddingBottom = 120;
  const zoomDetector = new ScaleGestureDetector();
  const zooms = recordEvents(zoomDetector, scaleTypes);
  zoomDetector.view = zoom;
  const outer = new LinearLayout();
  screen.addView(outer);
  const inner = row('里层', outer);
  const pressedRow = row('按下');
  activity.contentView = screen;
  await sleep(500);

  // ---- 只听触摸、不可点的视图也拿下整段手势 ----
  let sent = performance.now();
  request('tap 只听触摸');
  assert('点一下：收到 touchend', await waitFor(() => onlyTouchRec.seen.some((e) => e.type === 'touchend'), 10000), true);
  const received = performance.now();
  assert('只听触摸、不可点的视图也拿下整段手势', onlyTouchRec.names(), 'touchstart,touchend');
  if (onlyTouchRec.seen.length === 2) {
    const [down, up] = onlyTouchRec.seen;
    const p = down.pointers[0];
    const frame = /** @type {any} */ (onlyTouch).frame;
    assert('都是 MotionEvent', down instanceof MotionEvent && up instanceof MotionEvent, true);
    assert('一根手指，id 是 0', down.pointers.length + ':' + p.id, '1:0');
    assert("toolType 是 'finger'", p.toolType, 'finger');
    assert('按下和抬起的 actionIndex 是 0', down.actionIndex + ',' + up.actionIndex, '0,0');
    assert('touchstart 的 eventTime 就是按下时刻', down.eventTime, down.downTime);
    assert('按下时刻在发请求之后、收到之前（和 performance.now() 同一个钟：' +
           Math.round(sent) + ' < ' + Math.round(down.downTime) + ' < ' + Math.round(received) + '）',
           down.downTime > sent && down.downTime < received, true);
    assert('抬起的 downTime 和按下一样', up.downTime, down.downTime);
    assert('x 是 dp，点在视图正中（' + p.x + ' / ' + (frame && frame.width) + '）',
           frame !== null && near(p.x, frame.width / 2, 2), true);
    assert('y 是 dp，点在视图正中（' + p.y + ' / ' + (frame && frame.height) + '）',
           frame !== null && near(p.y, frame.height / 2, 2), true);
    assert('screenX、screenY 是屏幕上的位置：screenY 比 y 大', p.screenY > p.y, true);
    assert('没有 rawX、rawY 了', 'rawX' in p || 'rawY' in p, false);
    for (const key of ['pressure', 'size', 'touchMajor', 'touchMinor', 'toolMajor', 'toolMinor', 'orientation']) {
      assert('手指带 ' + key, typeof (/** @type {any} */ (p))[key], 'number');
    }
    assert('orientation 是度，在 -180 到 180 之间', p.orientation >= -180 && p.orientation <= 180, true);
    assert('触摸事件不可取消', down.cancelable, false);
    assert('target 是视图', down.target === onlyTouch, true);
  }
  onlyTouchRec.stop();

  // ---- 滑一下：touchmove、识别器的 pan 和 fling、喂给 VelocityTracker ----
  request('swipe 300 0 拖我');
  assert('滑一下：收到 touchend', await waitFor(() => dragRec.seen.some((e) => e.type === 'touchend'), 10000), true);
  await sleep(300);
  const moves = dragRec.seen.filter((e) => e.type === 'touchmove');
  const first = dragRec.seen[0];
  const last = dragRec.seen[dragRec.seen.length - 1];
  assert('第一个是 touchstart、最后一个是 touchend', first && last && first.type + ',' + last.type, 'touchstart,touchend');
  assert('中间有 touchmove（' + moves.length + ' 个）', moves.length > 0, true);
  assert('touchmove 的 actionIndex 是 null（没有哪根手指按下或抬起）', moves.every((e) => e.actionIndex === null), true);
  if (first && last) {
    const dx = last.pointers[0].x - first.pointers[0].x;
    assert('x 走了约 300 像素换成的 dp（' + dx + ' ≈ ' + 300 / density + '）', near(dx, 300 / density, 3), true);
    assert('screenX 也走了这么多',
           near(last.pointers[0].screenX - first.pointers[0].screenX, 300 / density, 3), true);
    assert('滑了约 300 毫秒（' + Math.round(last.eventTime - first.downTime) + '）',
           last.eventTime - first.downTime > 150, true);
    assert('eventTime 不往回走',
           dragRec.seen.every((e, i) => i === 0 || e.eventTime >= dragRec.seen[i - 1].eventTime), true);
  }
  const withHistory = dragRec.seen.filter((e) => e.history.length > 0);
  console.log('  （带 history 的事件 ' + withHistory.length + ' 个）');
  assert('history 的每个采样都有 eventTime 和同样多的手指',
         withHistory.every((e) => e.history.every((h) => typeof h.eventTime === 'number' &&
                                                        h.pointers.length === e.pointers.length)), true);
  assert('识别器：第一个是 down', dragGestures.names[0], 'down');
  assert('识别器：有 pan', dragGestures.names.includes('pan'), true);
  assert('识别器：最后是 fling（' + dragGestures.names.join(',') + '）',
         dragGestures.names[dragGestures.names.length - 1], 'fling');
  const pans = /** @type {GestureDetectorPanEvent[]} */ (dragGestures.events.filter((e) => e.type === 'pan'));
  if (pans.length > 0 && first) {
    assert('pan 是 GestureDetectorPanEvent', pans[0] instanceof GestureDetectorPanEvent, true);
    assert('pan 的 deltaX 是这一次减上一次，往右是正的', pans.every((e) => e.deltaX >= 0) && pans[0].deltaX > 0, true);
    const sum = pans.reduce((s, e) => s + e.deltaX, 0);
    const lastPan = pans[pans.length - 1];
    assert('deltaX 加起来是第一个 pan 到最后一个 pan 之间走的（dp）',
           lastPan.motionEvent !== null && pans[0].motionEvent !== null &&
           near(sum, lastPan.motionEvent.pointers[0].x - pans[0].motionEvent.pointers[0].x + pans[0].deltaX, 0.5), true);
    assert('pan 的 downEvent 是按下那一刻',
           pans[0].downEvent !== null && near(pans[0].downEvent.pointers[0].x, first.pointers[0].x, 0.01), true);
    assert('pan 带的事件是 MotionEvent，类型是 touchmove',
           pans[0].motionEvent instanceof MotionEvent && pans[0].motionEvent.type, 'touchmove');
  }
  const fling = /** @type {GestureDetectorFlingEvent | undefined} */ (dragGestures.events.find((e) => e.type === 'fling'));
  if (fling) {
    assert('fling 是 GestureDetectorFlingEvent', fling instanceof GestureDetectorFlingEvent, true);
    assert('fling 的 velocityX 是正的 dp/秒（' + fling.velocityX + '）', fling.velocityX > vc.minimumFlingVelocity, true);
    assert('fling 带的事件是抬起', fling.motionEvent !== null && fling.motionEvent.type, 'touchend');
  }
  const dragVelocity = dragTracker.getVelocity();
  assert('喂给 VelocityTracker：往右的速度（' + (dragVelocity && dragVelocity.x) + ' dp/秒）',
         dragVelocity !== null && dragVelocity.x > 0, true);
  dragRec.stop();

  // ---- 听着 click，isClickable 写了 false 也点得到 ----
  let clicks = 0;
  clickMe.isClickable = false;
  clickMe.addEventListener('click', () => { clicks++; });
  const clickRec = recordTouches(clickMe);
  request('tap 点它');
  assert('听着 click、isClickable 写了 false，还是点得到', await waitFor(() => clicks > 0, 10000), true);
  assert('isClickable 读出写进去的 false', clickMe.isClickable, false);
  assert('同时听着触摸：整段手势也收到了', clickRec.names(), 'touchstart,touchend');
  clickRec.stop();

  // ---- 不可用：系统不交触摸，也不点 ----
  let disabledClicks = 0;
  disabled.isEnabled = false;
  disabled.addEventListener('click', () => { disabledClicks++; });
  const disabledRec = recordTouches(disabled);
  request('tap 不可用');
  await sleep(4000);
  assert('不可用的视图收不到触摸事件', disabledRec.seen.length, 0);
  assert('不可用的视图不点', disabledClicks, 0);
  disabledRec.stop();

  // ---- 长按：longclick 一次，松手不再 click；按着时 isPressed 读原生 ----
  let longClicks = 0;
  let pressClicks = 0;
  /** @type {boolean | null} */
  let pressedDuringLongClick = null;
  presser.addEventListener('click', () => { pressClicks++; });
  presser.addEventListener('longclick', () => { longClicks++; pressedDuringLongClick = presser.isPressed; });
  request('longpress 长按我');
  assert('长按收到 longclick', await waitFor(() => longClicks > 0, 10000), true);
  await sleep(1500);
  assert('长按只收到一次 longclick', longClicks, 1);
  assert('长按之后松手没有 click', pressClicks, 0);
  assert('isLongClickable 读出写进去的 false', presser.isLongClickable, false);
  assert('longclick 时手指还按着：isPressed 读到原生的 true', pressedDuringLongClick, true);
  assert('松手之后 isPressed 读到原生的 false', presser.isPressed, false);

  // ---- 识别器：点一下、点两下、长按、关掉长按 ----
  request('tap 手势');
  assert('识别器：点一下收到 singletapup', await waitFor(() => gestures.names.includes('singletapup'), 10000), true);
  await sleep(ViewConfiguration.doubleTapTimeout + 500);
  assert('点一下：down、singletapup，过了双击的时限 singletapconfirmed',
         gestures.names.join(','), 'down,singletapup,singletapconfirmed');
  const tapDown = /** @type {GestureDetectorEvent} */ (gestures.events[0]);
  assert('down 是 GestureDetectorEvent', tapDown instanceof GestureDetectorEvent, true);
  assert('down 带的事件是 touchstart', tapDown.motionEvent !== null && tapDown.motionEvent.type, 'touchstart');
  assert('down 带的坐标是 dp，在视图里', tapDown.motionEvent !== null &&
         near(tapDown.motionEvent.pointers[0].x, /** @type {any} */ (gesture).frame.width / 2, 2), true);
  gestures.clear();
  request('doubletap 手势');
  assert('点两下认出 doubletap', await waitFor(() => gestures.names.includes('doubletap'), 10000), true);
  await sleep(ViewConfiguration.doubleTapTimeout + 500);
  assert('点两下之后不再确认单击（' + gestures.names.join(',') + '）', gestures.names.includes('singletapconfirmed'), false);
  gestures.clear();
  request('longpress 手势');
  assert('按住不动认出 longpress', await waitFor(() => gestures.names.includes('longpress'), 10000), true);
  await sleep(1500);
  assert('长按：先 showpress 再 longpress', gestures.names.slice(0, 3).join(','), 'down,showpress,longpress');
  gestures.clear();
  gestureDetector.isLongpressEnabled = false;
  request('longpress 手势');
  assert('关掉长按之后按住：有 showpress', await waitFor(() => gestures.names.includes('showpress'), 10000), true);
  await sleep(2000);
  assert('关掉长按之后没有 longpress', gestures.names.includes('longpress'), false);
  gestureDetector.isLongpressEnabled = true;

  // ---- 单指快速缩放：点一下，第二下按住往下拖 ----
  assert('挂上之后 isInProgress 是 false', zoomDetector.isInProgress, false);
  request('quickscale 300 缩放');
  assert('快速缩放：收到 scaleend', await waitFor(() => zooms.names.includes('scaleend'), 10000), true);
  assert('快速缩放：先 scalebegin，最后 scaleend（' + zooms.names.join(',') + '）',
         zooms.names[0] + ',' + zooms.names[zooms.names.length - 1], 'scalebegin,scaleend');
  assert('快速缩放：中间有 scale', zooms.names.includes('scale'), true);
  const scales = /** @type {ScaleGestureEvent[]} */ (zooms.events.filter((e) => e.type === 'scale'));
  if (scales.length > 0) {
    const s = scales[scales.length - 1];
    const zoomFrame = /** @type {any} */ (zoom).frame;
    assert('scale 是 ScaleGestureEvent', s instanceof ScaleGestureEvent, true);
    assert('往下拖是放大：scaleFactor 大于 1（' + s.scaleFactor + '）', s.scaleFactor > 1, true);
    assert('焦点是 dp，在视图里（' + s.focusX + '）', zoomFrame !== null && s.focusX > 0 && s.focusX < zoomFrame.width, true);
    assert('currentSpan 是 dp（' + s.currentSpan + '）', s.currentSpan > 0 && s.currentSpan < 1000, true);
    assert('eventTime 和 performance.now() 同一个钟', s.eventTime > sent && s.eventTime < performance.now(), true);
  }
  assert('松手之后 isInProgress 是 false', zoomDetector.isInProgress, false);
  zooms.clear();
  zoomDetector.isQuickScaleEnabled = false;
  // 听着触摸，等这一下点完、第二下拖完（两次抬起），确定手势做完了再看
  const zoomRec = recordTouches(zoom);
  request('quickscale 300 缩放');
  assert('关掉快速缩放之后再做一遍：两下都做完了',
         await waitFor(() => zoomRec.seen.filter((e) => e.type === 'touchend').length >= 2, 10000), true);
  await sleep(500);
  assert('关掉快速缩放之后没有缩放事件', zooms.names.length, 0);
  zoomRec.stop();
  zoomDetector.isQuickScaleEnabled = true;

  // ---- 拿下来时识别器放掉，放回去重建 ----
  screen.removeView(zoom);
  assert('视图拿下来之后 isInProgress 是 null（原生识别器放掉了）', zoomDetector.isInProgress, null);
  screen.addView(zoom);
  assert('放回去之后 isInProgress 又是 false', zoomDetector.isInProgress, false);
  screen.removeView(gesture);
  screen.addView(gesture, { index: 0 });
  gestures.clear();
  request('tap 手势');
  assert('拿下来再放回去，识别器照样认得出', await waitFor(() => gestures.names.includes('singletapup'), 10000), true);
  gestures.clear();
  gestureDetector.view = inner;
  assert('识别器移到别的视图', gestureDetector.view === inner, true);

  // ---- 归谁：子视图听着触摸就归它，父视图收不到；子视图不听了，交给父视图 ----
  const outerRec = recordTouches(outer);
  const innerRec = recordTouches(inner);
  request('tap 里层');
  assert('点里层：里层拿下整段手势', await waitFor(() => innerRec.names() === 'touchstart,touchend', 10000), true);
  assert('移过来的识别器也收到了', await waitFor(() => gestures.names.includes('singletapup'), 3000), true);
  await sleep(500);
  assert('里层拿下了，父视图收不到（Android 不往上冒泡）', outerRec.seen.length, 0);
  innerRec.stop();
  gestureDetector.view = null;
  request('tap 里层');
  assert('里层不听了，交给父视图', await waitFor(() => outerRec.names() === 'touchstart,touchend', 10000), true);
  outerRec.stop();

  // ---- 按下：系统也会改的状态。挂着读原生，拿下来读回 JS ----
  pressedRow.isClickable = true;
  let pressedClicks = 0;
  pressedRow.addEventListener('click', () => { pressedClicks++; });
  pressedRow.isPressed = true;
  assert('挂着时写 isPressed = true，读出 true', pressedRow.isPressed, true);
  request('tap 按下');
  assert('点了一下', await waitFor(() => pressedClicks > 0, 10000), true);
  await sleep(500);
  assert('松手之后系统把它改回 false，读到原生的 false', pressedRow.isPressed, false);
  screen.removeView(pressedRow);
  assert('拿下来时读回 JS：还是 false，不是写过的 true', pressedRow.isPressed, false);
  pressedRow.isPressed = true;
  assert('拿下来之后写 true，读出 true', pressedRow.isPressed, true);
  screen.addView(pressedRow);
  assert('放回去设到原生，读到原生的 true', pressedRow.isPressed, true);
  pressedRow.isPressed = false;

  // ---- 动作：挂着时 ----
  const actor = pressedRow;
  const actorClicks = pressedClicks;
  assert('有 click 监听时 performClick() 是 true', actor.performClick(), true);
  assert('click 延后一轮派发，当场还没到', pressedClicks, actorClicks);
  assert('performClick() 之后收到一次 click', await waitFor(() => pressedClicks === actorClicks + 1, 2000), true);
  assert('没有 longclick 监听时 performLongClick() 是 false', actor.performLongClick(), false);
  let actorLongClicks = 0;
  const onActorLongClick = () => { actorLongClicks++; };
  actor.addEventListener('longclick', onActorLongClick);
  assert('有 longclick 监听时 performLongClick() 是 true', actor.performLongClick(), true);
  assert('performLongClick() 之后收到一次 longclick', await waitFor(() => actorLongClicks === 1, 2000), true);
  actor.removeEventListener('longclick', onActorLongClick);
  assert("挂着时 performHapticFeedback('confirm') 返回布尔", typeof actor.performHapticFeedback('confirm'), 'boolean');
  actor.isHapticFeedbackEnabled = false;
  assert('isHapticFeedbackEnabled = false 时 performHapticFeedback 是 false', actor.performHapticFeedback('confirm'), false);
  assert('带 { ignoreViewSetting: true } 时返回布尔',
         typeof actor.performHapticFeedback('confirm', { ignoreViewSetting: true }), 'boolean');
  assert('带 { ignoreGlobalSetting: true } 也能调',
         typeof actor.performHapticFeedback('longPress', { ignoreGlobalSetting: true }), 'boolean');
  actor.isHapticFeedbackEnabled = true;
  screen.removeView(actor);
  assert('拿下来之后 performClick() 抛 InvalidStateError', thrown(() => actor.performClick()), 'InvalidStateError');
  screen.addView(actor);

  // ---- 不让父视图抢：ScrollView 里的子视图 ----
  const scroller = new ScrollView();
  /** @type {any} */ (scroller).layout = { height: 220 };
  const column = new LinearLayout();
  column.orientation = 'vertical';
  scroller.contentView = column;
  const keep = row('别抢我', column);
  keep.paddingTop = 40;
  keep.paddingBottom = 40;
  for (let i = 0; i < 12; i++) row('填充 ' + i, column);
  screen.addView(scroller, { index: 0 });
  await sleep(500);
  const keepRec = recordTouches(keep);
  request('swipe 0 -400 别抢我');
  assert('往上滑：子视图收到 touchcancel（ScrollView 中途抢走了）',
         await waitFor(() => keepRec.seen.some((e) => e.type === 'touchcancel'), 10000), true);
  await sleep(800);
  assert('ScrollView 滚了（' + /** @type {any} */ (scroller).scrollY + ' 像素）', /** @type {any} */ (scroller).scrollY > 0, true);
  assert('被抢的子视图没有 touchend', keepRec.seen.some((e) => e.type === 'touchend'), false);
  // 等甩出去的那一段停下来再滚回顶上：还在甩的时候按下，ScrollView 在按下那一刻就抢走
  await sleep(2500);
  /** @type {any} */ (scroller).scrollY = 0;
  keepRec.seen.length = 0;
  keep.disallowsParentIntercept = true;
  await sleep(300);
  request('swipe 0 -400 别抢我');
  assert('开着 disallowsParentIntercept 再滑：子视图收到 touchend',
         await waitFor(() => keepRec.seen.some((e) => e.type === 'touchend'), 10000), true);
  assert('这一次没有 touchcancel（当次手势就赶上了）', keepRec.seen.some((e) => e.type === 'touchcancel'), false);
  assert('ScrollView 没滚', /** @type {any} */ (scroller).scrollY, 0);
  keepRec.stop();
  screen.removeView(scroller);

  // ---- 可选中的字：isClickable、isLongClickable 写了 false，原生照样可长按（按住时进入按下态）----
  // 先写 isTextSelectable、后写 false：照 Java 的先后，后写的 false 会让长按选字失效
  const selectable = row('可选中的字');
  selectable.isTextSelectable = true;
  selectable.isClickable = false;
  selectable.isLongClickable = false;
  await sleep(300);
  let everPressed = false;
  request('longpress 可选中的字');
  await waitFor(() => { everPressed = everPressed || selectable.isPressed; return everPressed; }, 10000, 30);
  assert('可选中的字按住时进入按下态（原生实际是可长按的）', everPressed, true);
  assert('isClickable、isLongClickable 读出写进去的 false', selectable.isClickable + ',' + selectable.isLongClickable,
         'false,false');
  await sleep(1500);
  selectable.isTextSelectable = false;
  screen.removeView(selectable);
  activity.contentView = null;
}
