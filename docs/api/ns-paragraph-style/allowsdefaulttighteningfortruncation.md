---
type: reference
native: NSParagraphStyle.allowsDefaultTighteningForTruncation
---

# `NSParagraphStyle`：`allowsDefaultTighteningForTruncation` 属性

**`allowsDefaultTighteningForTruncation`** 属性是文字要被截断之前，系统是否先把字距收紧一点试试。

## 值

布尔。

`true`：先收紧字距，收紧后放得下就不截断。`false`：不收紧，直接截断。

- 只读。给它赋值抛 `TypeError`。要设值，用 [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md) 的同名属性。
- 默认值是 `false`（**未在模拟器验证**）。
- 段落样式放进富文本时放的是一份副本，所以这个值不会在富文本里变。

## 示例

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.allowsDefaultTighteningForTruncation);
```

**结果**：控制台输出默认值。

## 对应的 iOS API

`NSParagraphStyle.allowsDefaultTighteningForTruncation`。

## 参见

- [`NSMutableParagraphStyle.allowsDefaultTighteningForTruncation`](../ns-mutable-paragraph-style/allowsdefaulttighteningfortruncation.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
