---
type: reference
native: CLLocationErrorEvent()
---

# `CLLocationErrorEvent()` 构造函数

**`CLLocationErrorEvent()`** 构造函数创建一个 `CLLocationErrorEvent`。

## 语法

```
new CLLocationErrorEvent(type)
new CLLocationErrorEvent(type, { error, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.error`**

可选，对应 [`error`](error.md) 属性。任何值，原样保存。不传是 `null`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `CLLocationErrorEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'CLLocationErrorEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new CLLocationErrorEvent('locationerror');
console.log(event.type, event.error);
```

**结果**：控制台输出 `locationerror null`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`CLLocationErrorEvent`](../cl-location-error-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
