---
type: reference
native: WebContentsIpcMessageEvent()
---

# `WebContentsIpcMessageEvent()` 构造函数

**`WebContentsIpcMessageEvent()`** 构造函数创建一个 `WebContentsIpcMessageEvent`。

## 语法

```
new WebContentsIpcMessageEvent(type)
new WebContentsIpcMessageEvent(type, { channel, args, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.channel`**

可选，对应 [`channel`](channel.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 空串。

**`options.args`**

可选，对应 [`args`](args.md) 属性。要能迭代（数组、`Set`……），转成一个新数组；别的抛 `TypeError`。不传是 空数组。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `WebContentsIpcMessageEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'WebContentsIpcMessageEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new WebContentsIpcMessageEvent('ipc-message', { channel: 'share', args: [42] });
console.log(event.channel, event.args[0]);
```

**结果**：控制台输出 `share 42`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`WebContentsIpcMessageEvent`](../web-contents-ipc-message-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
