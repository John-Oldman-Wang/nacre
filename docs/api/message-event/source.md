---
type: reference
web: MessageEvent.source
---

# `MessageEvent`：`source` 属性

**`source`** 属性总是 `null`。

## 值

`null`。

- 只读。给它赋值抛 `TypeError`。
- 建事件时给 `source` 也只能给 `null`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const event = new MessageEvent('message');
console.log(event.source);
```

**效果**：控制台输出 `null`。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `MessageEvent.source`。

## 参见

- [`MessageEvent`](../message-event.md)
