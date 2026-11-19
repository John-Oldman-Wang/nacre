---
type: reference
native: NSParagraphStyle.tailIndent
---

# `NSParagraphStyle`: `tailIndent` property

The **`tailIndent`** property is the right edge of the lines. A positive number is measured from the left; `0` or a negative number is measured from the right, so `-16` leaves 16 pt on the right.

## Value

A number, in [points (pt)](../units.md).

- Read-only; assigning to it throws `TypeError`. To set a value, use the property of the same name on [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md).
- The default is `0`.
- A paragraph style is copied when it is put into an attributed string, so this value never changes inside the attributed string.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.tailIndent);
```

**Result**: the console prints the default value.

## Corresponding iOS API

`NSParagraphStyle.tailIndent`.

## See also

- [`NSMutableParagraphStyle.tailIndent`](../ns-mutable-paragraph-style/tailindent.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
