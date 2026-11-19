---
type: reference
native: CAAnimation.timingFunction
---

# `CAAnimation`: `timingFunction` property

The **`timingFunction`** property is the animation's [timing curve](../ca-media-timing-function.md), which decides how progress is distributed over time: at a constant rate, or slow then fast.

## Value

A [`CAMediaTimingFunction`](../ca-media-timing-function.md), or `null`.

- Readable and writable.
- The default is `null`.
- When `null`, the animation proceeds at a constant rate.
- For a [`CAAnimationGroup`](../ca-animation-group.md), the group's timing curve applies to the whole group.
- When a [`CAKeyframeAnimation`](../ca-keyframe-animation.md) needs a separate curve between each pair of adjacent values, use its [`timingFunctions`](../ca-keyframe-animation/timingfunctions.md).

## Examples

```js
const move = CABasicAnimation.animationWithKeyPath('position');
move.fromValue = new CGPoint(30, 80);
move.toValue = new CGPoint(270, 80);
move.duration = 0.6;
move.timingFunction = CAMediaTimingFunction.functionWithName('easeOut');
```

**Effect**: After it is added to a layer, the layer moves fast at first and slows down as it nears the end. **Not verified in the simulator.**

## Corresponding iOS API

`CAAnimation.timingFunction`.

## See also

- [`CAMediaTimingFunction`](../ca-media-timing-function.md): the five built-in curves and custom curves
