---
type: reference
native: "+[NSTextAttachment textAttachmentWithImage:]"
---

# `NSTextAttachment.textAttachmentWithImage()` static method

The **`NSTextAttachment.textAttachmentWithImage()`** static method creates an attachment that shows the given image.

## Syntax

```
NSTextAttachment.textAttachmentWithImage(image)
```

### Parameters

**`image`**

A [`UIImage`](../ui-image.md).

### Return value

A new `NSTextAttachment` whose [`image`](image.md) is this image.

### Exceptions

**`TypeError`**

`image` is not a `UIImage`: `textAttachmentWithImage image must be a UIImage, got …`. Methods such as `UIImage.systemImageNamed()` can return `null`; check for null before passing the result.

## Examples

```js
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  const attachment = NSTextAttachment.textAttachmentWithImage(star);
  console.log(attachment.image === star);
}
```

**Result**: the console logs `true`.

## Corresponding iOS API

`+[NSTextAttachment textAttachmentWithImage:]`.

## See also

- [`NSAttributedString.attributedStringWithAttachment()`](../ns-attributed-string/attributedstringwithattachment.md)
