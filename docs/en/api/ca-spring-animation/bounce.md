---
type: reference
native: CASpringAnimation.bounce
---

# `CASpringAnimation`: `bounce` property

The **`bounce`** property is how much the spring bounces.

## Value

A number, unitless. 0 means no bounce, and larger values bounce more noticeably; a negative value means reaching the end value even more slowly than with no bounce.

- Read-only. Assigning to it throws `TypeError`.
- Computed from [`mass`](mass.md), [`stiffness`](stiffness.md), [`damping`](damping.md), and [`initialVelocity`](initialvelocity.md), using their current values on every read. So read it only after all of them are set.
- 0.5 with the default parameters.
- No change event: it changes only along with the properties above, and only your own code changes those.

## Examples

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
console.log(spring.bounce.toFixed(3));
```

**Result**: the console prints `0.500`.

## Corresponding iOS API

`CASpringAnimation.bounce`.

## See also

- [`damping`](damping.md)
- [`perceptualDuration`](perceptualduration.md)
