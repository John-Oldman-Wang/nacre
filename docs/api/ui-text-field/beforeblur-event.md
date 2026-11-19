---
type: reference
native: "UITextFieldDelegate textFieldShouldEndEditing:"
---

# `UITextField`：`beforeblur` 事件

**`beforeblur`** 事件在输入框即将不再是 first responder 时派发。监听器里调 `preventDefault()`，焦点留在输入框上。

## 语法

```
field.addEventListener('beforeblur', (event) => { })
```

## 事件对象

`Event`。`type` 是事件名，`target` 是这个输入框。可以取消：`event.cancelable` 是 `true`，`preventDefault()` 起作用。

## 什么时候派发

- 代码调 `resignFirstResponder()` 时派发，监听器在这个调用返回之前就执行完了。
- 调了 `preventDefault()`：焦点留在输入框上，键盘不收起，`resignFirstResponder()` 返回 `false`。
- 没有调：照常失焦，随后派发 `blur`。
- `view.endEditing(true)` 是强制的，这时系统怎么处理**未在模拟器验证**。
- 监听器是当场执行的。系统派发事件之后等监听器全部执行完，再决定做不做。
- 同一个事件有多个监听器时，只要有一个调了 `preventDefault()`，系统就不做。
- 监听器里抛出异常时，同一事件的其他监听器照常执行。异常在 [`application`](../application.md#没处理的异常不会让-app-退出) 上派发 `error`。抛异常不等于 `preventDefault()`。
- 最后一个监听器移除之后，系统不再派发这个事件。
- 只在 `UITextField` 上有。在别的控件上监听不报错，但系统不会派发。

> **注意**：监听器执行期间系统在等。在监听器里只做判断，不做耗时的事。

## 示例

```js
const field = new UITextField();
field.addEventListener('beforeblur', (event) => {
  if (field.text === '') event.preventDefault();
});
field.becomeFirstResponder();
console.log(field.resignFirstResponder());
```

**效果**：输入框是空的，控制台输出 `false`，焦点还在输入框上，键盘不收起。输入了内容之后再调，输出 `true`。

## 对应的 iOS API

`UITextFieldDelegate` 的 `textFieldShouldEndEditing:` 返回 `NO`，对应这里调 `event.preventDefault()`。

## 参见

- [`beforefocus`](beforefocus-event.md)
- [焦点](../ui-text-field.md#焦点)
