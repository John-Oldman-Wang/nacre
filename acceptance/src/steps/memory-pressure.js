// 内存警告：系统喊内存不够时，JS 的 memorywarning 监听器先执行，然后运行时让
// V8 回收一次——监听器里刚放掉的对象，这一次就收掉。
//
// 系统的内存警告由示例原生模块发（它在原生那边发一次和模拟器菜单里
// Simulate Memory Warning 一样的通知），自动跑的验收不用人去点。
//
// 盯三件事：
//   - 事件照常到：一次、target 是 application、不能取消
//   - 只被监听器里的缓存拿着的对象，警告之后被回收了。这期间不制造任何分配
//     压力，所以回收只能是内存警告引起的
//   - 先后：监听器执行的时候对象还在（V8 在监听器之后才回收）
//
// 回收用 FinalizationRegistry 看，不用 WeakRef：deref() 会把目标保到这一轮任务
// 结束（见 support.js 的 collectGarbage）。清理回调是平台队列里的任务，要有原生
// 事件进来的那一轮才带它，所以等的时候每 50 毫秒写一次本地存储

/** @param {import("../main.js").StepContext} ctx */
export function stepMemoryPressure(ctx) {
  const { assert } = ctx;
  const example = application.nativeModules.get('example');
  if (example === null) {
    assert('内存警告：示例模块在', false, true);
    return Promise.resolve();
  }

  let collected = false;
  const registry = new FinalizationRegistry(() => { collected = true; });
  /** @type {object[]} */
  const cache = [];
  (() => {
    const cached = { payload: new Array(1000).fill('cached') };
    registry.register(cached, 'cached');
    cache.push(cached);
  })();

  let events = 0;
  /** @type {Event | null} */
  let seen = null;
  let cachedDuringListener = -1;
  const onWarning = (/** @type {Event} */ e) => {
    events++;
    seen = e;
    cachedDuringListener = cache.length;
    // App 该做的：扔掉能重新得到的东西
    cache.length = 0;
  };
  application.addEventListener('memorywarning', onWarning);

  // 先让这一轮任务过去，再发警告：注册和放进缓存都在这一轮里
  return new Promise((resolve) => { setTimeout(resolve, 0); }).then(() => {
    example.call('simulateMemoryWarning');
    const { storage } = application;
    const tickKey = 'nacre.acceptance.memoryTick';
    const noop = () => {};
    storage.addEventListener('change', noop);
    const t0 = performance.now();
    let tick = 0;
    return new Promise((resolve) => {
      const step = () => {
        if (registry === null) return;
        if ((collected && events > 0) || performance.now() - t0 > 3000) {
          storage.removeEventListener('change', noop);
          storage.remove(tickKey);
          resolve(undefined);
          return;
        }
        storage.set(tickKey, tick++);
        setTimeout(step, 50);
      };
      setTimeout(step, 50);
    });
  }).then(() => {
    application.removeEventListener('memorywarning', onWarning);
    const event = /** @type {Event | null} */ (seen);
    assert('内存警告：memorywarning 到了一次', events, 1);
    assert('内存警告：target 是 application', event !== null && event.target === application, true);
    assert('内存警告：不能取消', event !== null && event.cancelable, false);
    assert('内存警告：监听器执行时缓存里的对象还在', cachedDuringListener, 1);
    assert('内存警告：监听器放掉的对象，警告之后 3 秒内被回收了', collected, true);
  });
}
