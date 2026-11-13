---
type: reference
status: partial
---

# 定时器

**`setTimeout`** 在指定的延迟之后执行一次回调。**`setInterval`** 每隔一段时间执行一次回调，直到被取消。**`clearTimeout`** 和 **`clearInterval`** 取消还没执行的回调。**`queueMicrotask`** 把一个回调安排在当前这段代码结束之后立刻执行，它不计时。

这五个都是全局函数，延迟的单位是毫秒。

## 延迟是下限，不是准点

回调不会早于指定的延迟执行，但可能晚。JS 和界面共用一个线程（见[运行时怎么工作](how-it-works.md)），延迟到了之后，回调要等正在执行的 JS、界面的布局和绘制结束才轮到。

- **延迟没有最小值。** `setTimeout(fn, 0)` 表示「当前代码结束后尽快执行」，不会被加长到某个固定的毫秒数。
- **实际等了多久取决于当时有多忙。** App 启动期间实测，`setTimeout(fn, 0)` 等了 253 毫秒才执行：那段时间系统在做首次布局、加载字体、绘制第一帧。`setTimeout(fn, 50)` 实测过的时间不少于 50 毫秒。
- **延迟不是数时按 0 处理。** 负数、`NaN`、不传、转不成数的值（比如 `'abc'`）都等于 0。`'100'` 这样的字符串会转成 100。

