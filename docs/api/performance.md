---
type: reference
status: partial
---

# `Performance`

**`Performance`** 表示一个只用来量时间长短的时钟。它唯一的实例是全局对象 `performance`。[`performance.now()`](performance/now.md) 返回从运行时启动到此刻经过的毫秒数，在两个时刻各读一次，相减就是中间经过的时间。

`performance` 在 App 启动时就存在，任何时候都能用，包括脚本顶层。

怎么量一段代码或一次请求花了多久、和 `Date.now()` 怎么选，见指南[量一段代码花了多久](../guides/measure-time.md)。

**继承关系**：`Performance`

## 构造函数

不能用 `new` 创建：`new Performance()` 抛 `TypeError: Illegal constructor`。`Performance` 这个类存在是为了让 `performance instanceof Performance` 成立。唯一的实例是全局的 `performance`。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`timeOrigin`](performance/timeorigin.md) <small>只读</small> | `now()` 的零点对应的时刻，Unix 毫秒时间戳 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`now()`](performance/now.md) | 从运行时启动到现在经过的毫秒数，带小数 |
| [`toJSON()`](performance/tojson.md) | 返回 `{ timeOrigin }` |

## 读数是什么

`now()` 的读数是一个带小数的毫秒数，比如 `85.3271`。

- **零点是运行时启动的那一刻。** 它早于 `main.js` 的第一行，所以 `main.js` 顶层第一次读到的值已经大于 0。App 每次启动重新从 0 开始。
- **读数只增不减。** 用户修改系统时间、系统自动校时都不影响它。连续读 1000 次，没有一次比上一次小（实测）。
- **读数不是日期。** 单独一个读数只说明「启动后过了多久」。要换算成日期，加上 `performance.timeOrigin`。
- **精度高于 1 毫秒。** 读数带小数，没有被取整到毫秒（实测）。读一次约花 1 微秒（实测），所以能量出的最短时间在微秒这一级，再短的差值没有意义。

设备睡眠或 App 被系统暂停期间读数是否继续增加，**未在模拟器验证**。

## 示例

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

## 和 Web 的差别

`performance.now()` 和 `performance.timeOrigin` 的名字、单位与浏览器里的相同。下面列出不同的地方。

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| 读数的精度 | 被取整，通常到 0.1 毫秒或更粗 | 不取整 |
| 零点 | 页面开始加载的时刻 | 运行时启动的时刻 |
| `mark()`、`measure()`、`getEntries()`、`PerformanceObserver` | 有 | 没有 |

## 参见

- [量一段代码花了多久](../guides/measure-time.md)：量同步代码、异步操作、定时器的实际延迟；和 `Date.now()` 怎么选
- [定时器](timers.md)：`setTimeout()` 的延迟是下限，要知道实际过了多久用 `performance.now()` 量
- [运行时怎么工作](how-it-works.md)：有哪些全局对象
