---
type: reference
native: CAKeyframeAnimation.tensionValues
---

# `CAKeyframeAnimation`: `tensionValues` property

The **`tensionValues`** property adjusts the tightness of the smooth curve near each keyframe value. Only takes effect when [`calculationMode`](calculationmode.md) is `'cubic'` or `'cubicPaced'`.

## Value

An array of numbers, or `null`. Each item corresponds to one value in [`values`](values.md), ranges from −1 to 1, and has no unit.

- Readable and writable.
- The default is `null`. Items not given count as 0.
- The effect is **not verified in the simulator**.

### Invalid values

Throws `TypeError`:

- Neither an array nor `null`: `tensionValues must be an array of numbers or null, got …`
- An item cannot be converted to a finite number: `tensionValues[0] must be a finite number, got …`

## Examples

```js
const wave = CAKeyframeAnimation.animationWithKeyPath('position');
wave.values = [new CGPoint(30, 80), new CGPoint(150, 20), new CGPoint(270, 80)];
wave.calculationMode = 'cubic';
wave.tensionValues = [0, 0.5, 0];
console.log((wave.tensionValues || []).join(','));
```

**Result**: The console prints `0,0.5,0`. The tightness of the curve near the middle value changes. **How it looks on screen is not verified in the simulator.**

## Corresponding iOS API

`CAKeyframeAnimation.tensionValues`.

## See also

- [`continuityValues`](continuityvalues.md), [`biasValues`](biasvalues.md)
