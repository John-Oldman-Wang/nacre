---
type: reference
web: AbortController.abort()
---

# `AbortController`：`abort()` 方法

**`abort()`** 方法取消 [`signal`](signal.md)，交了这个 `signal` 的请求都被取消。

## 语法

```
abort()
abort(reason)
```

### 参数

**`reason`**

取消的原因，任意值，可选。它会成为 [`signal.reason`](../abort-signal/reason.md)。不给时，`signal.reason` 是一个 `name` 为 `'AbortError'`、`message` 为 `The operation was aborted` 的 `Error`。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- 调用时 `signal` 派发一次 [`abort`](../abort-signal/abort-event.md) 事件。
- 重复调用没有效果，`abort` 事件不会再派发，`reason` 也不变。
- 取消之后不能恢复。
- 请求进行中被取消时，`fetch()` 和 `read()` 抛出的不是 `reason`，而是一个新的 `AbortError`。

## 示例

```js
const controller = new AbortController();
controller.abort('用户离开了页面');
controller.abort('第二次');
console.log(controller.signal.aborted, controller.signal.reason);
```

**结果**：输出 `true 用户离开了页面`。第二次调用没有效果。

## 和 Web 的差别

- 不给 `reason` 时，`reason` 是 `name` 为 `'AbortError'` 的 `Error`。Web 里是 `DOMException`。
- 请求进行中被取消时，`fetch()` 抛出新的 `AbortError`，不是 `reason`。

## 参见

- [`AbortSignal`](../abort-signal.md)
