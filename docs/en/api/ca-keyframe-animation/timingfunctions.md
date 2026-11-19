---
type: reference
native: CAKeyframeAnimation.timingFunctions
---

# `CAKeyframeAnimation`: `timingFunctions` property

The **`timingFunctions`** property specifies a [timing curve](../ca-media-timing-function.md) for each segment between adjacent values.

## Value

An array of [`CAMediaTimingFunction`](../ca-media-timing-function.md).

- Readable and writable.
- The default is `[]`.
- One per segment, so one fewer than [`values`](values.md).
- It reads back as the objects written.
- Writing `null` or `undefined` is the same as writing `[]`.
- Has no effect when [`calculationMode`](calculationmode.md) is `'paced'` or `'cubicPaced'`.

### Invalid values

An item in the array is not a timing curve: throws `TypeError: timingFunctions needs an array of CAMediaTimingFunction`.

## Examples

```js
const bounce = CAKeyframeAnimation.animationWithKeyPath('opacity');
bounce.values = [1, 0, 1];
bounce.timingFunctions = [
  CAMediaTimingFunction.functionWithName('easeIn'),
  CAMediaTimingFunction.functionWithName('easeOut'),
];
console.log(bounce.timingFunctions.length);
```

**Effect**: The console prints `2`. After it is added to a layer, the fading segment starts slow and ends fast, and the recovering segment starts fast and ends slow. **How it looks on screen is not verified in the simulator.**

## Corresponding iOS API

`CAKeyframeAnimation.timingFunctions`.

## See also

- [`CAAnimation.timingFunction`](../ca-animation/timingfunction.md): one curve for the whole animation