所以不要用固定的延迟去等另一件事完成。要等一件事，就监听它的事件，或者像[等一个条件成立](#等一个条件成立)那样隔一段时间检查一次。

要知道实际过了多久，用 [`performance.now()`](performance.md) 量。

## 回调的执行顺序

- **延迟相同的定时器按注册的先后执行。** 先调用 `setTimeout` 的那个先执行。
- **`queueMicrotask` 和 `Promise` 的回调先于任何定时器。** 它们在当前这段代码结束后立刻执行，`setTimeout(fn, 0)` 排在它们后面。
- **回调里新注册的定时器等下一轮。** 在定时器的回调里再调 `setTimeout(fn, 0)`，新的回调不会紧接着执行，而是排到下一轮，中间界面有机会刷新和响应触摸。所以回调里反复给自己注册 0 毫秒的定时器不会让界面停止响应。
- **定时器和系统事件之间没有固定的先后。** `setTimeout(fn, 0)` 和同一时刻发生的系统事件（比如窗口的 `becomekey`）谁先到，实测两种顺序都出现过。要保证先后，就在事件的回调里做后面那一步，不要靠定时器去排。

## 回调执行得太久

一个回调从开始到结束是连续执行的，运行时不会中途打断它。这期间屏幕不刷新，触摸也不被处理。

单个回调执行超过 50 毫秒时，运行时在控制台输出一条警告，报出实际用了多少毫秒：

```
Timer callback blocked the main thread for 83 ms; this frame will drop
```

回调仍然会执行完，警告只是让这件事可见。看到它，就把那个回调里的工作拆成几块，每块放进一个 `setTimeout(fn, 0)`，做法见[运行时怎么工作](how-it-works.md)。

同一时刻有很多个定时器到期时，运行时连续执行回调累计约 8 毫秒后会停下，剩下的到期回调推到下一轮，中间界面可以刷新。这个上限只在两个回调之间检查，管不了单个回调自己执行多久。

## 回调里抛出异常

定时器的回调抛出异常时，App 不会退出，其他定时器照常执行。`setInterval` 的回调抛出异常后，下一次仍然会按时执行。

这个异常由 [`application`](application.md) 的 `error` 事件报告。没有监听器取消它时，控制台输出一条以 `Uncaught` 开头的错误日志。

## App 进入后台之后

App 进入后台一小段时间后会被系统暂停，暂停期间 JS 不执行，定时器的回调也不执行。回到前台后，已经过了时间的定时器会怎样执行（立刻补上一次，还是重新计时），**未在模拟器验证**。「后台会被暂停」来自 iOS 的定义，同样**未在模拟器验证**。

需要知道 App 在后台停留了多久时，不要靠 `setInterval` 计数。在 `application` 的 `background` 事件里用 `Date.now()` 记下时刻，回到前台时再读一次，两者相减。

## 推荐的做法

**周期性的任务，回调里只做同步的事时用 `setInterval`；回调里要等异步结果时用链式的 `setTimeout`。**

`setInterval` 到时间就执行，不管上一次回调发起的异步操作有没有结束。回调里发网络请求时，请求比间隔慢，就会同时有几个请求在进行。链式的写法是等上一次做完，再安排下一次：

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

**做动画不要用定时器。** 定时器的回调和屏幕刷新不同步。每帧都要更新的内容用 [`CADisplayLink`](ca-animation.md)，它在每一帧回调一次。

**量时间不要靠定时器的次数。** `setInterval(fn, 1000)` 执行了 60 次不代表过了 60 秒。用 `performance.now()` 读两次相减。

## 完整例子

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

## 常见用法

### 延迟执行一次

```js
setTimeout(() => {
  console.log('1 秒过去了');
}, 1000);
```

**结果**：至少 1000 毫秒之后，控制台输出一行。

### 取消还没执行的回调

```js
const id = setTimeout(() => {
  console.log('不会输出');
}, 1000);

clearTimeout(id);
clearTimeout(id);
```

**结果**：没有任何输出。重复取消、取消一个已经执行过的定时器，都不报错。

### 重复执行，在回调里停掉自己

```js
let count = 0;
const id = setInterval(() => {
  count += 1;
  console.log('第 ' + count + ' 次');
  if (count >= 3) clearInterval(id);
}, 100);
```

**结果**：输出 `第 1 次`、`第 2 次`、`第 3 次`，然后停止。

### 给回调传参数

```js
setTimeout((a, b) => {
  console.log(a + b);
}, 0, '参数', '透传');
```

**结果**：输出 `参数透传`。延迟后面的参数会原样传给回调。

### 用 `await` 等一段时间

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

### 等一个条件成立

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

### 看清几种回调的先后

```js
setTimeout(() => console.log('setTimeout'), 0);
Promise.resolve().then(() => console.log('Promise'));
queueMicrotask(() => console.log('queueMicrotask'));
console.log('同步');
```

**结果**：依次输出 `同步`、`Promise`、`queueMicrotask`、`setTimeout`。

### 延迟相同时的先后

```js
setTimeout(() => console.log('A'), 10);
setTimeout(() => console.log('B'), 10);
```

**结果**：先输出 `A`，再输出 `B`。

## 成员说明

### `setTimeout(handler, delay?, ...args)`

延迟之后执行一次 `handler`。

- **参数**：`handler` 是函数。`delay` 是延迟，单位是毫秒，可以带小数，默认 0。`args` 是传给 `handler` 的参数。
- **返回值**：数，这个定时器的编号，是从 1 开始递增的整数。交给 `clearTimeout` 用。
- **出错**：`handler` 不是函数时抛 `TypeError: setTimeout: the first argument must be a function`。不接受一段代码的字符串。

### `setInterval(handler, delay?, ...args)`

每隔 `delay` 毫秒执行一次 `handler`，直到被取消。

- **参数**：同 `setTimeout`。
- **返回值**：数，定时器的编号。交给 `clearInterval` 用。
- **出错**：`handler` 不是函数时抛 `TypeError: setInterval: the first argument must be a function`。
- **节奏**：下一次的时刻按「上一次应该执行的时刻加间隔」算，回调自己花的时间不会让节奏逐渐后移。落后超过一个间隔时（比如前面有一段很久的 JS），不会连续补上错过的次数，而是从当前时刻重新开始计时。

> **注意**：`setInterval` 的间隔要大于 0。间隔是 0（或者被当作 0 的值）时，回调只执行一次就不再重复。这是读代码得出的，**未在模拟器验证**；它和这个函数应有的行为不一致，已经记为运行时的问题。

### `clearTimeout(id)` / `clearInterval(id)`

取消一个定时器。两个函数可以互换：`clearTimeout` 能取消 `setInterval` 建的定时器，反过来也一样。

- **参数**：`id` 是 `setTimeout` 或 `setInterval` 返回的编号。
- **返回值**：无。
- 编号不存在、定时器已经执行过或已经取消过、不传参数或传 `null`，都不报错，什么也不做。
- 在 `setInterval` 的回调里取消它自己，这一次回调照常执行完，之后不再执行。

### `queueMicrotask(callback)`

把 `callback` 安排在当前这段代码结束之后立刻执行，先于任何定时器、先于界面刷新。它和 `Promise.resolve().then(callback)` 的时机相同。

- **参数**：`callback` 是函数，调用时不带参数。
- **返回值**：无。
- **出错**：`callback` 不是函数时抛 `TypeError: queueMicrotask: the argument must be a function`。
- `callback` 里抛出的异常由 `application` 的 `unhandledrejection` 事件报告，不是 `error` 事件。
- 不能取消。
- 在 `callback` 里不断再调 `queueMicrotask`，这些回调会一个接一个地执行，中间界面没有机会刷新。需要让出执行机会时用 `setTimeout(fn, 0)`。

## 和浏览器的对照

这五个函数的名字和参数与浏览器里的相同。下面列出行为不同的地方。

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| 返回值 | 数 | 数。不是 Node 的 `Timeout` 对象，没有 `unref()` 这类方法 |
| 嵌套多层的 `setTimeout(fn, 0)` | 延迟被加长到至少 4 毫秒 | 不加长 |
| `setTimeout('代码字符串', 0)` | 把字符串当代码执行 | 抛 `TypeError` |
| 页面在后台时 | 定时器被降低频率 | App 被系统暂停，定时器不执行。**未在模拟器验证** |
| 单个回调执行过久 | 没有提示 | 超过 50 毫秒在控制台输出警告 |
| `queueMicrotask` 的回调抛出异常 | 由 `error` 事件报告 | 由 `unhandledrejection` 事件报告 |
| `requestAnimationFrame` | 有 | 没有。用 [`CADisplayLink`](ca-animation.md) |

## 还不能做的

| 想做的事 | 状态 |
| --- | --- |
| 每帧回调一次（`requestAnimationFrame`） | 没有这个函数。用 [`CADisplayLink`](ca-animation.md) |
| 让定时器在 App 进入后台后继续执行 | 未实现。对应 iOS 的后台任务（`beginBackgroundTask`） |
| 给回调分优先级 | 未实现 |
| `setImmediate` | 没有。用 `setTimeout(fn, 0)` |

## 参见

- [`performance`](performance.md)：量实际过了多久
- [`CADisplayLink`](ca-animation.md)：和屏幕刷新同步的每帧回调
- [`application`](application.md)：`error` 事件报告回调里的异常；`background` 和 `foreground` 事件
- [运行时怎么工作](how-it-works.md)：JS 和界面在同一个线程上，大量计算怎么拆开
