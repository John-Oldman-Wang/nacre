---
type: reference
native: NSTextAttachment.image
---

# `NSTextAttachment`: `image` property

The **`image`** property is the image the attachment shows.

## Value

A [`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- Defaults to `null`.
- Reading returns the same object that was written.
- Whether an attributed string already handed to a view follows along when you change the image after placing the attachment in it is **not verified in the simulator**.

## Examples

```js
const attachment = new NSTextAttachment();
const star = UIImage.systemImageNamed('star.fill');
attachment.image = star;
console.log(attachment.image === star);
```

**Result**: the console logs `true`.

## Corresponding iOS API

`NSTextAttachment.image`.

## See also

- [`bounds`](bounds.md)
