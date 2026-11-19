---
type: reference
native: "-[CABasicAnimation init]"
---

# `CABasicAnimation()` constructor

The **`CABasicAnimation()`** constructor creates an animation with no property specified yet.

In most cases, use [`CABasicAnimation.animationWithKeyPath()`](animationwithkeypath.md), which creates the animation and specifies the property in one step.

## Syntax

```
new CABasicAnimation()
```

### Parameters

None.

### Return value

A new `CABasicAnimation`. Its [`keyPath`](../ca-property-animation/keypath.md) is `null`; set `keyPath` before setting `fromValue`, `toValue`, or `byValue`.

## Examples

```js
const fade = new CABasicAnimation();
fade.keyPath = 'opacity';
fade.fromValue = 1;
fade.toValue = 0;
```

**Result**: an animation that changes opacity from 1 to 0, the same as `CABasicAnimation.animationWithKeyPath('opacity')`.

## Corresponding iOS API

`[CABasicAnimation animation]`.

## See also

- [`CABasicAnimation.animationWithKeyPath()`](animationwithkeypath.md)
