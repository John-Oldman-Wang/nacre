---
type: reference
native: UITextBeforeInputEvent()
---

# `UITextBeforeInputEvent()` 构造函数

**`UITextBeforeInputEvent()`** 构造函数创建一个 `UITextBeforeInputEvent`。

## 语法

```
new UITextBeforeInputEvent(type)
new UITextBeforeInputEvent(type, { range, replacementString, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.range`**

可选，对应 [`range`](range.md) 属性。一个 `NSRange`，或者带 `location`、`length` 的普通对象（照结构体的规则转成 `NSRange`），也可以是 `null`；别的抛 `TypeError`。不传是 `null`。

**`options.replacementString`**

可选，对应 [`replacementString`](replacementstring.md) 属性。按字符串转（`String()`），`null` 是空串。不传是 空串。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `UITextBeforeInputEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'UITextBeforeInputEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new UITextBeforeInputEvent('beforeinput', { range: new NSRange(0, 0), replacementString: 'a', cancelable: true });
console.log(event.range.length, event.replacementString, event.cancelable);
```

**结果**：控制台输出 `0 a true`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`UITextBeforeInputEvent`](../ui-text-before-input-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
