---
type: reference
native: CAGradientLayer.endPoint
---

# `CAGradientLayer`: `endPoint` property

The **`endPoint`** property is the gradient's end point, in unit coordinates.

## Value

A [`CGPoint`](../structs.md) in unit coordinates: `(0, 0)` is the layer's top-left corner and `(1, 1)` is the bottom-right corner, regardless of the layer's actual size.

- Readable and writable.
- Defaults to `(0.5, 1)`. Together, the default start and end points run top to bottom.
- Its meaning differs by [`type`](type.md); see [Unit coordinates](../ca-gradient-layer.md#unit-coordinates).
- When writing, you can give a `CGPoint` or `{ x, y }`.

### Invalid values

**`TypeError`**

The value isn't an object, or a field is missing or isn't a finite number.

## Examples

```js
const gradient = new CAGradientLayer();
gradient.endPoint = new CGPoint(1, 0.5);   // midpoint of the right edge
console.log(gradient.endPoint.x, gradient.endPoint.y);
```

**Result**: the console prints the point's two coordinates.

## Corresponding iOS API

`CAGradientLayer.endPoint`.

## See also

- [Unit coordinates](../ca-gradient-layer.md#unit-coordinates)
