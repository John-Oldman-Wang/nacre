---
type: reference
native: "+[CABasicAnimation animationWithKeyPath:]"
---

# `CABasicAnimation.animationWithKeyPath()` static method

The **`CABasicAnimation.animationWithKeyPath()`** static method creates an animation that changes the specified property.

## Syntax

```
CABasicAnimation.animationWithKeyPath(keyPath)
```

### Parameters

**`keyPath`**

A string naming the property to animate. One of the names in the [Animatable properties](../ca-property-animation.md#animatable-properties) table.

### Return value

A new `CABasicAnimation` whose [`keyPath`](../ca-property-animation/keypath.md) is the given name.

### Exceptions

**`TypeError`**

`keyPath` is not in the table; the message lists every valid name:

```
TypeError: keyPath has no value "frame"; expected one of: backgroundColor / borderColor / …
```

## Examples

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
console.log(fade.keyPath);
```

**Result**: the console logs `opacity`.

## Corresponding iOS API

`+[CABasicAnimation animationWithKeyPath:]`. Only names in the table are accepted, not arbitrary key paths.

## See also

- [`CABasicAnimation()`](constructor.md): creating one without specifying a property
- [Animatable properties](../ca-property-animation.md#animatable-properties)
