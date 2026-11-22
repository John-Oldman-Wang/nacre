---
type: reference
web: MessageEvent()
---

# `MessageEvent()` 构造函数

**`MessageEvent()`** 构造函数创建一个 `MessageEvent`。

## 语法

```
new MessageEvent(type)
new MessageEvent(type, { data, origin, lastEventId, source, ports, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.data`**

可选，对应 [`data`](data.md) 属性。任何值，原样保存。不传是 `null`。

**`options.origin`**

可选，对应 [`origin`](origin.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 空串。

**`options.lastEventId`**

可选，对应 [`lastEventId`](lasteventid.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 空串。

**`options.source`**

可选，对应 [`source`](source.md) 属性。任何值，原样保存。不传是 `null`。

**`options.ports`**

可选，对应 [`ports`](ports.md) 属性。要能迭代（数组、`Set`……），转成一个新数组并冻结；别的抛 `TypeError`。不传是 冻结的空数组。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `MessageEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'MessageEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new MessageEvent('message', { data: 'hi' });
console.log(event.data, event.origin === '', event.source, event.ports.length);
```

**结果**：控制台输出 `hi true null 0`。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `new MessageEvent()`。

## 参见

- [`MessageEvent`](../message-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
