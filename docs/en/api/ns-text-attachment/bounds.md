---
type: reference
native: NSTextAttachment.bounds
---

# `NSTextAttachment`: `bounds` property

The **`bounds`** property determines where the attachment's image is drawn and how large.

## Value

A [`CGRect`](../structs.md), in [pt](../units.md).

- Readable and writable.
- Defaults to all `0`, which means the image's own size, with its bottom edge on the baseline.
- The origin is on the text baseline. A negative `y` moves the image down. The baseline is the line that the bottoms of letters in a line of text sit on.
- When writing, you can pass a `CGRect` or `{ x, y, width, height }`.

### Invalid values

**`TypeError`**

The value is not an object, or a field is missing or not a finite number, for example `bounds is missing width, or it is not a finite number`.

## Examples

```js
const attachment = new NSTextAttachment();
attachment.bounds = new CGRect(0, -3, 18, 18);
console.log(attachment.bounds.y, attachment.bounds.width);
```

**Effect**: the attachment is drawn at 18 × 18 pt, 3 pt below the text baseline. The console logs `-3 18`. The position on screen is **not verified in the simulator**.

## Corresponding iOS API

`NSTextAttachment.bounds`.

## See also

- [`image`](image.md)
- [Structs](../structs.md)
