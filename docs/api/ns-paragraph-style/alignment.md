---
type: reference
native: NSParagraphStyle.alignment
---

# `NSParagraphStyle`：`alignment` 属性

**`alignment`** 属性是段落里文字的对齐方式。

## 值

字符串。

| 取值 | 效果 |
| --- | --- |
| `'left'` | 靠左 |
| `'center'` | 居中 |
| `'right'` | 靠右 |
| `'justified'` | 两端对齐 |
| `'natural'` | 按文字的书写方向：从左往右的语言靠左，从右往左的语言靠右 |

- 只读。给它赋值抛 `TypeError`。要设值，用 [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md) 的同名属性。
- 默认值是 `'natural'`。
- 段落样式放进富文本时放的是一份副本，所以这个值不会在富文本里变。

## 示例

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.alignment);
```

**结果**：控制台输出默认值。

## 对应的 iOS API

`NSParagraphStyle.alignment`。

## 参见

- [`NSMutableParagraphStyle.alignment`](../ns-mutable-paragraph-style/alignment.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
