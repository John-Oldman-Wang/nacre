---
type: reference
web: AbortSignal.aborted
---

# `AbortSignal`：`aborted` 属性

**`aborted`** 属性表示这个信号是否已经取消。

## 值

布尔。

- `true`：已经取消。
- `false`：还没有取消。
- 只读。给它赋值抛 `TypeError`。
- 从 `false` 变成 `true` 时派发 [`abort`](abort-event.md) 事件。变成 `true` 之后不再变回。

## 示例

```js
const controller = new AbortController();
console.log(controller.signal.aborted);
controller.abort();
console.log(controller.signal.aborted);
```

**结果**：输出 `false` 和 `true`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`reason`](reason.md)
