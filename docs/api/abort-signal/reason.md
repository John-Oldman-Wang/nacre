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
- 没有给原因时，是一个 [`DOMException`](../dom-exception.md)，`name` 是 `'AbortError'`，`code` 是 20，`message` 是 `The operation was aborted`。
- [`AbortSignal.timeout()`](timeout.md) 到时间时，是一个 `DOMException`，`name` 是 `'TimeoutError'`，`code` 是 23，`message` 是 `The operation timed out`（实测）。
- 取消时派发 [`abort`](abort-event.md) 事件，之后不再变化。

## 示例

```js
const controller = new AbortController();
controller.abort();
const reason = controller.signal.reason;
console.log(reason instanceof DOMException ? reason.name + ' ' + reason.code : reason);
```

**结果**：输出 `AbortError 20`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`throwIfAborted()`](throwifaborted.md)
