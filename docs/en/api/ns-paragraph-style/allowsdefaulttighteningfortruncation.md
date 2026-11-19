---
type: reference
native: NSParagraphStyle.allowsDefaultTighteningForTruncation
---

# `NSParagraphStyle`: `allowsDefaultTighteningForTruncation` property

The **`allowsDefaultTighteningForTruncation`** property is whether the system first tries tightening the letter spacing slightly before truncating the text.

## Value

A boolean.

`true`: the letter spacing is tightened first, and if the text then fits, it is not truncated. `false`: the spacing is not tightened; the text is truncated directly.

- Read-only; assigning to it throws `TypeError`. To set a value, use the property of the same name on [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md).
- The default is `false` (**not verified in the simulator**).
- A paragraph style is copied when it is put into an attributed string, so this value never changes inside the attributed string.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.allowsDefaultTighteningForTruncation);
```

**Result**: the console prints the default value.

## Corresponding iOS API

`NSParagraphStyle.allowsDefaultTighteningForTruncation`.

## See also

- [`NSMutableParagraphStyle.allowsDefaultTighteningForTruncation`](../ns-mutable-paragraph-style/allowsdefaulttighteningfortruncation.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
