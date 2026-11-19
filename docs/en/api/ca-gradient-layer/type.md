---
type: reference
native: CAGradientLayer.type
---

# `CAGradientLayer`: `type` property

The **`type`** property is the shape of the gradient.

## Value

A string:

| Value | Effect |
| --- | --- |
| `'axial'` | Colors change along a straight line |
| `'radial'` | Colors change outward from the center of a circle |
| `'conic'` | Colors change in a full turn around the center |

- Readable and writable.
- Defaults to `'axial'`.
- For what `startPoint` and `endPoint` mean with each value, see [Unit coordinates](../ca-gradient-layer.md#unit-coordinates).
- How `'radial'` and `'conic'` look when drawn is **not verified in the simulator**.

### Invalid values

Writing a value not in the table doesn't throw: the property keeps its previous value, and the console prints a warning:

```
[Nacre] type has no value "linear"; expected one of: axial / radial / conic, ignored
```

## Examples

```js
const gradient = new CAGradientLayer();
gradient.type = 'radial';
gradient.startPoint = new CGPoint(0.5, 0.5);
gradient.endPoint = new CGPoint(1, 1);
console.log(gradient.type);
```

**Result**: the console prints `radial`. The colors change outward from the center of the layer; **not verified in the simulator**.

## Corresponding iOS API

`CAGradientLayer.type`. `kCAGradientLayerRadial` is written as `'radial'`, and likewise for the rest.

## See also

- [`startPoint`](startpoint.md), [`endPoint`](endpoint.md)
