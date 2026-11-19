---
type: reference
native: "-[CALayer animationKeys]"
---

# `CALayer`: `animationKeys()` method

The **`animationKeys()`** method returns the names of all animations on the layer.

## Syntax

```
animationKeys()
```

### Parameters

None.

### Return value

An array of strings. An empty array `[]` when there are no animations, not `null`. Animations added without a name aren't included.

### Exceptions

None.

## Examples

```js
const layer = new CALayer();
console.log(layer.animationKeys().length);
layer.addAnimation(CABasicAnimation.animationWithKeyPath('opacity'), { forKey: 'fade' });
console.log(layer.animationKeys().join(','));
```

**Result**: It prints `0`, then `fade`.

## Corresponding iOS API

`-[CALayer animationKeys]`. Natively it is `nil` when there are no animations; here it is an empty array.

## See also

- [`animationForKey()`](animationforkey.md)
