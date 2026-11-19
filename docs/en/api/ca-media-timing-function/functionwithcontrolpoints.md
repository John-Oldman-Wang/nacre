---
type: reference
native: "+[CAMediaTimingFunction functionWithControlPoints::::]"
---

# `CAMediaTimingFunction.functionWithControlPoints()` static method

The **`CAMediaTimingFunction.functionWithControlPoints()`** static method creates a custom timing function from the coordinates of two control points.

## Syntax

```
CAMediaTimingFunction.functionWithControlPoints(c1x, c1y, c2x, c2y)
```

### Parameters

**`c1x`**, **`c1y`**

The x and y of the first control point.

**`c2x`**, **`c2y`**

The x and y of the second control point.

All four are unitless numbers: coordinates in the [unit square the curve is drawn in](../ca-media-timing-function.md#the-shape-of-the-curve). Converted with `Number()`.

### Return value

A `CAMediaTimingFunction`.

### Exceptions

**`TypeError`**

A parameter can't be converted to a finite number: `c1x must be a finite number, got …`, naming whichever parameter is wrong.

## Examples

```js
const custom = CAMediaTimingFunction.functionWithControlPoints(0.25, 0.1, 0.25, 1);
console.log(String(custom.controlPointAtIndex(1)));
```

**Result**: You get the same curve as `'default'`. The console prints approximately `CGPoint(0.25, 0.1)`, with single-precision float error in the last digits.

## Corresponding iOS API

`+[CAMediaTimingFunction functionWithControlPoints::::]`.

## See also

- [`functionWithName()`](functionwithname.md): the built-in timing functions
- [`controlPointAtIndex()`](controlpointatindex.md)
