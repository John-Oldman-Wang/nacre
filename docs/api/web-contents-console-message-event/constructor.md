---
type: reference
native: WebContentsConsoleMessageEvent()
---

# `WebContentsConsoleMessageEvent()` 构造函数

**`WebContentsConsoleMessageEvent()`** 构造函数创建一个 `WebContentsConsoleMessageEvent`。

## 语法

```
new WebContentsConsoleMessageEvent(type)
new WebContentsConsoleMessageEvent(type, { level, message, lineNumber, sourceId, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.level`**

可选，对应 [`level`](level.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 `'info'`。

**`options.message`**

可选，对应 [`message`](message.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 空串。

**`options.lineNumber`**

可选，对应 [`lineNumber`](linenumber.md) 属性。按数转再向零取整，转不出有限数抛 `TypeError`。不传是 `0`。

**`options.sourceId`**

可选，对应 [`sourceId`](sourceid.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 空串。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `WebContentsConsoleMessageEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'WebContentsConsoleMessageEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new WebContentsConsoleMessageEvent('console-message', { level: 'warning', message: 'w' });
console.log(event.level, event.message, event.lineNumber, event.sourceId === '');
```

**结果**：控制台输出 `warning w 0 true`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`WebContentsConsoleMessageEvent`](../web-contents-console-message-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
