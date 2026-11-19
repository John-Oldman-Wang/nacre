---
type: reference
native: UIFont.lineHeight
---

# `UIFont`: `lineHeight` property

The **`lineHeight`** property is the height of a line of text. A single-line `UILabel` determines its own height from it.

## Value

A number, in [pt](../units.md), determined by the font and size.

It is a read-only value built into the font; you cannot adjust line spacing through it. To adjust line spacing, use the paragraph style of an attributed string; see [`NSParagraphStyle`](../ns-paragraph-style.md).

- Read-only. Assigning to it throws `TypeError`.
- Font objects are immutable, so this value never changes for the object's lifetime, and there is no change notification.

## Examples

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.lineHeight);
```

**Result**: the console logs the height of a line of text, in pt.

## Corresponding iOS API

`UIFont.lineHeight`.

## See also

- [Font metrics](../ui-font.md#font-metrics)
