---
type: reference
native: CALayer.frame
---

# `CALayer`: `frame` property

The **`frame`** property is the layer's position and size in the superlayer's coordinate system.

## Value

A [`CGRect`](../structs.md), in [pt](../units.md). `x` and `y` are the coordinates of the layer's top-left corner; the y axis points down.

- Readable and writable.
- Defaults to `(0, 0, 0, 0)`. A layer created with `new` isn't visible until you set `frame`.
- When writing, you can give a `CGRect` or `{ x, y, width, height }`. The `CGRect` you read is read-only; to change it, assign a new value.
- Changing `frame` also changes the size of [`bounds`](bounds.md) and [`position`](position.md).
- A sublayer's `frame` doesn't follow the size of its superview; see [Sublayer sizes don't follow the view](../ca-layer.md#sublayer-sizes-dont-follow-the-view).
- For a view's own layer (`view.layer`), use `view.frame` or constraints rather than writing `layer.frame`: the next layout pass overwrites it with the result computed from constraints. **This is not verified in the simulator.**
- `frame` can't be animated; use `position` for movement animations.

### Invalid values

**`TypeError`**

The value isn't an object, or is missing fields, or a field isn't a finite number.

## Examples

```js
const layer = new CALayer();
layer.frame = new CGRect(1, 2, 3, 4);
console.log(String(layer.position));
```

**Result**: The console prints `CGPoint(2.5, 4)`: the center is at (2.5, 4).

## Corresponding iOS API

`CALayer.frame`. `CGRectMake(1, 2, 3, 4)` is written `new CGRect(1, 2, 3, 4)`.

## See also

- [Position: `frame`, `bounds`, `position`](../ca-layer.md#position-frame-bounds-position)
- [`bounds`](bounds.md), [`position`](position.md)
