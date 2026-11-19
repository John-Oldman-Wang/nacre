---
type: reference
web: AbortSignal abort event
---

# `AbortSignal`：`abort` 事件

信号被取消时派发 **`abort`** 事件。

## 语法

```
signal.addEventListener('abort', (event) => { })
```

## 事件对象

`Event`，只带 `type` 和 `target`。不能取消。

## 什么时候派发

- 调 [`controller.abort()`](../abort-controller/abort.md) 时。
- [`AbortSignal.timeout()`](timeout.md) 到时间时。
- 只派发一次。重复调 `abort()` 不会再派发。
- [`AbortSignal.abort()`](abort.md) 返回的信号在创建时就已经取消，之后加的监听器收不到这个事件。

事件派发时 [`aborted`](aborted.md) 已经是 `true`，[`reason`](reason.md) 已经有值。

## 示例

```js
const controller = new AbortController();
controller.signal.addEventListener('abort', () => {
  console.log('已取消', controller.signal.aborted);
});
controller.abort();
```

**结果**：输出 `已取消 true`。

## 和 Web 的差别

没有 `onabort` 属性，只能用 `addEventListener()` 监听。

## 参见

- [`AbortController`](../abort-controller.md)
