---
type: reference
native: "UITextViewDelegate textViewDidEndEditing:"
---

# `UITextView`：`blur` 事件

**`blur`** 事件在多行输入不再是 first responder、结束输入时派发。适合在这里保存内容。

## 语法

```
input.addEventListener('blur', (event) => { })
```

## 事件对象

`Event`。`type` 是事件名，`target` 是这块多行输入。不带内容，也不带改了哪里。不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 代码调 `resignFirstResponder()` 时派发（实测）。
- 用户拖动内容收起键盘（[`keyboardDismissMode`](../ui-scroll-view/keyboarddismissmode.md) 是 `'onDrag'`）时派发。**未在模拟器验证。**
- [`isEditable`](iseditable.md) 是 `false` 时不派发（实测，量的时候没有键盘）。
- 回调不是在事件发生的那一刻同步执行，而是稍后执行，见[回调的执行时机](../ui-control.md#回调的执行时机)。
- 回调里抛出异常不影响多行输入，同一事件的其他回调照常执行。

## 示例

```js
const input = new UITextView();
input.addEventListener('blur', () => console.log('输入的是：' + input.text));
```

**效果**：结束输入时，控制台输出全部内容。

## 对应的 iOS API

`UITextViewDelegate` 的 `textViewDidEndEditing:`，或者 `UITextViewTextDidEndEditingNotification`。

## 参见

- [`focus`](focus-event.md)
