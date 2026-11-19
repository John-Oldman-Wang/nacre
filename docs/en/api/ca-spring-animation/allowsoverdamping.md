---
type: reference
native: CASpringAnimation.allowsOverdamping
---

# `CASpringAnimation`: `allowsOverdamping` property

The **`allowsOverdamping`** property determines whether, once damping is high enough that there's no bounce, increasing it further makes reaching the end value slower.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Increasing damping further makes reaching the end value slower |
| `false` | Once damping is high enough that there's no bounce, increasing it further doesn't slow it down |

- Readable and writable.
- Defaults to `false`.
- Writes are converted with `Boolean()` and never fail.
- The effect is **not verified in the simulator**.

## Examples

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
spring.damping = 100;
spring.allowsOverdamping = true;
console.log(spring.allowsOverdamping);
```

**Result**: the console prints `true`.

## Corresponding iOS API

`CASpringAnimation.allowsOverdamping`.

## See also

- [`damping`](damping.md)
