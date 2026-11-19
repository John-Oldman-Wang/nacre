---
type: reference
native: ErrorEvent
status: partial
---

# `ErrorEvent`

**`ErrorEvent`** 表示一次没被捕获的异常。它是 [`application`](application.md) 上 [`error`](application/error-event.md) 事件的事件对象，带着抛出来的值、出错的脚本名和行号。

**继承关系**：[`Event`](event.md) → `ErrorEvent`

## 构造函数

[`ErrorEvent()`](error-event/constructor.md)

创建一个错误事件对象。运行时派发 `error` 时自己创建，App 的代码一般不用。

## 实例属性

还继承 [`Event`](event.md) 的属性。运行时派发的 `error` 事件，`cancelable` 是 `true`。

| 属性 | 说明 |
| --- | --- |
| [`message`](error-event/message.md) <small>只读</small> | 错误的摘要文字 |
| [`error`](error-event/error.md) <small>只读</small> | 抛出来的那个值 |
| [`filename`](error-event/filename.md) <small>只读</small> | 出错的脚本名 |
| [`lineno`](error-event/lineno.md) <small>只读</small> | 出错的行号 |

## 示例

```js
application.addEventListener('error', (e) => {
  console.log(e instanceof ErrorEvent, e.message);
  e.preventDefault();
});
throw new Error('坏了');
```

**结果**：输出 `true` 和错误的摘要文字。

## 参见

- [`error`](application/error-event.md)
- [统一处理错误](../guides/handle-errors.md)
