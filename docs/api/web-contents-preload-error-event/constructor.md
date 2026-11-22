---
type: reference
native: WebContentsPreloadErrorEvent()
---

# `WebContentsPreloadErrorEvent()` 构造函数

**`WebContentsPreloadErrorEvent()`** 构造函数创建一个 `WebContentsPreloadErrorEvent`。

## 语法

```
new WebContentsPreloadErrorEvent(type)
new WebContentsPreloadErrorEvent(type, { preloadPath, error, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.preloadPath`**

可选，对应 [`preloadPath`](preloadpath.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 空串。

**`options.error`**

可选，对应 [`error`](error.md) 属性。任何值，原样保存。不传是 `null`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `WebContentsPreloadErrorEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'WebContentsPreloadErrorEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new WebContentsPreloadErrorEvent('preload-error', { preloadPath: 'JS/web/preload.js', error: new Error('boom') });
console.log(event.preloadPath, event.error.message);
```

**结果**：控制台输出 `JS/web/preload.js boom`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`WebContentsPreloadErrorEvent`](../web-contents-preload-error-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
