---
type: reference
native: WebContentsWillNavigateEvent()
---

# `WebContentsWillNavigateEvent()` 构造函数

**`WebContentsWillNavigateEvent()`** 构造函数创建一个 `WebContentsWillNavigateEvent`。

## 语法

```
new WebContentsWillNavigateEvent(type)
new WebContentsWillNavigateEvent(type, { url, isMainFrame, navigationType, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.url`**

可选，对应 [`url`](url.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 空串。

**`options.isMainFrame`**

可选，对应 [`isMainFrame`](ismainframe.md) 属性。按 JS 的真假值转（`Boolean()`）。不传是 `true`。

**`options.navigationType`**

可选，对应 [`navigationType`](navigationtype.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 `'other'`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `WebContentsWillNavigateEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'WebContentsWillNavigateEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new WebContentsWillNavigateEvent('will-navigate', { url: 'https://example.com', cancelable: true });
console.log(event.url, event.navigationType, event.isMainFrame);
```

**结果**：控制台输出 `https://example.com other true`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`WebContentsWillNavigateEvent`](../web-contents-will-navigate-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
