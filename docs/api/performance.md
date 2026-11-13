---
type: reference
status: partial
---

# `performance`

**`performance`** 表示一个只用来量时间长短的时钟。`performance.now()` 返回从运行时启动到此刻经过的毫秒数，在两个时刻各读一次，相减就是中间经过的时间。

它是全局对象，App 启动时就存在，不需要创建，也不能创建第二个。

## 读数是什么

`now()` 的读数是一个带小数的毫秒数，比如 `85.3271`。

- **零点是运行时启动的那一刻。** 它早于 `main.js` 的第一行，所以 `main.js` 顶层第一次读到的值已经大于 0。App 每次启动重新从 0 开始。
- **读数只增不减。** 用户修改系统时间、系统自动校时都不影响它。连续读 1000 次，没有一次比上一次小（实测）。
- **读数不是日期。** 单独一个读数只说明「启动后过了多久」。要换算成日期，加上 `performance.timeOrigin`。
- **精度高于 1 毫秒。** 读数带小数，没有被取整到毫秒（实测）。读一次约花 1 微秒（实测），所以能量出的最短时间在微秒这一级，再短的差值没有意义。

设备睡眠或 App 被系统暂停期间读数是否继续增加，**未在模拟器验证**。

## 和 `Date.now()` 怎么选

两者都返回毫秒数，用途不同：

| 要做的事 | 用哪个 | 原因 |
| --- | --- | --- |
| 量一段代码、一次请求、一段动画花了多久 | `performance.now()` | 读数只增不减，带小数。`Date.now()` 只精确到毫秒，系统时间被修改或校正时两次读数的差会出错，甚至是负数 |
| 知道现在是几点、给数据打时间戳、和服务器的时间比较 | `Date.now()` | 它是日期。`performance.now()` 每次启动都从 0 开始，不同次启动之间的读数不能比较 |
| 知道 App 在后台停留了多久 | `Date.now()` | App 被暂停期间 `performance.now()` 是否继续增加没有验证过 |

## 完整例子

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

## 常见用法

### 量一次异步操作的耗时

```js
const started = performance.now();
fetch('https://example.com/').then(() => {
  const elapsed = performance.now() - started;
  console.log('请求用了 ' + Math.round(elapsed) + ' 毫秒');
});
```

**结果**：请求完成时输出一行，形如 `请求用了 320 毫秒`。**这个例子未在模拟器验证。**

### 量定时器实际等了多久

[定时器](timers.md)的延迟是下限，实际可能更久。用 `now()` 量出实际值：

```js
const queuedAt = performance.now();
setTimeout(() => {
  const waited = performance.now() - queuedAt;
  console.log('实际等了 ' + waited.toFixed(1) + ' 毫秒');
}, 50);
```

**结果**：输出一行，形如 `实际等了 51.8 毫秒`。这个数不小于 50（实测）。

### 知道 App 启动了多久

`now()` 的零点是运行时启动的那一刻，早于任何一行 JS 执行。所以直接读它，就是 App 的 JS 环境已经运行了多久。

```js
console.log('已经运行 ' + Math.round(performance.now()) + ' 毫秒');
```

**结果**：输出一行，形如 `已经运行 85 毫秒`。

### 把读数换算成日期

`now()` 的读数不是日期。要得到日期，加上 `timeOrigin`：

```js
const date = new Date(performance.timeOrigin + performance.now());
console.log(date.toISOString());
```

**结果**：输出当前时刻，形如 `2026-11-12T01:23:45.678Z`。它和 `new Date()` 相差不到 50 毫秒（实测）。

只是要当前日期时直接用 `new Date()`。这个换算用在已经有一批 `now()` 读数、事后要知道它们各自对应几点的场合。

## 成员说明

### `performance.now()`

返回从运行时启动到现在经过的时间。

- **参数**：无。
- **返回值**：数，单位是毫秒，带小数。
- 读数只增不减。连续读 1000 次，没有一次比上一次小（实测）。
- 读数不受系统时间被修改的影响。
- 只能用来计算两次读数的差。单独一个读数没有日期上的含义。
- 不会出错。

### `performance.timeOrigin`

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `timeOrigin` | 数 | 是 | 否 | `now()` 的零点对应的时刻，写成 Unix 时间戳（从 1970 年 1 月 1 日 0 点 UTC 算起），单位是毫秒。运行期间不变，所以没有变化通知 |

这个值是启动那一刻按系统时间记下的。之后系统时间被修改，它不跟着变。

写它抛 `TypeError`。

### `performance.toJSON()`

返回 `{ timeOrigin }`。有了它，`JSON.stringify(performance)` 能得到结果。

### `Performance`

`performance` 的类。它存在是为了让 `performance instanceof Performance` 成立，不能自己创建：

- `new Performance()` 抛 `TypeError: Illegal constructor`

## 和浏览器的对照

`performance.now()` 和 `performance.timeOrigin` 的名字、单位与浏览器里的相同。下面列出不同的地方。

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| 读数的精度 | 被取整，通常到 0.1 毫秒或更粗 | 不取整 |
| 零点 | 页面开始加载的时刻 | 运行时启动的时刻 |
| `mark()`、`measure()`、`getEntries()`、`PerformanceObserver` | 有 | 没有 |

## 还不能做的

| 想做的事 | 对应的 Web 能力 | 状态 |
| --- | --- | --- |
| 给一段过程打标记、取两个标记之间的耗时 | `performance.mark()`、`performance.measure()` | 未实现。用两次 `now()` 相减代替 |
| 读取页面加载、资源请求的各阶段耗时 | `performance.getEntries()`、`PerformanceObserver` | 未实现 |
| 读取内存占用 | `performance.memory` | 未实现 |

## 参见

- [定时器](timers.md)：`setTimeout` 的延迟是下限，要知道实际过了多久用 `performance.now()` 量
- [运行时怎么工作](how-it-works.md)：有哪些全局对象
