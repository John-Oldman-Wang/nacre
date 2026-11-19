---
type: reference
native: NSParagraphStyle.defaultTabInterval
---

# `NSParagraphStyle`: `defaultTabInterval` property

The **`defaultTabInterval`** property is the default interval between tab stops.

## Value

A number, in [points (pt)](../units.md).

- Read-only; assigning to it throws `TypeError`. To set a value, use the property of the same name on [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md).
- The default is `0`.
- A paragraph style is copied when it is put into an attributed string, so this value never changes inside the attributed string.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.defaultTabInterval);
```

**Result**: the console prints the default value.

## Corresponding iOS API

`NSParagraphStyle.defaultTabInterval`.

## See also

- [`NSMutableParagraphStyle.defaultTabInterval`](../ns-mutable-paragraph-style/defaulttabinterval.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
