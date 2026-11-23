// Android 上验收的入口。现在只验 Web 标准那一批（core/builtin 里两端共用的内置脚本）：
// console、Event / EventTarget、DOMException 和几个 Web 的事件类、URL / URLSearchParams /
// Headers、定时器和微任务、performance、crypto、TextEncoder / TextDecoder / atob / btoa /
// structuredClone。
//
// 步骤从 acceptance/src/steps/ 拷过来，去掉了要 application、原生类、网络、Intl 的部分；
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
import { stepTimers } from './steps/timers.js';
import { stepPerformance } from './steps/performance.js';
import { stepSlice } from './steps/slice.js';
import { stepInheritance } from './steps/inheritance.js';

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
run('stepTimers', () => stepTimers(ctx));
run('stepPerformance', () => stepPerformance(ctx));

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
sliceDone.then(() => { setTimeout(tick, 1000); });
