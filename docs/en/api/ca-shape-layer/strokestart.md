---
type: reference
native: CAShapeLayer.strokeStart
---

# `CAShapeLayer`: `strokeStart` property

The **`strokeStart`** property determines where along the path the stroke starts.

## Value

A number, a fraction from 0 to 1. 0 is the start of the path and 1 is the end.

- Readable and writable.
- Defaults to `0`.
- Together with [`strokeEnd`](strokeend.md), it draws only a section of the path.

### Invalid values

Written values are converted with `Number()`. Values that cannot be converted to a finite number throw `TypeError`.

## Examples

```js
const shape = new CAShapeLayer();
shape.path = UIBezierPath.bezierPathWithRect(new CGRect(20, 20, 260, 120));
shape.fillColor = null;
shape.strokeColor = 'systemBlue';
shape.strokeStart = 0.25;
```

**Effect**: the rectangle's outline starts a quarter of the way along the path; the first quarter is not drawn. **Not verified in the simulator.**

## Corresponding iOS API

`CAShapeLayer.strokeStart`.

## See also

- [`strokeEnd`](strokeend.md)
