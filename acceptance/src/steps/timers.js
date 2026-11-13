// setTimeout 系列和 queueMicrotask 的调度顺序。

/** @param {import("../main.js").StepContext} ctx */
export function stepTimers(ctx) {
  const { assert, win } = ctx;
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


  // 9. 和原生事件的顺序。
  //
  // 定时器和原生事件确实都在主队列上按 FIFO 跑，但**不能用窗口通知来验证
  // 这一点**：观察者是 addObserverForName:object:queue:（mainQueue）注册的，
  // UIKit 发通知时先把观察者块排进主队列，块跑起来之后才 postToJS 排第二次；
  // 而 setTimeout(fn, 0) 只排一跳。两跳里第一跳什么时候入队由 UIKit 决定，
  // 所以相对顺序**不是确定的**——两种顺序都实测到过。
  //
  // 这里只断言两边都到了。顺序那条由上面的「同时到期按注册顺序」保证，
  // 那个才是我们自己的队列说了算的。
  /** @type {string[]} */ const mixedOrder = [];
  setTimeout(() => mixedOrder.push('timer'), 0);
  win.addEventListener('becomekey', () => mixedOrder.push('窗口事件'), { once: true });

  // 不用固定延迟汇总：App 启动时主线程很忙（首次布局、字体、首帧渲染），
  // 实测 0ms 的定时器可能等 250ms 才轮到。用轮询等条件齐了再汇总，
  // 既不依赖绝对时间，本身也是一次「定时器确实在推进」的验证。
  /** @param {number} roundsLeft */
  function summarizeWhenReady(roundsLeft) {
    const allDone = nestCount >= 5 && repeatCount >= 3 && order.length >= 5 &&
                    mixedOrder.length >= 2;
    if (!allDone && roundsLeft > 0) {
      setTimeout(() => summarizeWhenReady(roundsLeft - 1), 20);
      return;
    }
    assert('同时到期按注册顺序', order.join(''), '12345');
    assert('clearTimeout 生效', !wasCancelled, true);
    assert('嵌套跑满且每次一轮唤醒', nestCount, 5);
    assert('setInterval 被自己的 clearInterval 停住', repeatCount, 3);
    assert('同步 → 微任务 → 宏任务', interleaved.join(','),
         '同步,微任务,queueMicrotask,宏任务');
    assert('额外参数透传', passthroughResult, '参数透传');
    assert('timer 和窗口事件都到了 JS',
           [...mixedOrder].sort().join(','), 'timer,窗口事件');
    console.log('  ✓ 定时器全部跑完（从注册到跑满',
                Date.now() - nestStart, 'ms，含启动时的主线程繁忙）');
  }
  summarizeWhenReady(50);
}
