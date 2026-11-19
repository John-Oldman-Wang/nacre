---
type: reference
native: CAShapeLayer.lineCap
---

# `CAShapeLayer`: `lineCap` property

The **`lineCap`** property is the shape of the ends of a line.

## Value

A string:

| Value | Effect |
| --- | --- |
| `'butt'` | The line is cut off flat at the path's end points |
| `'round'` | A semicircle is added beyond each end point; the line extends half a line width past the path |
| `'square'` | Half a square is added beyond each end point; the line extends half a line width past the path |

- Readable and writable.
- Defaults to `'butt'`.
- How it looks when drawn is **not verified in the simulator**.

### Invalid values

Writing a value not in the table does not throw: the property keeps its previous value, and the console logs a warning:

```
[Nacre] lineCap has no value "flat"; expected one of: butt / round / square, ignored
```

## Examples

```js
const shape = new CAShapeLayer();
shape.lineWidth = 8;
shape.lineCap = 'round';
```

**Effect**: both ends of the line are rounded. **Not verified in the simulator.**

## Corresponding iOS API

`CAShapeLayer.lineCap`. `kCALineCapRound` is written `'round'`.

## See also

- [`lineJoin`](linejoin.md)
