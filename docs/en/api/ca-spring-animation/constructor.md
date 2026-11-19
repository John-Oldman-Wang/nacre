---
type: reference
native: "-[CASpringAnimation init]"
---

# `CASpringAnimation()` constructor

The **`CASpringAnimation()`** constructor creates a spring animation with no property specified yet.

Usually you use [`CASpringAnimation.animationWithKeyPath()`](animationwithkeypath.md).

## Syntax

```
new CASpringAnimation()
```

### Parameters

None.

### Return value

A new `CASpringAnimation`. Its `keyPath` is `null`, and the four physical quantities have their default values: `mass` 1, `stiffness` 100, `damping` 10, `initialVelocity` 0.

## Examples

```js
const spring = new CASpringAnimation();
spring.keyPath = 'position';
console.log(spring.mass, spring.stiffness, spring.damping);
```

**Result**: the console prints `1 100 10`.

## Corresponding iOS API

`[CASpringAnimation animation]`.

## See also

- [`CASpringAnimation.animationWithKeyPath()`](animationwithkeypath.md)
