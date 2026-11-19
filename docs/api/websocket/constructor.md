---
type: reference
web: WebSocket()
---

# `WebSocket()` 构造函数

**`WebSocket()`** 构造函数创建一条连接，并立刻开始在后台连接。构造函数返回时连接还没有建立，[`readyState`](readystate.md) 是 `0`；连上后派发 [`open`](open-event.md)。

## 语法

```
new WebSocket(url)
new WebSocket(url, { headers, protocols })
```

### 参数

**`url`**

服务器的地址，字符串。协议是 `wss:`（加密）或 `ws:`（不加密）。

**`options.headers`**

可选。握手请求带的请求头，写成普通对象，每个值都是字符串，比如 `{ Authorization: 'Bearer abc123' }`。值不是字符串的那一项被忽略，不报错。传 `Headers` 对象不起作用。

请求头确实到达了服务器这一点**未在模拟器验证**：验收用的公开服务不回显请求头。

**`options.protocols`**

可选。子协议的名字，字符串数组。子协议是客户端支持的应用层协议，服务器从中选一个，选中的那个在 [`protocol`](protocol.md) 上读。**子协议的协商未在模拟器验证。**

### 返回值

新建的 `WebSocket`。它的 `readyState` 是 `0`，[`url`](url.md) 是传入的地址，[`protocol`](protocol.md) 是空字符串。

### 异常

**`TypeError`**

`url` 是空字符串或无法识别成地址：`cannot construct WebSocket with these arguments`。

地址写对了但连不上，不抛异常，通过 [`error`](error-event.md) 和 [`close`](close-event.md) 事件通知。

## 说明

- 连接没结束之前，运行时保管着这个对象。App 的代码不保存它，连接也照常工作，事件照常派发。
- 在构造之后的同一段代码里加监听器，不会错过 `open`。
- 一个 `WebSocket` 只连一次。连接结束后要再连，新建一个。

## 示例

```js
const ws = new WebSocket('wss://example.com/quotes', {
  headers: { Authorization: 'Bearer abc123' },
});
console.log(ws.readyState);
```

**结果**：控制台输出 `0`。握手请求带上 `Authorization` 请求头。

## 和 Web 的差别

浏览器里第二个参数是子协议的字符串或数组；这里是一个对象 `{ headers, protocols }`，子协议写成 `protocols`。浏览器不能给握手请求带自定义请求头，这里能。

## 参见

- [`open` 事件](open-event.md)：连上之后
- [`close()`](close.md)：关闭连接
