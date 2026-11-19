---
type: reference
native: CASpringAnimation.perceptualDuration
---

# `CASpringAnimation`: `perceptualDuration` property

The **`perceptualDuration`** property is how long the animation appears to last; it's shorter than [`settlingDuration`](settlingduration.md).

## Value

A number, in seconds.

- Read-only. Assigning to it throws `TypeError`.
- Computed from [`mass`](mass.md), [`stiffness`](stiffness.md), [`damping`](damping.md), and [`initialVelocity`](initialvelocity.md), using their current values on every read. So read it only after all of them are set.
- 0.628 with the default parameters.
- No change event: it changes only along with the properties above, and only your own code changes those.

## Examples

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
console.log(spring.perceptualDuration.toFixed(3));
```

**Result**: the console prints `0.628`.

## Corresponding iOS API

`CASpringAnimation.perceptualDuration`.

## See also

- [`settlingDuration`](settlingduration.md)
- [`bounce`](bounce.md)
