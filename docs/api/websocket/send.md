---
type: reference
web: WebSocket.send()
---

# `WebSocket`：`send()` 方法

**`send()`** 方法通过连接发一条消息。字符串作为文本消息发送，其余几种作为二进制消息发送。

## 语法

```
send(data)
```

### 参数

**`data`**

要发的内容：

| 类型 | 发成 |
| --- | --- |
| 字符串 | 文本消息 |
| [`Blob`](../fetch.md)、`ArrayBuffer`、类型数组（比如 `Uint8Array`） | 二进制消息 |

单条消息能发多大，**未在模拟器验证**。

### 返回值

Promise。消息交给网络发出后兑现为 `true`。它不等服务器确认：兑现不表示服务器已经收到。

Promise 被拒绝时，拒绝的是一个 [`DOMException`](../dom-exception.md)，`name` 区分原因：

| `name` | `message` | 什么时候 |
| --- | --- | --- |
| `InvalidStateError` | `send: the socket is not open` | 连接没有打开：还在连接、正在关闭或已经结束 |
| `InvalidStateError` | `send: expects a string or a Blob` | `data` 不是上表里的类型 |
| `NetworkError` | 系统的错误描述 | 发送过程中网络出错。系统给的原值在 `cause` 上，是一个 [`NSError`](../ns-error.md)。**未在真机验证** |

### 异常

不直接抛异常。出错都通过返回的 Promise 拒绝。

## 说明

连接还没打开时调 `send()`，消息不会留到连上之后再发。要在连上后立刻发的内容，写进 [`open`](open-event.md) 的回调。

## 示例

### 发文本和二进制

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => {
  ws.send('文本').then(() => console.log('已发出'));
  ws.send(new Uint8Array([1, 2, 3, 4, 5]));
});
```

**结果**：连上后先发出一条文本，输出 `已发出`；再发出一条 5 字节的二进制消息。

### 连上之前就发

```js
const early = new WebSocket('wss://echo.websocket.org');
early.send('too early').catch((err) => {
  console.log(err.name, err.message);
});
```

**结果**：输出 `InvalidStateError send: the socket is not open`。

## 和 Web 的差别

- 浏览器的 `send()` 没有返回值；这里返回 Promise。
- 浏览器在连接没打开时调 `send()` 直接抛异常；这里是返回的 Promise 被拒绝。

## 参见

- [`message` 事件](message-event.md)：收消息
- [`Blob`](../fetch.md)
