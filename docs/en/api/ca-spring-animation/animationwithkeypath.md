---
type: reference
native: "+[CASpringAnimation animationWithKeyPath:]"
---

# `CASpringAnimation.animationWithKeyPath()` static method

The **`CASpringAnimation.animationWithKeyPath()`** static method creates a spring animation that changes the specified property.

## Syntax

```
CASpringAnimation.animationWithKeyPath(keyPath)
```

### Parameters

**`keyPath`**

A string: which property the animation changes. One of the names in the [Animatable properties](../ca-property-animation.md#animatable-properties) table.

### Return value

A new `CASpringAnimation` whose `keyPath` is the given name and whose four physical quantities have their default values.

### Exceptions

**`TypeError`**

`keyPath` isn't in the table; the error message lists all the names that can be used: `keyPath has no value "frame"; expected one of: …`.

## Examples

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
console.log(spring instanceof CABasicAnimation);
```

**Result**: the console prints `true`.

## Corresponding iOS API

`+[CASpringAnimation animationWithKeyPath:]`.

## See also

- [`CASpringAnimation()`](constructor.md)
