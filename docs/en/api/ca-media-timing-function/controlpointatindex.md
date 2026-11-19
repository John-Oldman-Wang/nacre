---
type: reference
native: "-[CAMediaTimingFunction getControlPointAtIndex:values:]"
---

# `CAMediaTimingFunction`: `controlPointAtIndex()` method

The **`controlPointAtIndex()`** method reads one end point or control point of the timing function.

## Syntax

```
controlPointAtIndex(index)
```

### Parameters

**`index`**

An integer from 0 to 3. 0 and 3 are the two ends of the curve, always (0, 0) and (1, 1); 1 and 2 are the two control points. Converted with `Number()` and truncated toward zero.

### Return value

A `CGPoint`, unitless: coordinates in the unit square. The values are single-precision floats, with error in the last digits.

### Exceptions

**`TypeError`**

- `index` is out of range: `controlPointAtIndex: index must be 0…3`.
- `index` can't be converted to a finite number: `index must be a finite number, got …`.

## Examples

```js
const ease = CAMediaTimingFunction.functionWithName('easeInEaseOut');
console.log(String(ease.controlPointAtIndex(0)), String(ease.controlPointAtIndex(1)));
```

**Result**: The console prints `CGPoint(0, 0)` and a value of approximately `CGPoint(0.42, 0)`.

## Corresponding iOS API

`-[CAMediaTimingFunction getControlPointAtIndex:values:]`. ObjC writes the result into a `float[2]` out parameter; here it returns a `CGPoint` instead.

## See also

- [The shape of the curve](../ca-media-timing-function.md#the-shape-of-the-curve)
