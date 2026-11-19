---
type: reference
native: NSParagraphStyle.lineBreakMode
---

# `NSParagraphStyle`：`lineBreakMode` 属性

**`lineBreakMode`** 属性是一行放不下时怎么处理。取值和 [`UILabel.lineBreakMode`](../ui-label/linebreakmode.md) 相同：`'byWordWrapping'`、`'byCharWrapping'`、`'byClipping'`、`'byTruncatingHead'`、`'byTruncatingTail'`、`'byTruncatingMiddle'`。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。要设值，用 [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md) 的同名属性。
- 默认值是 `'byWordWrapping'`。
- 段落样式放进富文本时放的是一份副本，所以这个值不会在富文本里变。

## 示例

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.lineBreakMode);
```

**结果**：控制台输出默认值。

## 对应的 iOS API

`NSParagraphStyle.lineBreakMode`。

## 参见

- [`NSMutableParagraphStyle.lineBreakMode`](../ns-mutable-paragraph-style/linebreakmode.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
