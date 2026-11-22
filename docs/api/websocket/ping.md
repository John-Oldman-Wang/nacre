---
type: reference
native: "-[NSURLSessionWebSocketTask sendPingWithPongReceiveHandler:]"
---

# `WebSocket`：`ping()` 方法

**`ping()`** 方法向服务器发一个协议层面的探测帧，等它回应，用来确认一条 [`readyState`](readystate.md) 是 `1` 的连接此刻确实还通。

协议规定服务器收到探测帧后必须回应。这个回应由服务器的 WebSocket 实现自动完成，不需要服务器的业务代码配合。

## 语法

```
ping()
```

### 参数

无。

### 返回值

Promise。收到服务器的回应后兑现为 `true`。

连接不通时 Promise 被拒绝，拒绝的是一个 [`DOMException`](../dom-exception.md)，`name` 是 `NetworkError`，`message` 是系统的错误描述，系统给的原值在 `cause` 上（一个 [`NSError`](../ns-error.md)）。**连接不通时的拒绝，以及要等多久才拒绝，未在模拟器验证。**

### 异常

不直接抛异常。连接还没打开时调用会怎样，**未在模拟器验证**。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => {
  ws.ping().then(
    () => console.log('连接正常'),
    (err) => console.log('连接不通', err.message),
  );
});
```

**结果**：服务器回应后输出 `连接正常`。连接不通时输出 `连接不通` 加错误描述，**这一种未在模拟器验证**。

## 和 Web 的差别

Web 没有这个方法。浏览器的 `WebSocket` 不能由页面主动发探测帧。

## 参见

- [保持一条长期使用的连接](../../guides/websocket.md#保持一条长期使用的连接)：用 `ping()` 定时检查
