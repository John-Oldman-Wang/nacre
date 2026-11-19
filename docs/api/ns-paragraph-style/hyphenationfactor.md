---
type: reference
native: NSParagraphStyle.hyphenationFactor
---

# `NSParagraphStyle`：`hyphenationFactor` 属性

**`hyphenationFactor`** 属性是断字的积极程度。`0` 不断字，`1` 尽量断。

## 值

数，0 到 1 的比例。

- 只读。给它赋值抛 `TypeError`。要设值，用 [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md) 的同名属性。
- 默认值是 `0`。
- 段落样式放进富文本时放的是一份副本，所以这个值不会在富文本里变。

## 示例

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.hyphenationFactor);
```

**结果**：控制台输出默认值。

## 对应的 iOS API

`NSParagraphStyle.hyphenationFactor`。

## 参见

- [`NSMutableParagraphStyle.hyphenationFactor`](../ns-mutable-paragraph-style/hyphenationfactor.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
