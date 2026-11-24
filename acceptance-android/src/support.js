// 拷自 acceptance/src/support.js，只留了断言和计数（assert、assertStats），去掉了自定义事件、
// GC 和枚举属性那几个助手；另外加了 runCase，拷自 acceptance/src/steps/intl-number-cases.js 的 intlRunCase。
//
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

// 跑一个取结果的函数，结果写成字符串；抛了写成「抛 <name>」。
// 拷自 intlRunCase，函数体没改：Web 全局那一步的固定期望值都是照这个格式写的
/**
 * @param {() => unknown} fn
 * @returns {string}
 */
export function runCase(fn) {
  try {
    var r = fn();
    return typeof r === 'string' ? r : JSON.stringify(r);
  } catch (e) {
    return '抛 ' + (e && e.name);
  }
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
