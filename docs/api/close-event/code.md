---
type: reference
web: CloseEvent.code
---

# `CloseEvent`：`code` 属性

**`code`** 属性是关闭码，说明连接为什么结束。

## 值

数。常见的值：

- 只读。给它赋值抛 `TypeError`。
- `1000`：正常关闭。
- `1006`：连接异常断开，没有走完关闭握手。
- 其余的值见 [`close`](../websocket/close-event.md#关闭码)。
- 用 [`new`](constructor.md) 创建时没给，是 `0`。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('close', (e) => {
  console.log(e.code === 1000 ? '正常关闭' : '异常结束 ' + e.code);
});
```

**效果**：连接结束时，正常关闭输出 `正常关闭`，否则输出 `异常结束` 和关闭码。

## 对应的 iOS API

`NSURLSessionWebSocketTask` 的 `closeCode`。

## 参见

- [`CloseEvent`](../close-event.md)
- [`close`](../websocket/close-event.md)
