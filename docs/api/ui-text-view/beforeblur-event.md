---
type: reference
native: "UITextViewDelegate textViewShouldEndEditing:"
---

# `UITextView`：`beforeblur` 事件

**`beforeblur`** 事件在多行输入即将不再是 first responder、结束输入时派发。监听器里调 `preventDefault()`，焦点留在多行输入上。

first responder 是当前接收键盘输入的那个视图，见 [`beforefocus`](beforefocus-event.md)。

## 语法

```
input.addEventListener('beforeblur', (event) => { })
```

## 事件对象

`Event`。`type` 是事件名，`target` 是这块多行输入。可以取消：`event.cancelable` 是 `true`，`preventDefault()` 起作用（实测）。

## 什么时候派发

- 代码调 `resignFirstResponder()` 时派发，监听器在这个调用返回之前就执行完了（实测）。用户的操作让它失焦时（比如往下拖动文字收起键盘）同样派发，**未在真机验证**。
- 调了 `preventDefault()`：焦点留在多行输入上，键盘不收起，`resignFirstResponder()` 返回 `false`，`isFirstResponder` 还是 `true`（实测）。
- 没有调：照常失焦，`resignFirstResponder()` 返回 `true`（实测），随后派发 [`blur`](blur-event.md)。
- `view.endEditing(true)` 是强制的，这时系统怎么处理**未在真机验证**。
- 监听器是当场执行的。系统派发事件之后等监听器全部执行完，再决定做不做。
- 同一个事件有多个监听器时，只要有一个调了 `preventDefault()`，系统就不做。
- 监听器里抛出异常时，同一事件的其他监听器照常执行。异常在 [`application`](../application.md#没处理的异常不会让-app-退出) 上派发 `error`。抛异常不等于 `preventDefault()`。
- 最后一个监听器移除之后，系统不再派发这个事件。
- 在 `UITextView` 和 [`UITextField`](../ui-text-field/beforeblur-event.md) 上有。在别的视图上监听不报错，它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

> **注意**：监听器执行期间系统在等。在监听器里只做判断，不做耗时的事。

## 示例

```js
const input = new UITextView();
input.addEventListener('beforeblur', (event) => {
  if (input.text.trim() === '') event.preventDefault();
});
input.becomeFirstResponder();
console.log(input.resignFirstResponder());
```

**效果**：多行输入放在窗口里、内容是空的时，控制台输出 `false`，焦点还在多行输入上，键盘不收起。输入了内容之后再调，输出 `true`。

## 对应的 iOS API

`UITextViewDelegate` 的 `textViewShouldEndEditing:` 返回 `NO`，对应这里调 `event.preventDefault()`。

## 参见

- [`beforefocus`](beforefocus-event.md)
- [`blur`](blur-event.md)
- [焦点](../ui-text-field.md#焦点)
