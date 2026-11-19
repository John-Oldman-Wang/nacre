---
type: reference
native: UITextView.textContainer
---

# `UITextView`：`textContainer` 属性

**`textContainer`** 属性是文字排版的区域，一个 [`NSTextContainer`](../ns-text-container.md)。

## 值

[`NSTextContainer`](../ns-text-container.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读得到同一个对象。改它的属性，多行输入里的排版跟着变。

## 示例

```js
const input = new UITextView();
const container = input.textContainer;
console.log(container === input.textContainer, container.lineFragmentPadding);
```

**结果**：输出 `true 5`。

## 对应的 iOS API

`UITextView.textContainer`。

## 参见

- [`NSTextContainer`](../ns-text-container.md)
