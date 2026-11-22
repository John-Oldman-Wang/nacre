---
type: reference
native: WebContentsPageTitleUpdatedEvent()
---

# `WebContentsPageTitleUpdatedEvent()` 构造函数

**`WebContentsPageTitleUpdatedEvent()`** 构造函数创建一个 `WebContentsPageTitleUpdatedEvent`。

## 语法

```
new WebContentsPageTitleUpdatedEvent(type)
new WebContentsPageTitleUpdatedEvent(type, { title, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.title`**

可选，对应 [`title`](title.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 空串。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `WebContentsPageTitleUpdatedEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'WebContentsPageTitleUpdatedEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new WebContentsPageTitleUpdatedEvent('page-title-updated', { title: '首页' });
console.log(event.title);
```

**结果**：控制台输出 `首页`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`WebContentsPageTitleUpdatedEvent`](../web-contents-page-title-updated-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
