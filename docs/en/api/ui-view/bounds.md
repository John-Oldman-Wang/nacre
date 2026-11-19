---
type: reference
native: UIView.bounds
---

# `UIView`: `bounds` property

The **`bounds`** property is the view's rectangle in its own coordinate system.

## Value

A [`CGRect`](../cg-rect.md), in [pt](../units.md).

- Readable and writable.
- The default is `(0, 0, 0, 0)`.
- The top-left corner is usually `(0, 0)`, and the width and height match [`frame`](frame.md).
- To find out how large a view is, or to make a subview fill it, read its `bounds`: subview coordinates are relative to its top-left corner, and `bounds` is exactly the rectangle in that coordinate system. Reading the superview's `frame` brings in the superview's own position.
- [`transform`](transform.md) doesn't change `bounds`. To resize a view that has a transform, write `bounds`.
- On write you can pass a `CGRect` or a plain object with all fields present. The fields of the struct that reads back are read-only, and each read returns a new object. See [Structs](../structs.md).
- No change notification.

### Invalid values

- Not an object: throws `TypeError: bounds needs an object with all of: x, y, width, height`.
- A field is missing or doesn't convert to a finite number: throws `TypeError: bounds is missing …, or it is not a finite number`, with the missing field name in the middle.
- On error the property keeps its previous value. Field values are converted with `Number()`, so `'10'` works.

## Examples

```js
const box = new UIView();
box.frame = new CGRect(24, 304, 40, 40);
box.transform = CGAffineTransform.scale(1.2)
  .concat(CGAffineTransform.rotation(Math.PI / 6));

console.log(box.bounds.width);
console.log(box.frame.width);
```

**Result**: Prints `40`, then about `65.57`. The transform doesn't change `bounds`; `frame` reads back as the bounding rectangle after the transform.

## Corresponding iOS API

`UIView.bounds`.

## See also

- [`frame`](frame.md), [`center`](center.md)
- [`frame`, `bounds`, and `center`](../ui-view.md#frame-bounds-and-center)
