---
type: reference
native: "-[UIBezierPath bezierPathByReversingPath]"
---

# `UIBezierPath`: `bezierPathByReversingPath()` method

The **`bezierPathByReversingPath()`** method returns a new path with the same shape and the opposite direction. The original path is unchanged.

## Syntax

```
bezierPathByReversingPath()
```

### Parameters

None.

### Return value

A new `UIBezierPath`, not the original one. Its [`bounds`](bounds.md) is the same as the original path's.

### Exceptions

None.

## Description

A path's direction matters in two places:

- Which regions are filled when the shape layer's `fillRule` is `'nonZero'`. See [`CAShapeLayer`](../ca-layer.md#cashapelayer).
- The direction of travel when animating along the path. See [animation](../ca-animation.md).

## Examples

```js
const path = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 10, 10));
const back = path.bezierPathByReversingPath();
console.log(back === path, String(back.bounds));
```

**Result**: The console prints `false CGRect(0, 0, 10, 10)`.

## Corresponding iOS API

`-[UIBezierPath bezierPathByReversingPath]`.

## See also

- [`usesEvenOddFillRule`](usesevenoddfillrule.md)
