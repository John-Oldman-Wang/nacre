---
type: reference
native: NSParagraphStyle.paragraphSpacing
---

# `NSParagraphStyle`: `paragraphSpacing` property

The **`paragraphSpacing`** property is the space left after the end of the paragraph.

## Value

A number, in [points (pt)](../units.md).

- Read-only; assigning to it throws `TypeError`. To set a value, use the property of the same name on [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md).
- The default is `0`.
- A paragraph style is copied when it is put into an attributed string, so this value never changes inside the attributed string.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.paragraphSpacing);
```

**Result**: the console prints the default value.

## Corresponding iOS API

`NSParagraphStyle.paragraphSpacing`.

## See also

- [`NSMutableParagraphStyle.paragraphSpacing`](../ns-mutable-paragraph-style/paragraphspacing.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
