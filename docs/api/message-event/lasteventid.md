---
type: reference
web: MessageEvent.lastEventId
---

# `MessageEvent`：`lastEventId` 属性

**`lastEventId`** 属性是消息的编号。

## 值

字符串。运行时派发的消息没有编号，是空串。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 空串。

## 示例

```js
const event = new MessageEvent('message', { data: 'hi', lastEventId: '7' });
console.log(event.lastEventId);
```

**效果**：控制台输出 `7`。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `MessageEvent.lastEventId`。

## 参见

- [`MessageEvent`](../message-event.md)
