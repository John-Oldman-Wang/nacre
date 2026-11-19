---
type: reference
native: UIFont.leading
---

# `UIFont`: `leading` property

The **`leading`** property is the extra spacing between lines suggested by the font.

## Value

A number, in [pt](../units.md), determined by the font and size.

- Read-only. Assigning to it throws `TypeError`.
- Font objects are immutable, so this value never changes for the object's lifetime, and there is no change notification.
- The specific values are **not verified in the simulator**.

## Examples

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.leading);
```

**Result**: the console logs the extra line spacing this font suggests.

## Corresponding iOS API

`UIFont.leading`.

## See also

- [Font metrics](../ui-font.md#font-metrics)
