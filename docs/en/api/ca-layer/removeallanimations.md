---
type: reference
native: "-[CALayer removeAllAnimations]"
---

# `CALayer`: `removeAllAnimations()` method

The **`removeAllAnimations()`** method removes all animations on the layer, including unnamed ones.

## Syntax

```
removeAllAnimations()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

```js
const layer = new CALayer();
layer.addAnimation(CABasicAnimation.animationWithKeyPath('opacity'), { forKey: 'fade' });
layer.addAnimation(CABasicAnimation.animationWithKeyPath('position'), { forKey: 'move' });
layer.removeAllAnimations();
console.log(layer.animationKeys().length);
```

**Result**: The console prints `0`.

## Corresponding iOS API

`-[CALayer removeAllAnimations]`.

## See also

- [`removeAnimationForKey()`](removeanimationforkey.md)
