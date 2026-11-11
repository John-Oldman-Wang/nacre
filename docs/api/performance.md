---
type: reference
status: partial
---

# `performance`

`performance` 是一个高精度的时钟，用来量一段代码或一次操作花了多久。它是全局对象，不需要创建。

它和浏览器、Node 里的 `performance` 是同一个东西，`now()` 的写法和含义相同。有两点不同：

- **只有 `now()` 和 `timeOrigin`。** 没有 `mark()`、`measure()`、`getEntries()` 这一组。
- **精度没有被降低。** 浏览器为了安全会把读数取整到 0.1 毫秒甚至 1 毫秒，这里不取整。

量时间不要用 `Date.now()`：它只精确到毫秒，而且用户改系统时间、系统自动校时都会让它跳变。

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

**效果**：控制台输出一行，形如 `循环用了 1.234 毫秒`。具体数字取决于设备。

做法是在开始和结束时各读一次 `now()`，两个读数相减。

## 常见用法

### 量一次异步操作的耗时

```js
const started = performance.now();
fetch('https://example.com/').then(() => {
  const elapsed = performance.now() - started;
  console.log('请求用了 ' + Math.round(elapsed) + ' 毫秒');
});
```

**效果**：请求完成时输出一行，形如 `请求用了 320 毫秒`。**这个例子未在模拟器验证。**

### 知道 App 启动了多久

`now()` 的零点是运行时启动的那一刻，早于任何一行 JS 执行。所以直接读它，就是 App 的 JS 环境已经运行了多久。

```js
console.log('已经运行 ' + Math.round(performance.now()) + ' 毫秒');
```

**效果**：输出一行，形如 `已经运行 85 毫秒`。

### 把读数换算成日期

`now()` 的读数不是日期。要得到日期，加上 `timeOrigin`：

```js
const date = new Date(performance.timeOrigin + performance.now());
console.log(date.toISOString());
```

**效果**：输出当前时刻，形如 `2026-11-12T01:23:45.678Z`。它和 `new Date()` 相差不到 50 毫秒（实测）。

## 成员说明

### `performance.now()`

返回从运行时启动到现在经过的时间。

- **参数**：无。
- **返回值**：数，单位是毫秒，带小数。
- 读数只增不减。连续读 1000 次，没有一次比上一次小（实测）。
- 读数不受系统时间被修改的影响。
- 只能用来计算两次读数的差。单独一个读数没有日期上的含义。

### `performance.timeOrigin`

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `timeOrigin` | 数 | 是 | 否 | `now()` 的零点对应的时刻，写成 Unix 时间戳，单位是毫秒。运行期间不变，所以没有变化通知 |

写它抛 `TypeError`。

### `performance.toJSON()`

返回 `{ timeOrigin }`。有了它，`JSON.stringify(performance)` 能得到结果。

### `Performance`

`performance` 的类。它存在是为了让 `performance instanceof Performance` 成立，不能自己创建：

- `new Performance()` 抛 `TypeError: Illegal constructor`

## 还不能做的

| 想做的事 | 对应的 Web 能力 | 状态 |
| --- | --- | --- |
| 给一段过程打标记、取两个标记之间的耗时 | `performance.mark()`、`performance.measure()` | 未实现。用两次 `now()` 相减代替 |
| 读取页面加载、资源请求的各阶段耗时 | `performance.getEntries()`、`PerformanceObserver` | 未实现 |
| 读取内存占用 | `performance.memory` | 未实现 |

## 参见

- [定时器](timers.md)：`setTimeout` 的延迟不精确，要知道实际过了多久用 `performance.now()` 量
- [运行时怎么工作](how-it-works.md)：有哪些全局对象
