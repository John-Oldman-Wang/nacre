---
type: reference
native: CAAnimation.autoreverses
---

# `CAAnimation`: `autoreverses` property

The **`autoreverses`** property determines whether the animation plays backward to the start after reaching the end.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | After reaching the end, plays backward to the start. One play-through takes twice [`duration`](duration.md) |
| `false` | Ends at the end |

- Readable and writable.
- The default is `false`.
- Converted with `Boolean()` on write; never fails.

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
```

**Effect**: The layer fades over 0.7 seconds, then returns over another 0.7 seconds, repeating forever.

## Corresponding iOS API

`CAMediaTiming.autoreverses`.

## See also

- [`repeatCount`](repeatcount.md): the number of repetitions
