---
type: reference
native: PromiseRejectionEvent
status: partial
---

# `PromiseRejectionEvent`

**`PromiseRejectionEvent`** 表示一次没有被处理的 Promise 拒绝。它是 [`application`](application.md) 上 [`unhandledrejection`](application/unhandledrejection-event.md) 事件的事件对象，带着拒绝的原因和被拒绝的 Promise。

**继承关系**：[`Event`](event.md) → `PromiseRejectionEvent`

## 构造函数

[`PromiseRejectionEvent()`](promise-rejection-event/constructor.md)

创建一个拒绝事件对象。运行时派发 `unhandledrejection` 时自己创建；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`reason`](promise-rejection-event/reason.md) <small>只读</small> | 拒绝的原因 |
| [`promise`](promise-rejection-event/promise.md) <small>只读</small> | 被拒绝的那个 Promise |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`application`](application.md) | [`unhandledrejection`](application/unhandledrejection-event.md) |

可以取消：`cancelable` 是 `true`，调 `preventDefault()` 的效果是运行时不再输出默认的错误日志。

## 示例

```js
application.addEventListener('unhandledrejection', (e) => {
  console.log(e instanceof PromiseRejectionEvent, String(e.reason));
  e.preventDefault();
});
Promise.reject(new Error('没人接'));
```

**结果**：输出 `true Error: 没人接`。

## 与浏览器的对照

| 浏览器 | Nacre |
| --- | --- |
| `rejectionhandled` 事件 | 没有 |

## 参见

- [`unhandledrejection`](application/unhandledrejection-event.md)
- [统一处理错误](../guides/handle-errors.md)
