---
type: reference
native: "UITextViewDelegate textViewDidBeginEditing:"
---

# `UITextView`：`focus` 事件

**`focus`** 事件在多行输入成为 first responder、开始输入时派发。

## 语法

```
input.addEventListener('focus', (event) => { })
```

## 事件对象

`Event`。`type` 是事件名，`target` 是这块多行输入。不带内容，也不带改了哪里。不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 用户点它时派发。**未在模拟器验证。**
- 代码调 `becomeFirstResponder()` 成功时派发（实测）。
- [`isEditable`](iseditable.md) 是 `false` 时，`becomeFirstResponder()` 仍然返回 `true`，但不派发 `focus`（实测，量的时候没有键盘）。
- 回调不是在事件发生的那一刻同步执行，而是稍后执行，见[回调的执行时机](../ui-control.md#回调的执行时机)。
- 回调里抛出异常不影响多行输入，同一事件的其他回调照常执行。

## 示例

```js
const input = new UITextView();
input.addEventListener('focus', () => console.log('开始输入'));
```

**效果**：多行输入开始输入时，控制台输出 `开始输入`。

## 对应的 iOS API

`UITextViewDelegate` 的 `textViewDidBeginEditing:`，或者 `UITextViewTextDidBeginEditingNotification`。

## 参见

- [`blur`](blur-event.md)
