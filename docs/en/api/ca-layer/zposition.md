---
type: reference
native: CALayer.zPosition
---

# `CALayer`: `zPosition` property

The **`zPosition`** property determines the layer's stacking order among its sibling layers, without changing the order of `sublayers`.

## Value

A number, with no unit.

- Readable and writable.
- Defaults to `0`.
- Higher values are drawn on top; layers with equal values follow the order in `sublayers`.
- **How it looks on screen is not verified in the simulator.**

### Invalid values

The written value is converted to a number with `Number()`. Values that don't convert to a finite number throw `TypeError`.

## Examples

```js
const layer = new CALayer();
layer.zPosition = 10;
console.log(layer.zPosition);
```

**Result**: The console prints `10`.

## Corresponding iOS API

`CALayer.zPosition`.

## See also

- [`insertSublayer()`](insertsublayer.md): changes the order in the array
