---
type: reference
native: UIFont.lineHeight
---

# `UIFont`：`lineHeight` 属性

**`lineHeight`** 属性是一行文字的高度。单行的 `UILabel` 按它决定自己的高度。

## 值

数，单位 [pt](../units.md)，由字体和字号决定。

它是字体自带的只读数值，不能通过它调整行距。调行距用富文本的段落样式，见 [`NSParagraphStyle`](../ns-paragraph-style.md)。

- 只读。给它赋值抛 `TypeError`。
- 字体对象不可变，这个值在对象存在期间不会变，所以没有变化通知。

## 示例

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.lineHeight);
```

**结果**：控制台输出一行文字的高度，单位 pt。

## 对应的 iOS API

`UIFont.lineHeight`。

## 参见

- [字体度量](../ui-font.md#字体度量)
