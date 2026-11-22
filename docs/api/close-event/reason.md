---
type: reference
web: CloseEvent.reason
---

# `CloseEvent`：`reason` 属性

**`reason`** 属性是关闭连接的那一方给的说明。

## 值

字符串。没有说明时是空串。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 空串。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => ws.close(1000, 'bye'));
ws.addEventListener('close', (e) => {
  console.log(e.reason);
});
```

**效果**：连接打开后立刻关闭，输出 `bye`。**未在模拟器验证。**

## 对应的 iOS API

`NSURLSessionWebSocketTask` 的 `closeReason`，按 UTF-8 解成字符串。

## 参见

- [`CloseEvent`](../close-event.md)
