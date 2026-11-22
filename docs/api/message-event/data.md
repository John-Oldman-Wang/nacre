---
type: reference
web: MessageEvent.data
---

# `MessageEvent`：`data` 属性

**`data`** 属性是消息的内容。

## 值

[`WebSocket`](../websocket.md) 的消息里：

- 只读。给它赋值抛 `TypeError`。
- 文本消息是字符串。
- 二进制消息是 [`Blob`](../blob.md)。`size` 是字节数，要读字节用 `await data.arrayBuffer()`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('message', async (e) => {
  if (typeof e.data === 'string') {
    console.log('文本', e.data);
  } else {
    const bytes = new Uint8Array(await e.data.arrayBuffer());
    console.log('二进制', bytes.length);
  }
});
```

**效果**：文本消息输出 `文本` 和它的内容；二进制消息输出 `二进制` 和它的字节数。

## 对应的 iOS API

`NSURLSessionWebSocketMessage` 的 `string` 或 `data`。

## 参见

- [`MessageEvent`](../message-event.md)
- [`message`](../websocket/message-event.md)
