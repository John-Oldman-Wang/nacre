// 动画：插值器（BaseInterpolator 一族）、ValueAnimator / ObjectAnimator、view.animate()、
// requestAnimationFrame、系统的动画时长缩放（application.animatorDurationScale）。
//
// 照「接类的总则」（2026-11-26）：
// - 插值器的可选参数是 options（new PathInterpolator({ x1, y1, x2, y2 })），建出来不能改，没有可读的成员。
// - ValueAnimator / ObjectAnimator 用 options 建（new ValueAnimator({ values, duration, … })），设置都是状态，
//   写什么读什么；animatedValue、animatedFraction、currentPlayTime、isRunning 这些读原生。它们会反复用，
//   所以结束是事件（start、end、cancel、repeat、pause、resume、update；被取消时先 cancel 再 end）。
// - view.animate(to, options) 返回 Promise<boolean>：跑完兑现 true，被打断（被别的 animate 接走、signal
//   中止、视图离开页面）兑现 false；视图自由时 reject InvalidStateError。动画改的属性是系统也会改的状态：
//   挂着时读原生（动画中途读到的是中间值），结束时 JS 里的值等于最终值。
// - 长度是 dp，时长是毫秒，角度是度；无限次数是 Infinity。
//
// 时长相关的断言假设手机的动画时长缩放是 1（开发者选项里没改过）。最后一段打「[acceptance] animscale 0」，
// android/scripts/run-device.sh 用 adb shell settings put global animator_duration_scale 改，
// 「animscale restore」还原；脚本退出时（含中途失败）也会还原。

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
 * Promise 的结果：兑现是「兑现 值」，拒绝是「拒绝 name」
 * @param {Promise<unknown>} p
 */
async function settled(p) {
  try {
    return '兑现 ' + String(await p);
  } catch (err) {
    return '拒绝 ' + (err instanceof Error ? err.name : typeof err);
  }
}

/**
 * 跑 fn，收下这期间打的警告（console.warn 的第一个参数），用 ' | ' 连起来；没有警告是空串
 * @param {() => unknown} fn
 */
function warnings(fn) {
  const original = console.warn;
  /** @type {string[]} */
  const seen = [];
  console.warn = (/** @type {unknown} */ first) => { seen.push(String(first)); };
  try {
    fn();
  } finally {
    console.warn = original;
  }
  return seen.join(' | ');
}

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 两个数差不多相等（插值器算的是 float）
 * @param {unknown} a
 * @param {number} b
 */
const near = (a, b) => typeof a === 'number' && Math.abs(a - b) < 1e-5;

/** a 在 lo 和 hi 之间（不含两头） @param {unknown} a @param {number} lo @param {number} hi */
const between = (a, lo, hi) => typeof a === 'number' && a > lo && a < hi;

/**
 * 等某个事件来一次，最多 ms 毫秒；来了是 true
 * @param {EventTarget} target
 * @param {string} type
 * @param {number} ms
 * @returns {Promise<boolean>}
 */
function once(target, type, ms) {
  return new Promise((resolve) => {
    target.addEventListener(type, () => resolve(true), { once: true });
    setTimeout(() => resolve(false), ms);
  });
}

/**
 * 记下一串事件的名字
 * @param {EventTarget} target
 * @param {string[]} types
 */
function record(target, types) {
  /** @type {string[]} */
  const log = [];
  for (const t of types) target.addEventListener(t, () => { log.push(t); });
  return log;
}

/**
 * 最多等 ms 毫秒，看 p 有没有落定；落定了给结果（settled 的写法），没有是「没落定」
 * @param {Promise<unknown>} p @param {number} ms
 */
function within(p, ms) {
  return Promise.race([settled(p), sleep(ms).then(() => '没落定')]);
}

/** 下一帧（rAF 的时刻） @returns {Promise<number>} */
const nextFrame = () => new Promise((resolve) => { requestAnimationFrame(resolve); });

