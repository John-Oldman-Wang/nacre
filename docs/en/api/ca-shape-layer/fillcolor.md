---
type: reference
native: CAShapeLayer.fillColor
---

# `CAShapeLayer`: `fillColor` property

The **`fillColor`** property is the color used to fill the area enclosed by the path.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- **Defaults to `'#000000'`, opaque black.** When you want only lines, you must set it to `null`; otherwise the area enclosed by the path is filled black.
- `null` means no fill.
- Paths that are not closed are filled too: for filling, the start and end points are treated as connected.
- When writing, accepts [color strings](../ui-color.md) as well as `UIColor` objects.
- A color that varies with light and dark mode is resolved to a fixed color when written and does not change when the mode switches later; see [Colors on layers](../ca-layer.md#colors-on-layers).

### Invalid values

Writing an invalid color does not throw. The console logs a warning and the property keeps its previous value:

```
[Nacre] fillColor: "#GGG" is not a valid color, ignored
```

## Examples

```js
const shape = new CAShapeLayer();
shape.path = UIBezierPath.bezierPathWithRect(new CGRect(20, 20, 260, 120));
shape.fillColor = 'systemOrange';
```

**Effect**: a 260 × 120 pt rectangle filled orange.

## Corresponding iOS API

`CAShapeLayer.fillColor`. `UIColor.clearColor.CGColor` is written `null`.

## See also

- [`fillRule`](fillrule.md)
- [`strokeColor`](strokecolor.md)
