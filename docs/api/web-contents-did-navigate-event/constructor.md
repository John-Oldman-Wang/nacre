---
type: reference
native: WebContentsDidNavigateEvent()
---

# `WebContentsDidNavigateEvent()` 构造函数

**`WebContentsDidNavigateEvent()`** 构造函数创建一个 `WebContentsDidNavigateEvent`。

## 语法

```
new WebContentsDidNavigateEvent(type)
new WebContentsDidNavigateEvent(type, { url, httpResponseCode, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.url`**

可选，对应 [`url`](url.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 空串。

**`options.httpResponseCode`**

可选，对应 [`httpResponseCode`](httpresponsecode.md) 属性。按数转再向零取整，转不出有限数抛 `TypeError`。不传是 `-1`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `WebContentsDidNavigateEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'WebContentsDidNavigateEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new WebContentsDidNavigateEvent('did-navigate', { url: 'https://example.com', httpResponseCode: 200 });
console.log(event.url, event.httpResponseCode);
```

**结果**：控制台输出 `https://example.com 200`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`WebContentsDidNavigateEvent`](../web-contents-did-navigate-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
