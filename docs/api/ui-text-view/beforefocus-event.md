---
type: reference
native: "UITextViewDelegate textViewShouldBeginEditing:"
---

# `UITextView`：`beforefocus` 事件

**`beforefocus`** 事件在多行输入即将成为 first responder、开始输入时派发：用户点了它，或者代码调了 `becomeFirstResponder()`。监听器里调 `preventDefault()`，它不进入编辑，键盘不弹出。

first responder 是当前接收键盘输入的那个视图，同一时刻只有一个。多行输入成为 first responder 时键盘弹出，不再是时键盘收起，见[焦点](../ui-text-field.md#焦点)。

## 语法

```
input.addEventListener('beforefocus', (event) => { })
```

## 事件对象

`Event`。`type` 是事件名，`target` 是这块多行输入（实测）。可以取消：`event.cancelable` 是 `true`，`preventDefault()` 起作用（实测）。

## 什么时候派发

- 代码调 `becomeFirstResponder()` 时派发，监听器在这个调用返回之前就执行完了（实测）。用户点它时同样派发，**未在真机验证**。
- 调了 `preventDefault()`：不进入编辑，键盘不弹出，`becomeFirstResponder()` 返回 `false`，`isFirstResponder` 还是 `false`（实测）。
- 没有调：照常进入编辑，`becomeFirstResponder()` 返回 `true`（实测），随后派发 [`focus`](focus-event.md)。
- 监听器是当场执行的。系统派发事件之后等监听器全部执行完，再决定做不做。
- 同一个事件有多个监听器时，只要有一个调了 `preventDefault()`，系统就不做。
- 监听器里抛出异常时，同一事件的其他监听器照常执行。异常在 [`application`](../application.md#没处理的异常不会让-app-退出) 上派发 `error`。抛异常不等于 `preventDefault()`。
- 最后一个监听器移除之后，系统不再派发这个事件。
- 在 `UITextView` 和 [`UITextField`](../ui-text-field/beforefocus-event.md) 上有。在别的视图上监听不报错，它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

> **注意**：监听器执行期间系统在等。在监听器里只做判断，不做耗时的事。

## 示例

```js
const input = new UITextView();
let locked = true;
input.addEventListener('beforefocus', (event) => {
  if (locked) event.preventDefault();
});
console.log(input.becomeFirstResponder());
```

**结果**：输出 `false`。多行输入没有进入编辑。把 `locked` 改成 `false` 之后再调，输出 `true`。这两个结果是在放进窗口的多行输入上量的。

## 对应的 iOS API

`UITextViewDelegate` 的 `textViewShouldBeginEditing:` 返回 `NO`，对应这里调 `event.preventDefault()`。

## 参见

- [`beforeblur`](beforeblur-event.md)
- [`focus`](focus-event.md)
- [焦点](../ui-text-field.md#焦点)
