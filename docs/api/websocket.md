# `WebSocket`

全双工的长连接。`fetch` 只有请求-响应，实时行情、聊天、推送要用它。

```js
const ws = new WebSocket('wss://example.com/quotes', {
  headers: { Authorization: 'Bearer ' + token },
});

ws.addEventListener('open', () => ws.send('subscribe'));
ws.addEventListener('message', (e) => {
  const data = /** @type {WebSocketMessageEvent} */ (e).data;
  console.log(data);            // 字符串，或者 Blob
});
ws.addEventListener('close', (e) => {
  const { code, wasClean } = /** @type {WebSocketCloseEvent} */ (e);
  console.log('关了', code, wasClean);
});

ws.close(1000, 'bye');
```

形状照 Web，**两处比 Web 多**。

## 一、可以带首部

```js
new WebSocket(url, { headers: { Authorization: 'Bearer …' } })
```

**浏览器给不了这个**——`WebSocket` 构造器只能传子协议，那是 Web 的历史限制，不是协议的限制。真实业务里 token 是刚需，所以我们按 iOS 的事实给。

> 子协议也收：`{ protocols: ['v1', 'v2'] }`。服务端选中的那个在 `protocol` 上读。
> **这一条还没实测**——公开的 echo 服务不协商子协议。

## 二、`ping()`

```js
await ws.ping();          // pong 回来就兑现，连接死了就拒绝
```

协议级的 ping。RFC 6455 规定对端**必须**回 Pong，所以**不需要服务端应用做任何事**——这是它比应用层心跳（自己发 `{"type":"ping"}` 等服务端回）强的地方。

浏览器不给这个 API，Web 应用只能做应用层心跳。

## 消息

```js
ws.send('文本');
ws.send(blob);            // 二进制
```

`send()` 返回 Promise，在**发出去之后**兑现——不等对端确认。没开就发会拒绝（`InvalidStateError`）。

收到的 `e.data`：文本消息是**字符串**，二进制消息是 **`Blob`**（字节不进 V8 堆，和 `fetch` 的 `blob()` 同一条路）。要字节就 `await data.arrayBuffer()`。

> **`send()` 只收字符串和 `Blob`。** Web 还接受 `ArrayBuffer` 和 TypedArray，我们还没做——先 `new Blob([bytes])` 包一下。

## `readyState` 是数字

```js
ws.readyState === WebSocket.OPEN       // 1
```

| | |
| --- | --- |
| `WebSocket.CONNECTING` | `0` |
| `WebSocket.OPEN` | `1` |
| `WebSocket.CLOSING` | `2` |
| `WebSocket.CLOSED` | `3` |

这是运行时**唯一一处枚举不用字符串**的地方。别处一律字符串（`'center'`、`'systemBlue'`），这里为了让从 Web 搬过来的 `ws.readyState === WebSocket.OPEN` 直接能跑而破例。理由记在[项目说明](../project.md)。

## 关闭

```js
ws.close();                  // 默认 1000
ws.close(1000, 'bye');
```

已经在关或者关完了再调是空操作，和 Web 一致。

`close` 事件上有三个字段：

| | |
| --- | --- |
| `code` | 走完关闭握手是你给的码（默认 1000）；**连接异常断开是 1006** |
| `reason` | 对端给的理由，没有就是空串 |
| `wasClean` | 走完握手才是 `true` |

> 1006 是 RFC 6455 规定的「异常关闭」码，**只能由端自己生成**，不会出现在线上。看到它就说明连接是断的不是关的。

## `maximumMessageSize`

一条消息最大多少字节，超了接收会失败。实测默认 **1048576**（1 MiB）。

**Web 没有这个。** 它的效果还没实测，只验了读写。

## 属性一览

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `url` | `string`（只读） | 规范化之后的地址 |
| `readyState` | `number`（只读） | 见上 |
| `protocol` | `string`（只读） | 服务端选中的子协议，没有是空串 |
| `maximumMessageSize` | `number` | 默认 1048576 |

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[session webSocketTaskWithRequest:req]` | `new WebSocket(url, { headers })` |
| `[task sendMessage:msg completionHandler:]` | `await ws.send(data)` |
| `[task receiveMessageWithCompletionHandler:]` | `message` 事件（运行时自己续读） |
| `[task sendPingWithPongReceiveHandler:]` | `await ws.ping()` |
| `[task cancelWithCloseCode:reason:]` | `ws.close(code, reason)` |
| `task.maximumMessageSize` | `ws.maximumMessageSize` |
| `URLSession:webSocketTask:didOpenWithProtocol:` | `open` 事件 |
| `URLSession:webSocketTask:didCloseWithCode:reason:` | `close` 事件 |

> `NSURLSessionWebSocketTask` 本身**不暴露**，和 `fetch` 没暴露 `NSURLSession` 是同一个分工。

## 还没做

| | |
| --- | --- |
| `send(ArrayBuffer)` / TypedArray | 先 `new Blob([bytes])` |
| `bufferedAmount` | `NSURLSessionWebSocketTask` 没有对应物。能数「发出去还没完成的条数」，但那和 Web 的「排队字节数」不是一个定义——同名不同义比没有更糟 |
| `binaryType` | 二进制永远给 `Blob`（Web 的默认也是 `'blob'`） |
| `extensions` | 原生不暴露 |
| 自动重连 | 这是业务层的事 |

**还没实测的**：子协议协商、首部真的到了服务端、`maximumMessageSize` 的效果。公开的 echo 服务都不回显这些。

---

设计理由和实测依据见[实现原理](../internals/network.md)。

← 返回 [API 文档](README.md)
