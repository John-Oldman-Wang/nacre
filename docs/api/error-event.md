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

创建一个错误事件对象。运行时派发 `error` 时自己创建；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`message`](error-event/message.md) <small>只读</small> | 错误的摘要文字 |
| [`error`](error-event/error.md) <small>只读</small> | 抛出来的那个值 |
| [`filename`](error-event/filename.md) <small>只读</small> | 出错的脚本名 |
| [`lineno`](error-event/lineno.md) <small>只读</small> | 出错的行号 |
| [`colno`](error-event/colno.md) <small>只读</small> | 出错的列号。运行时派发的都是 0 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`application`](application.md) | [`error`](application/error-event.md) |
| [`WebSocket`](websocket.md) | [`error`](websocket/error-event.md) |

`application` 的 `error` 可以取消：`cancelable` 是 `true`，调 `preventDefault()` 的效果是运行时不再输出默认的错误日志。`WebSocket` 的 `error` 不能取消，只带 [`message`](error-event/message.md)：`filename` 是空串，`lineno`、`colno` 是 0，`error` 是 `undefined`。

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
- [`WebSocket` 的 `error`](websocket/error-event.md)
- [统一处理错误](../guides/handle-errors.md)
