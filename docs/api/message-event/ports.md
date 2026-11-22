---
type: reference
web: MessageEvent.ports
---

# `MessageEvent`：`ports` 属性

**`ports`** 属性是随消息一起传过来的端口。运行时派发的消息不带端口，总是空数组。

## 值

数组，冻结的：不能往里加东西。

- 只读。给它赋值抛 `TypeError`。
- 建事件时给了数组，存的是它的一份冻结的副本。
- 用 [`new`](constructor.md) 创建时没给，是 冻结的空数组。

## 示例

```js
const event = new MessageEvent('message');
console.log(event.ports.length, Object.isFrozen(event.ports));
```

**效果**：控制台输出 `0 true`。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `MessageEvent.ports`。

## 参见

- [`MessageEvent`](../message-event.md)
