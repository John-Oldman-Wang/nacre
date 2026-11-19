---
type: reference
native: "-[NSTextAttachment init]"
---

# `NSTextAttachment()` constructor

The **`NSTextAttachment()`** constructor creates an empty attachment.

## Syntax

```
new NSTextAttachment()
```

### Parameters

None.

### Return value

A new `NSTextAttachment`. [`image`](image.md) is `null` and [`bounds`](bounds.md) is all `0`.

### Exceptions

It cannot be subclassed: with `class X extends NSTextAttachment {}`, `new X()` throws `TypeError`. See [Native classes](../native-classes.md).

## Examples

```js
const attachment = new NSTextAttachment();
attachment.image = UIImage.systemImageNamed('star.fill');
console.log(attachment.image !== null);
```

**Result**: the console logs `true`.

## Corresponding iOS API

`[[NSTextAttachment alloc] init]`.

## See also

- [`NSTextAttachment.textAttachmentWithImage()`](textattachmentwithimage.md)
