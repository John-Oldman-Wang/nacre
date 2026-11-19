---
type: reference
native: NSParagraphStyle.minimumLineHeight
---

# `NSParagraphStyle`: `minimumLineHeight` property

The **`minimumLineHeight`** property is the minimum line height. `0` means no limit.

## Value

A number, in [points (pt)](../units.md).

- Read-only; assigning to it throws `TypeError`. To set a value, use the property of the same name on [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md).
- The default is `0`.
- A paragraph style is copied when it is put into an attributed string, so this value never changes inside the attributed string.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.minimumLineHeight);
```

**Result**: the console prints the default value.

## Corresponding iOS API

`NSParagraphStyle.minimumLineHeight`.

## See also

- [`NSMutableParagraphStyle.minimumLineHeight`](../ns-mutable-paragraph-style/minimumlineheight.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
