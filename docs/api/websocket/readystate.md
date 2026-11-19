---
type: reference
web: WebSocket.readyState
---

# `WebSocket`：`readyState` 属性

**`readyState`** 属性表示连接此刻处在哪个阶段。

## 值

数，下面四个之一：

| 值 | 常量 | 含义 |
| --- | --- | --- |
| `0` | [`WebSocket.CONNECTING`](connecting.md) | 正在连接，还不能发消息 |
| `1` | [`WebSocket.OPEN`](open.md) | 已连上，可以收发 |
| `2` | [`WebSocket.CLOSING`](closing.md) | 正在关闭 |
| `3` | [`WebSocket.CLOSED`](closed.md) | 已结束 |

- 只读。给它赋值抛 `TypeError`。
- 新建的连接是 `0`。
- 只按 `0` → `1` → `2` → `3` 的方向变，不会变回去。没连上或中途断开时，从 `0` 或 `1` 直接变成 `3`。

### 怎么得知它变了

- 变成 `1` 时派发 [`open`](open-event.md)。
- 变成 `3` 时派发 [`close`](close-event.md)。
- 调 [`close()`](close.md) 后立刻变成 `2`，这次变化没有事件：它是 App 自己的调用引起的。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => {
  console.log(ws.readyState === WebSocket.OPEN);
  ws.close();
  console.log(ws.readyState === WebSocket.CLOSING);
});
```

**结果**：连上后依次输出 `true`、`true`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [连接的四个阶段](../websocket.md#连接的四个阶段)
