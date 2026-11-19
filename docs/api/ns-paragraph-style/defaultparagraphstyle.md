---
type: reference
native: NSParagraphStyle.defaultParagraphStyle
---

# `NSParagraphStyle.defaultParagraphStyle` 静态属性

**`NSParagraphStyle.defaultParagraphStyle`** 静态属性是系统的默认段落样式。

## 值

`NSParagraphStyle`，属性全部只读，都是默认值：`alignment` 是 `'natural'`，`lineBreakMode` 是 `'byWordWrapping'`，长度和倍数是 `0`。

- 只读。给它赋值抛 `TypeError`。
- 要在默认样式的基础上改，调 [`mutableCopy()`](mutablecopy.md)。

## 示例

```js
const style = NSParagraphStyle.defaultParagraphStyle.mutableCopy();
style.lineSpacing = 6;
console.log(style.lineSpacing, NSParagraphStyle.defaultParagraphStyle.lineSpacing);
```

**结果**：控制台输出 `6 0`。默认样式不变。

## 对应的 iOS API

`NSParagraphStyle.defaultParagraphStyle`。

## 参见

- [`NSParagraphStyle()`](constructor.md)
