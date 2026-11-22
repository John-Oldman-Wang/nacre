---
type: reference
native: WebContentsDidFailLoadEvent()
---

# `WebContentsDidFailLoadEvent()` 构造函数

**`WebContentsDidFailLoadEvent()`** 构造函数创建一个 `WebContentsDidFailLoadEvent`。

## 语法

```
new WebContentsDidFailLoadEvent(type)
new WebContentsDidFailLoadEvent(type, { errorCode, errorDescription, validatedURL, isMainFrame, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.errorCode`**

可选，对应 [`errorCode`](errorcode.md) 属性。按数转再向零取整，转不出有限数抛 `TypeError`。不传是 `0`。

**`options.errorDescription`**

可选，对应 [`errorDescription`](errordescription.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 空串。

**`options.validatedURL`**

可选，对应 [`validatedURL`](validatedurl.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 空串。

**`options.isMainFrame`**

可选，对应 [`isMainFrame`](ismainframe.md) 属性。按 JS 的真假值转（`Boolean()`）。不传是 `true`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `WebContentsDidFailLoadEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'WebContentsDidFailLoadEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new WebContentsDidFailLoadEvent('did-fail-load', { errorCode: -1009, validatedURL: 'https://example.com' });
console.log(event.errorCode, event.errorDescription === '', event.isMainFrame);
```

**结果**：控制台输出 `-1009 true true`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`WebContentsDidFailLoadEvent`](../web-contents-did-fail-load-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
