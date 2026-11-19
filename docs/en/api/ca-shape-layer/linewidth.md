---
type: reference
native: CAShapeLayer.lineWidth
---

# `CAShapeLayer`: `lineWidth` property

The **`lineWidth`** property is the line width.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- Defaults to `1`.
- The line is centered on the path, with half the line width on each side. A 3 pt line extends 1.5 pt on each side.

### Invalid values

Written values are converted with `Number()`. Values that cannot be converted to a finite number throw `TypeError`.

## Examples

```js
const shape = new CAShapeLayer();
shape.path = UIBezierPath.bezierPathWithRect(new CGRect(20, 20, 260, 120));
shape.fillColor = null;
shape.strokeColor = 'systemBlue';
shape.lineWidth = 3;
```

**Effect**: the rectangle's outline is 3 pt thick.

## Corresponding iOS API

`CAShapeLayer.lineWidth`.

## See also

- [`strokeColor`](strokecolor.md)
