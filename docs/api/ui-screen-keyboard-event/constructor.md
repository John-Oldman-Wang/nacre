---
type: reference
native: UIScreenKeyboardEvent()
---

# `UIScreenKeyboardEvent()` 构造函数

**`UIScreenKeyboardEvent()`** 构造函数创建一个 `UIScreenKeyboardEvent`。

## 语法

```
new UIScreenKeyboardEvent(type)
new UIScreenKeyboardEvent(type, { frame, previousFrame, duration, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.frame`**

可选，对应 [`frame`](frame.md) 属性。一个 `CGRect`，或者带 `x`、`y`、`width`、`height` 的普通对象（照结构体的规则转成 `CGRect`），也可以是 `null`；别的抛 `TypeError`。不传是 `null`。

**`options.previousFrame`**

可选，对应 [`previousFrame`](previousframe.md) 属性。一个 `CGRect`，或者带 `x`、`y`、`width`、`height` 的普通对象（照结构体的规则转成 `CGRect`），也可以是 `null`；别的抛 `TypeError`。不传是 `null`。

**`options.duration`**

可选，对应 [`duration`](duration.md) 属性。按数转（`Number()`），转不出有限数抛 `TypeError`。不传是 `0`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `UIScreenKeyboardEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'UIScreenKeyboardEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new UIScreenKeyboardEvent('keyboardshow', {
  frame: new CGRect(0, 500, 390, 344),
  previousFrame: new CGRect(0, 844, 390, 344),
  duration: 0.25,
});
console.log(event.frame.height, event.duration);
```

**结果**：控制台输出 `344 0.25`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`UIScreenKeyboardEvent`](../ui-screen-keyboard-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
