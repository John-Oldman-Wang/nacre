---
type: reference
native: NSURLSessionWebSocketTask
status: partial
---

# `WebSocket`

**`WebSocket`** 表示 App 和服务器之间的一条长连接。连接建立之后一直保持，双方都可以随时向对方发消息，不需要一问一答。实时行情、聊天、服务器主动推送用它；一次请求换一次响应的场合用 [`fetch`](fetch.md)。

连接由 `new WebSocket(url)` 创建。构造函数返回时连接还没有建立，它立刻开始在后台连接，结果通过事件通知：连上了派发 `open`，收到消息派发 `message`，出错派发 `error`，连接结束派发 `close`。

地址的协议是 `wss:`（加密）或 `ws:`（不加密）。

## 连接的四个阶段

`readyState` 给出连接此刻处在哪个阶段。它是一个数，四个取值在 `WebSocket` 上有对应的常量：

| `readyState` | 常量 | 含义 | 什么时候进入 |
| --- | --- | --- | --- |
| `0` | `WebSocket.CONNECTING` | 正在连接，还不能发消息 | 构造之后 |
| `1` | `WebSocket.OPEN` | 已连上，可以收发 | 派发 `open` 时 |
| `2` | `WebSocket.CLOSING` | 正在关闭 | 调了 `close()` 之后 |
| `3` | `WebSocket.CLOSED` | 已结束 | 派发 `close` 时 |

一条连接只走一遍这四个阶段。结束之后不能重新打开，要再连就新建一个 `WebSocket`。

## 监听器什么时候加

在 `new WebSocket()` 之后紧接着加监听器，不会错过事件。事件的回调都排在当前这段代码结束之后执行（见[运行时怎么工作](how-it-works.md)），所以同一段代码里先构造、后加监听器是安全的。

派发事件时还没有加监听器的，那个事件就丢失了，不会保留到之后再补发。所以不要等到 `open` 之后再去加 `message` 的监听器。

## 连接不会因为没人保存而断开

连接没结束之前，运行时保管着这个 `WebSocket` 对象。App 的代码不保存它，连接也照常工作，事件照常派发。派发 `close` 之后运行时不再保管它。

## 连不上和中途断开

连不上（地址不存在、没有网络、服务器拒绝握手）和连上之后中途断开，收到的事件相同，依次是：

1. `error`。事件对象的 `message` 是系统给出的错误描述，一段给人读的文字，语言跟随系统设置。
2. `close`。`code` 是 `1006`，`wasClean` 是 `false`，`reason` 是空字符串。

`open` 有没有派发过，可以区分这两种情况：没派发过就是没连上。

不管连接以哪种方式结束，最后都会派发一次 `close`，并且只派发一次。所以收尾的代码（停掉心跳、安排重连）只写在 `close` 的回调里就够了。

