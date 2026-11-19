---
type: reference
native: CAKeyframeAnimation.keyTimes
---

# `CAKeyframeAnimation`: `keyTimes` property

The **`keyTimes`** property gives the time at which each value in [`values`](values.md) occurs.

## Value

An array of numbers, or `null`. Each item is a fraction from 0 to 1, with no unit: 0 is the start of the animation and 1 is the end.

- Readable and writable.
- The default is `null`, meaning the values are evenly spaced.
- It has as many items as `values`.
- Has no effect when [`calculationMode`](calculationmode.md) is `'paced'` or `'cubicPaced'`.

### Invalid values

Throws `TypeError`:

- Neither an array nor `null`: `keyTimes must be an array of numbers or null, got …`
- An item cannot be converted to a finite number: `keyTimes[0] must be a finite number, got …`

## Examples

```js
const blink = CAKeyframeAnimation.animationWithKeyPath('opacity');
blink.values = [1, 0.2, 1, 0.2, 1];
blink.keyTimes = [0, 0.2, 0.5, 0.7, 1];
blink.duration = 1.5;
console.log((blink.keyTimes || []).join(','));
```

**Result**: The console prints `0,0.2,0.5,0.7,1`. After it is added to a layer, the first fade is at 0.3 seconds and the recovery at 0.75 seconds. **How it looks on screen is not verified in the simulator.**

## Corresponding iOS API

`CAKeyframeAnimation.keyTimes`.

## See also

- [`values`](values.md)
- [`timingFunctions`](timingfunctions.md)
