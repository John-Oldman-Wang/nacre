---
type: reference
native: NSParagraphStyle.firstLineHeadIndent
---

# `NSParagraphStyle`: `firstLineHeadIndent` property

The **`firstLineHeadIndent`** property is how far the first line is indented from the left.

## Value

A number, in [points (pt)](../units.md).

- Read-only; assigning to it throws `TypeError`. To set a value, use the property of the same name on [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md).
- The default is `0`.
- A paragraph style is copied when it is put into an attributed string, so this value never changes inside the attributed string.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.firstLineHeadIndent);
```

**Result**: the console prints the default value.

## Corresponding iOS API

`NSParagraphStyle.firstLineHeadIndent`.

## See also

- [`NSMutableParagraphStyle.firstLineHeadIndent`](../ns-mutable-paragraph-style/firstlineheadindent.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