**连接断开后不会自动重连。** 要重连就在 `close` 的回调里新建一个 `WebSocket`，写法见[推荐的做法](#推荐的做法)。

## App 进入后台之后

App 进入后台后连接是否保持、回到前台时是否还能用、期间服务器发来的消息会不会丢，**未在模拟器验证**。

App 在后台一小段时间后会被系统暂停，这来自 iOS 的定义。按照这一点，回到前台时应当把连接当作可能已经断开来处理：监听 `close` 并重连，或者在 [`application`](application.md) 的 `foreground` 事件里用 `ping()` 检查一次。

## 握手时可以带请求头

构造函数的第二个参数里可以给 `headers`，这些请求头随握手请求一起发给服务器。登录令牌可以放在这里：

```js
const ws = new WebSocket('wss://example.com/quotes', {
  headers: { Authorization: 'Bearer abc123' },
});
```

**结果**：握手请求带上 `Authorization` 请求头。**请求头确实到达了服务器这一点未在模拟器验证**：验收用的公开服务不回显请求头。

`headers` 要写成普通对象，每个值都是字符串。值不是字符串的那一项会被忽略，不报错。传 `Headers` 对象不起作用。

## `ping()` 检查连接是否还通

`ping()` 向服务器发一个协议层面的探测帧。协议规定服务器收到后必须回应，这个回应由服务器的 WebSocket 实现自动完成，不需要服务器的业务代码配合。

`ping()` 返回 Promise：回应到了就兑现，连接已经不通就拒绝。它用来确认一条 `readyState` 是 `1` 的连接此刻确实还通。

## 推荐的做法

长时间使用的连接要自己处理两件事：定时用 `ping()` 检查连接，断开后隔一段时间重连。下面是一个最小的写法。

```js
/**
 * 保持一条连接：断了就重连，每 30 秒探测一次。
 * @param {string} url
 * @param {(data: string | Blob) => void} onMessage
 */
function keepConnected(url, onMessage) {
  let attempts = 0;
  let stopped = false;
  /** @type {WebSocket | null} */
  let current = null;

  function open() {
    const ws = new WebSocket(url);
    current = ws;
    /** @type {number | undefined} */
    let heartbeat;

    ws.addEventListener('open', () => {
      attempts = 0;
      // 探测失败就主动关掉，交给 close 的回调去重连
      heartbeat = setInterval(() => {
        ws.ping().catch(() => ws.close());
      }, 30000);
    });

    ws.addEventListener('message', (e) => {
      onMessage(/** @type {WebSocketMessageEvent} */ (e).data);
    });

    // 不管怎么结束的，最后都到这里
    ws.addEventListener('close', () => {
      clearInterval(heartbeat);
      if (stopped) return;
      // 重连的间隔逐次加倍：1 秒、2 秒、4 秒……最长 30 秒
      const delay = Math.min(30000, 1000 * 2 ** attempts);
      attempts += 1;
      setTimeout(open, delay);
    });
  }

  open();

  return {
    stop() {
      stopped = true;
      if (current) current.close();
    },
  };
}

const connection = keepConnected('wss://example.com/quotes', (data) => {
  console.log('收到', data);
});
```

**结果**：连接建立后收到的每条消息输出一行。连接结束后隔一段时间自动新建连接，间隔从 1000 毫秒起逐次加倍，最长 30000 毫秒，连上后重新从 1000 毫秒算。调 `connection.stop()` 之后关闭连接，不再重连。

这段代码**未在模拟器验证**。其中这几点没有验证过：

- `ping()` 在连接不通时确实会拒绝，以及要等多久才拒绝。
- 探测失败后调 `close()`，`close` 事件确实会派发。
- App 从后台回来之后这套逻辑是否正常工作。

几点说明：

- **重连的间隔要逐次加长。** 服务器出故障时，所有客户端都以固定的短间隔重连，会让它更难恢复。
- **重连后要重新订阅。** 新连接和旧连接没有关系，登录、订阅这类消息要在新连接的 `open` 里重新发一遍。
- **探测用 `ping()`，不用自己定义的心跳消息。** `ping()` 不需要服务器的业务代码配合。服务器要求客户端定时发某种业务消息时，再按它的要求另外发。

## 完整例子

下面的代码连接一个把消息原样发回来的公开服务，发一条文本，收到回应后关闭连接。它不需要界面，直接写在 `main.js` 顶层就能运行。

```js
// 1. 建立连接。这一行返回时还没连上
const ws = new WebSocket('wss://echo.websocket.org');

// 2. 连上之后发一条消息
ws.addEventListener('open', () => {
  console.log('连上了');
  ws.send('hello');
});

// 3. 收到消息
ws.addEventListener('message', (e) => {
  const data = /** @type {WebSocketMessageEvent} */ (e).data;
  console.log('收到', data);

  // 4. 收到自己发的那条之后关闭
  if (data === 'hello') ws.close(1000, 'bye');
});

// 5. 出错和结束
ws.addEventListener('error', (e) => {
  console.log('出错', /** @type {WebSocketErrorEvent} */ (e).message);
});
ws.addEventListener('close', (e) => {
  const { code, wasClean } = /** @type {WebSocketCloseEvent} */ (e);
  console.log('结束', code, wasClean);
});
```

**结果**

- 连上后输出 `连上了`。
- 服务器把 `hello` 发回来，输出 `收到 hello`。这个服务在连上时可能先发一条自己的欢迎消息，那一条也会输出。
- 关闭完成后输出 `结束 1000 true`。
- 连不上时输出 `出错` 加一段系统的错误描述，然后输出 `结束 1006 false`。

事件对象要转一次类型才能读 `data`、`message`、`code` 这些字段：回调参数的类型是通用的 `Event`。上面 `/** @type {...} */ (e)` 就是做这件事。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里对着同一个服务运行过。

## 常见用法

以下例子都假设已经有上面的 `ws`，并且连接已经打开。

### 发文本

```js
ws.send('文本').then(() => {
  console.log('已发出');
});
```

**结果**：消息发出后输出 `已发出`。Promise 兑现表示消息已经交给网络发送，不表示服务器已经收到。

### 发二进制数据

```js
ws.send(new Uint8Array([1, 2, 3, 4, 5]));
```

**结果**：服务器收到一条 5 字节的二进制消息。`ArrayBuffer`、类型数组、[`Blob`](fetch.md) 都按二进制消息发送。

### 区分收到的是文本还是二进制

```js
ws.addEventListener('message', async (e) => {
  const data = /** @type {WebSocketMessageEvent} */ (e).data;
  if (typeof data === 'string') {
    console.log('文本', data);
  } else {
    const bytes = new Uint8Array(await data.arrayBuffer());
    console.log('二进制', bytes.length, '字节');
  }
});
```

**结果**：文本消息输出它的内容。二进制消息输出它的字节数。

文本消息的 `data` 是字符串，二进制消息的 `data` 是 `Blob`。`Blob` 的 `size` 是字节数，要读字节用 `await data.arrayBuffer()`。

### 收发 JSON

```js
ws.send(JSON.stringify({ type: 'subscribe', symbol: 'AAPL' }));

ws.addEventListener('message', (e) => {
  const data = /** @type {WebSocketMessageEvent} */ (e).data;
  if (typeof data !== 'string') return;
  try {
    const msg = JSON.parse(data);
    console.log(msg.type);
  } catch (err) {
    console.log('不是 JSON');
  }
});
```

**结果**：发出一条 JSON 文本。收到的每条文本消息按 JSON 解析，输出它的 `type`。**这个例子未在模拟器验证。**

### 连上之前就想发消息

连接还没打开时调 `send()`，Promise 被拒绝，消息不会留到连上之后再发。把要发的内容放进 `open` 的回调：

```js
const early = new WebSocket('wss://echo.websocket.org');

early.send('too early').catch((err) => {
  console.log(err.name, err.message);
});

early.addEventListener('open', () => {
  early.send('现在可以了');
});
```

**结果**：先输出 `InvalidStateError send: the socket is not open`。连上之后第二条消息正常发出。

### 检查连接是否还通

```js
ws.ping().then(
  () => console.log('连接正常'),
  (err) => console.log('连接不通', err.message),
);
```

**结果**：服务器回应后输出 `连接正常`。连接不通时输出 `连接不通` 加错误描述，**这一种未在模拟器验证**。

### 关闭连接

```js
ws.close(1000, 'bye');
console.log(ws.readyState === WebSocket.CLOSING);
```

**结果**：输出 `true`。`close()` 立刻返回，`readyState` 变成 `2`。关闭完成后派发 `close`，`readyState` 变成 `3`，事件的 `code` 是 `1000`，`wasClean` 是 `true`。

### 读懂关闭的原因

```js
ws.addEventListener('close', (e) => {
  const { code, reason, wasClean } = /** @type {WebSocketCloseEvent} */ (e);
  if (wasClean) {
    console.log('正常关闭', code, reason);
  } else {
    console.log('连接断了', code);
  }
});
```

**结果**：双方按协议完成关闭时输出 `正常关闭` 加关闭码和原因。连接异常结束时输出 `连接断了 1006`。

## 关闭码

`close` 事件的 `code` 说明连接为什么结束。

| `wasClean` | `code` | 含义 |
| --- | --- | --- |
| `true` | App 调 `close()` 时给的码，默认 `1000` | App 主动关闭，双方按协议完成了关闭 |
| `true` | 服务器给的码 | 服务器主动关闭。**未在模拟器验证** |
| `false` | `1006` | 没连上，或者连接中途断开。`1006` 不是服务器发来的，是本机在连接异常结束时填的 |

常见的码：`1000` 是正常关闭，`1001` 是一方要离开（比如服务器停机），`1008` 是违反了服务器的规则，`1009` 是消息太大，`1011` 是服务器内部出错。`4000` 到 `4999` 留给业务自己定义，含义要看服务器的文档。

## 成员说明

### `new WebSocket(url, options?)`

创建连接并立刻开始连接。

- **参数**：`url` 是地址，字符串。`options` 可选：

  | 成员 | 类型 | 含义 |
  | --- | --- | --- |
  | `headers` | 普通对象，值是字符串 | 握手请求带的请求头 |
  | `protocols` | 字符串数组 | 子协议：客户端支持的应用层协议的名字，服务器从中选一个。选中的那个在 `protocol` 上读。**子协议的协商未在模拟器验证** |

- **出错**：`url` 是空字符串或无法识别成地址时抛 `TypeError: cannot construct WebSocket with these arguments`。地址写对了但连不上，不会抛异常，通过 `error` 和 `close` 事件通知。
- `WebSocket` 不能被继承，见[原生类](native-classes.md)。

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `url` | 字符串 | 是 | 否 | | 连接的地址 |
| `readyState` | 数，取值 `0` 到 `3` | 是 | 否 | `0` | 连接所处的阶段，见[连接的四个阶段](#连接的四个阶段)。变成 `1` 时派发 `open`，变成 `3` 时派发 `close`。调 `close()` 后变成 `2`，这次变化没有事件，因为它是 App 自己的调用引起的 |
| `protocol` | 字符串 | 是 | 否 | `''` | 服务器选中的子协议。连上之前、服务器没有选时是空字符串 |
| `maximumMessageSize` | 数，单位是字节 | 是 | 是 | `1048576`（实测） | 能接收的单条消息的最大长度。超过时接收失败。**超过时具体发生什么未在模拟器验证**，只验证了这个值能读能写 |

`WebSocket.CONNECTING`、`WebSocket.OPEN`、`WebSocket.CLOSING`、`WebSocket.CLOSED` 是四个只读的常量，值是 `0`、`1`、`2`、`3`。

### `send(data)`

发一条消息。

- **参数**：`data` 是字符串（发文本消息），或者 `Blob`、`ArrayBuffer`、类型数组（发二进制消息）。
- **返回值**：Promise。消息交给网络发出后兑现为 `true`，不等服务器确认。
- **出错**：Promise 被拒绝，错误对象的 `name` 区分原因。
  - 连接没有打开（还在连接、正在关闭、已经结束）：`name` 是 `InvalidStateError`，`message` 是 `send: the socket is not open`
  - `data` 不是上面几种类型：`name` 是 `InvalidStateError`，`message` 是 `send: expects a string or a Blob`
  - 发送过程中网络出错：`name` 是 `NetworkError`，`message` 是系统的错误描述
- 单条消息能发多大，**未在模拟器验证**。

### `ping()`

向服务器发一个探测帧，等它回应。

- **参数**：无。
- **返回值**：Promise。收到回应后兑现为 `true`。
- **出错**：连接不通时 Promise 被拒绝，`name` 是 `NetworkError`，`message` 是系统的错误描述。**未在模拟器验证**。连接还没打开时调用会怎样，**未在模拟器验证**。

### `close(code?, reason?)`

关闭连接。

- **参数**：`code` 是关闭码，整数，默认 `1000`。`reason` 是给服务器的说明，字符串，可以不传。
- **返回值**：无。立刻返回，关闭完成后派发 `close`。
- 连接正在关闭或已经结束时再调，什么也不做，不报错。
- 连接还在连接中时调用，`readyState` 变成 `2`。之后派发哪些事件，**未在模拟器验证**。
- **出错**：`code` 转不成数时抛 `TypeError`。

### 事件

用 `addEventListener(type, callback)` 监听。`type` 只能是下面四个，写了别的名字抛 `TypeError: addEventListener has no value "ping"; expected one of: open / message / error / close`。

| 事件 | 什么时候派发 | 事件对象上多出的字段 |
| --- | --- | --- |
| `open` | 连上了 | 无 |
| `message` | 收到一条消息 | `data`：字符串或 `Blob` |
| `error` | 没连上，或者连接中途断开。之后一定跟着一个 `close` | `message`：字符串，系统的错误描述 |
| `close` | 连接结束。每条连接只派发一次 | `code`：数，关闭码。`reason`：字符串，对方给的说明，没有是空字符串。`wasClean`：布尔，`true` 表示双方按协议完成了关闭，`false` 表示连接异常结束 |

四个事件都不能取消。事件对象在类型定义里对应 `WebSocketMessageEvent`、`WebSocketErrorEvent`、`WebSocketCloseEvent`。

没有 `onopen`、`onmessage` 这类属性，只能用 `addEventListener`。

## 与 iOS 原生写法的对照

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

## 和浏览器的对照

`WebSocket` 的名字和大部分成员与浏览器里的相同。下面列出不同的地方。

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| 构造函数的第二个参数 | 子协议的字符串或数组 | 一个对象：`{ headers, protocols }` |
| 握手时带自定义请求头 | 不能 | 能，用 `headers` |
| `ping()` | 没有 | 有 |
| `maximumMessageSize` | 没有 | 有 |
| `send()` 的返回值 | 无 | Promise |
| 连接没打开时调 `send()` | 抛异常 | 返回的 Promise 被拒绝 |
| 二进制消息的 `data` | 默认是 `Blob`，可用 `binaryType` 改成 `ArrayBuffer` | 总是 `Blob` |
| `onopen` 等属性 | 有 | 没有 |
| `error` 事件 | 不带原因 | 带 `message` |
| `bufferedAmount`、`extensions`、`binaryType` | 有 | 没有 |
| `readyState` 的取值和四个常量 | 数 | 相同 |

## 还不能做的

| 想做的事 | 状态 |
| --- | --- |
| 知道还有多少数据排队没发出去（`bufferedAmount`） | 未实现。`NSURLSessionWebSocketTask` 没有对应的值 |
| 让二进制消息直接以 `ArrayBuffer` 到达（`binaryType`） | 未实现。收到 `Blob` 后调 `arrayBuffer()` |
| 读服务器启用的协议扩展（`extensions`） | 未实现。`NSURLSessionWebSocketTask` 不提供 |
| 断开后自动重连 | 运行时不做。写法见[推荐的做法](#推荐的做法) |
| App 在后台时保持连接 | 未实现。对应 iOS 的后台任务 |

## 参见

- [`fetch`](fetch.md)：一次请求换一次响应的场合；`Blob` 的说明也在那里
- [定时器](timers.md)：心跳和重连用到的 `setInterval`、`setTimeout`
- [`application`](application.md)：`foreground` 事件，App 回到前台的时刻
- [`URL`](url.md)：拼接和检查连接地址
- [运行时怎么工作](how-it-works.md)：事件的回调什么时候执行
