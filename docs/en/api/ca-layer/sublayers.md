---
type: reference
native: CALayer.sublayers
---

# `CALayer`: `sublayers` property

The **`sublayers`** property is the layer's sublayers; later ones are drawn on top.

## Value

An array of `CALayer`.

- Read-only; assigning to it throws `TypeError`. Use [`insertSublayer()`](insertsublayer.md) to change the order.
- An empty array when there are no sublayers.
- Layers in it read back as their actual class: a gradient layer reads as `CAGradientLayer`, a shape layer as `CAShapeLayer`.
- A view's layer's `sublayers` contains, besides the layers your code added, the layer of each subview. **This is not verified in the simulator.**

## Examples

```js
const host = new CALayer();
host.addSublayer(new CAGradientLayer());
host.addSublayer(new CAShapeLayer());
console.log(host.sublayers.length, host.sublayers[0] instanceof CAGradientLayer);
```

**Result**: The console prints `2 true`.

## Corresponding iOS API

`CALayer.sublayers`. Natively it is `nil` when there are no sublayers; here it is an empty array.

## See also

- [`superlayer`](superlayer.md)
- [`addSublayer()`](addsublayer.md)
