---
type: reference
native: NSParagraphStyle.paragraphSpacingBefore
---

# `NSParagraphStyle`: `paragraphSpacingBefore` property

The **`paragraphSpacingBefore`** property is the space left before the start of the paragraph.

## Value

A number, in [points (pt)](../units.md).

- Read-only; assigning to it throws `TypeError`. To set a value, use the property of the same name on [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md).
- The default is `0`.
- A paragraph style is copied when it is put into an attributed string, so this value never changes inside the attributed string.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.paragraphSpacingBefore);
```

**Result**: the console prints the default value.

## Corresponding iOS API

`NSParagraphStyle.paragraphSpacingBefore`.

## See also

- [`NSMutableParagraphStyle.paragraphSpacingBefore`](../ns-mutable-paragraph-style/paragraphspacingbefore.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
