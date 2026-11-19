---
type: reference
native: NSParagraphStyle.headIndent
---

# `NSParagraphStyle`: `headIndent` property

The **`headIndent`** property is how far the lines other than the first are indented from the left.

## Value

A number, in [points (pt)](../units.md).

- Read-only; assigning to it throws `TypeError`. To set a value, use the property of the same name on [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md).
- The default is `0`.
- A paragraph style is copied when it is put into an attributed string, so this value never changes inside the attributed string.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.headIndent);
```

**Result**: the console prints the default value.

## Corresponding iOS API

`NSParagraphStyle.headIndent`.

## See also

- [`NSMutableParagraphStyle.headIndent`](../ns-mutable-paragraph-style/headindent.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
