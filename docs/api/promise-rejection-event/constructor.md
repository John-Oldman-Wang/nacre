---
type: reference
native: PromiseRejectionEvent()
---

# `PromiseRejectionEvent()` 构造函数

**`PromiseRejectionEvent()`** 构造函数创建一个拒绝事件对象。

## 语法

```
new PromiseRejectionEvent(type)
new PromiseRejectionEvent(type, { reason, promise, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.reason`**

拒绝的原因，任意值，可选。不传是 `undefined`。

**`options.promise`**

被拒绝的 Promise，可选。不传时 [`promise`](promise.md) 是 `undefined`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `PromiseRejectionEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'PromiseRejectionEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new PromiseRejectionEvent('unhandledrejection', { reason: '超时' });
console.log(event.reason, event.promise);
```

**结果**：控制台输出 `超时 undefined`。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `new PromiseRejectionEvent()`。

## 参见

- [`PromiseRejectionEvent`](../promise-rejection-event.md)
