---
type: reference
native: CAAnimation.repeatDuration
---

# `CAAnimation`: `repeatDuration` property

The **`repeatDuration`** property is the total length of time the animation repeats. During this time the animation plays over and over, and it ends when the time is up.

## Value

A number, in seconds.

- Readable and writable.
- The default is `0`.
- Can be `Infinity`.
- Use either this or [`repeatCount`](repeatcount.md), not both.
- The effect is **not verified in the simulator**.

### Invalid values

Converted with `Number()`. If the result is neither a finite number nor `Infinity`, throws `TypeError`: `repeatDuration must be a finite number, got …`.

## Examples

```js
const blink = CABasicAnimation.animationWithKeyPath('opacity');
blink.fromValue = 1;
blink.toValue = 0;
blink.duration = 0.5;
blink.repeatDuration = 3;
```

**Effect**: After it is added to a layer, the 0.5-second fade-out plays over and over for 3 seconds in total. **Not verified in the simulator.**

## Corresponding iOS API

`CAMediaTiming.repeatDuration`.

## See also

- [`repeatCount`](repeatcount.md): repeating a number of times
