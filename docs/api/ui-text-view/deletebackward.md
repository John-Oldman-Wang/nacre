---
type: reference
native: "-[UITextView deleteBackward]"
---

# `UITextView`：`deleteBackward()` 方法

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

- 删掉了内容时派发一次 `input`。光标在开头、没有可删的内容时什么都不做，也不派发（实测）。
- [`isEditable`](iseditable.md) 是 `false` 时照样能删（实测）。

## 示例

```js
const input = new UITextView();
input.text = 'abc';
input.deleteBackward();
console.log(input.text);
```

**结果**：输出 `ab`。

## 对应的 iOS API

`-[UITextView deleteBackward]`（`UIKeyInput` 协议）。

## 参见

- [`insertText()`](inserttext.md)
