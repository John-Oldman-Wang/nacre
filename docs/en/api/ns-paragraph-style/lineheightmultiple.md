---
type: reference
native: NSParagraphStyle.lineHeightMultiple
---

# `NSParagraphStyle`: `lineHeightMultiple` property

The **`lineHeightMultiple`** property is the line height as a multiple of the font's natural line height. `0` means no adjustment.

## Value

A number, a multiplier with no unit.

- Read-only; assigning to it throws `TypeError`. To set a value, use the property of the same name on [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md).
- The default is `0`.
- A paragraph style is copied when it is put into an attributed string, so this value never changes inside the attributed string.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.lineHeightMultiple);
```

**Result**: the console prints the default value.

## Corresponding iOS API

`NSParagraphStyle.lineHeightMultiple`.

## See also

- [`NSMutableParagraphStyle.lineHeightMultiple`](../ns-mutable-paragraph-style/lineheightmultiple.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
