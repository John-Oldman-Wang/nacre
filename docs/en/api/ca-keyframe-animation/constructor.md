---
type: reference
native: "-[CAKeyframeAnimation init]"
---

# `CAKeyframeAnimation()` constructor

The **`CAKeyframeAnimation()`** constructor creates a keyframe animation with no property specified yet.

Usually you use [`CAKeyframeAnimation.animationWithKeyPath()`](animationwithkeypath.md), which creates it and specifies the property in one step.

## Syntax

```
new CAKeyframeAnimation()
```

### Parameters

None.

### Return value

The new `CAKeyframeAnimation`. Its [`keyPath`](../ca-property-animation/keypath.md) is `null`; set `keyPath` before setting [`values`](values.md).

## Examples

```js
const blink = new CAKeyframeAnimation();
console.log(blink.keyPath, blink.values, blink.calculationMode);
```

**Result**: The console prints `null null linear`.

## Corresponding iOS API

`[CAKeyframeAnimation animation]`.

## See also

- [`CAKeyframeAnimation.animationWithKeyPath()`](animationwithkeypath.md)