/** @param {import("../main.js").StepContext} ctx */
export async function stepAnimation(ctx) {
  const { assert } = ctx;
  const activity = /** @type {Activity} */ (ctx.activity);
  /** @type {any} 故意写错类型的地方用它 */
  let bad;
  const g = /** @type {any} */ (globalThis);

  // ===== 插值器 =====
  console.log('  --- 动画：插值器 ---');
  assert('BaseInterpolator 不能 new', thrown(() => new g.BaseInterpolator()), 'TypeError');
  const linear = new LinearInterpolator();
  assert('LinearInterpolator 是 BaseInterpolator', linear instanceof BaseInterpolator, true);
  assert('Linear(0.25)', near(linear.getInterpolation(0.25), 0.25), true);
  assert('Accelerate() 是 t²', near(new AccelerateInterpolator().getInterpolation(0.5), 0.25), true);
  assert('Accelerate({ factor: 2 }) 是 t⁴', near(new AccelerateInterpolator({ factor: 2 }).getInterpolation(0.5), 0.0625), true);
  assert('Accelerate({}) 用默认的 factor 1', near(new AccelerateInterpolator({}).getInterpolation(0.5), 0.25), true);
  assert('Accelerate(null) 当成空的 options', near(new AccelerateInterpolator(/** @type {any} */ (null)).getInterpolation(0.5), 0.25), true);
  assert("Accelerate({ factor: '2' }) 照 Number()", near(new AccelerateInterpolator(/** @type {any} */ ({ factor: '2' })).getInterpolation(0.5), 0.0625), true);
  assert('Accelerate 照 Java 按位置传 factor 抛 TypeError', thrown(() => new AccelerateInterpolator(/** @type {any} */ (2))), 'TypeError');
  assert("Accelerate({ factor: 'x' }) 抛 TypeError", thrown(() => new AccelerateInterpolator(/** @type {any} */ ({ factor: 'x' }))), 'TypeError');
  assert('Decelerate() 是 1-(1-t)²', near(new DecelerateInterpolator().getInterpolation(0.5), 0.75), true);
  assert('Decelerate({ factor: 2 })', near(new DecelerateInterpolator({ factor: 2 }).getInterpolation(0.5), 0.9375), true);
  assert('Decelerate 按位置传抛 TypeError', thrown(() => new DecelerateInterpolator(/** @type {any} */ (2))), 'TypeError');
  assert('AccelerateDecelerate(0.5)', near(new AccelerateDecelerateInterpolator().getInterpolation(0.5), 0.5), true);
  assert('AccelerateDecelerate(0.25)',
         near(new AccelerateDecelerateInterpolator().getInterpolation(0.25), Math.cos(1.25 * Math.PI) / 2 + 0.5), true);
  assert('Anticipate() 先往回走', near(new AnticipateInterpolator().getInterpolation(0.5), -0.125), true);
  assert('Anticipate({ tension: 3 })', near(new AnticipateInterpolator({ tension: 3 }).getInterpolation(0.5), 0.25 * (2 - 3)), true);
  assert('Anticipate 按位置传抛 TypeError', thrown(() => new AnticipateInterpolator(/** @type {any} */ (3))), 'TypeError');
  assert('Overshoot() 到 1 是 1', near(new OvershootInterpolator().getInterpolation(1), 1), true);
  assert('Overshoot({ tension: 2 }) 中途超过 1', new OvershootInterpolator({ tension: 2 }).getInterpolation(0.8) > 1, true);
  assert('Overshoot 按位置传抛 TypeError', thrown(() => new OvershootInterpolator(/** @type {any} */ (2))), 'TypeError');
  assert('AnticipateOvershoot() 到 1 是 1', near(new AnticipateOvershootInterpolator().getInterpolation(1), 1), true);
  assert('AnticipateOvershoot({ tension: 2, extraTension: 1.5 }) 到 0 是 0',
         near(new AnticipateOvershootInterpolator({ tension: 2, extraTension: 1.5 }).getInterpolation(0), 0), true);
  // 默认值是 tension 2、extraTension 1.5：只给 tension 时 extraTension 用默认值
  assert('AnticipateOvershoot({ tension: 2 }) 和默认的一样',
         near(new AnticipateOvershootInterpolator({ tension: 2 }).getInterpolation(0.3),
              new AnticipateOvershootInterpolator().getInterpolation(0.3)), true);
  assert('AnticipateOvershoot 按位置传抛 TypeError',
         thrown(() => new AnticipateOvershootInterpolator(/** @type {any} */ (2), /** @type {any} */ (1.5))), 'TypeError');
  // Android 的弹跳曲线用的是近似常数（t × 1.1226，最后一段 8(t − 1.0435)² + 0.95），
  // 到 t = 1 不是正好 1，是 1.0000545（照 float 算）
  assert('Bounce(1) 照 Android 的公式是 1.0000545', near(new BounceInterpolator().getInterpolation(1), 1.0000545), true);
  assert('Cycle(1) 在 0.25 是 1', near(new CycleInterpolator(1).getInterpolation(0.25), 1), true);
  assert('Cycle 不给次数抛 TypeError', thrown(() => new g.CycleInterpolator()), 'TypeError');
  assert("Cycle('x') 抛 TypeError", thrown(() => new CycleInterpolator(/** @type {any} */ ('x'))), 'TypeError');
  const ease = new PathInterpolator({ x1: 0.4, y1: 0, x2: 0.2, y2: 1 });
  assert('Path 三次贝塞尔 0 → 0', near(ease.getInterpolation(0), 0), true);
  assert('Path 三次贝塞尔 1 → 1', near(ease.getInterpolation(1), 1), true);
  assert('Path 三次贝塞尔 0.5 在 0.5 和 1 之间', between(ease.getInterpolation(0.5), 0.5, 1), true);
  assert('Path 的 y 可以超出 0–1（回弹）', new PathInterpolator({ x1: 0.3, y1: 1.6, x2: 0.6, y2: 1.2 }).getInterpolation(0.5) > 1, true);
  assert('Path 照 Java 按位置传抛 TypeError', thrown(() => new PathInterpolator(/** @type {any} */ (0.4), 0, 0.2, 1)), 'TypeError');
  assert('Path 不给参数抛 TypeError', thrown(() => new g.PathInterpolator()), 'TypeError');
  assert('Path 少一个成员抛 TypeError', thrown(() => new PathInterpolator(/** @type {any} */ ({ x1: 0.4, y1: 0, x2: 0.2 }))), 'TypeError');
  assert("Path 的成员给 'x' 抛 TypeError", thrown(() => new PathInterpolator(/** @type {any} */ ({ x1: 'x', y1: 0, x2: 0.2, y2: 1 }))), 'TypeError');
  // x 要在 0–1 里（和 CSS 的 cubic-bezier 一样），不然曲线可能往回绕
  assert('Path 的 x1 超出 0–1 抛 RangeError', thrown(() => new PathInterpolator({ x1: 2, y1: 0, x2: 0.2, y2: 1 })), 'RangeError');
  assert('Path 的 x2 是负数抛 RangeError', thrown(() => new PathInterpolator({ x1: 0.4, y1: 0, x2: -1, y2: 1 })), 'RangeError');
  assert("getInterpolation('x') 抛 TypeError", thrown(() => linear.getInterpolation(/** @type {any} */ ('x'))), 'TypeError');
  assert('getInterpolation() 不给参数抛 TypeError', thrown(() => /** @type {any} */ (linear).getInterpolation()), 'TypeError');
  assert("getInterpolation('0.5') 照 Number()", near(linear.getInterpolation(/** @type {any} */ ('0.5')), 0.5), true);
  // 建出来不能改，没有可读的成员（和 Java 一样）
  assert('插值器没有可读的 factor', 'factor' in new AccelerateInterpolator({ factor: 2 }), false);
  assert('插值器没有可读的 tension', 'tension' in new OvershootInterpolator(), false);
  class MyEase extends LinearInterpolator {}
  assert('插值器能在 JS 里继承（只在 JS 这一层）', near(new MyEase().getInterpolation(0.3), 0.3), true);

  // ===== ValueAnimator：建、写读 =====
  console.log('  --- 动画：ValueAnimator ---');
  assert('Animator 不能 new（抽象类）', thrown(() => new g.Animator()), 'TypeError');
  const va = new ValueAnimator({ values: [0, 100] });
  assert('ValueAnimator 是 Animator', va instanceof Animator, true);
  assert('ValueAnimator 是 EventTarget', va instanceof EventTarget, true);
  assert('values 读回写进去的', va.values.join(','), '0,100');
  assert('values 读出来是冻结的', Object.isFrozen(va.values), true);
  assert('values 没变时读两次是同一个', va.values === va.values, true);
  assert('duration 默认 300', va.duration, 300);
  assert('startDelay 默认 0', va.startDelay, 0);
  assert('repeatCount 默认 0', va.repeatCount, 0);
  assert("repeatMode 默认 'restart'", va.repeatMode, 'restart');
  assert('interpolator 默认 null（Android 默认的先加速后减速）', va.interpolator, null);
  assert('isRunning 默认 false', va.isRunning, false);
  assert('isStarted 默认 false', va.isStarted, false);
  assert('isPaused 默认 false', va.isPaused, false);
  assert('不给 options 抛 TypeError', thrown(() => new g.ValueAnimator()), 'TypeError');
  assert('不给 values 抛 TypeError', thrown(() => new ValueAnimator(/** @type {any} */ ({ duration: 100 }))), 'TypeError');
  assert('values 是空数组抛 RangeError', thrown(() => new ValueAnimator({ values: [] })), 'RangeError');
  assert('values 不是数组抛 TypeError', thrown(() => new ValueAnimator(/** @type {any} */ ({ values: 5 }))), 'TypeError');
  assert("values 有一个 'x'（数和字符串混着）抛 TypeError", thrown(() => new ValueAnimator(/** @type {any} */ ({ values: [1, 'x'] }))), 'TypeError');
  assert('values 有 NaN 抛 TypeError', thrown(() => new ValueAnimator({ values: [0, NaN] })), 'TypeError');
  assert('构造时颜色写错抛 TypeError', thrown(() => new ValueAnimator({ values: ['#000000', 'nope'] })), 'TypeError');
  const full = new ValueAnimator({
    values: [1, 2, 3], duration: 120, startDelay: 10, interpolator: linear, repeatCount: 2, repeatMode: 'reverse',
  });
  assert('构造时给的 duration', full.duration, 120);
  assert('构造时给的 startDelay', full.startDelay, 10);
  assert('构造时给的 interpolator', full.interpolator === linear, true);
  assert('构造时给的 repeatCount', full.repeatCount, 2);
  assert('构造时给的 repeatMode', full.repeatMode, 'reverse');
  assert('构造时 repeatMode 写错抛 TypeError',
         thrown(() => new ValueAnimator(/** @type {any} */ ({ values: [0, 1], repeatMode: 'pingpong' }))), 'TypeError');
  assert('构造时 duration 是负数抛 RangeError', thrown(() => new ValueAnimator({ values: [0, 1], duration: -1 })), 'RangeError');

  va.duration = 200;
  assert('duration 写 200', va.duration, 200);
  bad = '250';
  va.duration = bad;
  assert("duration 写 '250' 照 Number()", va.duration, 250);
  assert('duration 写负数抛 RangeError', thrown(() => { va.duration = -1; }), 'RangeError');
  bad = 'long';
  assert("duration 写 'long' 抛 TypeError", thrown(() => { va.duration = bad; }), 'TypeError');
  assert('duration 写 Infinity 抛 TypeError（只有次数能无限）', thrown(() => { va.duration = Infinity; }), 'TypeError');
  assert('写错之后 duration 不变', va.duration, 250);
  va.startDelay = 30;
  assert('startDelay 写 30', va.startDelay, 30);
  assert('startDelay 写负数抛 RangeError', thrown(() => { va.startDelay = -5; }), 'RangeError');
  va.startDelay = 0;
  va.repeatCount = 2;
  assert('repeatCount 写 2', va.repeatCount, 2);
  va.repeatCount = 2.9;
  assert('repeatCount 写 2.9 向零取整', va.repeatCount, 2);
  va.repeatCount = Infinity;
  assert('repeatCount 写 Infinity（无限次）', va.repeatCount, Infinity);
  bad = 'infinite';
  assert("repeatCount 写 'infinite' 抛 TypeError（无限是 Infinity）", thrown(() => { va.repeatCount = bad; }), 'TypeError');
  assert('repeatCount 写负数抛 RangeError', thrown(() => { va.repeatCount = -1; }), 'RangeError');
  assert('写错之后 repeatCount 不变', va.repeatCount, Infinity);
  va.repeatCount = 0;
  va.repeatMode = 'reverse';
  assert("repeatMode 写 'reverse'", va.repeatMode, 'reverse');
  bad = 'pingpong';
  assert('repeatMode 写错：一条警告',
         warnings(() => { va.repeatMode = bad; }),
         '[Nacre] repeatMode has no value "pingpong"; expected one of: restart / reverse, ignored');
  assert('repeatMode 写错之后值不变', va.repeatMode, 'reverse');
  va.repeatMode = 'restart';

  va.interpolator = linear;
  assert('interpolator 写读是同一个', va.interpolator === linear, true);
  bad = {};
  assert('interpolator 给普通对象抛 TypeError', thrown(() => { va.interpolator = bad; }), 'TypeError');
  bad = (/** @type {number} */ t) => t;
  assert('interpolator 给 JS 函数抛 TypeError（只认原生的插值器）', thrown(() => { va.interpolator = bad; }), 'TypeError');
  va.interpolator = null;
  assert('interpolator 写 null 读回 null', va.interpolator, null);
  va.interpolator = linear;

  va.values = [10, 20];
  assert('values 写 [10, 20]', va.values.join(','), '10,20');
  va.values = [5];
  assert('values 可以只有一个', va.values.join(','), '5');
  assert('values 写空数组抛 RangeError', thrown(() => { va.values = []; }), 'RangeError');
  assert('写错之后 values 不变', va.values.join(','), '5');
  va.values = [0, 100];

  // 一件事只说一次：旧的写法都没有了
  for (const name of ['ofFloat', 'ofInt', 'ofArgb', 'durationScale', 'areAnimatorsEnabled']) {
    assert('ValueAnimator 上没有 ' + name + ' 了', name in ValueAnimator, false);
  }
  for (const name of ['setDuration', 'setFloatValues', 'setIntValues', 'setCurrentFraction', 'totalDuration',
    'setInterpolator', 'setStartDelay']) {
    assert('animator 上没有 ' + name + ' 了', name in va, false);
  }

  // 跳到某一刻：currentPlayTime 可写（线性、300 毫秒里的 150 是一半）
  const seek = new ValueAnimator({ values: [0, 100], duration: 300, interpolator: linear });
  seek.currentPlayTime = 150;
  assert('currentPlayTime 写 150 之后 animatedFraction 是 0.5', near(seek.animatedFraction, 0.5), true);
  assert('currentPlayTime 写 150 之后 animatedValue 是 50', near(seek.animatedValue, 50), true);
  assert('currentPlayTime 读原生', seek.currentPlayTime, 150);
  seek.currentPlayTime = 300;
  assert('currentPlayTime 写到头 animatedValue 是 100', near(seek.animatedValue, 100), true);
  assert('currentPlayTime 写负数抛 RangeError', thrown(() => { seek.currentPlayTime = -1; }), 'RangeError');
  bad = 'x';
  assert("currentPlayTime 写 'x' 抛 TypeError", thrown(() => { seek.currentPlayTime = bad; }), 'TypeError');
  bad = 1;
  assert('animatedValue 是只读的', thrown(() => { /** @type {any} */ (seek).animatedValue = bad; }), 'TypeError');
  assert('animatedFraction 是只读的', thrown(() => { /** @type {any} */ (seek).animatedFraction = bad; }), 'TypeError');
  assert('isRunning 是只读的', thrown(() => { /** @type {any} */ (seek).isRunning = bad; }), 'TypeError');

  // 颜色动画：values 全是 CSS 的颜色字符串，animatedValue 读出来也是
  const vc = new ValueAnimator({ values: ['#000000', 'rgb(255, 255, 255)'], interpolator: linear });
  assert('颜色的 values 原样读回', vc.values.join('|'), '#000000|rgb(255, 255, 255)');
  vc.currentPlayTime = 0;
  assert('颜色动画起点读出 CSS 颜色', vc.animatedValue, '#000000');
  vc.currentPlayTime = 300;
  assert('颜色动画终点读出 CSS 颜色', vc.animatedValue, '#ffffff');
  vc.currentPlayTime = 150;
  assert('颜色动画中途是颜色字符串', String(vc.animatedValue).startsWith('#'), true);
  bad = ['#000000', 'nope'];
  assert('颜色的 values 写错：一条警告', warnings(() => { vc.values = bad; }).startsWith('[Nacre] values: '), true);
  assert('颜色写错之后 values 不变', vc.values.join('|'), '#000000|rgb(255, 255, 255)');
  vc.values = [0, 1];
  vc.currentPlayTime = 300;
  assert('values 换回数之后 animatedValue 是数', vc.animatedValue, 1);

  // ===== ValueAnimator：真的跑 =====
  console.log('  --- 动画：ValueAnimator 跑起来 ---');
  const run = new ValueAnimator({ values: [0, 1], duration: 150, interpolator: linear });
  const runLog = record(run, ['start', 'end', 'cancel', 'repeat']);
  /** @type {number[]} */
  const values = [];
  const onUpdate = (/** @type {Event} */ e) => {
    values.push(/** @type {number} */ (run.animatedValue));
    if (values.length === 1) {
      assert('update 是普通的 Event', e.constructor === Event, true);
      assert('update 的 target 是 animator', e.target === run, true);
      assert('update 不可取消', e.cancelable, false);
    }
  };
  run.addEventListener('update', onUpdate);
  const ended = once(run, 'end', 3000);
  run.start();
  assert('start() 之后 isStarted', run.isStarted, true);
  assert('事件不在 start() 里当场派发', runLog.length, 0);
  assert('等到 end', await ended, true);
  assert('事件顺序 start、end', runLog.join(','), 'start,end');
  assert('一路收到好几次 update', values.length > 3, true);
  assert('update 里读到的值递增', values.every((v, i) => i === 0 || v >= /** @type {number} */ (values[i - 1])), true);
  assert('最后一次 update 是终点', near(values[values.length - 1], 1), true);
  assert('结束之后 isRunning 是 false', run.isRunning, false);
  run.removeEventListener('update', onUpdate);

  // cancel：先 cancel 再 end
  runLog.length = 0;
  run.duration = 2000;
  run.start();
  await sleep(100);
  assert('跑着的时候 isRunning', run.isRunning, true);
  const cancelEnded = once(run, 'end', 3000);
  run.cancel();
  assert('取消之后收到 end', await cancelEnded, true);
  assert('取消：先 cancel 再 end', runLog.join(','), 'start,cancel,end');
  assert('取消之后停在中途', between(run.animatedValue, 0, 1), true);

  // end()：直接跳到终点
  runLog.length = 0;
  run.start();
  run.end();
  await sleep(50);
  assert('end() 跳到终点', near(run.animatedValue, 1), true);
  assert('end()：start、end', runLog.join(','), 'start,end');

  // reverse()：倒着播回起点
  run.duration = 100;
  const reversed = once(run, 'end', 3000);
  run.reverse();
  assert('reverse 之后等到 end', await reversed, true);
  assert('reverse 播完停在起点', near(run.animatedValue, 0), true);

  // repeat
  runLog.length = 0;
  run.repeatCount = 1;
  const repeated = once(run, 'end', 3000);
  run.start();
  await repeated;
  assert('重复一次：start、repeat、end', runLog.join(','), 'start,repeat,end');

  // 无限次：一直 repeat，取消才停
  runLog.length = 0;
  run.repeatCount = Infinity;
  run.duration = 60;
  run.start();
  await sleep(400);
  assert('无限次：跑了好几轮', runLog.filter((t) => t === 'repeat').length >= 2, true);
  assert('无限次：一直没 end', runLog.includes('end'), false);
  const infiniteEnded = once(run, 'end', 3000);
  run.cancel();
  assert('无限次：取消之后收到 end', await infiniteEnded, true);
  run.repeatCount = 0;

  // pause / resume
  const pauseLog = record(run, ['pause', 'resume']);
  run.duration = 2000;
  run.start();
  await sleep(50);
  run.pause();
  assert('pause() 之后 isPaused', run.isPaused, true);
  run.resume();
  assert('resume() 之后不再 isPaused', run.isPaused, false);
  run.cancel();
  await sleep(50);
  assert('pause、resume 两个事件', pauseLog.join(','), 'pause,resume');

  // 跑着的时候改设置：下一次 start 用新的
  run.duration = 80;
  run.values = [0, 50];
  const reEnded = once(run, 'end', 3000);
  run.start();
  await reEnded;
  assert('改了 values 再跑，停在新的终点', near(run.animatedValue, 50), true);

  // JS 不留变量的 animator：跑着的时候包装不丢，end 照样收得到
  /** @type {Promise<boolean>} */
  const anonymousEnded = new Promise((resolve) => {
    const a = new ValueAnimator({ values: [0, 1], duration: 600 });
    a.addEventListener('end', () => resolve(true), { once: true });
    a.start();
    setTimeout(() => resolve(false), 5000);
  });
  for (let round = 0; round < 4; round++) {
    let junk = [];
    for (let i = 0; i < 200000; i++) junk.push({ i, s: 'x' + i });
    junk = [];
    await sleep(30);
  }
  assert('不留变量的 animator，跑完照样收到 end', await anonymousEnded, true);

  // ===== ObjectAnimator =====
  console.log('  --- 动画：ObjectAnimator ---');
  const box = new TextView();
  box.text = '动起来';
  box.paddingTop = 16;
  box.paddingBottom = 16;
  box.paddingStart = 16;
  box.paddingEnd = 16;
  const screen = new LinearLayout();
  screen.orientation = 'vertical';
  screen.paddingTop = 160;
  screen.paddingStart = 24;
  screen.addView(box);

  const oa = new ObjectAnimator({ target: box, propertyName: 'translationX', values: [0, 40], interpolator: linear, duration: 150 });
  assert('ObjectAnimator 是 ValueAnimator', oa instanceof ValueAnimator, true);
  assert('target 是给的视图', oa.target === box, true);
  assert('propertyName', oa.propertyName, 'translationX');
  assert('autoCancel 默认 false', oa.autoCancel, false);
  oa.autoCancel = true;
  assert('autoCancel 写 true', oa.autoCancel, true);
  oa.autoCancel = false;
  assert('不给 target 抛 TypeError', thrown(() => new ObjectAnimator(/** @type {any} */ ({ propertyName: 'alpha', values: [0, 1] }))), 'TypeError');
  assert('target 给普通对象抛 TypeError',
         thrown(() => new ObjectAnimator(/** @type {any} */ ({ target: {}, propertyName: 'alpha', values: [0, 1] }))), 'TypeError');
  assert('不给 propertyName 抛 TypeError', thrown(() => new ObjectAnimator(/** @type {any} */ ({ target: box, values: [0, 1] }))), 'TypeError');
  // 只认运行时登记过的属性（要知道它的单位）
  assert('构造时 propertyName 不认识抛 TypeError',
         thrown(() => new ObjectAnimator(/** @type {any} */ ({ target: box, propertyName: 'backgroundColor', values: [0, 1] }))), 'TypeError');
  assert('ObjectAnimator 的 values 不收颜色',
         thrown(() => new ObjectAnimator(/** @type {any} */ ({ target: box, propertyName: 'alpha', values: ['#000000', '#ffffff'] }))), 'TypeError');
  assert('alpha 的 values 超出 0–1 抛 RangeError',
         thrown(() => new ObjectAnimator({ target: box, propertyName: 'alpha', values: [0, 1.5] })), 'RangeError');
  bad = 'nope';
  assert('propertyName 写错：一条警告',
         warnings(() => { oa.propertyName = bad; }),
         '[Nacre] propertyName has no value "nope"; expected one of: alpha / translationX / translationY / translationZ / ' +
         'scaleX / scaleY / rotation / rotationX / rotationY / elevation / scrollX / scrollY, ignored');
  assert('propertyName 写错之后值不变', oa.propertyName, 'translationX');
  bad = {};
  assert('target 写普通对象抛 TypeError', thrown(() => { oa.target = bad; }), 'TypeError');
  assert('target 写 null 抛 TypeError', thrown(() => { /** @type {any} */ (oa).target = null; }), 'TypeError');
  // 目标是自由的视图：start() 是动作，抛 InvalidStateError
  assert('目标自由时 start() 抛 InvalidStateError', thrown(() => oa.start()), 'InvalidStateError');
  assert('抛了之后没开始', oa.isStarted, false);
  assert("ObjectAnimator 上没有 ofFloat 了", 'ofFloat' in ObjectAnimator, false);
  assert("没有 setAutoCancel 了（是 autoCancel）", 'setAutoCancel' in oa, false);

  activity.contentView = screen;
  await sleep(300);

  const oaEnded = once(oa, 'end', 3000);
  oa.start();
  assert('ObjectAnimator 跑完收到 end', await oaEnded, true);
  assert('跑完 JS 里的 translationX 正好是终点（dp）', box.translationX, 40);

  // 跑着的时候读到的是中间值：系统也会改的状态，挂着时读原生
  oa.values = [0, 100];
  oa.duration = 1000;
  oa.start();
  await sleep(400);
  assert('跑到一半读 translationX 是中间值', between(box.translationX, 5, 95), true);
  const oaCancelled = once(oa, 'end', 3000);
  oa.cancel();
  await oaCancelled;
  const stopped = box.translationX;
  assert('取消之后停在中途', between(stopped, 5, 95), true);
  await sleep(50);
  assert('取消之后再读还是那个值', box.translationX, stopped);

  // 只给一个值：从现在的值动到它
  const fromNow = new ObjectAnimator({ target: box, propertyName: 'alpha', values: [0.25], duration: 100 });
  const fromNowEnded = once(fromNow, 'end', 3000);
  fromNow.start();
  await fromNowEnded;
  assert('只给一个值：动到它，JS 里正好是 0.25', box.alpha, 0.25);
  box.alpha = 1;
  assert('之后自己写 alpha 读回写的', box.alpha, 1);

  const rot = new ObjectAnimator({ target: box, propertyName: 'rotation', values: [0, 90], duration: 120 });
  const rotEnded = once(rot, 'end', 3000);
  rot.start();
  await rotEnded;
  assert('rotation 跑完是 90（度）', box.rotation, 90);
  box.rotation = 0;

  // scrollY：长度是 dp（原生换成整数像素）
  const sy = new ObjectAnimator({ target: box, propertyName: 'scrollY', values: [0, 8], duration: 100 });
  const syEnded = once(sy, 'end', 3000);
  sy.start();
  await syEnded;
  assert('scrollY 跑完是 8（dp）', box.scrollY, 8);
  box.scrollY = 0;

  // 换了 propertyName 就改别的属性
  oa.propertyName = 'translationY';
  oa.values = [0, 24];
  oa.duration = 100;
  box.translationX = 0;
  const tyEnded = once(oa, 'end', 3000);
  oa.start();
  await tyEnded;
  assert('propertyName 换成 translationY 之后改的是它', box.translationY, 24);
  assert('translationX 没动', box.translationX, 0);
  box.translationY = 0;

  // 目标在动画中途离开页面：动画取消（cancel、end），JS 里留着离开那一刻的值
  const leaving = new ObjectAnimator({ target: box, propertyName: 'translationX', values: [0, 100], duration: 2000, interpolator: linear });
  const leaveLog = record(leaving, ['cancel', 'end']);
  leaving.start();
  await sleep(300);
  screen.removeView(box);
  await sleep(100);
  assert('目标离开页面：动画被取消（cancel、end）', leaveLog.join(','), 'cancel,end');
  const leftAt = box.translationX;
  assert('离开页面之后 JS 里是离开那一刻的值', between(leftAt, 1, 99), true);
  await sleep(300);
  assert('离开之后不再变', box.translationX, leftAt);
  screen.addView(box);
  await sleep(100);
  assert('放回去读到的还是那个值', box.translationX, leftAt);
  box.translationX = 0;

  // ===== view.animate() =====
  console.log('  --- 动画：view.animate() ---');
  assert('没有 ViewPropertyAnimator 这个类了', 'ViewPropertyAnimator' in globalThis, false);
  const free = new View();
  assert('自由的视图：animate() reject InvalidStateError', await settled(free.animate({ alpha: 0 })), '拒绝 InvalidStateError');
  assert('animate() 返回 Promise', box.animate({}) instanceof Promise, true);
  assert('to 不是对象：reject TypeError', await settled(box.animate(/** @type {any} */ (5))), '拒绝 TypeError');
  assert("to 的值给 'x'：reject TypeError", await settled(box.animate(/** @type {any} */ ({ alpha: 'x' }))), '拒绝 TypeError');
  assert('alpha 超出 0–1：reject RangeError', await settled(box.animate({ alpha: 2 })), '拒绝 RangeError');
  assert('duration 是负数：reject RangeError', await settled(box.animate({ alpha: 0.5 }, { duration: -1 })), '拒绝 RangeError');
  assert('delay 是负数：reject RangeError', await settled(box.animate({ alpha: 0.5 }, { delay: -1 })), '拒绝 RangeError');
  assert('interpolator 给普通对象：reject TypeError',
         await settled(box.animate({ alpha: 0.5 }, /** @type {any} */ ({ interpolator: {} }))), '拒绝 TypeError');
  assert('signal 不是 AbortSignal：reject TypeError',
         await settled(box.animate({ alpha: 0.5 }, /** @type {any} */ ({ signal: {} }))), '拒绝 TypeError');
  assert('参数写错时值不变', box.alpha, 1);
  assert('to 是空的：直接兑现 true', await within(box.animate({}), 100), '兑现 true');
  assert('to 里不认识的键不管（没有 x、y、z）', await within(box.animate(/** @type {any} */ ({ x: 10, z: 3 })), 100), '兑现 true');

  // 跑完兑现 true，JS 里的值正好是终点
  const t0 = Date.now();
  const done = await settled(box.animate({ alpha: 0.5, translationX: 30, rotation: 45, scaleX: 1.5 },
                                         { duration: 150, interpolator: linear }));
  assert('跑完兑现 true', done, '兑现 true');
  assert('跑了差不多 duration 那么久', Date.now() - t0 >= 120, true);
  assert('跑完 alpha 正好是 0.5', box.alpha, 0.5);
  assert('跑完 translationX 正好是 30', box.translationX, 30);
  assert('跑完 rotation 正好是 45', box.rotation, 45);
  assert('跑完 scaleX 正好是 1.5', box.scaleX, 1.5);
  // 0.3 这种 float 存不准的值，读回的也是 JS 写的那个
  assert('跑完 alpha 0.3 读回正好 0.3', await settled(box.animate({ alpha: 0.3 }, { duration: 50 })), '兑现 true');
  assert('alpha 读回 0.3（不是 float 的 0.30000001）', box.alpha, 0.3);
  assert('translationX 0.1 dp 跑完读回 0.1', (await box.animate({ translationX: 0.1 }, { duration: 50 })) && box.translationX, 0.1);

  // 中途读到的是中间值
  const slow = box.animate({ translationY: 100 }, { duration: 1000, interpolator: linear });
  await sleep(400);
  assert('跑到一半读 translationY 是中间值', between(box.translationY, 5, 95), true);
  assert('跑完兑现 true', await slow, true);
  assert('跑完 translationY 是 100', box.translationY, 100);

  // delay：等一会儿才开始
  box.translationY = 0;
  const delayed = box.animate({ translationY: 50 }, { delay: 300, duration: 100 });
  await sleep(150);
  assert('delay 期间还没动', box.translationY, 0);
  assert('delay 之后跑完兑现 true', await delayed, true);
  assert('delay 之后到了终点', box.translationY, 50);

  // 被同样的属性的新动画接走：旧的兑现 false，新的兑现 true
  box.translationX = 0;
  const first = box.animate({ translationX: 200 }, { duration: 1000 });
  await sleep(100);
  const second = box.animate({ translationX: 0 }, { duration: 100 });
  assert('被接走的旧动画兑现 false', await first, false);
  assert('接手的新动画兑现 true', await second, true);
  assert('最后是新动画的终点', box.translationX, 0);

  // 只接走一部分属性：旧的接着跑剩下的，照样兑现 true
  const both = box.animate({ alpha: 0.5, translationY: 30 }, { duration: 300 });
  await sleep(50);
  const onlyAlpha = box.animate({ alpha: 1 }, { duration: 100 });
  assert('只被接走一部分：新的兑现 true', await onlyAlpha, true);
  assert('只被接走一部分：旧的跑完剩下的，兑现 true', await both, true);
  assert('alpha 是新动画的终点', box.alpha, 1);
  assert('translationY 是旧动画的终点', box.translationY, 30);

  // signal：中止就是被打断，兑现 false，停在中途
  const controller = new AbortController();
  const aborted = box.animate({ rotation: 90 }, { duration: 1000, interpolator: linear, signal: controller.signal });
  await sleep(200);
  controller.abort();
  assert('signal 中止：兑现 false', await aborted, false);
  const abortedAt = box.rotation;
  assert('signal 中止：停在中途', between(abortedAt, 1, 89), true);
  await sleep(100);
  assert('中止之后不再变', box.rotation, abortedAt);
  const already = new AbortController();
  already.abort();
  assert('signal 已经中止：马上兑现 false', await within(box.animate({ rotation: 0 }, { signal: already.signal }), 100), '兑现 false');
  assert('signal 已经中止：没动', box.rotation, abortedAt);
  box.rotation = 0;

  // duration 0：马上到终点
  assert('duration 0：兑现 true', await within(box.animate({ scaleY: 2 }, { duration: 0 }), 300), '兑现 true');
  assert('duration 0：到了终点', box.scaleY, 2);
  box.scaleY = 1;
  box.scaleX = 1;

  // 动画中途视图离开页面：兑现 false，JS 里留着离开那一刻的值，放回去还是它
  const away = box.animate({ translationX: 100 }, { duration: 2000, interpolator: linear });
  await sleep(300);
  screen.removeView(box);
  assert('离开页面：兑现 false', await away, false);
  const awayAt = box.translationX;
  assert('离开页面之后 JS 里是离开那一刻的值', between(awayAt, 1, 99), true);
  assert('离开之后 animate() reject InvalidStateError', await settled(box.animate({ alpha: 0 })), '拒绝 InvalidStateError');
  screen.addView(box);
  await sleep(100);
  assert('放回去读到的还是那个值', box.translationX, awayAt);
  box.translationX = 0;

  // 整个页面的内容拿下来也一样
  const pageAway = box.animate({ translationY: 0 }, { duration: 2000 });
  await sleep(100);
  activity.contentView = null;
  assert('页面的内容拿下来：兑现 false', await pageAway, false);
  activity.contentView = screen;
  await sleep(200);

  // ===== requestAnimationFrame =====
  console.log('  --- 动画：requestAnimationFrame ---');
  assert('requestAnimationFrame 在全局', typeof requestAnimationFrame, 'function');
  assert('cancelAnimationFrame 在全局', typeof cancelAnimationFrame, 'function');
  assert('requestAnimationFrame 不给参数抛 TypeError', thrown(() => g.requestAnimationFrame()), 'TypeError');
  assert('requestAnimationFrame 给字符串抛 TypeError', thrown(() => requestAnimationFrame(/** @type {any} */ ('x'))), 'TypeError');
  assert('cancelAnimationFrame 不认识的编号不抛', thrown(() => cancelAnimationFrame(987654)), '没抛');
  assert('cancelAnimationFrame(undefined) 不抛', thrown(() => g.cancelAnimationFrame()), '没抛');

  /** @type {number[]} */
  const stamps = [];
  let nowInCallback = 0;
  const id1 = requestAnimationFrame((t) => { stamps.push(t); nowInCallback = performance.now(); });
  const id2 = requestAnimationFrame((t) => { stamps.push(t); });
  const id3 = requestAnimationFrame(() => { stamps.push(-1); });
  assert('返回正整数', Number.isInteger(id1) && id1 > 0, true);
  assert('编号递增', id2 > id1 && id3 > id2, true);
  cancelAnimationFrame(id3);
  assert('回调不当场调', stamps.length, 0);
  await sleep(200);
  assert('取消的那个没调，另外两个调了', stamps.length, 2);
  assert('同一帧的回调拿到同一个时刻', stamps[0] === stamps[1], true);
  const stamp0 = stamps[0] ?? 0;
  assert('时刻是数', typeof stamp0, 'number');
  assert('时刻和 performance.now() 同一个起点（不晚于回调执行的那一刻）', stamp0 <= nowInCallback, true);
  assert('时刻和 performance.now() 同一个起点（相差不到 100 毫秒）', nowInCallback - stamp0 < 100, true);

  // 回调里再请求的排到下一帧；一个回调抛了不影响同一帧的别的回调
  /** @type {number[]} */
  const nested = [];
  let sibling = false;
  requestAnimationFrame((t) => {
    nested.push(t);
    requestAnimationFrame((t2) => { nested.push(t2); });
  });
  requestAnimationFrame(() => { throw new Error('这一条是故意抛的'); });
  requestAnimationFrame(() => { sibling = true; });
  await sleep(300);
  assert('回调里请求的在下一帧调', nested.length, 2);
  assert('下一帧的时刻更晚', (nested[1] ?? 0) > (nested[0] ?? 0), true);
  assert('一个回调抛了，同一帧别的回调照样调', sibling, true);

  // 连续 30 帧：间隔是屏幕刷新的间隔
  /** @type {number[]} */
  const frames = [];
  for (let i = 0; i < 30; i++) frames.push(await nextFrame());
  const avg = ((frames[29] ?? 0) - (frames[0] ?? 0)) / 29;
  console.log('  （平均帧间隔 ' + avg.toFixed(2) + ' 毫秒）');
  assert('连续 30 帧的平均间隔在 5 到 40 毫秒之间', avg > 5 && avg < 40, true);
  assert('每一帧的时刻都比上一帧晚', frames.every((t, i) => i === 0 || t > (frames[i - 1] ?? 0)), true);

  // 用 rAF 逐帧改视图
  for (let i = 1; i <= 10; i++) {
    await nextFrame();
    box.translationY = i * 5;
  }
  assert('rAF 里改的视图属性读得回来', box.translationY, 50);
  box.translationY = 0;

  // ===== 动画时长缩放 =====
  console.log('  --- 动画：动画时长缩放 ---');
  assert('application.animatorDurationScale 是 1（这台手机没改过）', application.animatorDurationScale, 1);
  bad = 2;
  assert('animatorDurationScale 是只读的', thrown(() => { /** @type {any} */ (application).animatorDurationScale = bad; }), 'TypeError');
  /** @type {number[]} */
  const scales = [];
  /** @type {Event[]} */
  const scaleEvents = [];
  const onScale = (/** @type {Event} */ e) => { scaleEvents.push(e); scales.push(application.animatorDurationScale); };
  application.addEventListener('animatordurationscalechange', onScale);
  const toZero = once(application, 'animatordurationscalechange', 10000);
  console.log('[acceptance] animscale 0');
  assert('改成 0：收到 animatordurationscalechange', await toZero, true);
  const scaleEvent = scaleEvents[0];
  assert('animatordurationscalechange 是普通的 Event', scaleEvent !== undefined && scaleEvent.constructor === Event, true);
  assert('animatordurationscalechange 的 target 是 application', scaleEvent !== undefined && scaleEvent.target === application, true);
  assert('事件里读到 0', scales[0], 0);
  // 缩放是 0：动画一开始就结束
  const instant = Date.now();
  assert('缩放是 0：animate() 马上兑现 true', await within(box.animate({ alpha: 0.5 }, { duration: 1000 }), 500), '兑现 true');
  assert('缩放是 0：差不多没花时间', Date.now() - instant < 500, true);
  assert('缩放是 0：到了终点', box.alpha, 0.5);
  box.alpha = 1;
  const zeroAnimator = new ValueAnimator({ values: [0, 1], duration: 1000 });
  const zeroEnded = once(zeroAnimator, 'end', 500);
  zeroAnimator.start();
  assert('缩放是 0：ValueAnimator 马上 end', await zeroEnded, true);
  const back = once(application, 'animatordurationscalechange', 10000);
  console.log('[acceptance] animscale restore');
  assert('还原：收到 animatordurationscalechange', await back, true);
  assert('还原之后是 1', application.animatorDurationScale, 1);
  application.removeEventListener('animatordurationscalechange', onScale);

  activity.contentView = null;
}
