---
type: reference
native: CALayer.opacity
---

# `CALayer`: `opacity` property

The **`opacity`** property is the layer's opacity, applied to the layer and all its sublayers.

## Value

A number, a ratio from 0 to 1. 0 is fully transparent; 1 is fully opaque.

- Readable and writable.
- Defaults to `1`.
- For a view's own layer, use `view.alpha`; see [View properties or layer properties](../ca-layer.md#view-properties-or-layer-properties).

### Invalid values

The written value is converted to a number with `Number()`. Values that don't convert to a finite number throw `TypeError`.

## Examples

```js
const layer = new CALayer();
layer.opacity = 0.5;
console.log(layer.opacity);
```

**Result**: The console prints `0.5`.

## Corresponding iOS API

`CALayer.opacity`.

## See also

- [`isHidden`](ishidden.md)
