---
type: reference
web: WebSocket message event
---

# `WebSocket`：`message` 事件

**`message`** 事件在收到服务器发来的一条消息时派发。每条消息派发一次。

## 语法

```
ws.addEventListener('message', (event) => { })
```

## 事件对象

[`MessageEvent`](../message-event.md)。不能取消。除了下面的 `data`，[`origin`](../message-event/origin.md) 是连接地址的源。

**[`data`](../message-event/data.md)**

收到的内容：

- 文本消息是字符串。
- 二进制消息是 [`Blob`](../fetch.md)。`size` 是字节数，要读字节用 `await data.arrayBuffer()`。

## 什么时候派发

- 连接打开期间，每收到一条消息派发一次，持续派发，直到连接结束。
- 单条消息长度超过 [`maximumMessageSize`](maximummessagesize.md) 时接收失败。**这时派发什么未在模拟器验证。**
- 派发时还没有加监听器的消息就丢失了，不会补发。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('message', async (e) => {
  const data = e.data;
  if (typeof data === 'string') {
    console.log('文本', data);
  } else {
    const bytes = new Uint8Array(await data.arrayBuffer());
    console.log('二进制', bytes.length, '字节');
  }
});
```

**效果**：文本消息输出它的内容；二进制消息输出它的字节数。

## 和 Web 的差别

- 浏览器的二进制消息默认是 `Blob`，可以用 `binaryType` 改成 `ArrayBuffer`；这里总是 `Blob`，没有 `binaryType`。
- 没有 `onmessage` 属性，只能用 `addEventListener`。

## 参见

- [`send()`](send.md)
