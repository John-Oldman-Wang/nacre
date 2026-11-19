---
type: reference
status: partial
---

# 定时器

**定时器**是一组全局函数，用来在一段时间之后执行回调，或者每隔一段时间重复执行回调。[`setTimeout()`](timers/settimeout.md) 在指定的延迟之后执行一次回调；[`setInterval()`](timers/setinterval.md) 每隔一段时间执行一次回调，直到被取消；[`clearTimeout()`](timers/cleartimeout.md) 和 [`clearInterval()`](timers/clearinterval.md) 取消还没执行的回调；[`queueMicrotask()`](timers/queuemicrotask.md) 把一个回调安排在当前这段代码结束之后立刻执行，它不计时。

这五个函数任何时候都能用，包括脚本顶层。延迟的单位是毫秒。

怎么延迟执行、怎么轮询、怎么用 `await` 等一段时间，见指南[延迟和重复执行代码](../guides/timers.md)。

## 函数

| 函数 | 说明 |
| --- | --- |
| [`setTimeout()`](timers/settimeout.md) | 延迟之后执行一次回调，返回定时器的编号 |
| [`setInterval()`](timers/setinterval.md) | 每隔一段时间执行一次回调，返回定时器的编号 |
| [`clearTimeout()`](timers/cleartimeout.md) | 取消一个定时器 |
| [`clearInterval()`](timers/clearinterval.md) | 取消一个定时器。和 `clearTimeout()` 可以互换 |
| [`queueMicrotask()`](timers/queuemicrotask.md) | 在当前这段代码结束之后立刻执行回调 |

## 延迟是下限，不是准点

回调不会早于指定的延迟执行，但可能晚。JS 和界面共用一个线程（见[运行时怎么工作](how-it-works.md)），延迟到了之后，回调要等正在执行的 JS、界面的布局和绘制结束才轮到。

- **延迟没有最小值。** `setTimeout(fn, 0)` 表示「当前代码结束后尽快执行」，不会被加长到某个固定的毫秒数。
- **实际等了多久取决于当时有多忙。** App 启动期间实测，`setTimeout(fn, 0)` 等了 253 毫秒才执行：那段时间系统在做首次布局、加载字体、绘制第一帧。`setTimeout(fn, 50)` 实测过的时间不少于 50 毫秒。
- **延迟不是数时按 0 处理。** 负数、`NaN`、不传、转不成数的值（比如 `'abc'`）都等于 0。`'100'` 这样的字符串会转成 100。

所以不要用固定的延迟去等另一件事完成。要等一件事，就监听它的事件，或者隔一段时间检查一次，见[等一个条件成立](../guides/timers.md#等一个条件成立)。

要知道实际过了多久，用 [`performance.now()`](performance/now.md) 量。

## 回调的执行顺序

- **延迟相同的定时器按注册的先后执行。** 先调用 `setTimeout()` 的那个先执行。
- **`queueMicrotask()` 和 `Promise` 的回调先于任何定时器。** 它们在当前这段代码结束后立刻执行，`setTimeout(fn, 0)` 排在它们后面。
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

定时器的回调抛出异常时，App 不会退出，其他定时器照常执行。`setInterval()` 的回调抛出异常后，下一次仍然会按时执行。

这个异常由 [`application`](application.md) 的 `error` 事件报告。没有监听器取消它时，控制台输出一条以 `Uncaught` 开头的错误日志。`queueMicrotask()` 的回调例外，见 [`queueMicrotask()`](timers/queuemicrotask.md)。

## App 进入后台之后

App 进入后台一小段时间后会被系统暂停，暂停期间 JS 不执行，定时器的回调也不执行。回到前台后，已经过了时间的定时器会怎样执行（立刻补上一次，还是重新计时），**未在模拟器验证**。「后台会被暂停」来自 iOS 的定义，同样**未在模拟器验证**。

需要知道 App 在后台停留了多久时，不要靠 `setInterval()` 计数。在 `application` 的 `background` 事件里用 `Date.now()` 记下时刻，回到前台时再读一次，两者相减。

## 示例

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

## 和 Web 的差别

这五个函数的名字和参数与浏览器里的相同。下面列出行为不同的地方。

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| 返回值 | 数 | 数。不是 Node 的 `Timeout` 对象，没有 `unref()` 这类方法 |
| 嵌套多层的 `setTimeout(fn, 0)` | 延迟被加长到至少 4 毫秒 | 不加长 |
| `setInterval(fn, 0)` | 重复，间隔被加长到至少 4 毫秒（Node 是 1 毫秒） | 重复，间隔不加长：每次回调之后回一次队列 |
| `setTimeout('代码字符串', 0)` | 把字符串当代码执行 | 抛 `TypeError` |
| 页面在后台时 | 定时器被降低频率 | App 被系统暂停，定时器不执行。**未在模拟器验证** |
| 单个回调执行过久 | 没有提示 | 超过 50 毫秒在控制台输出警告 |
| `queueMicrotask()` 的回调抛出异常 | 由 `error` 事件报告 | 由 `unhandledrejection` 事件报告 |
| `requestAnimationFrame` | 有 | 没有。用 [`CADisplayLink`](ca-animation.md) |

## 还不能做的

| 想做的事 | 状态 |
| --- | --- |
| 每帧回调一次（`requestAnimationFrame`） | 没有这个函数。用 [`CADisplayLink`](ca-animation.md) |
| 让定时器在 App 进入后台后继续执行 | 未实现。对应 iOS 的后台任务（`beginBackgroundTask`） |
| 给回调分优先级 | 未实现 |
| `setImmediate` | 没有。用 `setTimeout(fn, 0)` |

## 参见

- [延迟和重复执行代码](../guides/timers.md)：延迟执行、轮询、`await` 等一段时间、等一个条件成立
- [`performance`](performance.md)：量实际过了多久
- [`CADisplayLink`](ca-animation.md)：和屏幕刷新同步的每帧回调
- [`application`](application.md)：`error` 事件报告回调里的异常；`background` 和 `foreground` 事件
- [运行时怎么工作](how-it-works.md)：JS 和界面在同一个线程上，大量计算怎么拆开
