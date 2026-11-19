---
type: reference
native: CAAnimation.duration
---

# `CAAnimation`: `duration` property

The **`duration`** property is the length of one play-through of the animation.

## Value

A number, in seconds.

- Readable and writable.
- The default is `0`.
- **0 does not mean "no animation".** When added to a layer, 0 is replaced with the current [transaction](../ca-transaction.md)'s duration, which is the iOS default of 0.25 seconds if never set. **Not verified in the simulator.**
- When [`autoreverses`](autoreverses.md) is `true`, one play-through takes twice `duration`.
- An animation inside a [`CAAnimationGroup`](../ca-animation-group.md) without a `duration` uses the group's duration.
- For [`CASpringAnimation`](../ca-spring-animation.md), how long the spring takes to settle is computed from physical quantities; read [`settlingDuration`](../ca-spring-animation/settlingduration.md).

### Invalid values

Converted with `Number()`. If the result is not a finite number, throws `TypeError`: `duration must be a finite number, got …`.

## Examples

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
console.log(fade.duration);
```

**Result**: The console prints `0.3`. After it is added to a layer, the fade-out finishes in 0.3 seconds.

## Corresponding iOS API

`CAMediaTiming.duration` (`CFTimeInterval`).

## See also

- [`repeatCount`](repeatcount.md): how many times it plays
- [`CATransaction.setAnimationDuration()`](../ca-transaction/setanimationduration.md): the duration used when `duration` is 0
