---
type: reference
native: CADisplayLinkEvent()
---

# `CADisplayLinkEvent()` 构造函数

**`CADisplayLinkEvent()`** 构造函数创建一个 `CADisplayLinkEvent`。

## 语法

```
new CADisplayLinkEvent(type)
new CADisplayLinkEvent(type, { frame, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.frame`**

可选，对应 [`frame`](frame.md) 属性。任何值，原样保存。不传是 `null`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `CADisplayLinkEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'CADisplayLinkEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new CADisplayLinkEvent('tick', { frame: { timestamp: 1, duration: 0.016, targetTimestamp: 1.016 } });
console.log(event.frame.targetTimestamp - event.frame.timestamp);
```

**结果**：控制台输出约 `0.016`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`CADisplayLinkEvent`](../ca-display-link-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
