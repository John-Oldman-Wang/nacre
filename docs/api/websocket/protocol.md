---
type: reference
web: WebSocket.protocol
---

# `WebSocket`：`protocol` 属性

**`protocol`** 属性是服务器选中的子协议。子协议是构造时用 `protocols` 提出的应用层协议名。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 连上之前是空字符串 `''`。
- 连上之后是服务器从 `protocols` 里选中的那一个；服务器没有选时是空字符串。**连上之后的值未在模拟器验证。**
- 在派发 [`open`](open-event.md) 时确定，之后不变。

## 示例

```js
const ws = new WebSocket('wss://example.com/chat', { protocols: ['chat.v2', 'chat.v1'] });
ws.addEventListener('open', () => {
  console.log(ws.protocol);
});
```

**结果**：连上后输出服务器选中的子协议，比如 `chat.v2`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。子协议在构造时的写法不同，见 [`WebSocket()`](constructor.md#和-web-的差别)。

## 参见

- [`WebSocket()`](constructor.md)：`options.protocols`
