---
type: reference
native: CAShapeLayer.lineDashPhase
---

# `CAShapeLayer`: `lineDashPhase` property

The **`lineDashPhase`** property determines at which position in the dash pattern drawing starts.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- Defaults to `0`.
- Takes effect only when [`lineDashPattern`](linedashpattern.md) is not `null`.

### Invalid values

Written values are converted with `Number()`. Values that cannot be converted to a finite number throw `TypeError`.

## Examples

```js
const shape = new CAShapeLayer();
shape.lineDashPattern = [6, 3];
shape.lineDashPhase = 3;
console.log(shape.lineDashPhase);
```

**Result**: the console logs `3`. The dashes start drawing 3 pt into the pattern; **not verified in the simulator**.

## Corresponding iOS API

`CAShapeLayer.lineDashPhase`.

## See also

- [`lineDashPattern`](linedashpattern.md)
