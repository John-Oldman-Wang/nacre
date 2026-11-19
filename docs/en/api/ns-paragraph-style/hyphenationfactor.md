---
type: reference
native: NSParagraphStyle.hyphenationFactor
---

# `NSParagraphStyle`: `hyphenationFactor` property

The **`hyphenationFactor`** property is how aggressively words are hyphenated. `0` means no hyphenation; `1` means hyphenate as much as possible.

## Value

A number, a ratio from 0 to 1.

- Read-only; assigning to it throws `TypeError`. To set a value, use the property of the same name on [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md).
- The default is `0`.
- A paragraph style is copied when it is put into an attributed string, so this value never changes inside the attributed string.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.hyphenationFactor);
```

**Result**: the console prints the default value.

## Corresponding iOS API

`NSParagraphStyle.hyphenationFactor`.

## See also

- [`NSMutableParagraphStyle.hyphenationFactor`](../ns-mutable-paragraph-style/hyphenationfactor.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
