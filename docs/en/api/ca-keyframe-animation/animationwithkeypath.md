---
type: reference
native: "+[CAKeyframeAnimation animationWithKeyPath:]"
---

# `CAKeyframeAnimation.animationWithKeyPath()` static method

The **`CAKeyframeAnimation.animationWithKeyPath()`** static method creates a keyframe animation that changes the given property.

## Syntax

```
CAKeyframeAnimation.animationWithKeyPath(keyPath)
```

### Parameters

**`keyPath`**

A string: which property the animation changes. One of the names in the table [Animatable properties](../ca-property-animation.md#animatable-properties).

### Return value

The new `CAKeyframeAnimation`, with [`keyPath`](../ca-property-animation/keypath.md) set to the given name.

### Exceptions

**`TypeError`**

`keyPath` is not in the table; the error message lists all usable names: `keyPath has no value "frame"; expected one of: …`.

## Examples

```js
const walk = CAKeyframeAnimation.animationWithKeyPath('position');
walk.values = [new CGPoint(0, 0), new CGPoint(10, 20), new CGPoint(30, 5)];
console.log(walk.keyPath);
```

**Result**: The console prints `position`.

## Corresponding iOS API

`+[CAKeyframeAnimation animationWithKeyPath:]`.

## See also

- [`CAKeyframeAnimation()`](constructor.md): creating one without specifying a property
