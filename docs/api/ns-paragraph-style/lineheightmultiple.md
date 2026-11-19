---
type: reference
native: NSParagraphStyle.lineHeightMultiple
---

# `NSParagraphStyle`：`lineHeightMultiple` 属性

**`lineHeightMultiple`** 属性是行高是字体自然行高的几倍。`0` 是不调整。

## 值

数，倍数，没有单位。

- 只读。给它赋值抛 `TypeError`。要设值，用 [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md) 的同名属性。
- 默认值是 `0`。
- 段落样式放进富文本时放的是一份副本，所以这个值不会在富文本里变。

## 示例

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.lineHeightMultiple);
```

**结果**：控制台输出默认值。

## 对应的 iOS API

`NSParagraphStyle.lineHeightMultiple`。

## 参见

- [`NSMutableParagraphStyle.lineHeightMultiple`](../ns-mutable-paragraph-style/lineheightmultiple.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
