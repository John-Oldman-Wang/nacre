---
type: reference
native: UIFont.capHeight
---

# `UIFont`: `capHeight` property

The **`capHeight`** property is the height of capital letters.

## Value

A number, in [pt](../units.md), determined by the font and size.

- Read-only. Assigning to it throws `TypeError`.
- Font objects are immutable, so this value never changes for the object's lifetime, and there is no change notification.
- The specific values are **not verified in the simulator**.

## Examples

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.capHeight);
```

**Result**: the console logs the height of capital letters in the 17 pt system font.

## Corresponding iOS API

`UIFont.capHeight`.

## See also

- [Font metrics](../ui-font.md#font-metrics)
