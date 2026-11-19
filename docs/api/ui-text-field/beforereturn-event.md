---
type: reference
native: "UITextFieldDelegate textFieldShouldReturn:"
---

# `UITextField`：`beforereturn` 事件

**`beforereturn`** 事件在用户按了回车键、输入框即将按默认方式处理这次回车时派发。监听器里调 `preventDefault()`，输入框不按默认方式处理。

## 语法

```
field.addEventListener('beforereturn', (event) => { })
```

## 事件对象

`Event`。`type` 是事件名，`target` 是这个输入框。可以取消：`event.cancelable` 是 `true`，`preventDefault()` 起作用。

## 什么时候派发

- 用户按回车键时派发，在 `return` 之前。`beforereturn` 可以取消，`return` 是事后的通知、不能取消。
- 调了 `preventDefault()`：输入框不按默认方式处理这次回车。**未在模拟器验证。** 取消之后 `return` 还派不派发，**未在模拟器验证**。
- 只有真实的键盘输入会触发，自动跑的验收触发不了，**未在模拟器验证**。
- 只是想在按回车时做事（收起键盘、提交），监听 `return` 就够了。
- 监听器是当场执行的。系统派发事件之后等监听器全部执行完，再决定做不做。
- 同一个事件有多个监听器时，只要有一个调了 `preventDefault()`，系统就不做。
- 监听器里抛出异常时，同一事件的其他监听器照常执行。异常在 [`application`](../application.md#没处理的异常不会让-app-退出) 上派发 `error`。抛异常不等于 `preventDefault()`。
- 最后一个监听器移除之后，系统不再派发这个事件。
- 只在 `UITextField` 上有。在别的控件上监听不报错，但系统不会派发。

> **注意**：监听器执行期间系统在等。在监听器里只做判断，不做耗时的事。

## 示例

```js
const field = new UITextField();
field.addEventListener('beforereturn', (event) => {
  if (field.text === '') event.preventDefault();
});
```

**效果**：框里没有内容时，按回车不做任何处理。**未在模拟器验证。**

## 对应的 iOS API

`UITextFieldDelegate` 的 `textFieldShouldReturn:` 返回 `NO`，对应这里调 `event.preventDefault()`。在那个方法里收键盘的写法，对应这里监听 `return` 并调 `resignFirstResponder()`。

## 参见

- [`returnKeyType`](returnkeytype.md)
