---
type: reference
native: "-[CALayer removeAnimationForKey:]"
---

# `CALayer`: `removeAnimationForKey()` method

The **`removeAnimationForKey()`** method removes the animation with a given name from the layer.

## Syntax

```
removeAnimationForKey(key)
```

### Parameters

**`key`**

The animation's name, that is, the `forKey` given to [`addAnimation()`](addanimation.md).

### Return value

None (`undefined`).

When an animation is removed partway through, `finished` on its `stop` event is `false`; see [`CAAnimation`](../ca-animation.md).

### Exceptions

None.

## Examples

```js
const layer = new CALayer();
layer.addAnimation(CABasicAnimation.animationWithKeyPath('opacity'), { forKey: 'fade' });
layer.removeAnimationForKey('fade');
console.log(layer.animationForKey('fade'));
```

**Result**: The console prints `null`.

## Corresponding iOS API

`-[CALayer removeAnimationForKey:]`.

## See also

- [`removeAllAnimations()`](removeallanimations.md)
