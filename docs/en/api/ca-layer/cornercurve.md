---
type: reference
native: CALayer.cornerCurve
---

# `CALayer`: `cornerCurve` property

The **`cornerCurve`** property is the curve of the rounded corners.

## Value

A string:

| Value | Effect |
| --- | --- |
| `'circular'` | Each corner is a circular arc; the curvature changes abruptly where it meets the straight edge |
| `'continuous'` | The curvature changes gradually from the straight edge, for a smoother transition. iOS app icons use this kind of corner |

- Readable and writable.
- Defaults to `'continuous'` (measured).
- How the two values look different is **not verified in the simulator**.

### Invalid values

Writing any other value doesn't throw: the property keeps its previous value, and the console prints a warning:

```
[Nacre] cornerCurve has no value "squircle"; expected one of: circular / continuous, ignored
```

## Examples

```js
const layer = new CALayer();
console.log(layer.cornerCurve);
layer.cornerCurve = 'circular';
```

**Result**: The console prints `continuous`, and afterward the corners become circular arcs.

## Corresponding iOS API

`CALayer.cornerCurve`. `kCACornerCurveContinuous` is written `'continuous'`. Apple's header says the default is `kCACornerCurveCircular`; measured, it is `continuous`.

## See also

- [`cornerRadius`](cornerradius.md)
