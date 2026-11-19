---
type: reference
native: UIView.center
---

# `UIView`: `center` property

The **`center`** property is the position of the view's center point in the superview's coordinate system.

## Value

A [`CGPoint`](../cg-point.md), in [pt](../units.md).

- Readable and writable.
- The default is `(0, 0)`.
- Write it to move without resizing; you don't need to repeat the width and height.
- [`transform`](transform.md) doesn't change `center`. To move a view that has a transform, write `center`.
- A write takes effect only at the moment it runs. If the superview's size changes later, the view isn't re-centered automatically. To keep it centered at all times, use constraints aligned to [`centerXAnchor`](centerxanchor.md) and [`centerYAnchor`](centeryanchor.md).
- On write you can pass a `CGPoint` or `{ x, y }`. The fields of the struct that reads back are read-only, and each read returns a new object. See [Structs](../structs.md).
- No change notification.

### Invalid values

- Not an object: throws `TypeError: center needs an object with all of: x, y`.
- A field is missing or doesn't convert to a finite number: throws `TypeError: center is missing …, or it is not a finite number`, with the missing field name in the middle.
- On error the property keeps its previous value. Field values are converted with `Number()`, so `'10'` works.

## Examples

```js
const parent = new UIView();
parent.frame = new CGRect(0, 0, 390, 844);
const card = new UIView();
card.frame = new CGRect(0, 0, 200, 120);
parent.addSubview(card);

const size = parent.bounds;
card.center = new CGPoint(size.width / 2, size.height / 2);
console.log(String(card.frame));
```

**Result**: `card` moves to the exact center of `parent` without changing size. The console prints `CGRect(95, 362, 200, 120)`. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.center`. `CGPointMake(100, 100)` is written as `new CGPoint(100, 100)`.

## See also

- [`frame`](frame.md), [`bounds`](bounds.md)
- [Centering a view in its superview](../../guides/views.md#centering-a-view-in-its-superview)
