---
type: reference
native: ErrorEvent.colno
---

# `ErrorEvent`：`colno` 属性

**`colno`** 属性是出错的列号。

## 值

数。

- 只读。给它赋值抛 `TypeError`。
- 运行时派发的 `error` 事件里总是 `0`：运行时不给出列号。出错的位置看 [`filename`](filename.md) 和 [`lineno`](lineno.md)。
- 用 [`new`](constructor.md) 创建时没给，是 `0`。

## 示例

```js
const event = new ErrorEvent('error', { message: '坏了', lineno: 3, colno: 7 });
console.log(event.lineno, event.colno);
```

**结果**：输出 `3 7`。

## 参见

- [`lineno`](lineno.md)
