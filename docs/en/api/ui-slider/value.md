---
type: reference
native: UISlider.value
---

# `UISlider`: `value` property

The **`value`** property is the slider's current value: the number corresponding to the thumb's position.

## Value

A number, unitless. Single-precision float: writing 0.3 reads back 0.30000001192092896 (measured). Round it or fix the number of decimal places before displaying it; don't compare two values with `===` when they have fractions.

- Readable and writable.
- Defaults to 0.
- Writes are converted with `Number()`, so `'0.25'` gives 0.25.
- A value outside [`minimumValue`](minimumvalue.md) to [`maximumValue`](maximumvalue.md) doesn't throw; it is clamped to the nearer end: with a range of 0 to 1, writing 5 reads back 1, and writing -5 reads back 0. So set the range first, then the value.
- Writing `value` isn't animated. For animation, use [`setValue()`](setvalue.md).

### Observing changes

When the user drags, [`change`](../ui-control/change-event.md) fires; when it fires is determined by [`isContinuous`](iscontinuous.md). Writing `value` from code doesn't fire `change`, so writing `value` inside a `change` callback doesn't loop. The acceptance tests assert that no `change` is received after a write.

### Invalid values

A value that can't be converted to a finite number (`'half'`, `undefined`, `NaN`) throws `TypeError`, and the property keeps its previous value:

```
TypeError: value must be a finite number, got "half"
```

## Examples

```js
const slider = new UISlider();
slider.value = 0.5;
console.log(slider.value);
slider.value = 5;
console.log(slider.value);
```

**Result**: Prints `0.5`, then `1`.

## Corresponding iOS API

`UISlider.value`. Natively a `float`.

## See also

- [`setValue()`](setvalue.md): changing the value with animation
- The [`change`](../ui-control/change-event.md) event
- [Snapping a slider to fixed steps](../../guides/switches-sliders-steppers.md#make-the-slider-snap-to-fixed-steps)
