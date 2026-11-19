---
type: reference
native: ErrorEvent.message
---

# `ErrorEvent`：`message` 属性

**`message`** 属性是错误的摘要文字，由引擎生成。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 要拿到抛出来的原始值，读 [`error`](error.md)。

## 示例

```js
application.addEventListener('error', (e) => {
  console.log(e.message);
  e.preventDefault();
});
throw new Error('坏了');
```

**结果**：输出错误的摘要文字，其中包含 `坏了`。

## 参见

- [`error`](error.md)
