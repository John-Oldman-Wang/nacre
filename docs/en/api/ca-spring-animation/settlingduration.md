---
type: reference
native: CASpringAnimation.settlingDuration
---

# `CASpringAnimation`: `settlingDuration` property

The **`settlingDuration`** property is the time the spring needs to come to rest.

## Value

A number, in seconds.

- Read-only. Assigning to it throws `TypeError`.
- Computed from [`mass`](mass.md), [`stiffness`](stiffness.md), [`damping`](damping.md), and [`initialVelocity`](initialvelocity.md), using their current values on every read. So read it only after all of them are set.
- 1.473 with the default parameters.
- No change event: it changes only along with the properties above, and only your own code changes those.

## Examples

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
spring.stiffness = 120;
spring.damping = 8;
spring.duration = spring.settlingDuration;
```

**Effect**: the animation's duration is exactly the time the spring needs to come to rest. This is the recommended way to set `duration`.

## Corresponding iOS API

`CASpringAnimation.settlingDuration`.

## See also

- [`perceptualDuration`](perceptualduration.md)
- [`CAAnimation.duration`](../ca-animation/duration.md)
