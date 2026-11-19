---
type: reference
native: UIFont.descender
---

# `UIFont`: `descender` property

The **`descender`** property is the distance from the baseline to the font's lowest point. Letters such as `g` and `y` extend partly below the baseline.

## Value

A number, in [pt](../units.md), determined by the font and size. It represents a position below the baseline and is usually negative (**not verified in the simulator**).

- Read-only. Assigning to it throws `TypeError`.
- Font objects are immutable, so this value never changes for the object's lifetime, and there is no change notification.
- The specific values are **not verified in the simulator**.

## Examples

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.descender);
```

**Result**: the console logs the height below the baseline.

## Corresponding iOS API

`UIFont.descender`.

## See also

- [Font metrics](../ui-font.md#font-metrics)
