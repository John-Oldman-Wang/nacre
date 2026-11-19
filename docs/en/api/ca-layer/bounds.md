---
type: reference
native: CALayer.bounds
---

# `CALayer`: `bounds` property

The **`bounds`** property is the layer's own coordinate system: its size, and the coordinates of its top-left corner in its own coordinate system.

## Value

A [`CGRect`](../structs.md), in [pt](../units.md).

- Readable and writable.
- Defaults to `(0, 0, 0, 0)`.
- `width` and `height` match [`frame`](frame.md). `x` and `y` default to 0.
- Sublayer coordinates and coordinates in a shape layer's path are calculated in this coordinate system.
- When writing, you can give a `CGRect` or `{ x, y, width, height }`.

### Invalid values

**`TypeError`**

The value isn't an object, or is missing fields, or a field isn't a finite number.

## Examples

```js
const layer = new CALayer();
layer.frame = new CGRect(10, 20, 100, 50);
console.log(layer.bounds.x, layer.bounds.width);
```

**Result**: The console prints `0 100`.

## Corresponding iOS API

`CALayer.bounds`.

## See also

- [`frame`](frame.md)
