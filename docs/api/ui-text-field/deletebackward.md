---
type: reference
native: "-[UITextField deleteBackward]"
---

# `UITextField`：`deleteBackward()` 方法

**`deleteBackward()`** 方法按用户按删除键的方式删除：有选中的文字时删掉选中的部分，没有时删掉光标前面的一个字符。

## 语法

```
deleteBackward()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- 光标在开头并且没有选中文字时，什么都不做。
- 删掉了内容时派发一次 `input`，不派发 `beforeinput`。
- 和 [`UITextView`](../ui-text-view/deletebackward.md) 上的同名方法写法相同。

上面几条行为**未在模拟器验证**。

## 示例

```js
const field = new UITextField();
field.text = 'abc';
field.selectedRange = new NSRange(3, 0);
field.deleteBackward();
console.log(field.text);
```

**结果**：输出 `ab`。**未在模拟器验证。**

## 对应的 iOS API

`-[UITextField deleteBackward]`（`UIKeyInput` 协议）。

## 参见

- [`insertText()`](inserttext.md)
