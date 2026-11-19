---
type: reference
web: AbortSignal.reason
---

# `AbortSignal`：`reason` 属性

**`reason`** 属性是取消的原因。

## 值

任意值。

- 只读。给它赋值抛 `TypeError`。
- 取消之前是 `undefined`。
- 用 [`controller.abort(reason)`](../abort-controller/abort.md) 或 [`AbortSignal.abort(reason)`](abort.md) 给了原因时，是给的那个值。
- 没有给原因时，是一个 `name` 为 `'AbortError'`、`message` 为 `The operation was aborted` 的 `Error`。
- [`AbortSignal.timeout()`](timeout.md) 到时间时，是一个 `name` 为 `'TimeoutError'`、`message` 为 `The operation timed out` 的 `Error`。
- 取消时派发 [`abort`](abort-event.md) 事件，之后不再变化。

## 示例

```js
const controller = new AbortController();
controller.abort();
const reason = controller.signal.reason;
console.log(reason instanceof Error ? reason.name : reason);
```

**结果**：输出 `AbortError`。

## 和 Web 的差别

默认的原因是 `Error`，不是 `DOMException`。

## 参见

- [`throwIfAborted()`](throwifaborted.md)
