---
type: reference
native: UIBezierPath.usesEvenOddFillRule
---

# `UIBezierPath`: `usesEvenOddFillRule` property

The **`usesEvenOddFillRule`** property decides which rule [`containsPoint()`](containspoint.md) uses to test whether a point is inside the shape.

## Value

A boolean.

- Readable and writable.
- The default is `false`.
- `false`: uses the nonzero rule. `true`: uses the even-odd rule. For what the two rules mean, see `fillRule` on [`CAShapeLayer`](../ca-layer.md#cashapelayer).
- Written values are converted with `Boolean(v)`, so `'false'` gives `true`.
- Its effect on the result of `containsPoint()` is **not verified in the simulator**.

> **Note:** This property doesn't affect how a shape layer fills. The layer only looks at its own `fillRule`.

## Examples

```js
const path = new UIBezierPath();
path.usesEvenOddFillRule = true;
console.log(path.usesEvenOddFillRule);
```

**Result**: The console prints `true`.

## Corresponding iOS API

`UIBezierPath.usesEvenOddFillRule`.

## See also

- [`containsPoint()`](containspoint.md)
