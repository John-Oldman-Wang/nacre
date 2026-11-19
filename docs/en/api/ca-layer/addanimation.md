---
type: reference
native: "-[CALayer addAnimation:forKey:]"
---

# `CALayer`: `addAnimation()` method

The **`addAnimation()`** method adds an [animation](../ca-animation.md) to the layer.

## Syntax

```
addAnimation(animation, [{ forKey }])
```

### Parameters

**`animation`**

An animation object, such as a [`CABasicAnimation`](../ca-basic-animation.md).

**`options.forKey`**

Optional. A name for this animation, a string, used later to look it up and remove it. An animation added without a name can only be removed with [`removeAllAnimations()`](removeallanimations.md).

### Return value

None (`undefined`).

- The animation doesn't start on this line. It starts playing after the current JS code finishes running and the interface changes are handed to the system. Use the animation's `start` and `stop` events to know when it starts and ends; see [`CAAnimation`](../ca-animation.md).
- The layer stores a copy of the animation object. Changing the original object after adding it doesn't affect the playing animation. To change it, create a new one and add it again with the same `forKey`.
- Events are fired on the object your code created, not on the copy. So listen on the original object, and add listeners before `addAnimation()`.
- A layer can have only one animation per name. Adding with an existing name removes and replaces the old one. **The replacement is not verified in the simulator.**

### Exceptions

**`TypeError`**

`animation` isn't an animation object: `addAnimation: expects a CAAnimation`.

## Examples

```js
const layer = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
layer.addAnimation(fade, { forKey: 'fade' });
console.log(layer.animationKeys().join(','));
```

**Result**: The console prints `fade`.

## Corresponding iOS API

`-[CALayer addAnimation:forKey:]`. The second part, `forKey:`, goes into the options object.

## See also

- [`CAAnimation`](../ca-animation.md)
- [`animationForKey()`](animationforkey.md), [`removeAnimationForKey()`](removeanimationforkey.md)
