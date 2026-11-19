---
type: reference
native: NSParagraphStyle.lineBreakMode
---

# `NSParagraphStyle`: `lineBreakMode` property

The **`lineBreakMode`** property is what happens when a line doesn't fit. The values are the same as for [`UILabel.lineBreakMode`](../ui-label/linebreakmode.md): `'byWordWrapping'`, `'byCharWrapping'`, `'byClipping'`, `'byTruncatingHead'`, `'byTruncatingTail'`, `'byTruncatingMiddle'`.

## Value

A string.

- Read-only; assigning to it throws `TypeError`. To set a value, use the property of the same name on [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md).
- The default is `'byWordWrapping'`.
- A paragraph style is copied when it is put into an attributed string, so this value never changes inside the attributed string.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.lineBreakMode);
```

**Result**: the console prints the default value.

## Corresponding iOS API

`NSParagraphStyle.lineBreakMode`.

## See also

- [`NSMutableParagraphStyle.lineBreakMode`](../ns-mutable-paragraph-style/linebreakmode.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
