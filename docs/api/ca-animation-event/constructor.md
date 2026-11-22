---
type: reference
native: CAAnimationEvent()
---

# `CAAnimationEvent()` 构造函数

**`CAAnimationEvent()`** 构造函数创建一个 `CAAnimationEvent`。

## 语法

```
new CAAnimationEvent(type)
new CAAnimationEvent(type, { finished, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.finished`**

可选，对应 [`finished`](finished.md) 属性。按 JS 的真假值转（`Boolean()`）。不传是 `false`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `CAAnimationEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'CAAnimationEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new CAAnimationEvent('stop', { finished: true });
console.log(event.finished);
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`CAAnimationEvent`](../ca-animation-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
