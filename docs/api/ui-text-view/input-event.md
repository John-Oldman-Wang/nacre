---
type: reference
native: "UITextViewDelegate textViewDidChange:"
---

# `UITextView`：`input` 事件

**`input`** 事件在多行输入的内容被用户的输入或者 `insertText()`、`deleteBackward()` 改变时派发。

## 语法

```
input.addEventListener('input', (event) => { })
```

## 事件对象

`Event`。`type` 是事件名，`target` 是这块多行输入。不带内容，也不带改了哪里。不能取消，`preventDefault()` 不起作用。

## 什么时候派发

| 怎么改的 | 派发吗 |
| --- | --- |
| 用户打字、删除、粘贴 | 派发（**未在模拟器验证**） |
| [`insertText()`](inserttext.md)、[`deleteBackward()`](deletebackward.md) | 派发（实测）。插入空字符串也派发；`deleteBackward()` 没删掉东西时不派发 |
| 写 [`text`](text.md) 或 [`attributedText`](attributedtext.md) | 不派发（实测） |

- 不能在字符进入之前拦下它。限制长度只能在回调里事后截断。
- 回调不是在事件发生的那一刻同步执行，而是稍后执行，见[回调的执行时机](../ui-control.md#回调的执行时机)。
- 回调里抛出异常不影响多行输入，同一事件的其他回调照常执行。

## 示例

```js
const input = new UITextView();
const LIMIT = 200;
input.addEventListener('input', () => {
  if (input.text.length > LIMIT) {
    input.text = input.text.slice(0, LIMIT);
  }
});
```

**效果**：内容超过 200 个 UTF-16 码元时，多出来的部分被去掉。写 `text` 不派发 `input`，回调不会因此再执行一次。用户会先看到多出来的字，随后它消失，**未在模拟器验证**。

## 对应的 iOS API

`UITextViewDelegate` 的 `textViewDidChange:`，或者 `UITextViewTextDidChangeNotification`。

## 参见

- [`text`](text.md)
