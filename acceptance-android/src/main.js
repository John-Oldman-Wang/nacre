// Android 上验收的入口。现在只验 Web 标准那一批（core/builtin 里两端共用的内置脚本）：
// console、Event / EventTarget、DOMException 和几个 Web 的事件类、URL / URLSearchParams /
// Headers、定时器和微任务、performance、crypto、TextEncoder / TextDecoder / atob / btoa /
// structuredClone、fetch / Request / Response（含 response.body 的流）/ Blob / AbortController、
// Intl.NumberFormat / Intl.DateTimeFormat / toLocale*String / String.prototype.normalize。
//
// 步骤从 acceptance/src/steps/ 拷过来，去掉了要 application、原生类、网页（WebView）的部分；
// 留下的断言名字和期望值和 iOS 一字不差。每个文件第一行写着去掉了什么。
//
// 输出的格式和 iOS 一样：一条断言一行（「  ✓ 名字 = 值」「  ✗ 名字 = …」），全部跑完
// 打一行「[acceptance] done {…}」。
//
// 打包：npm run build  →  build/main.js（iife，classic script）

// —— 顶层：作为副作用导入，在脚本顶层执行 ——
import './steps/console-basics.js';

import { assert, assertStats } from './support.js';
import { stepUrl } from './steps/url.js';
import { stepCrypto } from './steps/crypto.js';
import { stepEvents } from './steps/events.js';
import { stepErrors } from './steps/errors.js';
import { stepWebGlobals } from './steps/web-globals.js';
import { stepIntlNumber } from './steps/intl-number.js';
import { stepIntlDate } from './steps/intl-date.js';
import { stepNormalize } from './steps/normalize.js';
import { stepTimers } from './steps/timers.js';
import { stepPerformance } from './steps/performance.js';
import { stepFetch } from './steps/fetch.js';
import { stepFetchStream } from './steps/fetch-stream.js';
import { stepSlice } from './steps/slice.js';
import { stepInheritance } from './steps/inheritance.js';
import { stepSafeArea, watchSafeArea } from './steps/safe-area.js';
import { stepWebSocket } from './steps/websocket.js';

/**
 * 各步共享的上下文。这一批只用得到断言。
 *
 * @typedef {object} StepContext
 * @property {typeof assert} assert 断言
 */

/** @type {StepContext} */
const ctx = { assert };

// 每一步包一层：一步中途抛了，记一条失败，后面的步骤照常跑
/** @param {string} name @param {() => unknown} fn */
const run = (name, fn) => {
  try {
    fn();
  } catch (err) {
    console.log('  ✗ 步骤 ' + name + ' 中途抛了，它后面的断言没跑: ' +
                (err instanceof Error ? err.message : String(err)));
  }
};

// 先跑全是同步断言的，再跑有异步部分的
run('stepUrl', () => stepUrl(ctx));
run('stepCrypto', () => stepCrypto(ctx));
run('stepEvents', () => stepEvents(ctx));
run('stepErrors', () => stepErrors(ctx));
run('stepWebGlobals', () => stepWebGlobals(ctx));
// Intl 三步：iOS 上排在最后，是因为那三张和网页的比对要占主线程十几秒。这里只剩固定期望值的
// 断言，全是同步的，排在定时器那一步前面：要做的原生调用在定时器开始量时刻之前就做完了
run('stepIntlNumber', () => stepIntlNumber(ctx));
run('stepIntlDate', () => stepIntlDate(ctx));
run('stepNormalize', () => stepNormalize(ctx));
run('stepTimers', () => stepTimers(ctx));
run('stepPerformance', () => stepPerformance(ctx));
// WebSocket 的异步部分各自等（和 iOS 一样不交出「做完了」），最长 10 秒一段，靠结束标记前的「5 秒没有新断言」兜着
run('stepWebSocket', () => stepWebSocket(ctx));

// 安全区域要在 onCreate 这一刻就订阅（窗口挂上时的第一次分发要接住），放在最前面
try {
  watchSafeArea();
} catch (err) {
  console.log('  ✗ watchSafeArea 中途抛了: ' + (err instanceof Error ? err.message : String(err)));
}

// 竖切要等两次点击，自己交出「做完了」，结束标记等它
/** @type {Promise<unknown>} */
const sliceDone = (async () => {
  try {
    await stepSlice(ctx);
  } catch (err) {
    console.log('  ✗ 步骤 stepSlice 中途抛了，它后面的断言没跑: ' +
                (err instanceof Error ? err.message : String(err)));
  }
  try {
    await stepInheritance(ctx);
  } catch (err) {
    console.log('  ✗ 步骤 stepInheritance 中途抛了，它后面的断言没跑: ' +
                (err instanceof Error ? err.message : String(err)));
  }
  try {
    await stepSafeArea(ctx);
  } catch (err) {
    console.log('  ✗ 步骤 stepSafeArea 中途抛了，它后面的断言没跑: ' +
                (err instanceof Error ? err.message : String(err)));
  }
})();

// 网络那两步不碰界面，和上面那条链并行跑；两步之间先后跑：fetch-stream 里有量时刻、
// 量背压的断言，fetch 那一步有量并发耗时的断言，各自跑的时候不让对方的流量掺进来
// （iOS 上这两步也从来不同时跑）。本机测试服务那一半要 runner 先起服务、做 adb reverse
/** @type {Promise<unknown>} */
const networkDone = (async () => {
  try {
    await stepFetch(ctx);
  } catch (err) {
    console.log('  ✗ 步骤 stepFetch 中途抛了，它后面的断言没跑: ' +
                (err instanceof Error ? err.message : String(err)));
  }
  try {
    await stepFetchStream(ctx);
  } catch (err) {
    console.log('  ✗ 步骤 stepFetchStream 中途抛了，它后面的断言没跑: ' +
                (err instanceof Error ? err.message : String(err)));
  }
})();

// 全部跑完之后打一行结束标记，外面的 runner 等的就是它。和 iOS 一样：
// 连续 5 秒没有新的断言算跑完，每秒看一次
let seen = assertStats().asserts;
let calm = 0;
const tick = () => {
  const now = assertStats().asserts;
  calm = now === seen ? calm + 1 : 0;
  seen = now;
  if (calm < 5) { setTimeout(tick, 1000); return; }
  console.log('[acceptance] done ' + JSON.stringify(assertStats()));
};
Promise.allSettled([sliceDone, networkDone]).then(() => { setTimeout(tick, 1000); });
