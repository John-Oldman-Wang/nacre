---
type: reference
native: CASpringAnimation.stiffness
---

# `CASpringAnimation`: `stiffness` property

The **`stiffness`** property is the spring's stiffness. The larger the stiffness, the stiffer the spring and the faster it moves.

## Value

A number, unitless.

- Readable and writable.
- Defaults to `100`.
- Must be greater than 0. The behavior with 0 or a negative value is **not verified in the simulator**.
- Changing it changes [`settlingDuration`](settlingduration.md), [`perceptualDuration`](perceptualduration.md), and [`bounce`](bounce.md) accordingly.

### Invalid values

Converted with `Number()`. If the result isn't a finite number, throws `TypeError`: `stiffness must be a finite number, got …`.

## Examples

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
spring.stiffness = 120;
console.log(spring.stiffness);
```

**Result**: the console prints `120`.

## Corresponding iOS API

`CASpringAnimation.stiffness`.

## See also

- [`settlingDuration`](settlingduration.md)
