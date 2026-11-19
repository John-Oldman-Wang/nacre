---
type: reference
native: UITextView.attributedText
---

# `UITextView`：`attributedText` 属性

**`attributedText`** 属性是多行输入里带样式的内容：一段文字，每一段带自己的字体、颜色等属性。

## 值

[`NSAttributedString`](../ns-attributed-string.md)，或者 `null`。

- 可读，可写。
- 空的多行输入读出来是 `null` 或长度为 0 的富文本，验收用例两种都接受。
- 读出来的是一份快照，不能改（不是 `NSMutableAttributedString`）。
- 写了它，[`text`](text.md) 读出来是其中的纯文字。之后再写 `text`，文字跟着变，原来的样式被去掉（实测）。
- 写 `null` 是清空，`text` 变成 `''`。
- 代码写它不派发 `input`。

### 写错时

写了不是 `NSAttributedString` 的值（比如字符串）：抛 `TypeError`，报错信息里有 `attributedText`。

## 示例

```js
const input = new UITextView();
const styled = new NSMutableAttributedString('第一段\n第二段', { font: UIFont.systemFontOfSize(17) });
styled.addAttribute('backgroundColor', { value: 'systemYellow', range: new NSRange(0, 3) });
input.attributedText = styled;
console.log(input.text);
```

**效果**：控制台输出两行：`第一段`、`第二段`。「第一段」三个字带黄色底。

## 对应的 iOS API

`UITextView.attributedText`。

## 参见

- [富文本](../ns-attributed-string.md)
- [`text`](text.md)
