---
type: reference
web: WebSocket.CLOSING
---

# `WebSocket.CLOSING` 静态属性

**`WebSocket.CLOSING`** 静态属性是 [`readyState`](readystate.md) 的一个取值，值是 `2`：正在关闭。调了 [`close()`](close.md) 之后进入。

## 值

数，`2`。

- 只读。给它赋值抛 `TypeError`。
- 不会变。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
console.log(WebSocket.CLOSING, ws.readyState === WebSocket.CLOSING);
```

**结果**：控制台输出 `2`，后面跟这条连接此刻是不是处在这个阶段。刚构造完的连接处在 `CONNECTING`。

## 和 Web 的差别

值和 Web 相同。浏览器在实例上也有这个常量（`ws.CLOSING`）；这里只在 `WebSocket` 上有，实例上读到 `undefined`。

## 参见

- [连接的四个阶段](../websocket.md#连接的四个阶段)
