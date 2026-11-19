---
type: reference
native: CALayer.superlayer
---

# `CALayer`: `superlayer` property

The **`superlayer`** property is the layer's superlayer.

## Value

A `CALayer`, or `null`.

- Read-only; assigning to it throws `TypeError`.
- `null` when there is no superlayer.
- Changed by [`addSublayer()`](addsublayer.md), [`insertSublayer()`](insertsublayer.md), and [`removeFromSuperlayer()`](removefromsuperlayer.md).

## Examples

```js
const parent = new CALayer();
const child = new CALayer();
parent.addSublayer(child);
console.log(child.superlayer === parent);
child.removeFromSuperlayer();
console.log(child.superlayer);
```

**Result**: It prints `true`, then `null`.

## Corresponding iOS API

`CALayer.superlayer`.

## See also

- [`sublayers`](sublayers.md)
