---
type: reference
native: CAAnimation.fillMode
---

# `CAAnimation`: `fillMode` property

The **`fillMode`** property determines what is shown on screen outside the animation's active period. The "active period" is the time from the animation's start to its end.

## Value

A string, one of these four:

| Value | Effect |
| --- | --- |
| `'removed'` | Outside the active period, the property value is shown |
| `'forwards'` | After the end, the end value continues to be shown. Only takes effect if [`removedOnCompletion`](removedoncompletion.md) is also set to `false` |
| `'backwards'` | Before the start, the start value is already shown. Only makes a difference when the animation starts late |
| `'both'` | Both of the above |

- Readable and writable.
- The default is `'removed'`.
- The visual effect of the four values is **not verified in the simulator**.

### Invalid values

Writing a value not in the table does not throw. The console prints a warning listing all available values, and `fillMode` keeps its previous value:

```
[Nacre] fillMode has no value "hold"; expected one of: removed / forwards / backwards / both, ignored
```

## Examples

```js
const layer = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
fade.fillMode = 'forwards';
fade.removedOnCompletion = false;
layer.addAnimation(fade, { forKey: 'fade' });
```

**Effect**: The layer gradually disappears over 0.3 seconds and then stays invisible. `layer.opacity` still reads 1. **Not verified in the simulator.**

This approach leaves the animation on the layer permanently; for the cost, see [Keeping a layer at the end](../../guides/animation.md#keeping-the-layer-at-the-end-value).

## Corresponding iOS API

`CAMediaTiming.fillMode`. `kCAFillModeForwards` is written `'forwards'`, and likewise for the rest.

## See also

- [`removedOnCompletion`](removedoncompletion.md)
- [Enums](../enums.md): why an invalid property value is a warning instead of an exception
