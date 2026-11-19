---
type: reference
native: UISlider.maximumValue
---

# `UISlider`: `maximumValue` property

The **`maximumValue`** property is the upper bound of the slider's range: the value when the thumb is at the far right.

## Value

A number, unitless, single-precision float.

- Readable and writable.
- Defaults to 1.
- Writes are converted with `Number()`.
- If [`value`](value.md) is above it after the write, `value` becomes it.

This property has no change notification; only your code changes it.

### Invalid values

A value that can't be converted to a finite number throws `TypeError`, and the property keeps its previous value:

```
TypeError: maximumValue must be a finite number, got "high"
```

## Examples

```js
const slider = new UISlider();
slider.maximumValue = 100;
slider.value = 40;
console.log(slider.value);
```

**Result**: Prints `40`. Set the range first, then the value; in the reverse order, 40 would first be clamped to the old upper bound 1.

## Corresponding iOS API

`UISlider.maximumValue`.

## See also

- [`minimumValue`](minimumvalue.md)
