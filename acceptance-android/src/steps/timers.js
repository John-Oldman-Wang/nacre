// 拷自 acceptance/src/steps/timers.js，去掉了第 9 段：定时器和窗口事件（becomekey）的先后。
//
// setTimeout 系列和 queueMicrotask 的调度顺序。

/** @param {import("../main.js").StepContext} ctx */
export function stepTimers(ctx) {
  const { assert } = ctx;
  // ===== 定时器 =====
  console.log('  --- 定时器 ---');

  // 1. 同时到期必须按注册顺序（HTML 规范要求，也是我们自己管堆的理由）
  /** @type {number[]} */ const order = [];
  for (let i = 1; i <= 5; i++) setTimeout(() => order.push(i), 30);

  // 2. 取消
  let wasCancelled = false;
  const toCancel = setTimeout(() => { wasCancelled = true; }, 30);
  clearTimeout(toCancel);
  clearTimeout(toCancel);        // 重复取消不该炸
  clearTimeout(999999);          // 不认识的 id 静默忽略

  // 3. 嵌套不饿死：每一次都该落在不同轮唤醒上
  let nestCount = 0;
  const nestStart = Date.now();
  setTimeout(function again() {
    if (++nestCount < 5) setTimeout(again, 0);
  }, 0);

  // 4. setInterval + clearInterval
  let repeatCount = 0;
  const repeater = setInterval(() => {
    if (++repeatCount >= 3) clearInterval(repeater);
  }, 10);

  // 4b. 间隔是 0 的 setInterval 也要重复。
  //
  // 引擎原来拿「间隔大于 0」当「要不要重复」的判断，于是 setInterval(fn, 0)
  // 只执行一次就没了，而且不报错——从 Web 搬来的「尽快反复执行直到条件满足」
  // 那种轮询会静默地只跑一次。
  let zeroCount = 0;
  // 第一次回调里另外注册一个 0 延迟的定时器，记下它轮到的时候重复定时器跑了
  // 几次。它得在重复定时器跑完之前就轮到——说明 0 间隔的重复**每次都回一趟
  // 队列**，不是在一次唤醒里连发（那样别的任务插不进来）。
  let zeroCountWhenOtherRan = -1;
  const zeroRepeater = setInterval(() => {
    zeroCount++;
    if (zeroCount === 1) setTimeout(() => { zeroCountWhenOtherRan = zeroCount; }, 0);
    if (zeroCount >= 5) clearInterval(zeroRepeater);
  }, 0);
  // 不写间隔等于 0（undefined、负数、NaN 都被规范化成 0），同样要重复
  let omittedCount = 0;
  const omittedRepeater = setInterval(() => {
    if (++omittedCount >= 3) clearInterval(omittedRepeater);
  });

  // 5. 宏任务 / 微任务的交错顺序，经典用例
  /** @type {string[]} */ const interleaved = [];
  setTimeout(() => interleaved.push('宏任务'), 0);
  Promise.resolve().then(() => interleaved.push('微任务'));
  queueMicrotask(() => interleaved.push('queueMicrotask'));
  interleaved.push('同步');

  // 6. 额外参数透传
  /** @type {string | null} */ let passthroughResult = null;
  setTimeout((a, b) => { passthroughResult = a + b; }, 0, '参数', '透传');

  // 7. 非函数参数要抛
  // @ts-expect-error 第一个参数必须是函数
  try { setTimeout(123, 0); console.log('  ✗ 非函数居然通过'); }
  catch (err) { console.log('  ✓ setTimeout 拒绝非函数:', err.constructor.name); }


  // 不用固定延迟汇总：App 启动时主线程很忙（首次布局、字体、首帧渲染），
  // 实测 0ms 的定时器可能等 250ms 才轮到。用轮询等条件齐了再汇总，
  // 既不依赖绝对时间，本身也是一次「定时器确实在推进」的验证。
  /** @param {number} roundsLeft */
  function summarizeWhenReady(roundsLeft) {
    const allDone = nestCount >= 5 && repeatCount >= 3 && order.length >= 5 &&
                    zeroCount >= 5 && omittedCount >= 3 &&
                    zeroCountWhenOtherRan >= 0;
    if (!allDone && roundsLeft > 0) {
      setTimeout(() => summarizeWhenReady(roundsLeft - 1), 20);
      return;
    }
    assert('同时到期按注册顺序', order.join(''), '12345');
    assert('clearTimeout 生效', !wasCancelled, true);
    assert('嵌套跑满且每次一轮唤醒', nestCount, 5);
    assert('setInterval 被自己的 clearInterval 停住', repeatCount, 3);
    assert('setInterval(fn, 0) 也重复，并且停得住', zeroCount, 5);
    assert('0 间隔的重复每次都回一趟队列（别的定时器插得进来）',
           zeroCountWhenOtherRan >= 1 && zeroCountWhenOtherRan < 5, true);
    assert('不写间隔的 setInterval 也重复，并且停得住', omittedCount, 3);
    assert('同步 → 微任务 → 宏任务', interleaved.join(','),
         '同步,微任务,queueMicrotask,宏任务');
    assert('额外参数透传', passthroughResult, '参数透传');
    console.log('  ✓ 定时器全部跑完（从注册到跑满',
                Date.now() - nestStart, 'ms，含启动时的主线程繁忙）');
  }
  summarizeWhenReady(50);
}
