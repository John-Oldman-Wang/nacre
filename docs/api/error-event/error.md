---
type: reference
native: ErrorEvent.error
---

# `ErrorEvent`：`error` 属性

**`error`** 属性是抛出来的那个值。

## 值

类型是 `unknown`。通常是 `Error` 对象，但 JS 允许抛出任何值，所以用之前要判断。

- 只读。给它赋值抛 `TypeError`。
- 就是 `throw` 的那个对象本身（实测）。

## 示例

```js
application.addEventListener('error', (e) => {
  if (e.error instanceof Error) {
    console.log(e.error.message);
  } else {
    console.log('抛出的不是 Error：', String(e.error));
  }
  e.preventDefault();
});
throw new Error('坏了');
```

**结果**：输出 `坏了`。

## 参见

- [`message`](message.md)
