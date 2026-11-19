---
type: reference
native: NSParagraphStyle.alignment
---

# `NSParagraphStyle`: `alignment` property

The **`alignment`** property is the alignment of the text in the paragraph.

## Value

A string.

| Value | Effect |
| --- | --- |
| `'left'` | Aligned to the left |
| `'center'` | Centered |
| `'right'` | Aligned to the right |
| `'justified'` | Justified |
| `'natural'` | Follows the writing direction of the text: left for left-to-right languages, right for right-to-left languages |

- Read-only; assigning to it throws `TypeError`. To set a value, use the property of the same name on [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md).
- The default is `'natural'`.
- A paragraph style is copied when it is put into an attributed string, so this value never changes inside the attributed string.

## Examples

```js
const style = NSParagraphStyle.defaultParagraphStyle;
console.log(style.alignment);
```

**Result**: the console prints the default value.

## Corresponding iOS API

`NSParagraphStyle.alignment`.

## See also

- [`NSMutableParagraphStyle.alignment`](../ns-mutable-paragraph-style/alignment.md)
- [`NSParagraphStyle`](../ns-paragraph-style.md)
