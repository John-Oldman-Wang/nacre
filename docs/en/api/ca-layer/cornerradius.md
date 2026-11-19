---
type: reference
native: CALayer.cornerRadius
---

# `CALayer`: `cornerRadius` property

The **`cornerRadius`** property is the corner radius.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- Defaults to `0`: square corners.
- Rounded corners apply only to the layer's own background color and border. Subviews and sublayers keep square corners and draw outside the rounded corners; to clip them, set `masksToBounds` (on a view, `clipsToBounds`) to `true`.
- Which corners are rounded is decided by [`maskedCorners`](maskedcorners.md); the curve is decided by [`cornerCurve`](cornercurve.md).

### Invalid values

The written value is converted to a number with `Number()`. Values that don't convert to a finite number throw `TypeError`.

## Examples

```js
const card = new UIView();
card.layer.cornerRadius = 16;
console.log(card.layer.cornerRadius);
```

**Effect**: The four corners of the card's background and border become rounded with a 16 pt radius. The console prints `16`.

## Corresponding iOS API

`CALayer.cornerRadius`.

## See also

- [`maskedCorners`](maskedcorners.md), [`cornerCurve`](cornercurve.md)
