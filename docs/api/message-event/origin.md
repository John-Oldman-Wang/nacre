---
type: reference
web: MessageEvent.origin
---

# `MessageEvent`：`origin` 属性

**`origin`** 属性是发消息的那一方的源：协议、主机和端口。

## 值

字符串。[`WebSocket`](../websocket.md) 的消息里，是连接地址的源，比如连接 `wss://echo.websocket.org/chat` 时是 `'wss://echo.websocket.org'`。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 空串。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org/chat');
ws.addEventListener('message', (e) => {
  console.log(e.origin);
});
```

**效果**：每收到一条消息，输出 `wss://echo.websocket.org`。**未在模拟器验证。**

## 对应的 iOS API

没有对应的系统 API。由连接的地址算出来。

## 参见

- [`MessageEvent`](../message-event.md)
