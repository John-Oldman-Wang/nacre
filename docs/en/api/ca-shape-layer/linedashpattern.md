---
type: reference
native: CAShapeLayer.lineDashPattern
---

# `CAShapeLayer`: `lineDashPattern` property

The **`lineDashPattern`** property describes how dashes are drawn: alternating lengths to draw and to leave blank, repeating from the start after the end of the array.

## Value

An array of numbers, in [pt](../units.md); or `null`.

- Readable and writable.
- Defaults to `null`, a solid line. Setting it back to `null` restores a solid line.

### Invalid values

**`TypeError`**

An item cannot be converted to a finite number: `lineDashPattern[0] must be a finite number, got …`.

## Examples

```js
const shape = new CAShapeLayer();
shape.path = UIBezierPath.bezierPathWithRect(new CGRect(20, 20, 260, 120));
shape.fillColor = null;
shape.strokeColor = 'systemGray';
shape.lineDashPattern = [6, 3];
```

**Effect**: a gray dashed frame. Each dash is 6 pt long with 3 pt gaps. **Not verified in the simulator.**

## Corresponding iOS API

`CAShapeLayer.lineDashPattern`. `@[@4, @2]` is written `[4, 2]`.

## See also

- [`lineDashPhase`](linedashphase.md)
