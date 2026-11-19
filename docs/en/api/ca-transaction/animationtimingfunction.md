---
type: reference
native: +[CATransaction animationTimingFunction]
---

# `CATransaction.animationTimingFunction()` static method

The **`CATransaction.animationTimingFunction()`** static method returns the [timing curve](../ca-media-timing-function.md) used by the current transaction's implicit animations.

## Syntax

```
CATransaction.animationTimingFunction()
```

### Parameters

None.

### Return value

A [`CAMediaTimingFunction`](../ca-media-timing-function.md), or `null`. `null` means the default is used.

### Exceptions

None.

## Examples

```js
CATransaction.begin();
CATransaction.setAnimationTimingFunction(
  CAMediaTimingFunction.functionWithName('easeOut'));
const fn = CATransaction.animationTimingFunction();
console.log(fn !== null);
CATransaction.commit();
```

**Result**: logs `true` to the console.

## Corresponding iOS API

`+[CATransaction animationTimingFunction]`.

## See also

- [`setAnimationTimingFunction()`](setanimationtimingfunction.md)
