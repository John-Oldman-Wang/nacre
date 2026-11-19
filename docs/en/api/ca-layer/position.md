---
type: reference
native: CALayer.position
---

# `CALayer`: `position` property

The **`position`** property is the coordinates of the layer's center in the superlayer's coordinate system.

## Value

A [`CGPoint`](../structs.md), in [pt](../units.md).

- Readable and writable.
- Defaults to `(0, 0)`.
- Changing `position` moves the layer without changing its size.
- Use it for movement animations: `frame` can't be animated; see [`CAAnimation`](../ca-animation.md).
- When writing, you can give a `CGPoint` or `{ x, y }`.

### Invalid values

**`TypeError`**

The value isn't an object, or is missing fields, or a field isn't a finite number.

## Examples

```js
const layer = new CALayer();
layer.frame = new CGRect(1, 2, 3, 4);
layer.position = new CGPoint(10, 10);
console.log(layer.frame.x);
```

**Result**: The console prints `8.5`. A layer 3 pt wide has its center moved to x = 10, so its top-left corner is at 10 − 1.5 = 8.5.

## Corresponding iOS API

`CALayer.position`. `anchorPoint`, which changes the center of rotation, isn't provided; the center point is fixed at the middle of the layer.

## See also

- [`frame`](frame.md)
