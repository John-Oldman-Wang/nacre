---
type: reference
---

# `Performance`：`now()` 方法

**`now()`** 方法返回从运行时启动到现在经过的毫秒数。

## 语法

```
performance.now()
```

### 参数

无。

### 返回值

数，单位是毫秒，带小数，比如 `85.3271`。

- 零点是运行时启动的那一刻，早于 `main.js` 的第一行。App 每次启动重新从 0 开始。
- 读数只增不减。连续读 1000 次，没有一次比上一次小（实测）。
- 读数不受系统时间被修改的影响。
- 读数没有被取整到毫秒（实测）。读一次约花 1 微秒（实测）。
- 只能用来计算两次读数的差。单独一个读数没有日期上的含义，要换算成日期加上 [`timeOrigin`](timeorigin.md)。
- 设备睡眠或 App 被系统暂停期间读数是否继续增加，**未在模拟器验证**。

### 异常

无。

## 示例

### 量一段代码

```js
const started = performance.now();
let sum = 0;
for (let i = 0; i < 100000; i++) {
  sum += i;
}
console.log('循环用了 ' + (performance.now() - started).toFixed(3) + ' 毫秒');
```

**结果**：输出一行，形如 `循环用了 1.234 毫秒`。具体数字取决于设备。

### 知道 App 启动了多久

```js
console.log('已经运行 ' + Math.round(performance.now()) + ' 毫秒');
```

**结果**：输出一行，形如 `已经运行 85 毫秒`。

## 和 Web 的差别

- 读数不取整。浏览器通常取整到 0.1 毫秒或更粗。
- 零点是运行时启动的时刻。浏览器是页面开始加载的时刻。

## 参见

- [`timeOrigin`](timeorigin.md)：零点对应的时刻
- [量一段代码花了多久](../../guides/measure-time.md)
