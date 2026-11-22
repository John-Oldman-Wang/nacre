---
type: reference
web: MessageEvent
---

# `MessageEvent`

**`MessageEvent`** 表示收到的一条消息。

[`WebSocket`](websocket.md) 的 [`message`](websocket/message-event.md) 事件是它：[`data`](message-event/data.md) 是消息的内容，[`origin`](message-event/origin.md) 是连接地址的源。

**继承关系**：[`Event`](event.md) → `MessageEvent`

## 构造函数

[`MessageEvent()`](message-event/constructor.md)

创建一个 `MessageEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`data`](message-event/data.md) <small>只读</small> | 消息的内容 |
| [`origin`](message-event/origin.md) <small>只读</small> | 发消息的那一方的源 |
| [`lastEventId`](message-event/lasteventid.md) <small>只读</small> | 消息的编号。运行时派发的消息里总是空串 |
| [`source`](message-event/source.md) <small>只读</small> | 总是 `null` |
| [`ports`](message-event/ports.md) <small>只读</small> | 总是空数组 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`WebSocket`](websocket.md) | [`message`](websocket/message-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => ws.send('你好'));
ws.addEventListener('message', (e) => {
  console.log(e instanceof MessageEvent, e.origin, e.data);
});
```

**效果**：连接打开后发出 `你好`，收到回声时输出 `true wss://echo.websocket.org` 和收到的内容。`origin` 的值**未在模拟器验证**。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `MessageEvent`。WebSocket 的一条消息是系统的 `NSURLSessionWebSocketMessage`，它的 `string` 或 `data` 是这里的 [`data`](message-event/data.md)。

## 参见

- [`WebSocket`](websocket.md)：派发这种事件的对象
- [`message`](websocket/message-event.md)：什么时候派发
- [用 WebSocket 收发消息](../guides/websocket.md)
