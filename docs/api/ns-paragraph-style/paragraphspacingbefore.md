---
type: reference
native: NSParagraphStyle.paragraphSpacingBefore
---

# `NSParagraphStyle`：`paragraphSpacingBefore` 属性

**`paragraphSpacingBefore`** 属性是这一段开始前空出的距离。

## 值

数，单位 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError`。要设值，用 [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md) 的同名属性。
- 默认值是 `0`。
- 段落样式放进富文本时放的是一份副本，所以这个值不会在富文本里变。

## 示例

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.paragraphSpacingBefore);
```

**结果**：控制台输出默认值。

## 对应的 iOS API

`NSParagraphStyle.paragraphSpacingBefore`。

## 参见

- [`NSMutableParagraphStyle.paragraphSpacingBefore`](../ns-mutable-paragraph-style/paragraphspacingbefore.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
