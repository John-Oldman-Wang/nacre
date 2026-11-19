---
type: reference
native: "UITextFieldDelegate textFieldShouldClear:"
---

# `UITextField`：`beforeclear` 事件

**`beforeclear`** 事件在用户点了右侧的清除按钮、即将清空内容时派发。监听器里调 `preventDefault()`，内容不清空。

## 语法

```
field.addEventListener('beforeclear', (event) => { })
```

## 事件对象

`Event`。`type` 是事件名，`target` 是这个输入框。可以取消：`event.cancelable` 是 `true`，`preventDefault()` 起作用。

## 什么时候派发

- 只有显示了清除按钮（[`clearButtonMode`](clearbuttonmode.md) 不是 `'never'`）时才可能派发。
- 调了 `preventDefault()`：不清空。**未在模拟器验证。**
- 只有真实的触摸会触发，自动跑的验收触发不了，**未在模拟器验证**。
- 监听器是当场执行的。系统派发事件之后等监听器全部执行完，再决定做不做。
- 同一个事件有多个监听器时，只要有一个调了 `preventDefault()`，系统就不做。
- 监听器里抛出异常时，同一事件的其他监听器照常执行。异常在 [`application`](../application.md#没处理的异常不会让-app-退出) 上派发 `error`。抛异常不等于 `preventDefault()`。
- 最后一个监听器移除之后，系统不再派发这个事件。
- 只在 `UITextField` 上有。在别的控件上监听不报错，但系统不会派发。

> **注意**：监听器执行期间系统在等。在监听器里只做判断，不做耗时的事。

## 示例

```js
const field = new UITextField();
field.clearButtonMode = 'whileEditing';
field.addEventListener('beforeclear', (event) => {
  if (field.text.length > 20) event.preventDefault();
});
```

**效果**：内容超过 20 个字符时，点清除按钮没有反应。**未在模拟器验证。**

## 对应的 iOS API

`UITextFieldDelegate` 的 `textFieldShouldClear:` 返回 `NO`，对应这里调 `event.preventDefault()`。

## 参见

- [`clearButtonMode`](clearbuttonmode.md)
