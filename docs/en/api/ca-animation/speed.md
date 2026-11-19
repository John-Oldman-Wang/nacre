---
type: reference
native: CAAnimation.speed
---

# `CAAnimation`: `speed` property

The **`speed`** property is the playback speed multiplier.

## Value

A number, with no unit; it is a multiplier.

- Readable and writable.
- The default is `1`.
- 2 is double speed, halving the duration. 0 stops it.
- The effect is **not verified in the simulator**.

### Invalid values

Converted with `Number()`. If the result is not a finite number, throws `TypeError`: `speed must be a finite number, got …`.

## Examples

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 1;
fade.speed = 2;
```

**Effect**: After it is added to a layer, the fade-out finishes in 0.5 seconds. **Not verified in the simulator.**

## Corresponding iOS API

`CAMediaTiming.speed`.

## See also

- [`duration`](duration.md)
- [`timeOffset`](timeoffset.md)
