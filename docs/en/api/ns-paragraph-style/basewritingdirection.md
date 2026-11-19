---
type: reference
native: NSParagraphStyle.baseWritingDirection
---

# `NSParagraphStyle`: `baseWritingDirection` property

The **`baseWritingDirection`** property is the side the paragraph starts from.

## Value

A string.

| Value | Effect |
| --- | --- |
| `'natural'` | Determined from the text content |
| `'leftToRight'` | Left to right |
| `'rightToLeft'` | Right to left |

- Read-only; assigning to it throws `TypeError`. To set a value, use the property of the same name on [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md).
- The default is `'natural'`.
- A paragraph style is copied when it is put into an attributed string, so this value never changes inside the attributed string.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.baseWritingDirection);
```

**Result**: the console prints the default value.

## Corresponding iOS API

`NSParagraphStyle.baseWritingDirection`.

## See also

- [`NSMutableParagraphStyle.baseWritingDirection`](../ns-mutable-paragraph-style/basewritingdirection.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
