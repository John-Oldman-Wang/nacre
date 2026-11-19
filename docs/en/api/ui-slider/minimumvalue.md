---
type: reference
native: UISlider.minimumValue
---

# `UISlider`: `minimumValue` property

The **`minimumValue`** property is the lower bound of the slider's range: the value when the thumb is at the far left.

## Value

A number, unitless, single-precision float.

- Readable and writable.
- Defaults to 0.
- Writes are converted with `Number()`.
- If [`value`](value.md) is below it after the write, `value` becomes it (measured).
- Writing a value larger than [`maximumValue`](maximumvalue.md) doesn't throw: measured, the upper bound is changed to equal the lower bound, and `value` becomes that number too.

This property has no change notification; only your code changes it.

### Invalid values

A value that can't be converted to a finite number throws `TypeError`, and the property keeps its previous value:

```
TypeError: minimumValue must be a finite number, got "low"
```

## Examples

```js
const slider = new UISlider();
slider.maximumValue = 100;
slider.minimumValue = 10;
console.log(slider.value);
```

**Result**: Prints `10`. The previous value 0 is below the new lower bound, so it becomes 10 too.

## Corresponding iOS API

`UISlider.minimumValue`.

## See also

- [`maximumValue`](maximumvalue.md)
