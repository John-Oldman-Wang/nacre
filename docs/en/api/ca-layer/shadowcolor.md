---
type: reference
native: CALayer.shadowColor
---

# `CALayer`: `shadowColor` property

The **`shadowColor`** property is the color of the shadow.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- Defaults to opaque black.
- Setting only the color doesn't make the shadow visible: [`shadowOpacity`](shadowopacity.md) defaults to 0.
- Accepts a [color string](../ui-color.md) or a `UIColor` object when written.
- When you write a color that changes with light and dark mode (such as `'label'` or `'light-dark(…)'`), it is resolved on the spot into a fixed color using the mode of the view the layer belongs to at that moment, and doesn't change when the mode switches later; see [Colors on layers](../ca-layer.md#colors-on-layers).
- It reads back as a string for the same color; case and notation aren't guaranteed to match what was written. A mode-dependent color reads back as the resolved `'#rrggbb'`.

### Invalid values

Writing an invalid color doesn't throw. The console prints a warning, and the property keeps its previous value:

```
[Nacre] shadowColor: "sytemBlue" is not a valid color, ignored; expected a color name, one of: …
```

## Examples

```js
const card = new UIView();
card.backgroundColor = 'systemBackground';
card.layer.shadowColor = 'black';
card.layer.shadowOpacity = 0.25;
```

**Effect**: A black shadow appears around the card. **How the shadow looks is not verified in the simulator.**

## Corresponding iOS API

`CALayer.shadowColor`.

## See also

- [`shadowOpacity`](shadowopacity.md), [`shadowRadius`](shadowradius.md), [`shadowOffset`](shadowoffset.md)
