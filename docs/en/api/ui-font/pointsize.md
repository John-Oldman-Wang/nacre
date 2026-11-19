---
type: reference
native: UIFont.pointSize
---

# `UIFont`: `pointSize` property

The **`pointSize`** property is the font size.

## Value

A number, in [pt](../units.md). Equal to the size given at creation; for fonts from [`preferredFontForTextStyle()`](preferredfontfortextstyle.md), it is the size under the text size setting at that time.

- Read-only. Assigning to it throws `TypeError`.
- Font objects are immutable, so this value never changes for the object's lifetime, and there is no change notification.

## Examples

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.pointSize);
console.log(UIFont.preferredFontForTextStyle('title1').pointSize);
```

**Result**: the first line logs `17`; the second logs the size of the first-level heading under the current setting.

## Corresponding iOS API

`UIFont.pointSize`.

## See also

- [Font metrics](../ui-font.md#font-metrics)
