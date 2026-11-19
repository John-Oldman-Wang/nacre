# 延迟和重复执行代码

这一篇讲怎么用[定时器](../api/timers.md)延迟执行代码、重复执行代码、在 `async` 函数里等一段时间、等一个条件成立。每个函数的细节在[定时器](../api/timers.md)的参考页。

## 推荐的做法

- **周期性的任务，回调里只做同步的事时用 `setInterval()`；回调里要等异步结果时用链式的 `setTimeout()`。** `setInterval()` 到时间就执行，不管上一次回调发起的异步操作有没有结束。回调里发网络请求时，请求比间隔慢，就会同时有几个请求在进行。链式的写法是等上一次做完，再安排下一次，见[定期执行一个异步任务](#定期执行一个异步任务)。
- **不要用固定的延迟去等另一件事完成。** 延迟是下限，实际等多久取决于当时有多忙：App 启动期间实测，`setTimeout(fn, 0)` 等了 253 毫秒才执行。要等一件事，就监听它的事件，或者隔一段时间检查一次，见[等一个条件成立](#等一个条件成立)。
- **做动画不要用定时器。** 定时器的回调和屏幕刷新不同步。每帧都要更新的内容用 [`CADisplayLink`](../api/ca-animation.md)，它在每一帧回调一次。
- **量时间不要靠定时器的次数。** `setInterval(fn, 1000)` 执行了 60 次不代表过了 60 秒。用 [`performance.now()`](../api/performance/now.md) 读两次相减。
- **算 App 在后台停留了多久，不要靠 `setInterval()` 计数。** App 在后台会被系统暂停，定时器不执行。在 [`application`](../api/application.md) 的 `background` 事件里用 `Date.now()` 记下时刻，回到前台时再读一次，两者相减。

## 第一个例子

下面的代码做一个倒计时：每秒输出一次剩余秒数，数到 0 时停止。它不需要界面，直接写在 `main.js` 顶层就能运行。

```js
// 1. 用时钟算剩余时间，不靠回调的次数
const total = 5000;                       // 毫秒
const startedAt = performance.now();

// 2. 每秒检查一次
const timer = setInterval(() => {
  const left = total - (performance.now() - startedAt);

  if (left <= 0) {
    // 3. 到时间了，停掉定时器
    clearInterval(timer);
    console.log('时间到');
    return;
  }
  console.log('还剩 ' + Math.ceil(left / 1000) + ' 秒');
}, 1000);
```

**结果**：控制台每隔约 1 秒输出一行，从 `还剩 4 秒` 开始递减，最后输出 `时间到`，之后不再输出。每一行的间隔不保证正好是 1000 毫秒。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

## 延迟执行一次

```js
setTimeout(() => {
  console.log('1 秒过去了');
}, 1000);
```

**结果**：至少 1000 毫秒之后，控制台输出一行。

## 取消还没执行的回调

```js
const pending = setTimeout(() => {
  console.log('不会输出');
}, 1000);

clearTimeout(pending);
clearTimeout(pending);
```

**结果**：没有任何输出。重复取消、取消一个已经执行过的定时器，都不报错。

## 重复执行，在回调里停掉自己

```js
let count = 0;
const repeating = setInterval(() => {
  count += 1;
  console.log('第 ' + count + ' 次');
  if (count >= 3) clearInterval(repeating);
}, 100);
```

**结果**：输出 `第 1 次`、`第 2 次`、`第 3 次`，然后停止。

## 给回调传参数

```js
setTimeout((a, b) => {
  console.log(a + b);
}, 0, '参数', '透传');
```

**结果**：输出 `参数透传`。延迟后面的参数会原样传给回调。

## 用 `await` 等一段时间

定时器是回调式的。要在 `async` 函数里等，包一层 `Promise`：

```js
/** @param {number} ms */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('开始');
  await sleep(500);
  console.log('500 毫秒之后');
}
run();
```

**结果**：先输出 `开始`，至少 500 毫秒后输出 `500 毫秒之后`。

## 定期执行一个异步任务

等上一次做完，再安排下一次：

```js
/** @type {number | undefined} */
let pollTimer;

async function poll() {
  try {
    const res = await fetch('https://example.com/status');
    console.log('状态', res.status);
  } catch (err) {
    console.log('这次没取到');
  }
  // 上一次结束之后，再等 5 秒开始下一次
  pollTimer = setTimeout(poll, 5000);
}
poll();

// 不再需要时
function stopPolling() {
  clearTimeout(pollTimer);
}
```

**结果**：每次请求结束后隔 5000 毫秒发下一次，任何时刻最多有一个请求在进行。调 `stopPolling()` 之后不再发。**这段代码未在模拟器验证。**

## 等一个条件成立

不知道一件事什么时候完成、它又没有事件可以监听时，隔一段时间检查一次，并设一个放弃的期限：

```js
/**
 * @param {() => boolean} ready
 * @param {number} timeoutMs
 * @returns {Promise<boolean>}
 */
function waitUntil(ready, timeoutMs) {
  const deadline = performance.now() + timeoutMs;
  return new Promise((resolve) => {
    function check() {
      if (ready()) { resolve(true); return; }
      if (performance.now() >= deadline) { resolve(false); return; }
      setTimeout(check, 50);
    }
    check();
  });
}

let loaded = false;
setTimeout(() => { loaded = true; }, 300);

waitUntil(() => loaded, 5000).then((ok) => {
  console.log(ok ? '等到了' : '超时');
});
```

**结果**：约 300 毫秒后输出 `等到了`。条件在 5000 毫秒内一直不成立时输出 `超时`。**这个例子未在模拟器验证。**

检查的间隔要给一个实际的值（这里是 50 毫秒）。间隔是 0 的 `setInterval()` 会让主线程一直在运行，见 [`setInterval()`](../api/timers/setinterval.md#说明)。

## 看清几种回调的先后

```js
setTimeout(() => console.log('setTimeout'), 0);
Promise.resolve().then(() => console.log('Promise'));
queueMicrotask(() => console.log('queueMicrotask'));
console.log('同步');
```

**结果**：依次输出 `同步`、`Promise`、`queueMicrotask`、`setTimeout`。

`setTimeout(fn, 0)` 和同一时刻发生的系统事件谁先到，实测两种顺序都出现过。要保证先后，就在事件的回调里做后面那一步，不要靠定时器去排。

## 参见

- [定时器](../api/timers.md)：五个函数和它们的执行规则
- [`performance`](../api/performance.md)：量实际过了多久
- [`CADisplayLink`](../api/ca-animation.md)：和屏幕刷新同步的每帧回调
- [运行时怎么工作](../api/how-it-works.md)：大量计算怎么拆开，不让界面停住
