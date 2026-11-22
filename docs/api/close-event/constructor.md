---
type: reference
web: CloseEvent()
---

# `CloseEvent()` 构造函数

**`CloseEvent()`** 构造函数创建一个 `CloseEvent`。

## 语法

```
new CloseEvent(type)
new CloseEvent(type, { code, reason, wasClean, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.code`**

可选，对应 [`code`](code.md) 属性。按数转再向零取整，转不出有限数抛 `TypeError`。不传是 `0`。

**`options.reason`**

可选，对应 [`reason`](reason.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 空串。

**`options.wasClean`**

可选，对应 [`wasClean`](wasclean.md) 属性。按 JS 的真假值转（`Boolean()`）。不传是 `false`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `CloseEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'CloseEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new CloseEvent('close', { code: 1000, reason: 'bye', wasClean: true });
console.log(event.code, event.reason, event.wasClean);
```

**结果**：控制台输出 `1000 bye true`。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `new CloseEvent()`。

## 参见

- [`CloseEvent`](../close-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
