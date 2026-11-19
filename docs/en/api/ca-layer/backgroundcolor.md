---
type: reference
native: CALayer.backgroundColor
---

# `CALayer`: `backgroundColor` property

The **`backgroundColor`** property is the layer's background color.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- Defaults to `null`: no background color.
- Accepts a [color string](../ui-color.md) or a `UIColor` object when written.
- When you write a color that changes with light and dark mode (such as `'label'` or `'light-dark(…)'`), it is resolved on the spot into a fixed color using the mode of the view the layer belongs to at that moment, and doesn't change when the mode switches later; see [Colors on layers](../ca-layer.md#colors-on-layers).
- It reads back as a string for the same color; case and notation aren't guaranteed to match what was written. A mode-dependent color reads back as the resolved `'#rrggbb'`.
- For a view's own layer, use `view.backgroundColor`: it keeps the mode-dependent color and follows automatically when the system switches modes.

### Invalid values

Writing an invalid color doesn't throw. The console prints a warning, and the property keeps its previous value:

```
[Nacre] backgroundColor: "sytemBlue" is not a valid color, ignored; expected a color name, one of: …
```

## Examples

```js
const layer = new CALayer();
layer.backgroundColor = '#FF2D55';
console.log(layer.backgroundColor);
```

**Result**: The console prints `#FF2D55`.

## Corresponding iOS API

`CALayer.backgroundColor`. In ObjC you write `color.CGColor`; here you write a color string.

## See also

- [Colors on layers](../ca-layer.md#colors-on-layers)
