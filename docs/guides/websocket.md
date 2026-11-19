# 用 WebSocket 收发消息

这一篇讲怎么用 [`WebSocket`](../api/websocket.md) 和服务器保持一条长连接：连接、收发文本和二进制、收发 JSON、关闭，以及断开后自动重连、定时检查连接。每个成员的细节在 [`WebSocket`](../api/websocket.md) 的参考页。

## 推荐的做法

- **构造之后紧接着加监听器。** 事件的回调排在当前这段代码结束之后执行，同一段代码里先构造、后加监听器是安全的。不要等到 `open` 之后再去加 `message` 的监听器：派发时没有监听器的消息就丢失了。
- **要发的第一条消息写进 `open` 的回调。** 连上之前调 `send()`，Promise 被拒绝，消息不会留到连上之后再发。
- **收尾的代码只写在 `close` 的回调里。** 不管连接怎么结束，最后都派发一次 `close`，并且只派发一次。
- **长时间使用的连接，自己处理重连和检查。** 连接断开后不会自动重连。用 `ping()` 定时检查，断开后隔一段逐次加长的时间重连，写法见[保持一条长期使用的连接](#保持一条长期使用的连接)。

## 第一条连接

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

**效果**

- 连上后输出 `连上了`。
- 服务器把 `hello` 发回来，输出 `收到 hello`。这个服务在连上时可能先发一条自己的欢迎消息，那一条也会输出。
- 关闭完成后输出 `结束 1000 true`。
- 连不上时输出 `出错` 加一段系统的错误描述，然后输出 `结束 1006 false`。

事件回调的参数类型是通用的 `Event`，要转一次类型才能读 `data`、`message`、`code` 这些字段，上面 `/** @type {...} */ (e)` 就是做这件事。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里对着同一个服务运行过。

下面的例子沿用这里的 `ws`，并且假设连接已经打开。

## 发文本

```js
ws.send('文本').then(() => {
  console.log('已发出');
});
```

**效果**：消息发出后输出 `已发出`。Promise 兑现表示消息已经交给网络发送，不表示服务器已经收到。

## 发二进制数据

```js
ws.send(new Uint8Array([1, 2, 3, 4, 5]));
```

**效果**：服务器收到一条 5 字节的二进制消息。`ArrayBuffer`、类型数组、[`Blob`](../api/fetch.md) 都按二进制消息发送。

## 区分收到的是文本还是二进制

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

**效果**：文本消息输出它的内容。二进制消息输出它的字节数。

文本消息的 `data` 是字符串，二进制消息的 `data` 是 `Blob`。`Blob` 的 `size` 是字节数，要读字节用 `await data.arrayBuffer()`。

## 收发 JSON

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

**效果**：发出一条 JSON 文本。收到的每条文本消息按 JSON 解析，输出它的 `type`。**这个例子未在模拟器验证。**

## 连上之前就想发消息

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

**效果**：先输出 `InvalidStateError send: the socket is not open`。连上之后第二条消息正常发出。

## 检查连接是否还通

```js
ws.ping().then(
  () => console.log('连接正常'),
  (err) => console.log('连接不通', err.message),
);
```

**效果**：服务器回应后输出 `连接正常`。连接不通时输出 `连接不通` 加错误描述，**这一种未在模拟器验证**。

[`ping()`](../api/websocket/ping.md) 发的是协议层面的探测帧，服务器的 WebSocket 实现自动回应，不需要服务器的业务代码配合。

## 关闭连接

```js
ws.close(1000, 'bye');
console.log(ws.readyState === WebSocket.CLOSING);
```

**效果**：输出 `true`。`close()` 立刻返回，`readyState` 变成 `2`。关闭完成后派发 `close`，`readyState` 变成 `3`，事件的 `code` 是 `1000`，`wasClean` 是 `true`。

## 读懂关闭的原因

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

**效果**：双方按协议完成关闭时输出 `正常关闭` 加关闭码和原因。连接异常结束时输出 `连接断了 1006`。各个关闭码的含义见 [`close` 事件](../api/websocket/close-event.md#关闭码)。

## 握手时带上登录令牌

构造函数的第二个参数里可以给 `headers`，这些请求头随握手请求一起发给服务器：

```js
const authed = new WebSocket('wss://example.com/quotes', {
  headers: { Authorization: 'Bearer abc123' },
});
```

**效果**：握手请求带上 `Authorization` 请求头。**请求头确实到达了服务器这一点未在模拟器验证**：验收用的公开服务不回显请求头。

`headers` 要写成普通对象，每个值都是字符串。值不是字符串的那一项会被忽略，不报错。传 `Headers` 对象不起作用。

## 保持一条长期使用的连接

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
    const socket = new WebSocket(url);
    current = socket;
    /** @type {number | undefined} */
    let heartbeat;

    socket.addEventListener('open', () => {
      attempts = 0;
      // 探测失败就主动关掉，交给 close 的回调去重连
      heartbeat = setInterval(() => {
        socket.ping().catch(() => socket.close());
      }, 30000);
    });

    socket.addEventListener('message', (e) => {
      onMessage(/** @type {WebSocketMessageEvent} */ (e).data);
    });

    // 不管怎么结束的，最后都到这里
    socket.addEventListener('close', () => {
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

**效果**：连接建立后收到的每条消息输出一行。连接结束后隔一段时间自动新建连接，间隔从 1000 毫秒起逐次加倍，最长 30000 毫秒，连上后重新从 1000 毫秒算。调 `connection.stop()` 之后关闭连接，不再重连。

这段代码**未在模拟器验证**。其中这几点没有验证过：

- `ping()` 在连接不通时确实会拒绝，以及要等多久才拒绝。
- 探测失败后调 `close()`，`close` 事件确实会派发。
- App 从后台回来之后这套逻辑是否正常工作。

几点说明：

- **重连的间隔要逐次加长。** 服务器出故障时，所有客户端都以固定的短间隔重连，会让它更难恢复。
- **重连后要重新订阅。** 新连接和旧连接没有关系，登录、订阅这类消息要在新连接的 `open` 里重新发一遍。
- **探测用 `ping()`，不用自己定义的心跳消息。** `ping()` 不需要服务器的业务代码配合。服务器要求客户端定时发某种业务消息时，再按它的要求另外发。

## App 进入后台之后

App 进入后台后连接是否保持、回到前台时是否还能用、期间服务器发来的消息会不会丢，**未在模拟器验证**。

App 在后台一小段时间后会被系统暂停，这来自 iOS 的定义。按照这一点，回到前台时应当把连接当作可能已经断开来处理：监听 `close` 并重连，或者在 [`application`](../api/application.md) 的 `foreground` 事件里用 `ping()` 检查一次。

## 参见

- [`WebSocket`](../api/websocket.md)：全部属性、方法和事件
- [`fetch`](../api/fetch.md)：一次请求换一次响应的场合；`Blob` 的说明也在那里
- [定时器](../api/timers.md)：`setInterval`、`setTimeout`
- [`application`](../api/application.md)：`foreground` 事件
