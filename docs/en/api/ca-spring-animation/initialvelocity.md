---
type: reference
native: CASpringAnimation.initialVelocity
---

# `CASpringAnimation`: `initialVelocity` property

The **`initialVelocity`** property is the velocity the end of the spring already has when the animation starts.

## Value

A number, unitless.

- Readable and writable.
- Defaults to `0`.
- 0 means at rest at the start. Positive values point toward the end value, negative values the opposite way.
- Changing it changes [`settlingDuration`](settlingduration.md), [`perceptualDuration`](perceptualduration.md), and [`bounce`](bounce.md) accordingly.

### Invalid values

Converted with `Number()`. If the result isn't a finite number, throws `TypeError`: `initialVelocity must be a finite number, got …`.

## Examples

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
spring.initialVelocity = 5;
console.log(spring.initialVelocity);
```

**Result**: the console prints `5`. Once added to a layer, the layer starts out already moving toward the end value. **The on-screen behavior is not verified in the simulator.**

## Corresponding iOS API

`CASpringAnimation.initialVelocity`.

## See also

- [`settlingDuration`](settlingduration.md)
