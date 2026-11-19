---
type: reference
native: CALayer.borderColor
---

# `CALayer`: `borderColor` property

The **`borderColor`** property is the color of the border.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- Defaults to `'#000000'`, opaque black.
- Accepts a [color string](../ui-color.md) or a `UIColor` object when written.
- When you write a color that changes with light and dark mode (such as `'label'` or `'light-dark(…)'`), it is resolved on the spot into a fixed color using the mode of the view the layer belongs to at that moment, and doesn't change when the mode switches later; see [Colors on layers](../ca-layer.md#colors-on-layers).
- It reads back as a string for the same color; case and notation aren't guaranteed to match what was written. A mode-dependent color reads back as the resolved `'#rrggbb'`.
- What you read is a newly created string; to follow light and dark mode, write it again in `traitchange`; see the guide [Drawing rounded corners, shadows, gradients, and shapes with layers](../../guides/layers.md#updating-layer-colors-after-switching-light-and-dark-mode).

### Invalid values

Writing an invalid color doesn't throw. The console prints a warning, and the property keeps its previous value:

```
[Nacre] borderColor: "sytemBlue" is not a valid color, ignored; expected a color name, one of: …
```

## Examples

```js
const view = new UIView();
view.overrideUserInterfaceStyle = 'dark';
view.layer.borderWidth = 1;
view.layer.borderColor = 'label';
console.log(view.layer.borderColor);
```

**Result**: When the view is locked to dark mode and dark mode has already taken effect, it prints `#ffffff` (verified in the acceptance tests). If dark mode hasn't taken effect yet at the time of writing, you read the light-mode value; see [`UITraitCollection`](../ui-trait-collection.md#forcing-doesnt-take-effect-immediately).

## Corresponding iOS API

`CALayer.borderColor`. In ObjC you write `UIColor.systemBlueColor.CGColor`; here you write `'systemBlue'`.

## See also

- [`borderWidth`](borderwidth.md)
- [Colors on layers](../ca-layer.md#colors-on-layers)
