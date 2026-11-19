---
type: reference
native: NSTextAttachment.image
---

# `NSTextAttachment`：`image` 属性

**`image`** 属性是附件显示的图片。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 读出来的和写进去的是同一个对象。
- 附件放进富文本之后再换图，已经交给视图的富文本是否跟着变，**未在模拟器验证**。

## 示例

```js
const attachment = new NSTextAttachment();
const star = UIImage.systemImageNamed('star.fill');
attachment.image = star;
console.log(attachment.image === star);
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`NSTextAttachment.image`。

## 参见

- [`bounds`](bounds.md)
