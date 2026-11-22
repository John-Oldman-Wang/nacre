---
type: reference
web: WebSocket error event
---

# `WebSocket`：`error` 事件

**`error`** 事件在没连上，或者连上之后中途断开时派发。之后一定跟着一个 [`close`](close-event.md)。

## 语法

```
ws.addEventListener('error', (event) => { })
```

## 事件对象

[`ErrorEvent`](../error-event.md)，只带 `message`：`filename` 是空串，`lineno`、`colno` 是 `0`，`error` 是 `undefined`。不能取消。

**[`message`](../error-event/message.md)**

字符串，系统给出的错误描述。这是一段给人读的文字，语言跟随系统设置，不要用它做判断。

## 什么时候派发

- 连不上：地址不存在、没有网络、服务器拒绝握手。
- 连上之后中途断开。
- 两种情况事件相同。`open` 有没有派发过可以区分它们：没派发过就是没连上。
- 紧接着派发 `close`，`code` 是 `1006`，`wasClean` 是 `false`。收尾的代码写在 `close` 的回调里就够了。

## 示例

```js
const ws = new WebSocket('wss://echo.websocket.org');
let opened = false;
ws.addEventListener('open', () => { opened = true; });
ws.addEventListener('error', (e) => {
  const reason = e.message;
  console.log(opened ? '中途断开' : '没连上', reason);
});
```

**效果**：连接出错时输出 `没连上` 或 `中途断开`，后面是系统的错误描述。

## 和 Web 的差别

- 浏览器的 `error` 事件不带原因；这里带 `message`。
- 没有 `onerror` 属性，只能用 `addEventListener`。

## 参见

- [`close` 事件](close-event.md)
