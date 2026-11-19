---
type: reference
native: NSParagraphStyle.lineSpacing
---

# `NSParagraphStyle`: `lineSpacing` property

The **`lineSpacing`** property is the extra distance added between lines.

## Value

A number, in [points (pt)](../units.md).

- Read-only; assigning to it throws `TypeError`. To set a value, use the property of the same name on [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md).
- The default is `0`.
- A paragraph style is copied when it is put into an attributed string, so this value never changes inside the attributed string.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.lineSpacing);
```

**Result**: the console prints the default value.

## Corresponding iOS API

`NSParagraphStyle.lineSpacing`.

## See also

- [`NSMutableParagraphStyle.lineSpacing`](../ns-mutable-paragraph-style/linespacing.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
