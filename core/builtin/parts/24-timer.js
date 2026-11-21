// 定时器和 performance
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const { define, native } = ctx;

  function normalizeDelay(value) {
    const ms = Number(value);
    return Number.isFinite(ms) && ms > 0 ? ms : 0;
  }
  function addTimer(handler, delay, args, repeats, who) {
    if (typeof handler !== 'function') {
      throw new TypeError(who + ': the first argument must be a function');
    }
    // 额外参数透传是标准行为：setTimeout(fn, 0, a, b) 会用 (a, b) 调 fn
    const callback = args.length === 0 ? handler : () => handler(...args);
    return native.addTimer(callback, normalizeDelay(delay), repeats);
  }

  define(globalThis, 'setTimeout', function setTimeout(handler, delay, ...args) {
    return addTimer(handler, delay, args, false, 'setTimeout');
  });
  define(globalThis, 'setInterval', function setInterval(handler, delay, ...args) {
    return addTimer(handler, delay, args, true, 'setInterval');
  });
  // id 不认识时静默忽略，和 Web 一致
  define(globalThis, 'clearTimeout', function clearTimeout(id) {
    if (id != null) native.removeTimer(Number(id) | 0);
  });
  define(globalThis, 'clearInterval', function clearInterval(id) {
    if (id != null) native.removeTimer(Number(id) | 0);
  });
  // 不是定时器，是微任务——排在当前任务的微任务检查点里，不等下一轮。
  // 同样是生态假设存在的东西。
  define(globalThis, 'queueMicrotask', function queueMicrotask(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('queueMicrotask: the argument must be a function');
    }
    Promise.resolve().then(callback);
  });

  // ---- performance ----
  //
  // 上层 API，Web 原样：Node、Deno、浏览器都有这个全局。只做 now() 和
  // timeOrigin——mark / measure 那一组 JS 自己写得出来。
  //
  // 时钟在引擎的 C++ 里（steady_clock），不依赖 iOS。零点是引擎建出来的
  // 那一刻，早于任何一行 JS
  const perfTimeOrigin = native.timeOrigin();
  let allowPerformance = false;
  class Performance {
    constructor() {
      if (!allowPerformance) throw new TypeError('Illegal constructor');
    }
    // 毫秒，带小数。只能拿来算差值：它不是日期
    now() { return native.now(); }
    // now() 的零点对应的 Unix 毫秒时间戳
    get timeOrigin() { return perfTimeOrigin; }
    toJSON() { return { timeOrigin: perfTimeOrigin }; }
  }
  allowPerformance = true;
  const performance = new Performance();
  allowPerformance = false;
  define(globalThis, 'Performance', Performance);
  define(globalThis, 'performance', performance);

  // ---- crypto ----
  //
  // 上层 API，Web 原样。只有随机数这两个：getRandomValues 和 randomUUID。
  // crypto.subtle（摘要、签名）是另一步。
  //
  // 随机源在原生（SecRandomCopyBytes）。这里只做 Web 规定的那几项检查，
  // 以及 UUID 的拼装——它就是 16 个随机字节改 6 个位

})
