---
type: reference
native: UIFont.ascender
---

# `UIFont`: `ascender` property

The **`ascender`** property is the distance from the baseline to the font's highest point. The baseline is the line letters stand on.

## Value

A number, in [pt](../units.md), determined by the font and size.

- Read-only. Assigning to it throws `TypeError`.
- Font objects are immutable, so this value never changes for the object's lifetime, and there is no change notification.
- The specific values are **not verified in the simulator**.

## Examples

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.ascender, font.descender);
```

**Result**: the console logs the heights above and below the baseline.

## Corresponding iOS API

`UIFont.ascender`.

## See also

- [Font metrics](../ui-font.md#font-metrics)
