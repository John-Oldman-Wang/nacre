---
type: reference
native: UITextField.text
---

# `UITextField`：`text` 属性

**`text`** 属性是框里的全部内容。

## 值

字符串。

- 可读，可写。
- 默认值是空字符串 `''`。没有内容时是 `''`，不是 `null`，可以直接取 `length`。
- 写入的值不是字符串时按字符串转换。写 `null` 或 `undefined` 得到 `''`。
- 写入会把框里的内容整个换掉。
- 用户的输入改变内容时派发 `input`。用代码写 `text` 不派发 `input`，也不派发 `beforeinput`。**不派发 `input` 未在模拟器验证。** 要让代码的修改也派发 `input`，用 [`insertText()`](inserttext.md)。
- 写过 [`attributedText`](attributedtext.md) 之后再写 `text`，`attributedText` 的文字跟着变。原来的样式留不留着**未在模拟器验证**。

## 示例

```js
const field = new UITextField();
field.text = '张三';
console.log(field.text.length);
```

**结果**：输出 `2`。框里显示「张三」。

## 对应的 iOS API

`UITextField.text`。`nil` 读出来是 `''`。

## 参见

- [`insertText()`](inserttext.md)：按用户打字的方式改内容
- [`hasText`](hastext.md)
