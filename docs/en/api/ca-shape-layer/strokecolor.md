---
type: reference
native: CAShapeLayer.strokeColor
---

# `CAShapeLayer`: `strokeColor` property

The **`strokeColor`** property is the color of the line.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- **Defaults to `null`, no stroke.** Setting only `lineWidth` without a color shows no line.
- When writing, accepts [color strings](../ui-color.md) as well as `UIColor` objects.
- A color that varies with light and dark mode is resolved to a fixed color when written and does not change when the mode switches later; see [Colors on layers](../ca-layer.md#colors-on-layers).

### Invalid values

Writing an invalid color does not throw. The console logs a warning and the property keeps its previous value:

```
[Nacre] strokeColor: "#GGG" is not a valid color, ignored
```

## Examples

```js
const shape = new CAShapeLayer();
shape.path = UIBezierPath.bezierPathWithRect(new CGRect(20, 20, 260, 120));
shape.fillColor = null;
shape.strokeColor = 'systemBlue';
```

**Effect**: a rectangle with a blue outline 1 pt wide.

## Corresponding iOS API

`CAShapeLayer.strokeColor`.

## See also

- [`lineWidth`](linewidth.md)
- [`fillColor`](fillcolor.md)
