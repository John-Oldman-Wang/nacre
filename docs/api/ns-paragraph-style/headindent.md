---
type: reference
native: NSParagraphStyle.headIndent
---

# `NSParagraphStyle`：`headIndent` 属性

**`headIndent`** 属性是第一行以外的各行左边缩进多少。

## 值

数，单位 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError`。要设值，用 [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md) 的同名属性。
- 默认值是 `0`。
- 段落样式放进富文本时放的是一份副本，所以这个值不会在富文本里变。

## 示例

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.headIndent);
```

**结果**：控制台输出默认值。

## 对应的 iOS API

`NSParagraphStyle.headIndent`。

## 参见

- [`NSMutableParagraphStyle.headIndent`](../ns-mutable-paragraph-style/headindent.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
