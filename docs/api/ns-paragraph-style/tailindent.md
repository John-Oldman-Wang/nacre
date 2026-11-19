---
type: reference
native: NSParagraphStyle.tailIndent
---

# `NSParagraphStyle`：`tailIndent` 属性

**`tailIndent`** 属性是行的右边界。正数从左边量起；`0` 或负数从右边量起，`-16` 是右边留 16 pt。

## 值

数，单位 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError`。要设值，用 [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md) 的同名属性。
- 默认值是 `0`。
- 段落样式放进富文本时放的是一份副本，所以这个值不会在富文本里变。

## 示例

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.tailIndent);
```

**结果**：控制台输出默认值。

## 对应的 iOS API

`NSParagraphStyle.tailIndent`。

## 参见

- [`NSMutableParagraphStyle.tailIndent`](../ns-mutable-paragraph-style/tailindent.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
