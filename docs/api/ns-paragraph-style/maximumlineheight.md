---
type: reference
native: NSParagraphStyle.maximumLineHeight
---

# `NSParagraphStyle`：`maximumLineHeight` 属性

**`maximumLineHeight`** 属性是行高的上限。`0` 是不限。

## 值

数，单位 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError`。要设值，用 [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md) 的同名属性。
- 默认值是 `0`。
- 段落样式放进富文本时放的是一份副本，所以这个值不会在富文本里变。

## 示例

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.maximumLineHeight);
```

**结果**：控制台输出默认值。

## 对应的 iOS API

`NSParagraphStyle.maximumLineHeight`。

## 参见

- [`NSMutableParagraphStyle.maximumLineHeight`](../ns-mutable-paragraph-style/maximumlineheight.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
