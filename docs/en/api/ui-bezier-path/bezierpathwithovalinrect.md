---
type: reference
native: "+[UIBezierPath bezierPathWithOvalInRect:]"
---

# `UIBezierPath.bezierPathWithOvalInRect()` static method

The **`UIBezierPath.bezierPathWithOvalInRect()`** static method creates the oval inscribed in a rectangle. When the given rectangle is a square, you get a circle.

## Syntax

```
UIBezierPath.bezierPathWithOvalInRect(rect)
```

### Parameters

**`rect`**

The oval's bounding rectangle, a `CGRect`, in [pt](../units.md). Can also be a plain object `{ x, y, width, height }`.

### Return value

A new `UIBezierPath`. Its [`bounds`](bounds.md) is `rect`.

### Exceptions

**`TypeError`**

- `rect` isn't an object: `bezierPathWithOvalInRect needs an object with all of: x, y, width, height`.
- A field is missing or can't be converted to a finite number: `bezierPathWithOvalInRect is missing height, or it is not a finite number` (`height` replaced by whichever field is actually missing).

## Examples

```js
const oval = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 80, 50));
const circle = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 50, 50));
console.log(String(circle.bounds));
```

**Result**: `oval` is an 80 × 50 pt oval. `circle` is a circle 50 pt in diameter. The console prints `CGRect(0, 0, 50, 50)`.

## Corresponding iOS API

`+[UIBezierPath bezierPathWithOvalInRect:]`.

## See also

- [`bezierPathWithArcCenter()`](bezierpathwitharccenter.md): draw a circle or arc from a center and radius
