---
type: reference
native: "-[CALayer animationForKey:]"
---

# `CALayer`: `animationForKey()` method

The **`animationForKey()`** method reads the animation with a given name on the layer.

## Syntax

```
animationForKey(key)
```

### Parameters

**`key`**

The animation's name.

### Return value

An animation object; `null` when there is no animation with that name.

- It returns the copy the layer stores, not the object that was added.
- The copy is the same class as the added object: if you added a `CASpringAnimation`, you read a `CASpringAnimation`.
- The returned object is for reading only; the result of changing its properties is undefined.
- While an image view plays an animated image, its layer has an animation named `'nacreImageFrames'`; see [`UIImageView`](../ui-image-view.md#playing-animated-images).

### Exceptions

None.

## Examples

```js
const layer = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
layer.addAnimation(fade, { forKey: 'fade' });
const copy = layer.animationForKey('fade');
console.log(copy === fade, copy instanceof CABasicAnimation);
```

**Result**: The console prints `false true`.

## Corresponding iOS API

`-[CALayer animationForKey:]`.

## See also

- [`addAnimation()`](addanimation.md)
