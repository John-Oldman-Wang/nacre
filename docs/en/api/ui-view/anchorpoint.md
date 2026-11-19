---
type: reference
native: UIView.anchorPoint
---

# `UIView`: `anchorPoint` property

The **`anchorPoint`** property is the point the view is transformed (rotated, scaled) around, expressed as a ratio of the view's own size.

## Value

A [`CGPoint`](../cg-point.md) whose two fields are both ratios: `(0, 0)` is the top-left corner, `(1, 1)` is the bottom-right corner, and `(0.5, 0.5)` is the center.

- Readable and writable.
- The default is **not verified in the simulator**; according to Apple's documentation it is `(0.5, 0.5)`, so [`transform`](transform.md) uses the center as its origin by default.
- On write you can pass a `CGPoint` or `{ x, y }`. The fields of the struct that reads back are read-only, and each read returns a new object. See [Structs](../structs.md).
- The type it reads back as, and that writing back the original value reads back unchanged, are checked in the acceptance tests. How the view's position changes after changing it is **not verified in the simulator**.

### Invalid values

- Not an object: throws `TypeError: anchorPoint needs an object with all of: x, y`.
- A field is missing or doesn't convert to a finite number: throws `TypeError: anchorPoint is missing …, or it is not a finite number`, with the missing field name in the middle.
- On error the property keeps its previous value. Field values are converted with `Number()`, so `'10'` works.

## Examples

```js
const hand = new UIView();
hand.anchorPoint = new CGPoint(0.5, 1);
hand.transform = CGAffineTransform.rotation(Math.PI / 4);
```

**Effect**: `hand` rotates 45° around the midpoint of its bottom edge. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.anchorPoint`.

## See also

- [`transform`](transform.md)
- [`CALayer`](../ca-layer.md): the layer's `anchorPoint`
