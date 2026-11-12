// 各步共用的支撑函数。

// 断言要能失败：只打印数值的「用例」给不了任何保证
/**
 * @param {string} label
 * @param {unknown} actual
 * @param {unknown} expected
 */
export function assert(label, actual, expected) {
  const passed = String(actual) === String(expected);
  console.log((passed ? '  ✓ ' : '  ✗ ') + label + ' = ' + actual +
              (passed ? '' : '（期望 ' + expected + '）'));
}

// 逼出一次完整的 GC，并且等清理回调跑过。返回对照组有没有被回收——没有就
// 说明 GC 没跑到，调用方该报「未验证」，不能当通过。
//
// 三件事都是量出来的（见 docs/internals/network.md）：
//   - FinalizationRegistry 的回调要等**完整** GC，只造小对象触发不了。大块
//     类型数组记在堆外内存上，每拍 96 MB 逼得出来
//   - 回调是 V8 平台队列里的任务，只在原生事件进来的那一轮之后才执行，
//     定时器那一轮不带它。所以每拍写一次本地存储，让 change 事件来带
//   - 不能用 WeakRef 轮询当对照组：deref() 会把目标保到这一轮任务结束
/**
 * @param {number} [limitMs]
 * @returns {Promise<boolean>}
 */
export function collectGarbage(limitMs = 10000) {
  return new Promise((resolve) => {
    const { storage } = application;
    const tickKey = 'nacre.acceptance.gcTick';
    const noop = () => {};
    let collected = false;
    let extra = 0;
    const registry = new FinalizationRegistry(() => { collected = true; });
    (() => { registry.register({}, 0); })();
    storage.addEventListener('change', noop);
    const t0 = performance.now();
    let tick = 0;
    const step = () => {
      // registry 要有人拿着：它自己被回收了，回调就永远不来
      if (registry === null) return;
      // 对照组的回调跑了，别的登记表的回调可能排在后面几轮：再带几拍
      if (collected) extra++;
      if (extra > 6 || performance.now() - t0 > limitMs) {
        storage.removeEventListener('change', noop);
        storage.remove(tickKey);
        resolve(collected);
        return;
      }
      if (!collected) {
        for (let i = 0; i < 24; i++) new Uint8Array(4 << 20);
        for (let i = 0; i < 20; i++) {
          /** @type {object[]} */ const junk = [];
          for (let j = 0; j < 3000; j++) junk.push({ i, j, s: 'x'.repeat(16) + j });
        }
      }
      storage.set(tickKey, tick++);
      setTimeout(step, 50);
    };
    // 第一拍也排到下一轮任务里，不在调用方这一轮里跑。调用方常常刚对某个
    // WeakRef 调过 deref()，目标在那一轮任务里是被保住的；第一拍就逼出 GC
    // 的话，对照组被回收了、被测的对象没有，之后也不会再有第二次 GC
    setTimeout(step, 0);
  });
}
