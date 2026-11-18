// 各步共用的支撑函数。

/** @param {unknown} value */
const show = (value) => {
  try { return String(value); } catch { return '（写不成字符串的值）'; }
};

/** @param {unknown} value */
const kind = (value) => (value === null ? 'null' : typeof value);

// 这一遍一共断言了多少条、其中失败多少条。入口在全部步骤跑完之后把它打进
// 结束标记里（见 main.js），外面的 runner 靠那一行知道「跑完了」
let asserted = 0;
let failed = 0;
export const assertStats = () => ({ asserts: asserted, failed });

// 断言要能失败：只打印数值的「用例」给不了任何保证。
//
// 比的是**严格相等**：类型不同不算相等，两个对象只有是同一个才算相等。
// 以前比的是两边写成字符串之后相不相等，于是 assert(label, 1, '1') 通过，
// assert(label, { a: 1 }, { a: 2 }) 也通过（两边都是 '[object Object]'）。
// 要比内容的，在调用的地方写清楚比什么：数组用 join(',')，对象挑字段，
// 故意按字符串比的写 String(x)。
/**
 * @param {string} label
 * @param {unknown} actual
 * @param {unknown} expected
 */
export function assert(label, actual, expected) {
  // NaN 和 NaN 算相等（=== 不这么认）；0 和 -0 算相等（Object.is 不这么认）
  const passed = actual === expected ||
                 (typeof actual === 'number' && typeof expected === 'number' &&
                  Number.isNaN(actual) && Number.isNaN(expected));
  asserted++;
  if (passed) {
    console.log('  ✓ ' + label + ' = ' + show(actual));
    return;
  }
  failed++;
  // 两边写出来一样却没通过：只说「期望 1」看不出哪里不对，把原因写出来
  let why = '';
  if (show(actual) === show(expected)) {
    why = kind(actual) !== kind(expected)
      ? '；写出来一样，类型不同：得到的是 ' + kind(actual) + '，期望的是 ' + kind(expected)
      : '；写出来一样，但不是同一个对象';
  }
  console.log('  ✗ ' + label + ' = ' + show(actual) + '（期望 ' + show(expected) + why + '）');
}

// 在一个对象上用一个它没有的事件名走一遍自定义事件：能注册、自己派发收得到、
// 摘掉之后收不到。原生对象上不认识的事件名不拒绝，当自定义事件，和浏览器里的
// EventTarget 一样（2026-11-17 定；在这之前是注册时抛 TypeError）
/**
 * @param {EventTarget} target
 * @param {string} name
 * @returns {string} 全对是「收到一次」
 */
export function customEventWorks(target, name) {
  let got = 0;
  const listener = () => { got++; };
  const loose = /** @type {any} */ (target);
  try {
    loose.addEventListener(name, listener);
    loose.dispatchEvent(new Event(name));
    loose.removeEventListener(name, listener);
    loose.dispatchEvent(new Event(name));
  } catch (err) {
    return '抛了：' + (err instanceof Error ? err.message : String(err));
  }
  return got === 1 ? '收到一次' : '收到 ' + got + ' 次';
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
// 有几次 collectGarbage 还没结算。要占主线程的重活（Intl 那两步的比对）看这个数，
// 等它是 0 再开始：GC 的检查靠的是「这段时间里没人大量分配」，旁边有人干重活，
// 它不是失败就是报未验证
let garbageProbes = 0;
export const garbageProbesInFlight = () => garbageProbes;

/**
 * @param {number} [limitMs]
 * @returns {Promise<boolean>}
 */
export function collectGarbage(limitMs = 10000) {
  garbageProbes++;
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
        garbageProbes--;
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

/** 枚举属性写错之后应该得到的结果，配合 enumIgnored 用。 */
export const ENUM_IGNORED = '值不变，警告 1 条';

/**
 * 枚举属性写了不认识的值（2026-11-17 定的规矩）：不抛，打一条警告，值保持不变。
 * 做一次写入，把实际发生的事写成一句话；一切照规矩时正好是 ENUM_IGNORED。
 * @param {() => void} write 做那次写入
 * @param {() => unknown} read 读这个属性
 * @returns {string}
 */
export function enumIgnored(write, read) {
  /** @param {unknown} v */
  const show = (v) => (Array.isArray(v) ? '[' + v.join(',') + ']' : String(v));
  const before = show(read());
  /** @type {string[]} */
  const warnings = [];
  const original = console.warn;
  console.warn = (...args) => { warnings.push(args.map(String).join(' ')); };
  try {
    write();
  } catch (err) {
    return '抛了 ' + (err instanceof Error ? err.name + ': ' + err.message : String(err)).slice(0, 90);
  } finally {
    console.warn = original;
  }
  const after = show(read());
  const relevant = warnings.filter((w) => w.includes('expected one of'));
  return (after === before ? '值不变' : '值变成了 ' + after + '（原来是 ' + before + '）') +
         '，警告 ' + relevant.length + ' 条';
}
