---
type: reference
web: CloseEvent
---

# `CloseEvent`

**`CloseEvent`** 表示一条连接结束了。

[`WebSocket`](websocket.md) 的 [`close`](websocket/close-event.md) 事件是它，带着关闭码、对方给的说明，以及连接是不是正常结束的。

**继承关系**：[`Event`](event.md) → `CloseEvent`

## 构造函数

[`CloseEvent()`](close-event/constructor.md)

创建一个 `CloseEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`code`](close-event/code.md) <small>只读</small> | 关闭码：连接为什么结束 |
| [`reason`](close-event/reason.md) <small>只读</small> | 对方给的说明 |
| [`wasClean`](close-event/wasclean.md) <small>只读</small> | 双方有没有按协议完成关闭 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`WebSocket`](websocket.md) | [`close`](websocket/close-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => ws.close());
ws.addEventListener('close', (e) => {
  console.log(e instanceof CloseEvent, e.code, e.wasClean);
});
```

**效果**：连接打开后立刻关闭，输出 `true 1000 true`。**未在模拟器验证。**

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `CloseEvent`。WebSocket 连接是系统的 `NSURLSessionWebSocketTask`，它的 `closeCode`、`closeReason` 是这里的 [`code`](close-event/code.md)、[`reason`](close-event/reason.md)。

## 参见

- [`WebSocket`](websocket.md)：派发这种事件的对象
- [`close`](websocket/close-event.md)：什么时候派发
