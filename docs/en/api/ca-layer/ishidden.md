---
type: reference
native: CALayer.hidden
---

# `CALayer`: `isHidden` property

The **`isHidden`** property determines whether the layer is hidden.

## Value

A boolean.

- Readable and writable.
- Defaults to `false`.
- `true`: neither the layer nor its sublayers are displayed.
- `false`: displayed.
- For a view's own layer, use `view.isHidden`.

## Examples

```js
const layer = new CALayer();
layer.isHidden = true;
console.log(layer.isHidden);
```

**Result**: The console prints `true`.

## Corresponding iOS API

`CALayer.hidden` (the getter is `isHidden`).

## See also

- [`opacity`](opacity.md)
