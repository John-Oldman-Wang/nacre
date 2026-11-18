// performance.now()：高精度的单调时钟。

/** @param {import("../main.js").StepContext} ctx */
export function stepPerformance(ctx) {
  const { assert } = ctx;
  // ===== performance =====
  //
  // Date.now() 只有毫秒精度，而且用户改系统时间它会跳。量一段代码花了多久
  // 要用这个。
  console.log('--- performance ---');

  assert('performance 是 Performance 的实例', performance instanceof Performance, true);
  try {
    // @ts-expect-error 构造函数是私有的
    new Performance();
    console.log('  ✗ Performance 居然能 new');
  } catch (err) {
    console.log('  ✓ Performance 不能 new:', err.message);
  }

  const a = performance.now();
  assert('now() 是数', typeof a, 'number');
  assert('now() 大于 0（零点是运行时启动）', a > 0, true);
  // 启动到这里不该超过一分钟。超了说明零点取错了（比如取成了开机时间）
  assert('now() 是从启动算起的，不是从开机算起的', a < 60000, true);

  // 单调：连读 1000 次，一次都不许倒退
  let prev = a;
  let backwards = 0;
  let fractional = 0;
  for (let i = 0; i < 1000; i++) {
    const t = performance.now();
    if (t < prev) backwards += 1;
    if (t !== Math.floor(t)) fractional += 1;
    prev = t;
  }
  assert('连读 1000 次没有倒退', backwards, 0);
  assert('精度高于毫秒（读数带小数）', fractional > 0, true);
  console.log('  实测：连读 1000 次共 ' + (prev - a).toFixed(3) + ' ms，平均每次 ' +
              ((prev - a) * 1000 / 1000).toFixed(2) + ' µs');

  // timeOrigin + now() 应该就是现在。两个时钟不同源，给 50 ms 的余量
  assert('timeOrigin 是数', typeof performance.timeOrigin, 'number');
  const drift = Math.abs(performance.timeOrigin + performance.now() - Date.now());
  assert('timeOrigin + now() 约等于 Date.now()（差 50 ms 以内）', drift < 50, true);
  assert('toJSON 给出 timeOrigin',
         JSON.stringify(performance) === JSON.stringify({ timeOrigin: performance.timeOrigin }),
         true);
  try {
    // @ts-expect-error 只读
    performance.timeOrigin = 1;
    console.log('  ✗ timeOrigin 居然能写');
  } catch (err) {
    console.log('  ✓ timeOrigin 只读:', err instanceof TypeError);
  }

  // 和定时器对一下：等 50 ms，量出来不该少于 50
  const started = performance.now();
  setTimeout(() => {
    const elapsed = performance.now() - started;
    assert('setTimeout(50) 之后量到的时间不少于 50 ms', elapsed >= 50, true);
    console.log('  实测：setTimeout(50) 实际过了 ' + elapsed.toFixed(3) + ' ms');
  }, 50);
}
