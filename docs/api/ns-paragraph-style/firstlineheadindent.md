---
type: reference
native: NSParagraphStyle.firstLineHeadIndent
---

# `NSParagraphStyle`：`firstLineHeadIndent` 属性

**`firstLineHeadIndent`** 属性是第一行左边缩进多少。

## 值

数，单位 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError`。要设值，用 [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md) 的同名属性。
- 默认值是 `0`。
- 段落样式放进富文本时放的是一份副本，所以这个值不会在富文本里变。

## 示例

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.firstLineHeadIndent);
```

**结果**：控制台输出默认值。

## 对应的 iOS API

`NSParagraphStyle.firstLineHeadIndent`。

## 参见

- [`NSMutableParagraphStyle.firstLineHeadIndent`](../ns-mutable-paragraph-style/firstlineheadindent.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
