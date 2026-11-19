---
type: reference
native: NSTextAttachment.bounds
---

# `NSTextAttachment`：`bounds` 属性

**`bounds`** 属性决定附件的图片画在哪、画多大。

## 值

[`CGRect`](../structs.md)，单位 [pt](../units.md)。

- 可读，可写。
- 默认值全是 `0`，表示用图片自己的大小，底边贴着基线。
- 原点在文字的基线上。`y` 为负是往下移。基线是一行文字里字母底部对齐的那条线。
- 写入时可以给 `CGRect`，也可以给 `{ x, y, width, height }`。

### 写错时

**`TypeError`**

给的不是对象，或者缺字段、字段不是有限的数，比如 `bounds is missing width, or it is not a finite number`。

## 示例

```js
const attachment = new NSTextAttachment();
attachment.bounds = new CGRect(0, -3, 18, 18);
console.log(attachment.bounds.y, attachment.bounds.width);
```

**效果**：附件画成 18 × 18 pt，比文字的基线低 3 pt。控制台输出 `-3 18`。屏幕上的位置**未在模拟器验证**。

## 对应的 iOS API

`NSTextAttachment.bounds`。

## 参见

- [`image`](image.md)
- [结构体](../structs.md)
