// 动画：插值器（BaseInterpolator 一族）、Animator / ValueAnimator / ObjectAnimator、
// view.animate() 的 ViewPropertyAnimator、requestAnimationFrame、系统的动画时长缩放。
//
// 时长和时刻的单位是毫秒，平移是像素，旋转是度。动画的通知是事件（start、end、cancel、
// repeat、pause、resume、update），照 Android 的 AnimatorListener：被取消时先 cancel
// 再 end。事件不带数据，值读 animatedValue。返回自己的 setter（setDuration 这些）
// 和属性两种写法都有。
//
// 这台手机的「动画时长缩放」要是 1（开发者选项里没改过），时长相关的断言才成立。

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

/** 下一帧（rAF 的时刻） @returns {Promise<number>} */
const nextFrame = () => new Promise((resolve) => { requestAnimationFrame(resolve); });

/** @param {import("../main.js").StepContext} ctx */
export async function stepAnimation(ctx) {
  const { assert } = ctx;
  const activity = application.activity;
  /** @type {any} 故意写错类型的地方用它 */
  let bad;

  // ===== 插值器 =====
  console.log('  --- 动画：插值器 ---');
  assert('BaseInterpolator 不能 new', thrown(() => new /** @type {any} */ (BaseInterpolator)()), 'TypeError');
  const linear = new LinearInterpolator();
  assert('LinearInterpolator 是 BaseInterpolator', linear instanceof BaseInterpolator, true);
  assert('Linear(0.25)', near(linear.getInterpolation(0.25), 0.25), true);
  assert('Accelerate() 是 t²', near(new AccelerateInterpolator().getInterpolation(0.5), 0.25), true);
  assert('Accelerate(2) 是 t⁴', near(new AccelerateInterpolator(2).getInterpolation(0.5), 0.0625), true);
  assert('Decelerate() 是 1-(1-t)²', near(new DecelerateInterpolator().getInterpolation(0.5), 0.75), true);
  assert('Decelerate(2)', near(new DecelerateInterpolator(2).getInterpolation(0.5), 0.9375), true);
  assert('AccelerateDecelerate(0.5)', near(new AccelerateDecelerateInterpolator().getInterpolation(0.5), 0.5), true);
  assert('AccelerateDecelerate(0.25)',
         near(new AccelerateDecelerateInterpolator().getInterpolation(0.25), Math.cos(1.25 * Math.PI) / 2 + 0.5), true);
  assert('Anticipate() 先往回走', near(new AnticipateInterpolator().getInterpolation(0.5), -0.125), true);
  assert('Anticipate(3)', near(new AnticipateInterpolator(3).getInterpolation(0.5), 0.25 * (2 - 3)), true);
  assert('Overshoot() 到 1 是 1', near(new OvershootInterpolator().getInterpolation(1), 1), true);
  assert('Overshoot(2) 中途超过 1', /** @type {number} */ (new OvershootInterpolator(2).getInterpolation(0.8)) > 1, true);
  assert('AnticipateOvershoot() 到 1 是 1', near(new AnticipateOvershootInterpolator().getInterpolation(1), 1), true);
  assert('AnticipateOvershoot(2, 1.5) 到 0 是 0', near(new AnticipateOvershootInterpolator(2, 1.5).getInterpolation(0), 0), true);
  assert('AnticipateOvershoot(3) 能建', new AnticipateOvershootInterpolator(3) instanceof BaseInterpolator, true);
  // Android 的弹跳曲线用的是近似常数（t × 1.1226，最后一段 8(t − 1.0435)² + 0.95），
  // 到 t = 1 不是正好 1，是 1.0000545（照 float 算）
  assert('Bounce(1) 照 Android 的公式是 1.0000545',
         near(new BounceInterpolator().getInterpolation(1), 1.0000545), true);
  assert('Cycle(1) 在 0.25 是 1', near(new CycleInterpolator(1).getInterpolation(0.25), 1), true);
  assert('Cycle 不给次数抛 TypeError', thrown(() => new /** @type {any} */ (CycleInterpolator)()), 'TypeError');
  const ease = new PathInterpolator(0.4, 0, 0.2, 1);
  assert('Path 三次贝塞尔 0 → 0', near(ease.getInterpolation(0), 0), true);
  assert('Path 三次贝塞尔 1 → 1', near(ease.getInterpolation(1), 1), true);
  assert('Path 三次贝塞尔 0.5 在 0.5 和 1 之间', (() => {
    const v = ease.getInterpolation(0.5);
    return v > 0.5 && v < 1;
  })(), true);
  assert('Path 二次贝塞尔（两个参数）', near(new PathInterpolator(0.5, 0.5).getInterpolation(0.3), 0.3), true);
  assert('Path 给三个参数抛 TypeError',
         thrown(() => new /** @type {any} */ (PathInterpolator)(0.1, 0.2, 0.3)), 'TypeError');
  assert('Path 给一个参数抛 TypeError', thrown(() => new /** @type {any} */ (PathInterpolator)(0.1)), 'TypeError');
  assert("Path 给 'x' 抛 TypeError", thrown(() => new PathInterpolator(/** @type {any} */ ('x'), 0)), 'TypeError');
  assert('Path 的曲线往回绕：Java 的异常', thrown(() => new PathInterpolator(2, 0, -1, 1)), 'IllegalArgumentException');
  assert("getInterpolation('x') 抛 TypeError", thrown(() => linear.getInterpolation(/** @type {any} */ ('x'))), 'TypeError');
  assert('getInterpolation() 不给参数抛 TypeError',
         thrown(() => /** @type {any} */ (linear).getInterpolation()), 'TypeError');
  assert("getInterpolation('0.5') 照 Number()", near(linear.getInterpolation(/** @type {any} */ ('0.5')), 0.5), true);
  class MyEase extends LinearInterpolator {}
  assert('插值器能在 JS 里继承（只在 JS 这一层）', new MyEase().getInterpolation(0.3) !== undefined, true);
  assert('不能用 JS 函数做插值器（只认原生的插值器）',
         thrown(() => { ValueAnimator.ofFloat(0, 1).interpolator = /** @type {any} */ ((t) => t); }), 'TypeError');

  // ===== ValueAnimator：写读 =====
  console.log('  --- 动画：ValueAnimator ---');
  assert('Animator 不能 new（抽象类）', thrown(() => new /** @type {any} */ (Animator)()), 'TypeError');
  const va = ValueAnimator.ofFloat(0, 100);
  assert('ofFloat 是 ValueAnimator', va instanceof ValueAnimator, true);
  assert('ValueAnimator 是 Animator', va instanceof Animator, true);
  assert('ValueAnimator 是 EventTarget', va instanceof EventTarget, true);
  assert('new ValueAnimator() 能建', new ValueAnimator() instanceof ValueAnimator, true);
  assert('duration 默认 300', va.duration, 300);
  assert('startDelay 默认 0', va.startDelay, 0);
  assert('repeatCount 默认 0', va.repeatCount, 0);
  assert("repeatMode 默认 'restart'", va.repeatMode, 'restart');
  assert('interpolator 默认是 AccelerateDecelerate', va.interpolator instanceof AccelerateDecelerateInterpolator, true);
  assert('isRunning 默认 false', va.isRunning, false);
  assert('isStarted 默认 false', va.isStarted, false);
  assert('isPaused 默认 false', va.isPaused, false);

  va.duration = 200;
  assert('duration 写 200', va.duration, 200);
  assert('setDuration 返回自己（能链式）', va.setDuration(250) === va, true);
  assert('setDuration(250) 之后', va.duration, 250);
  assert('duration 写负数：Java 的异常', thrown(() => { va.duration = -1; }), 'IllegalArgumentException');
  bad = 'long';
  assert("duration 写 'long' 抛 TypeError", thrown(() => { va.duration = bad; }), 'TypeError');
  va.startDelay = 30;
  assert('startDelay 写 30', va.startDelay, 30);
  va.startDelay = 0;
  va.repeatCount = 2;
  assert('repeatCount 写 2', va.repeatCount, 2);
  va.repeatCount = 'infinite';
  assert("repeatCount 写 'infinite'", va.repeatCount, 'infinite');
  bad = 'forever';
  assert('repeatCount 写错的名字：一条警告',
         warnings(() => { va.repeatCount = bad; }),
         '[Nacre] repeatCount has no value "forever"; expected one of: infinite, ignored');
  assert('repeatCount 写错之后值不变', va.repeatCount, 'infinite');
  assert("totalDuration 重复无限次是 'infinite'", va.totalDuration, 'infinite');
  va.repeatCount = 1;
  va.startDelay = 50;
  assert('totalDuration = startDelay + duration × (repeatCount + 1)', va.totalDuration, 550);
  va.startDelay = 0;
  va.repeatCount = 0;
  va.repeatMode = 'reverse';
  assert("repeatMode 写 'reverse'", va.repeatMode, 'reverse');
  bad = 'pingpong';
  assert('repeatMode 写错：一条警告',
         warnings(() => { va.repeatMode = bad; }),
         '[Nacre] repeatMode has no value "pingpong"; expected one of: restart / reverse, ignored');
  va.repeatMode = 'restart';

  va.interpolator = linear;
  assert('interpolator 写读是同一个', va.interpolator === linear, true);
  // Java 的 ValueAnimator.setInterpolator / setStartDelay 返回 void，不是链式的 setter，只有属性
  assert('ValueAnimator 没有 setInterpolator（只有属性）', 'setInterpolator' in va, false);
  assert('ValueAnimator 没有 setStartDelay（只有属性）', 'setStartDelay' in va, false);
  bad = {};
  assert('interpolator 给普通对象抛 TypeError', thrown(() => { va.interpolator = bad; }), 'TypeError');
  va.interpolator = null;
  assert('interpolator 写 null：Java 换成 LinearInterpolator', va.interpolator instanceof LinearInterpolator, true);
  va.interpolator = linear;

  va.setCurrentFraction(0.5);
  assert('setCurrentFraction(0.5) 之后 animatedValue（线性）', near(va.animatedValue, 50), true);
  assert('setCurrentFraction(0.5) 之后 animatedFraction', near(va.animatedFraction, 0.5), true);
  assert('setCurrentFraction(0.5) 之后 currentPlayTime', va.currentPlayTime, 125);
  va.currentPlayTime = 50;
  assert('currentPlayTime 写 50 之后 animatedFraction', near(va.animatedFraction, 0.2), true);
  assert('setCurrentFraction 给 NaN 抛 TypeError', thrown(() => va.setCurrentFraction(NaN)), 'TypeError');
  va.setFloatValues(10, 20);
  va.setCurrentFraction(1);
  assert('setFloatValues(10, 20) 之后到终点是 20', near(va.animatedValue, 20), true);
  assert('setFloatValues 不给值抛 TypeError', thrown(() => va.setFloatValues()), 'TypeError');
  assert("setFloatValues 有一个 'x' 抛 TypeError", thrown(() => va.setFloatValues(1, /** @type {any} */ ('x'))), 'TypeError');

  const vi = ValueAnimator.ofInt(0, 10);
  vi.interpolator = linear;
  vi.setCurrentFraction(0.5);
  assert('ofInt 的值是整数', vi.animatedValue, 5);
  vi.setIntValues(100, 200);
  vi.setCurrentFraction(1);
  assert('setIntValues 之后到终点', vi.animatedValue, 200);
  const vc = ValueAnimator.ofArgb('#000000', 'rgb(255, 255, 255)');
  vc.setCurrentFraction(0);
  assert('ofArgb 起点读出 CSS 颜色', vc.animatedValue, '#000000');
  vc.setCurrentFraction(1);
  assert('ofArgb 终点读出 CSS 颜色', vc.animatedValue, '#ffffff');
  vc.setCurrentFraction(0.5);
  assert('ofArgb 中途是颜色字符串', String(vc.animatedValue).startsWith('#'), true);
  assert('ofArgb 颜色写错抛 TypeError', thrown(() => ValueAnimator.ofArgb('#000000', 'nope')), 'TypeError');
  assert('ofFloat 不给值抛 TypeError', thrown(() => ValueAnimator.ofFloat()), 'TypeError');
  assert("ofInt 有一个 'x' 抛 TypeError", thrown(() => ValueAnimator.ofInt(1, /** @type {any} */ ('x'))), 'TypeError');

  // ===== 动画时长缩放 =====
  console.log('  --- 动画：动画时长缩放 ---');
  assert('ValueAnimator.durationScale 是 1（这台手机没改过）', ValueAnimator.durationScale, 1);
  assert('ValueAnimator.areAnimatorsEnabled()', ValueAnimator.areAnimatorsEnabled(), true);
  assert('durationScale 是只读的', thrown(() => { /** @type {any} */ (ValueAnimator).durationScale = 2; }), 'TypeError');
  const onScale = () => {};
  application.addEventListener('animatordurationscalechange', onScale);
  application.removeEventListener('animatordurationscalechange', onScale);
  assert('application 上能订、能摘 animatordurationscalechange', true, true);

  // ===== ValueAnimator：真的跑 =====
  console.log('  --- 动画：ValueAnimator 跑起来 ---');
  const run = ValueAnimator.ofFloat(0, 1);
  run.duration = 150;
  run.interpolator = linear;
  const runLog = record(run, ['start', 'end', 'cancel', 'repeat']);
  /** @type {number[]} */
  const values = [];
  const onUpdate = (/** @type {Event} */ e) => {
    values.push(/** @type {number} */ (run.animatedValue));
    if (values.length === 1) {
      assert('update 是普通的 Event', e.constructor === Event, true);
      assert('update 的 target 是 animator', e.target === run, true);
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
  assert('取消之后停在中途', /** @type {number} */ (run.animatedValue) < 1, true);

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

  // JS 不留变量的 animator：跑着的时候包装不丢，end 照样收得到
  /** @type {Promise<boolean>} */
  const anonymousEnded = new Promise((resolve) => {
    const a = ValueAnimator.ofFloat(0, 1);
    a.duration = 600;
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
  const screen = new LinearLayout(activity);
  screen.setPadding(48, 400, 48, 0);
  const box = new TextView(activity);
  box.text = '动起来';
  box.setBackgroundColor('#ffe0a0');
  box.setPadding(40, 40, 40, 40);
  screen.addView(box);
  activity.setContentView(screen);
  await sleep(300);

  const oa = ObjectAnimator.ofFloat(box, 'alpha', 1, 0.25);
  assert('ObjectAnimator 是 ValueAnimator', oa instanceof ValueAnimator, true);
  assert('target 是给的视图', oa.target === box, true);
  assert('propertyName', oa.propertyName, 'alpha');
  oa.interpolator = linear;
  oa.setCurrentFraction(1);
  assert('ObjectAnimator 改了视图的 alpha', near(box.alpha, 0.25), true);
  oa.propertyName = 'translationX';
  oa.setFloatValues(0, 80);
  oa.setCurrentFraction(1);
  assert('propertyName 改成 translationX 之后改的是它', near(box.translationX, 80), true);
  box.alpha = 1;
  box.translationX = 0;
  const other = new View(activity);
  oa.target = other;
  assert('target 换成另一个视图', oa.target === other, true);
  bad = {};
  assert('target 给普通对象抛 TypeError', thrown(() => { oa.target = bad; }), 'TypeError');
  assert('new ObjectAnimator() 能建', new ObjectAnimator() instanceof ObjectAnimator, true);
  assert('ObjectAnimator.ofFloat 目标是普通对象抛 TypeError',
         thrown(() => ObjectAnimator.ofFloat(/** @type {any} */ ({}), 'alpha', 1)), 'TypeError');
  assert('ObjectAnimator.ofFloat 不给值抛 TypeError', thrown(() => ObjectAnimator.ofFloat(box, 'alpha')), 'TypeError');
  oa.setAutoCancel(true);
  assert('setAutoCancel 能调', true, true);

  const oi = ObjectAnimator.ofInt(box, 'scrollY', 0, 30);
  oi.interpolator = linear;
  oi.setCurrentFraction(1);
  assert('ofInt 改了视图的 scrollY', box.scrollY, 30);
  box.scrollY = 0;
  const oc = ObjectAnimator.ofArgb(box, 'backgroundColor', '#ff0000', '#0000ff');
  oc.setCurrentFraction(1);
  const boxBg = box.background;
  assert('ofArgb 改了背景色', boxBg instanceof ColorDrawable ? boxBg.color : null, '#0000ff');
  assert('不存在的属性：Java 只打日志，不抛',
         thrown(() => { ObjectAnimator.ofFloat(box, 'nope', 0, 1).setDuration(10).start(); }), '没抛');

  const oaRun = ObjectAnimator.ofFloat(box, 'rotation', 0, 90);
  oaRun.duration = 150;
  const oaEnded = once(oaRun, 'end', 3000);
  oaRun.start();
  assert('ObjectAnimator 跑完收到 end', await oaEnded, true);
  assert('跑完视图转到 90 度', near(box.rotation, 90), true);
  box.rotation = 0;

  // ===== ViewPropertyAnimator：view.animate() =====
  console.log('  --- 动画：view.animate() ---');
  const a = box.animate();
  assert('animate() 是 ViewPropertyAnimator', a instanceof ViewPropertyAnimator, true);
  assert('同一个视图每次拿到的是同一个', box.animate() === a, true);
  assert('ViewPropertyAnimator 不能 new', thrown(() => new /** @type {any} */ (ViewPropertyAnimator)()), 'TypeError');
  assert('duration 默认 300', a.duration, 300);
  assert('startDelay 默认 0', a.startDelay, 0);
  assert('interpolator 默认是 AccelerateDecelerate', a.interpolator instanceof AccelerateDecelerateInterpolator, true);
  a.duration = 200;
  assert('duration 写 200', a.duration, 200);
  assert('setDuration 返回自己', a.setDuration(150) === a, true);
  assert('setStartDelay 返回自己', a.setStartDelay(0) === a, true);
  assert('setInterpolator 返回自己', a.setInterpolator(linear) === a, true);
  assert('interpolator 写读是同一个', a.interpolator === linear, true);
  assert('setDuration 负数：Java 的异常', thrown(() => a.setDuration(-5)), 'IllegalArgumentException');
  assert('withLayer 返回自己', a.withLayer() === a, true);
  a.cancel();
  /** @type {(keyof ViewPropertyAnimator)[]} */
  const chainNames = ['alpha', 'alphaBy', 'translationX', 'translationXBy', 'translationY', 'translationYBy',
    'translationZ', 'translationZBy', 'x', 'xBy', 'y', 'yBy', 'z', 'zBy', 'scaleX', 'scaleXBy',
    'scaleY', 'scaleYBy', 'rotation', 'rotationBy', 'rotationX', 'rotationXBy', 'rotationY', 'rotationYBy'];
  for (const name of chainNames) {
    const method = /** @type {any} */ (a)[name];
    assert(name + '() 返回自己', typeof method === 'function' && method.call(a, 0) === a, true);
  }
  a.cancel();
  assert("alpha('x') 抛 TypeError", thrown(() => a.alpha(/** @type {any} */ ('x'))), 'TypeError');
  assert('alpha() 不给参数抛 TypeError', thrown(() => /** @type {any} */ (a).alpha()), 'TypeError');
  assert('不接 withEndAction（用 end 事件）', 'withEndAction' in a, false);
  assert('不接 withStartAction（用 start 事件）', 'withStartAction' in a, false);
  assert('不接 setListener（用事件）', 'setListener' in a, false);
  assert('不接 setUpdateListener（用 update 事件）', 'setUpdateListener' in a, false);

  box.alpha = 1;
  box.translationX = 0;
  await sleep(50);
  const vpaLog = record(a, ['start', 'end', 'cancel']);
  let vpaUpdates = 0;
  a.addEventListener('update', () => { vpaUpdates++; });
  const vpaEnded = once(a, 'end', 3000);
  a.alpha(0.5).translationX(100).setDuration(150);
  assert('等到 end', await vpaEnded, true);
  assert('事件 start、end', vpaLog.join(','), 'start,end');
  assert('一路收到好几次 update', vpaUpdates > 2, true);
  assert('结束之后 alpha 到了 0.5', near(box.alpha, 0.5), true);
  assert('结束之后 translationX 到了 100', near(box.translationX, 100), true);
  const byEnded = once(a, 'end', 3000);
  a.translationXBy(50).start();
  await byEnded;
  assert('translationXBy(50) 在原来的基础上加', near(box.translationX, 150), true);

  vpaLog.length = 0;
  const longEnded = once(a, 'end', 5000);
  a.rotation(180).setDuration(2000).start();
  await sleep(150);
  a.cancel();
  assert('取消之后收到 end', await longEnded, true);
  assert('取消：start、cancel、end', vpaLog.join(','), 'start,cancel,end');
  assert('取消之后停在中途', box.rotation > 0 && box.rotation < 180, true);

  // ===== requestAnimationFrame =====
  console.log('  --- 动画：requestAnimationFrame ---');
  assert('requestAnimationFrame 在全局', typeof requestAnimationFrame, 'function');
  assert('cancelAnimationFrame 在全局', typeof cancelAnimationFrame, 'function');
  assert('requestAnimationFrame 不给参数抛 TypeError',
         thrown(() => /** @type {any} */ (requestAnimationFrame)()), 'TypeError');
  assert('requestAnimationFrame 给字符串抛 TypeError',
         thrown(() => requestAnimationFrame(/** @type {any} */ ('x'))), 'TypeError');
  assert('cancelAnimationFrame 不认识的编号不抛', thrown(() => cancelAnimationFrame(987654)), '没抛');
  assert('cancelAnimationFrame(undefined) 不抛', thrown(() => /** @type {any} */ (cancelAnimationFrame)()), '没抛');

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
  const t0 = stamps[0] ?? 0;
  assert('时刻是数', typeof t0, 'number');
  assert('时刻和 performance.now() 同一个起点（不晚于回调执行的那一刻）', t0 <= nowInCallback, true);
  assert('时刻和 performance.now() 同一个起点（相差不到 100 毫秒）', nowInCallback - t0 < 100, true);

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
  box.alpha = 1;
  for (let i = 1; i <= 10; i++) {
    const t = await nextFrame();
    box.translationY = i * 5;
    if (i === 10) assert('rAF 里改的视图属性读得回来', near(box.translationY, 50), true);
    void t;
  }
}
