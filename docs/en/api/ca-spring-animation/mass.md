---
type: reference
native: CASpringAnimation.mass
---

# `CASpringAnimation`: `mass` property

The **`mass`** property is the mass of the object at the end of the spring. The larger the mass, the slower it moves and the longer the bouncing lasts.

## Value

A number, unitless.

- Readable and writable.
- Defaults to `1`.
- Must be greater than 0. The behavior with 0 or a negative value is **not verified in the simulator**.
- Changing it changes [`settlingDuration`](settlingduration.md), [`perceptualDuration`](perceptualduration.md), and [`bounce`](bounce.md) accordingly.

### Invalid values

Converted with `Number()`. If the result isn't a finite number, throws `TypeError`: `mass must be a finite number, got …`.

## Examples

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
const before = spring.settlingDuration;
spring.mass = 3;
console.log(spring.settlingDuration > before);
```

**Result**: the console prints `true`: with more mass, it takes longer to come to rest. **Not verified in the simulator.**

## Corresponding iOS API

`CASpringAnimation.mass`.

## See also

- [`settlingDuration`](settlingduration.md)
