---
type: reference
native: CALayer.contentsScale
---

# `CALayer`: `contentsScale` property

The **`contentsScale`** property is how many pixels the layer's content uses per 1 pt.

## Value

A number, with no unit.

- Readable and writable.
- Defaults to `1`. On an iPhone screen, 1 pt is 2 or 3 pixels.
- A view's own layer also reads 1 in the `sceneconnect` callback, so you can't use it to find the screen's scale. Read the screen's scale from [`traitCollection.displayScale`](../ui-trait-collection/displayscale.md).
- Whether gradient and shape layers look blurry when it is 1 is **not verified in the simulator**.

### Invalid values

The written value is converted to a number with `Number()`. Values that don't convert to a finite number throw `TypeError`.

## Examples

```js
const view = new UIView();
const layer = new CAShapeLayer();
layer.contentsScale = view.traitCollection.displayScale;
console.log(layer.contentsScale);
```

**Result**: On a 3x iPhone it prints `3`.

## Corresponding iOS API

`CALayer.contentsScale`.

## See also

- [`contentsScale`: pixels per point](../ca-layer.md#contentsscale-pixels-per-point)
