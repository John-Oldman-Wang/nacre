// Android 上验收的入口。Web 标准那一批（core/builtin 里两端共用的内置脚本）：
// console、Event / EventTarget、DOMException 和几个 Web 的事件类、URL / URLSearchParams /
// Headers、定时器和微任务、performance、crypto、TextEncoder / TextDecoder / atob / btoa /
// structuredClone、fetch / Request / Response（含 response.body 的流）/ Blob / AbortController、
// Intl.NumberFormat / Intl.DateTimeFormat / toLocale*String / String.prototype.normalize。
// 再加上页面和视图的基础：竖切、JS 层的继承、安全区域、自由和挂上的视图树。
//
// Web 标准的步骤从 acceptance/src/steps/ 拷过来，去掉了要 application、原生类、网页（WebView）的部分；
// 留下的断言名字和期望值和 iOS 一字不差。每个文件第一行写着去掉了什么。
//
// 页面那几步在 application 的 activitycreate 里开始：运行时在 App 的进程启动时建、执行 main.js，
// 页面是之后系统建的，建好时运行时发 activitycreate，页面从事件里拿。最后一步把页面关掉再打开，
// 新页面也从 activitycreate 拿，main.js 不再跑。
//
// 视图那几组（外观、布局、文字、图片、触摸和手势、滚动、动画）和 App 层都照「接类的总则」
// （docs/project.md 第 4 节）写的，跑在页面那几步后面。
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
import { stepSlice, onActivityCreate } from './steps/slice.js';
import { stepInheritance } from './steps/inheritance.js';
import { stepSafeArea, watchSafeArea } from './steps/safe-area.js';
import { stepTree } from './steps/tree.js';
import { stepActivityLifecycle } from './steps/activity-lifecycle.js';
import { stepWebSocket } from './steps/websocket.js';
import { stepLayout } from './steps/layout.js';
import { stepAppearance } from './steps/appearance.js';
import { stepText } from './steps/text.js';
import { stepTouch } from './steps/touch.js';
import { stepScroll } from './steps/scroll.js';
import { stepAnimation } from './steps/animation.js';
import { stepApp, watchApp } from './steps/app.js';
import { stepImage } from './steps/image.js';
import { stepErrorEvents } from './steps/error-events.js';

/**
 * 各步共享的上下文。页面那几步还要页面（从 activitycreate 拿到的）。
 *
 * @typedef {object} StepContext
 * @property {typeof assert} assert 断言
 * @property {Activity} [activity] 页面
 */

/** @type {StepContext} */
const ctx = { assert };

// main.js 的顶层跑完了没有：第一个 activitycreate 要在它之后来
let topLevelFinished = false;

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

/** @param {string} name @param {() => Promise<unknown>} fn */
const runAsync = async (name, fn) => {
  try {
    await fn();
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

// ===== 页面：等 activitycreate =====
// main.js 顶层执行时页面还没交给 JS
run('activities', () => {
  const list = application.activities;
  assert('main.js 顶层执行时 application.activities 是空数组', Array.isArray(list) && list.length === 0, true);
});

// 页面建好时运行时当场派发，页面的 onCreate 刚跑完、第一帧之前。安全区域要在这一刻就订阅
// （窗口挂上时的第一次分发要接住）；App 层的 start、resume 也要在这一刻订阅。
// 只收第一个页面：关了再开的那个交给页面那几步的最后一步
/** @type {Promise<Activity | null>} */
const created = new Promise((resolve) => {
  const timer = setTimeout(() => resolve(null), 5000);
  application.addEventListener('activitycreate', (e) => {
    clearTimeout(timer);
    assert('第一个 activitycreate 在 main.js 的顶层跑完之后才来', topLevelFinished, true);
    const activity = /** @type {ActivityEvent} */ (e).activity;
    run('onActivityCreate', () => onActivityCreate(/** @type {ActivityEvent} */ (e)));
    run('watchSafeArea', () => watchSafeArea(activity));
    run('watchApp', () => watchApp(activity));
    resolve(activity);
  }, { once: true });
});

// 页面那几步要等点击，自己交出「做完了」，结束标记等它
/** @type {Promise<unknown>} */
const sliceDone = (async () => {
  const activity = await created;
  assert('5 秒内收到了 activitycreate', activity !== null, true);
  if (activity === null) return;
  ctx.activity = activity;
  await runAsync('stepSlice', () => stepSlice(ctx));
  await runAsync('stepInheritance', () => stepInheritance(ctx));
  await runAsync('stepSafeArea', () => stepSafeArea(ctx));
  // 树这一步会改手机的显示密度（脚本退出时还原），放在页面那几步的最后
  await runAsync('stepTree', () => stepTree(ctx));
  // 按返回把页面关掉、再打开，之后 ctx.activity 是新页面
  await runAsync('stepActivityLifecycle', () => stepActivityLifecycle(ctx));
  await runAsync('stepLayout', () => stepLayout(ctx));
  await runAsync('stepAppearance', () => stepAppearance(ctx));
  await runAsync('stepText', () => stepText(ctx));
  await runAsync('stepTouch', () => stepTouch(ctx));
  await runAsync('stepImage', () => stepImage(ctx));
  // 滚动和动画两步都会改手机的设置（显示密度、动画时长缩放），脚本退出时还原
  await runAsync('stepScroll', () => stepScroll(ctx));
  await runAsync('stepAnimation', () => stepAnimation(ctx));
})();

// 网络那两步不碰界面，和上面那条链并行跑；两步之间先后跑：fetch-stream 里有量时刻、
// 量背压的断言，fetch 那一步有量并发耗时的断言，各自跑的时候不让对方的流量掺进来
// （iOS 上这两步也从来不同时跑）。本机测试服务那一半要 runner 先起服务、做 adb reverse
/** @type {Promise<unknown>} */
const networkDone = (async () => {
  await runAsync('stepFetch', () => stepFetch(ctx));
  await runAsync('stepFetchStream', () => stepFetchStream(ctx));
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
// App 层会离开 App（打开浏览器），最后还把页面关掉、带着网址打开一个新页面，等点击和网络都跑完再跑
// 全局错误出口那一步会故意抛几个没接住的异常，放在最后，不和别的步骤掺在一起
Promise.allSettled([sliceDone, networkDone]).then(async () => {
  await runAsync('stepApp', () => stepApp(ctx));
  await runAsync('stepErrorEvents', () => stepErrorEvents(ctx));
}).then(() => { setTimeout(tick, 1000); });

topLevelFinished = true;
