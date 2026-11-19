---
type: reference
native: "+[CATransaction setAnimationTimingFunction:]"
---

# `CATransaction.setAnimationTimingFunction()` static method

The **`CATransaction.setAnimationTimingFunction()`** static method sets the [timing curve](../ca-media-timing-function.md) used by the current transaction's implicit animations.

## Syntax

```
CATransaction.setAnimationTimingFunction(value)
```

### Parameters

**`value`**

A [`CAMediaTimingFunction`](../ca-media-timing-function.md), or `null`. `null` means the default is used.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`value` is neither a timing curve nor `null`: `setAnimationTimingFunction needs a CAMediaTimingFunction or null`.

## Examples

```js
const shape = new CAShapeLayer();

CATransaction.begin();
CATransaction.setAnimationDuration(1.5);
CATransaction.setAnimationTimingFunction(
  CAMediaTimingFunction.functionWithName('easeOut'));
shape.strokeEnd = 1;
CATransaction.commit();
```

**Effect**: when the layer has been shown, `strokeEnd` transitions to 1 over 1.5 seconds, starting fast and slowing down before the end. **Not verified in the simulator.**

## Corresponding iOS API

`+[CATransaction setAnimationTimingFunction:]`.

## See also

- [`animationTimingFunction()`](animationtimingfunction.md)
