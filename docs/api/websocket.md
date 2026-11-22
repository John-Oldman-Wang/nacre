---
type: reference
web: WebSocket
native: NSURLSessionWebSocketTask
status: partial
---

# `WebSocket`

**`WebSocket`** 表示 App 和服务器之间的一条长连接。连接建立之后一直保持，双方都可以随时向对方发消息，不需要一问一答。实时行情、聊天、服务器主动推送用它；一次请求换一次响应的场合用 [`fetch`](fetch.md)。

连接由 `new WebSocket(url)` 创建。构造函数返回时连接还没有建立，它立刻开始在后台连接，结果通过事件通知：连上了派发 [`open`](websocket/open-event.md)，收到消息派发 [`message`](websocket/message-event.md)，出错派发 [`error`](websocket/error-event.md)，连接结束派发 [`close`](websocket/close-event.md)。

地址的协议是 `wss:`（加密）或 `ws:`（不加密）。

**继承关系**：[`EventTarget`](event-target.md) → `WebSocket`

`WebSocket` 不能被继承，见[原生类](native-classes.md)。怎么保持一条长期使用的连接、收发各种消息，见指南[用 WebSocket 收发消息](../guides/websocket.md)。

## 构造函数

[`WebSocket()`](websocket/constructor.md)

创建一条连接并立刻开始连接。可以给握手请求带请求头。

## 静态属性

四个常量，是 [`readyState`](websocket/readystate.md) 的四个取值：

| 常量 | 说明 |
| --- | --- |
| [`WebSocket.CONNECTING`](websocket/connecting.md) <small>只读</small> | `0`，正在连接 |
| [`WebSocket.OPEN`](websocket/open.md) <small>只读</small> | `1`，已连上 |
| [`WebSocket.CLOSING`](websocket/closing.md) <small>只读</small> | `2`，正在关闭 |
| [`WebSocket.CLOSED`](websocket/closed.md) <small>只读</small> | `3`，已结束 |

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`url`](websocket/url.md) <small>只读</small> | 连接的地址 |
| [`readyState`](websocket/readystate.md) <small>只读</small> | 连接所处的阶段 |
| [`protocol`](websocket/protocol.md) <small>只读</small> | 服务器选中的子协议 |
| [`maximumMessageSize`](websocket/maximummessagesize.md) | 能接收的单条消息的最大长度，单位是字节 |

## 实例方法

还继承 `EventTarget` 的 `addEventListener()`、`removeEventListener()`、`dispatchEvent()`。

| 方法 | 说明 |
| --- | --- |
| [`send()`](websocket/send.md) | 发一条文本或二进制消息。返回 Promise |
| [`ping()`](websocket/ping.md) | 检查连接是否还通。返回 Promise |
| [`close()`](websocket/close.md) | 关闭连接 |

## 事件

用 `addEventListener()` 监听。没有 `onopen`、`onmessage` 这类属性。

| 事件 | 什么时候派发 |
| --- | --- |
| [`open`](websocket/open-event.md) | 连上了 |
| [`message`](websocket/message-event.md) | 收到一条消息 |
| [`error`](websocket/error-event.md) | 没连上，或者连接中途断开。之后一定跟着一个 `close` |
| [`close`](websocket/close-event.md) | 连接结束。每条连接只派发一次 |

`message` 的事件对象是 [`MessageEvent`](message-event.md)，`error` 的是 [`ErrorEvent`](error-event.md)，`close` 的是 [`CloseEvent`](close-event.md)，`open` 的是普通的 [`Event`](event.md)。四个事件都不能取消。监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

事件的回调都排在当前这段代码结束之后执行（见[运行时怎么工作](how-it-works.md)），所以在 `new WebSocket()` 之后紧接着加监听器，不会错过事件。派发事件时还没有加监听器的，那个事件就丢失了，不会补发。

## 连接的四个阶段

[`readyState`](websocket/readystate.md) 给出连接此刻处在哪个阶段：

| `readyState` | 常量 | 含义 | 什么时候进入 |
| --- | --- | --- | --- |
| `0` | `WebSocket.CONNECTING` | 正在连接，还不能发消息 | 构造之后 |
| `1` | `WebSocket.OPEN` | 已连上，可以收发 | 派发 `open` 时 |
| `2` | `WebSocket.CLOSING` | 正在关闭 | 调了 `close()` 之后 |
| `3` | `WebSocket.CLOSED` | 已结束 | 派发 `close` 时 |

一条连接只走一遍这四个阶段。结束之后不能重新打开，要再连就新建一个 `WebSocket`。

## 连接怎么结束

