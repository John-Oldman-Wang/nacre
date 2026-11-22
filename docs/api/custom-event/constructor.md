---
type: reference
web: CustomEvent()
---

# `CustomEvent()` 构造函数

**`CustomEvent()`** 构造函数创建一个 `CustomEvent`。

## 语法

```
new CustomEvent(type)
new CustomEvent(type, { detail, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.detail`**

可选，对应 [`detail`](detail.md) 属性。任何值，原样保存。不传是 `null`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `CustomEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'CustomEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new CustomEvent('progress', { detail: { done: 3, total: 10 } });
console.log(event.type, event.detail.done, event.cancelable);
```

**结果**：控制台输出 `progress 3 false`。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `new CustomEvent()`。

## 参见

- [`CustomEvent`](../custom-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
