---
type: reference
---

# `queueMicrotask()` 全局函数

**`queueMicrotask()`** 全局函数把一个回调安排在当前这段代码结束之后立刻执行，先于任何定时器、先于界面刷新。它和 `Promise.resolve().then(callback)` 的时机相同。

## 语法

```
queueMicrotask(callback)
```

### 参数

**`callback`**

要执行的函数，调用时不带参数。

### 返回值

无（`undefined`）。安排好的回调不能取消。

### 异常

**`TypeError`**

`callback` 不是函数：`queueMicrotask: the argument must be a function`。

## 说明

- `callback` 里抛出的异常由 [`application`](../application.md) 的 `unhandledrejection` 事件报告，不是 `error` 事件。
- 在 `callback` 里不断再调 `queueMicrotask()`，这些回调会一个接一个地执行，中间界面没有机会刷新。需要让出执行机会时用 [`setTimeout(fn, 0)`](settimeout.md)。

## 示例

```js
setTimeout(() => console.log('setTimeout'), 0);
Promise.resolve().then(() => console.log('Promise'));
queueMicrotask(() => console.log('queueMicrotask'));
console.log('同步');
```

**结果**：依次输出 `同步`、`Promise`、`queueMicrotask`、`setTimeout`。

## 和 Web 的差别

回调抛出的异常：浏览器由 `error` 事件报告，这里由 `unhandledrejection` 事件报告。其余和 Web 相同。

## 参见

- [回调的执行顺序](../timers.md#回调的执行顺序)
