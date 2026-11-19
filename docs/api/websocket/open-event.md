---
type: reference
web: WebSocket open event
---

# `WebSocket`：`open` 事件

**`open`** 事件在连接建立时派发。派发之后可以收发消息。

## 语法

```
ws.addEventListener('open', (event) => { })
```

## 事件对象

`Event`，除 `type`、`target` 以外不带别的字段。不能取消。

## 什么时候派发

- 握手完成、连接建立时，派发一次。这时 [`readyState`](readystate.md) 已经是 `1`，[`protocol`](protocol.md) 已经确定。
- 没连上的连接不派发 `open`，直接派发 [`error`](error-event.md) 和 [`close`](close-event.md)。所以 `open` 有没有派发过，可以区分「没连上」和「连上后断开」。
- 回调排在当前这段代码结束之后执行。构造之后在同一段代码里加的监听器不会错过它。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
ws.addEventListener('open', () => {
  console.log('连上了');
  ws.send('hello');
});
```

**效果**：连上后输出 `连上了`，然后发出 `hello`。

## 和 Web 的差别

浏览器还可以用 `ws.onopen = …` 监听；这里没有 `onopen` 属性，只能用 `addEventListener`。

## 参见

- [`send()`](send.md)
