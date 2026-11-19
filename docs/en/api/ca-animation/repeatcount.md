---
type: reference
native: CAAnimation.repeatCount
---

# `CAAnimation`: `repeatCount` property

The **`repeatCount`** property is the number of times the animation repeats.

## Value

A number, with no unit; it is a count.

- Readable and writable.
- The default is `0`.
- Both 0 and 1 play once.
- Can be fractional: 2.5 plays two and a half times.
- `Infinity` repeats forever. An animation that repeats forever never ends on its own; to stop it, call the layer's `removeAnimationForKey()`.
- Use either this or [`repeatDuration`](repeatduration.md), not both.

### Invalid values

Converted with `Number()`. If the result is neither a finite number nor `Infinity`, throws `TypeError`: `repeatCount must be a finite number, got …`.

## Examples

```js
const layer = new CALayer();
const pulse = CABasicAnimation.animationWithKeyPath('opacity');
pulse.fromValue = 1;
pulse.toValue = 0.2;
pulse.duration = 0.7;
pulse.autoreverses = true;
pulse.repeatCount = Infinity;
layer.addAnimation(pulse, { forKey: 'pulse' });
console.log(pulse.repeatCount);
```

**Effect**: The layer fades over 0.7 seconds, then returns over another 0.7 seconds, repeating forever. The console prints `Infinity`.

## Corresponding iOS API

`CAMediaTiming.repeatCount`. `HUGE_VALF` is written `Infinity`.

## See also

- [`autoreverses`](autoreverses.md): playing back and forth
- [`repeatDuration`](repeatduration.md): repeating for a total duration
