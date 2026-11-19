---
type: reference
native: CAShapeLayer.lineJoin
---

# `CAShapeLayer`: `lineJoin` property

The **`lineJoin`** property is the shape of the corner where two line segments meet.

## Value

A string:

| Value | Effect |
| --- | --- |
| `'miter'` | The outer edges of the two segments are extended until they meet, forming a sharp corner |
| `'round'` | The corner is an arc |
| `'bevel'` | The tip of the corner is cut off flat |

- Readable and writable.
- Defaults to `'miter'`. When the sharp corner gets too long, it is drawn as `'bevel'` instead; the limit is set by [`miterLimit`](miterlimit.md).
- How it looks when drawn is **not verified in the simulator**.

### Invalid values

Writing a value not in the table does not throw: the property keeps its previous value, and the console logs a warning:

```
[Nacre] lineJoin has no value "sharp"; expected one of: miter / round / bevel, ignored
```

## Examples

```js
const shape = new CAShapeLayer();
shape.lineWidth = 8;
shape.lineJoin = 'round';
```

**Effect**: the polyline's corners are rounded. **Not verified in the simulator.**

## Corresponding iOS API

`CAShapeLayer.lineJoin`. `kCALineJoinBevel` is written `'bevel'`.

## See also

- [`miterLimit`](miterlimit.md)
- [`lineCap`](linecap.md)