- **App 调 `close()`**：双方按协议完成关闭，派发 `close`，`wasClean` 是 `true`。
- **服务器主动关闭**：派发 `close`，`code` 是服务器给的码。**未在模拟器验证。**
- **连不上，或者连上之后中途断开**：先派发 `error`，再派发 `close`，`code` 是 `1006`，`wasClean` 是 `false`。`open` 有没有派发过，可以区分这两种情况。

不管以哪种方式结束，最后都会派发一次 `close`，并且只派发一次。**连接断开后不会自动重连。**

连接没结束之前，运行时保管着这个 `WebSocket` 对象。App 的代码不保存它，连接也照常工作，事件照常派发。派发 `close` 之后运行时不再保管它。

## 示例

### 发一条消息，收到回应后关闭

下面的代码连接一个把消息原样发回来的公开服务，发一条文本，收到回应后关闭连接。它不需要界面，直接写在 `main.js` 顶层就能运行。

```js
const ws = new WebSocket('wss://echo.websocket.org');

ws.addEventListener('open', () => {
  console.log('连上了');
  ws.send('hello');
});

ws.addEventListener('message', (e) => {
  const data = e.data;
  console.log('收到', data);
  if (data === 'hello') ws.close(1000, 'bye');
});

ws.addEventListener('error', (e) => {
  console.log('出错', e.message);
});
ws.addEventListener('close', (e) => {
  const { code, wasClean } = e;
  console.log('结束', code, wasClean);
});
```

**效果**

- 连上后输出 `连上了`。
- 服务器把 `hello` 发回来，输出 `收到 hello`。这个服务在连上时可能先发一条自己的欢迎消息，那一条也会输出。
- 关闭完成后输出 `结束 1000 true`。
- 连不上时输出 `出错` 加一段系统的错误描述，然后输出 `结束 1006 false`。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里对着同一个服务运行过。

更多写法见指南[用 WebSocket 收发消息](../guides/websocket.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[session webSocketTaskWithRequest:req]` 加 `[task resume]` | `new WebSocket(url, { headers })` |
| `[task sendMessage:msg completionHandler:]` | `await ws.send(data)` |
| `[task receiveMessageWithCompletionHandler:]`，每收一条要再调一次 | `message` 事件，持续派发 |
| `[task sendPingWithPongReceiveHandler:]` | `await ws.ping()` |
| `[task cancelWithCloseCode:reason:]` | `ws.close(code, reason)` |
| `task.maximumMessageSize` | `ws.maximumMessageSize` |
| `URLSession:webSocketTask:didOpenWithProtocol:` | `open` 事件 |
| `URLSession:webSocketTask:didCloseWithCode:reason:` | `close` 事件，`wasClean` 是 `true` |
| `URLSession:task:didCompleteWithError:` | `error` 事件加 `close` 事件，`code` 是 `1006` |

`NSURLSessionWebSocketTask` 本身不能在 JS 里直接使用。

## 和 Web 的差别

名字和大部分成员与浏览器里的 `WebSocket` 相同。不同的地方：

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| 构造函数的第二个参数 | 子协议的字符串或数组 | 一个对象：`{ headers, protocols }`，见 [`WebSocket()`](websocket/constructor.md) |
| 握手时带自定义请求头 | 不能 | 能，用 `headers` |
| [`ping()`](websocket/ping.md) | 没有 | 有 |
| [`maximumMessageSize`](websocket/maximummessagesize.md) | 没有 | 有 |
| [`send()`](websocket/send.md) 的返回值 | 无 | Promise |
| 连接没打开时调 `send()` | 抛异常 | 返回的 Promise 被拒绝 |
| 二进制消息的 `data` | 默认是 `Blob`，可用 `binaryType` 改成 `ArrayBuffer` | 总是 `Blob` |
| `onopen` 等属性 | 有 | 没有 |
| `error` 事件 | 不带原因 | 带 `message` |
| `bufferedAmount`、`extensions`、`binaryType` | 有 | 没有 |
| 实例上的 `ws.OPEN` 等常量 | 有 | 没有，只在 `WebSocket` 上 |
| `readyState` 的取值和四个常量的值 | 数 | 相同 |

## 参见

- [用 WebSocket 收发消息](../guides/websocket.md)：文本、二进制、JSON、重连、心跳、App 回到前台
- [`fetch`](fetch.md)：一次请求换一次响应的场合；`Blob` 的说明也在那里
- [定时器](timers.md)：心跳和重连用到的 `setInterval`、`setTimeout`
- [`application`](application.md)：`foreground` 事件，App 回到前台的时刻
- [`URL`](url.md)：拼接和检查连接地址
- [运行时怎么工作](how-it-works.md)：事件的回调什么时候执行
