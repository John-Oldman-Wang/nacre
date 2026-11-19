---
type: reference
native: "+[NSTextAttachment textAttachmentWithImage:]"
---

# `NSTextAttachment.textAttachmentWithImage()` 静态方法

**`NSTextAttachment.textAttachmentWithImage()`** 静态方法创建一个显示指定图片的附件。

## 语法

```
NSTextAttachment.textAttachmentWithImage(image)
```

### 参数

**`image`**

[`UIImage`](../ui-image.md)。

### 返回值

新建的 `NSTextAttachment`，[`image`](image.md) 是这张图。

### 异常

**`TypeError`**

`image` 不是 `UIImage`：`textAttachmentWithImage image must be a UIImage, got …`。`UIImage.systemImageNamed()` 这类方法可能返回 `null`，先判空再传。

## 示例

```js
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  const attachment = NSTextAttachment.textAttachmentWithImage(star);
  console.log(attachment.image === star);
}
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`+[NSTextAttachment textAttachmentWithImage:]`。

## 参见

- [`NSAttributedString.attributedStringWithAttachment()`](../ns-attributed-string/attributedstringwithattachment.md)
