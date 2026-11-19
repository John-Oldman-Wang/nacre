---
type: reference
native: CAKeyframeAnimation.calculationMode
---

# `CAKeyframeAnimation`: `calculationMode` property

The **`calculationMode`** property determines how the animation transitions between keyframe values.

## Value

A string, one of these five:

| Value | Effect |
| --- | --- |
| `'linear'` | Straight-line transition between adjacent values |
| `'discrete'` | No transition. At each time it switches directly to the next value |
| `'paced'` | Straight-line transition at a constant rate throughout. [`keyTimes`](keytimes.md) and [`timingFunctions`](timingfunctions.md) have no effect |
| `'cubic'` | Passes through each value along a smooth curve, with no sharp corners at turns |
| `'cubicPaced'` | A smooth curve at a constant rate throughout. `keyTimes` and `timingFunctions` have no effect |

- Readable and writable.
- The default is `'linear'`.
- The effects of `'cubic'` and `'cubicPaced'` are **not verified in the simulator**. Their curve shape can be adjusted with [`tensionValues`](tensionvalues.md), [`continuityValues`](continuityvalues.md), and [`biasValues`](biasvalues.md).

### Invalid values

Writing a value not in the table does not throw. The console prints a warning listing all available values, and `calculationMode` keeps its previous value.

## Examples

```js
const jump = CAKeyframeAnimation.animationWithKeyPath('fillColor');
jump.values = ['systemRed', '#FFCC00', 'systemGreen'];
jump.calculationMode = 'discrete';
jump.duration = 1.8;
```

**Effect**: After it is added to a shape layer, it shows red, yellow, and green in turn; each stays for a while and then switches directly to the next, with no gradual transition.

## Corresponding iOS API

`CAKeyframeAnimation.calculationMode`. `kCAAnimationDiscrete` is written `'discrete'`, and likewise for the rest.

## See also

- [Switching directly at each time, without interpolation](../../guides/animation.md#switching-directly-at-set-times-without-blending)
- [Enums](../enums.md)
