---
type: reference
native: CALayer.masksToBounds
---

# `CALayer`: `masksToBounds` property

The **`masksToBounds`** property determines whether the parts of sublayers outside this layer's bounds are clipped.

## Value

A boolean.

- Readable and writable.
- Defaults to `false`.
- `true`: the parts of sublayers outside this layer's bounds (including the rounded corners) aren't displayed. The shadow, drawn outside the bounds, is clipped too.
- `false`: displayed as usual.
- For a view's own layer, use `view.clipsToBounds`.

## Examples

```js
const layer = new CALayer();
layer.cornerRadius = 16;
layer.masksToBounds = true;
```

**Effect**: The parts of sublayers outside the rounded corners aren't displayed. **Not verified in the simulator.**

## Corresponding iOS API

`CALayer.masksToBounds`.

## See also

- [`cornerRadius`](cornerradius.md)
