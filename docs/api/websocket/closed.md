---
type: reference
web: WebSocket.CLOSED
---

# `WebSocket.CLOSED` 静态属性

**`WebSocket.CLOSED`** 静态属性是 [`readyState`](readystate.md) 的一个取值，值是 `3`：连接已结束，不能再收发。派发 [`close`](close-event.md) 时进入。

## 值

数，`3`。

- 只读。给它赋值抛 `TypeError`。
- 不会变。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
console.log(WebSocket.CLOSED, ws.readyState === WebSocket.CLOSED);
```

**结果**：控制台输出 `3`，后面跟这条连接此刻是不是处在这个阶段。刚构造完的连接处在 `CONNECTING`。

## 和 Web 的差别

值和 Web 相同。浏览器在实例上也有这个常量（`ws.CLOSED`）；这里只在 `WebSocket` 上有，实例上读到 `undefined`。

## 参见

- [连接的四个阶段](../websocket.md#连接的四个阶段)
