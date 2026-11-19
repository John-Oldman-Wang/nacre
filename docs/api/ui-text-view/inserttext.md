---
type: reference
native: "-[UITextView insertText:]"
---

# `UITextView`：`insertText()` 方法

**`insertText()`** 方法按用户打字的方式插入一段文字：插在光标的位置；有选中的文字时，换掉选中的部分。光标移到插入的内容后面。

## 语法

```
insertText(text)
```

### 参数

**`text`**

要插入的文字，字符串。别的类型按 `String()` 转，`null` 和 `undefined` 当作空字符串。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- 派发一次 `input`，也派发 `selectionchange`。插入空字符串什么都不改，但也派发 `input`（实测）。
- [`isEditable`](iseditable.md) 是 `false` 时照样能插入（实测）。
- 回调是稍后执行的：调完 `insertText()` 的下一行，`input` 的回调还没有执行。

## 示例

```js
const input = new UITextView();
input.text = '你好';
input.insertText('😀');
console.log(input.text);
```

**结果**：输出 `你好😀`。写 `text` 之后光标在末尾，表情插在末尾。

## 对应的 iOS API

`-[UITextView insertText:]`（`UIKeyInput` 协议）。

## 参见

- [`deleteBackward()`](deletebackward.md)
- [`input`](input-event.md) 事件
