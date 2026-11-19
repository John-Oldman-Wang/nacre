---
type: reference
native: CAAnimation.timeOffset
---

# `CAAnimation`: `timeOffset` property

The **`timeOffset`** property specifies which second of the animation playback starts from.

## Value

A number, in seconds.

- Readable and writable.
- The default is `0`.
- The effect is **not verified in the simulator**.

### Invalid values

Converted with `Number()`. If the result is not a finite number, throws `TypeError`: `timeOffset must be a finite number, got …`.

## Examples

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 1;
fade.timeOffset = 0.5;
```

**Effect**: After it is added to a layer, playback starts halfway through the fade-out. **Not verified in the simulator.**

## Corresponding iOS API

`CAMediaTiming.timeOffset`.

## See also

- [`speed`](speed.md)
