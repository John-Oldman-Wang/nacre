---
type: reference
native: NSParagraphStyle.baseWritingDirection
---

# `NSParagraphStyle`：`baseWritingDirection` 属性

**`baseWritingDirection`** 属性是这一段从哪边开始排。

## 值

字符串。

| 取值 | 效果 |
| --- | --- |
| `'natural'` | 按文字内容判断 |
| `'leftToRight'` | 从左往右 |
| `'rightToLeft'` | 从右往左 |

- 只读。给它赋值抛 `TypeError`。要设值，用 [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md) 的同名属性。
- 默认值是 `'natural'`。
- 段落样式放进富文本时放的是一份副本，所以这个值不会在富文本里变。

## 示例

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.baseWritingDirection);
```

**结果**：控制台输出默认值。

## 对应的 iOS API

`NSParagraphStyle.baseWritingDirection`。

## 参见

- [`NSMutableParagraphStyle.baseWritingDirection`](../ns-mutable-paragraph-style/basewritingdirection.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
