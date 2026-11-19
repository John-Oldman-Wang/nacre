---
type: reference
native: CASpringAnimation.damping
---

# `CASpringAnimation`: `damping` property

The **`damping`** property is the spring's damping. The larger the damping, the less it bounces; when large enough, it doesn't bounce and stops right at the end value.

## Value

A number, unitless.

- Readable and writable.
- Defaults to `10`.
- Can't be negative. The behavior with a negative value is **not verified in the simulator**.
- Changing it changes [`settlingDuration`](settlingduration.md), [`perceptualDuration`](perceptualduration.md), and [`bounce`](bounce.md) accordingly.

### Invalid values

Converted with `Number()`. If the result isn't a finite number, throws `TypeError`: `damping must be a finite number, got …`.

## Examples

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
const before = spring.settlingDuration;
spring.damping = 40;
console.log(before.toFixed(3), spring.settlingDuration.toFixed(3));
```

**Result**: the console prints `1.473 1.000`: raising damping from 10 to 40 changes the time needed to come to rest from 1.473 seconds to 1.000 seconds.

## Corresponding iOS API

`CASpringAnimation.damping`.

## See also

- [`settlingDuration`](settlingduration.md)
