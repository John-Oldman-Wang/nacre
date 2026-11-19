---
type: reference
native: UITextField.attributedText
---

# `UITextField`：`attributedText` 属性

**`attributedText`** 属性是框里带样式的内容：一段文字，每一段带自己的字体、颜色等属性。

## 值

[`NSAttributedString`](../ns-attributed-string.md)，或者 `null`。

- 可读，可写。
- 空输入框读出来是 `null` 或长度为 0 的富文本，验收用例两种都接受。
- 读出来的是一份快照，用 `isEqualToAttributedString()` 比较内容。
- 写了它，[`text`](text.md) 读出来是其中的纯文字。之后再写 `text`，`attributedText` 的文字跟着变，原来的样式留不留着**未在模拟器验证**。
- 代码写它不派发 `input`。

### 写错时

写了不是 `NSAttributedString` 的值（比如字符串）：抛 `TypeError`，报错信息里有 `attributedText`。

## 示例

```js
const field = new UITextField();
field.attributedText = new NSAttributedString('13800138000', { kern: 2 });
console.log(field.text);
```

**结果**：输出 `13800138000`。框里的数字之间多出 2 pt 的间距。

## 对应的 iOS API

`UITextField.attributedText`。

## 参见

- [富文本](../ns-attributed-string.md)
- [`text`](text.md)
