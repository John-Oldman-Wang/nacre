---
type: reference
native: CAShapeLayer.fillRule
---

# `CAShapeLayer`: `fillRule` property

The **`fillRule`** property determines which areas count as inside, and are filled, when the path intersects itself or forms nested loops.

## Value

A string. Both rules cast a ray outward from a point and look at how it crosses the path:

| Value | Effect |
| --- | --- |
| `'nonZero'` | A crossing where the path goes left to right counts +1, right to left counts −1. Points whose total is not 0 are inside. With two nested circles drawn in the same direction, the inner circle is filled too |
| `'evenOdd'` | Only the number of crossings counts. Points with an odd count are inside. With two nested circles, the inner circle is empty, giving a ring |

- Readable and writable.
- Defaults to `'nonZero'`.
- The difference in what the two values draw is **not verified in the simulator**.

### Invalid values

Writing a value not in the table does not throw: the property keeps its previous value, and the console logs a warning:

```
[Nacre] fillRule has no value "oddEven"; expected one of: nonZero / evenOdd, ignored
```

## Examples

```js
const ring = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 100, 100));
ring.appendPath(UIBezierPath.bezierPathWithOvalInRect(new CGRect(25, 25, 50, 50)));
const shape = new CAShapeLayer();
shape.path = ring;
shape.fillRule = 'evenOdd';
```

**Effect**: a ring: the outer circle is filled and the inner circle is empty. **Not verified in the simulator.**

## Corresponding iOS API

`CAShapeLayer.fillRule`. `kCAFillRuleEvenOdd` is written `'evenOdd'`.

## See also

- [`fillColor`](fillcolor.md)
- [`UIBezierPath.usesEvenOddFillRule`](../ui-bezier-path/usesevenoddfillrule.md)
