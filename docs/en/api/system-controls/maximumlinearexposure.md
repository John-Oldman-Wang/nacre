---
type: reference
native: UIColorWell.maximumLinearExposure
---

# `UIColorWell`: `maximumLinearExposure` property

The **`maximumLinearExposure`** property is the maximum linear exposure of colors selectable in the color picker panel. It's used for high dynamic range (HDR) colors, which can be brighter than ordinary white.

## Value

A number, unitless.

- Readable and writable.
- Defaults to `0` (measured in the simulator).
- The effect of each value on the color picker panel is **not verified in the simulator**. For the exact meaning, see Apple's documentation.
- Written values are converted with `Number()`: writing `'4'` gives 4.
- No change event. Only the app's own code changes it.

### Invalid values

Writing a value that can't be converted to a finite number (`'abc'`, `undefined`, `NaN`) throws `TypeError`, and the value stays unchanged:

```
TypeError: maximumLinearExposure must be a finite number, got "abc"
```

## Examples

```js
const well = new UIColorWell();
well.maximumLinearExposure = 2;
console.log(well.maximumLinearExposure);
```

**Result**: prints `2`. The change on the color picker panel is **not verified in the simulator**.

## Corresponding iOS API

`UIColorWell.maximumLinearExposure`.

## See also

- [`selectedColor`](selectedcolor.md)
