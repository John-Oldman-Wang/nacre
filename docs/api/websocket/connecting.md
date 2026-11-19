---
type: reference
web: WebSocket.CONNECTING
---

# `WebSocket.CONNECTING` 静态属性

**`WebSocket.CONNECTING`** 静态属性是 [`readyState`](readystate.md) 的一个取值，值是 `0`：正在连接，还不能发消息。构造之后就是这个阶段。

## 值

数，`0`。

- 只读。给它赋值抛 `TypeError`。
- 不会变。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
console.log(WebSocket.CONNECTING, ws.readyState === WebSocket.CONNECTING);
```

**结果**：控制台输出 `0`，后面跟这条连接此刻是不是处在这个阶段。刚构造完的连接处在 `CONNECTING`。

## 和 Web 的差别

值和 Web 相同。浏览器在实例上也有这个常量（`ws.CONNECTING`）；这里只在 `WebSocket` 上有，实例上读到 `undefined`。

## 参见

- [连接的四个阶段](../websocket.md#连接的四个阶段)
