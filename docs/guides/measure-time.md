# 量一段代码花了多久

这一篇讲怎么用 [`performance.now()`](../api/performance/now.md) 量一段代码、一次请求、一个定时器实际花了多久，以及什么时候该用 `Date.now()`。细节在 [`Performance`](../api/performance.md) 的参考页。

## 推荐的做法

**量时长用 `performance.now()`，要日期用 `Date.now()`。** 两者都返回毫秒数，用途不同：

| 要做的事 | 用哪个 | 原因 |
| --- | --- | --- |
| 量一段代码、一次请求、一段动画花了多久 | `performance.now()` | 读数只增不减，带小数。`Date.now()` 只精确到毫秒，系统时间被修改或校正时两次读数的差会出错，甚至是负数 |
| 知道现在是几点、给数据打时间戳、和服务器的时间比较 | `Date.now()` | 它是日期。`performance.now()` 每次启动都从 0 开始，不同次启动之间的读数不能比较 |
| 知道 App 在后台停留了多久 | `Date.now()` | App 被暂停期间 `performance.now()` 是否继续增加没有验证过 |

## 第一个例子

下面的代码量出一段循环花了多久。它不需要界面，直接写在 `main.js` 顶层就能运行。

```js
const started = performance.now();

let sum = 0;
for (let i = 0; i < 100000; i++) {
  sum += i;
}

const elapsed = performance.now() - started;
console.log('循环用了 ' + elapsed.toFixed(3) + ' 毫秒');
```

**结果**：控制台输出一行，形如 `循环用了 1.234 毫秒`。具体数字取决于设备。

做法是在开始和结束时各读一次 `now()`，两个读数相减。

被量的代码很短、耗时接近读一次 `now()` 的开销（约 1 微秒）时，把它重复执行多次，量总时间再除以次数。

## 量一次异步操作的耗时

```js
const requestStarted = performance.now();
fetch('https://example.com/').then(() => {
  const took = performance.now() - requestStarted;
  console.log('请求用了 ' + Math.round(took) + ' 毫秒');
});
```

**结果**：请求完成时输出一行，形如 `请求用了 320 毫秒`。**这个例子未在模拟器验证。**

## 量定时器实际等了多久

[定时器](../api/timers.md)的延迟是下限，实际可能更久。用 `now()` 量出实际值：

```js
const queuedAt = performance.now();
setTimeout(() => {
  const waited = performance.now() - queuedAt;
  console.log('实际等了 ' + waited.toFixed(1) + ' 毫秒');
}, 50);
```

**结果**：输出一行，形如 `实际等了 51.8 毫秒`。这个数不小于 50（实测）。

## 知道 App 启动了多久

`now()` 的零点是运行时启动的那一刻，早于任何一行 JS 执行。所以直接读它，就是 App 的 JS 环境已经运行了多久。

```js
console.log('已经运行 ' + Math.round(performance.now()) + ' 毫秒');
```

**结果**：输出一行，形如 `已经运行 85 毫秒`。

## 把读数换算成日期

`now()` 的读数不是日期。要得到日期，加上 [`timeOrigin`](../api/performance/timeorigin.md)：

```js
const date = new Date(performance.timeOrigin + performance.now());
console.log(date.toISOString());
```

**结果**：输出当前时刻，形如 `2026-11-12T01:23:45.678Z`。它和 `new Date()` 相差不到 50 毫秒（实测）。

只是要当前日期时直接用 `new Date()`。这个换算用在已经有一批 `now()` 读数、事后要知道它们各自对应几点的场合。

## 参见

- [`Performance`](../api/performance.md)：`now()`、`timeOrigin` 的细节
- [定时器](../api/timers.md)：延迟是下限
