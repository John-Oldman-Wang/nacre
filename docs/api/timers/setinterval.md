---
type: reference
---

# `setInterval()` 全局函数

**`setInterval()`** 全局函数每隔一段时间执行一次回调，直到被取消。

## 语法

```
setInterval(handler)
setInterval(handler, delay)
setInterval(handler, delay, ...args)
```

### 参数

**`handler`**

每次执行的函数。不接受一段代码的字符串。

**`delay`** <small>可选</small>

间隔，单位是毫秒，可以带小数。默认 0。负数、`NaN`、不传、转不成数的值都等于 0。

**`...args`** <small>可选</small>

每次原样传给 `handler` 的参数。

### 返回值

数，这个定时器的编号，是从 1 开始递增的整数。交给 [`clearInterval()`](clearinterval.md) 用。

### 异常

**`TypeError`**

`handler` 不是函数：`setInterval: the first argument must be a function`。

## 说明

**节奏**：下一次的时刻按「上一次应该执行的时刻加间隔」算，回调自己花的时间不会让节奏逐渐后移。落后超过一个间隔时（比如前面有一段很久的 JS），不会连续补上错过的次数，而是从当前时刻重新开始计时。

**回调抛出异常**：下一次仍然会按时执行。异常由 [`application`](../application.md) 的 `error` 事件报告。

**不等上一次的异步操作**：到时间就执行，不管上一次回调发起的异步操作有没有结束。回调里要等异步结果时，用链式的 `setTimeout()`，见[定期执行一个异步任务](../../guides/timers.md#定期执行一个异步任务)。

**间隔是 0**：照样重复。`delay` 是 0、不写、或者是被当作 0 的值时，回调每执行完一次就回到队列末尾，等排在它前面的事件和界面刷新处理完再执行下一次。间隔没有最小值，不会被加长到某个固定的毫秒数。

> **注意**：间隔是 0 的 `setInterval()` 会让主线程一直在运行，直到被 `clearInterval()` 取消：模拟器上实测每秒执行约 19 万到 29 万次回调。耗电多少没有量过。它不会让界面停住：同一次实测里，一条 0 延迟的 `setTimeout()` 链连续跑着的 2 秒里界面刷新了 120 帧（不跑时是 124 帧），按钮点得动，系统切换深浅色的事件照常收到。这组数字**未在真机测量**。要每帧执行一次用 [`CADisplayLink`](../ca-animation.md)；要等一个条件成立，给一个实际的间隔，见[等一个条件成立](../../guides/timers.md#等一个条件成立)。

## 示例

```js
let count = 0;
const id = setInterval(() => {
  count += 1;
  console.log('第 ' + count + ' 次');
  if (count >= 3) clearInterval(id);
}, 100);
```

**结果**：输出 `第 1 次`、`第 2 次`、`第 3 次`，然后停止。

## 和 Web 的差别

- `setInterval(fn, 0)`：浏览器把间隔加长到至少 4 毫秒（Node 是 1 毫秒），这里不加长，每次回调之后回一次队列。
- 返回值是数，不是 Node 的 `Timeout` 对象。
- 单个回调执行超过 50 毫秒时，这里在控制台输出警告。
- App 进入后台后被系统暂停，回调不执行。**未在模拟器验证。**

## 参见

- [`clearInterval()`](clearinterval.md)：取消
- [`setTimeout()`](settimeout.md)：只执行一次
