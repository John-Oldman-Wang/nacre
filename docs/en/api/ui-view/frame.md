---
type: reference
native: UIView.frame
---

# `UIView`: `frame` property

The **`frame`** property is the view's position and size in the superview's coordinate system.

## Value

A [`CGRect`](../cg-rect.md), in [pt](../units.md). The origin is at the superview's top-left corner; `x` increases to the right and `y` increases downward.

- Readable and writable.
- The default is `(0, 0, 0, 0)`.
- On write you can pass a `CGRect` or a plain object with all four fields (`x`, `y`, `width`, `height`) present.
- The fields of the struct that reads back are read-only, and each read returns a new object. See [Structs](../structs.md). Writing `view.frame.x = 10` throws `TypeError: x is read-only: structs are values, assign a whole new one instead`; to change it, assign a whole new one.
- `frame`, [`bounds`](bounds.md), and [`center`](center.md) are the same data: write one, and the other two read back changed accordingly.
- When [`transform`](transform.md) isn't the identity matrix, it reads back as the bounding rectangle of the transformed shape, no longer the view's original rectangle. In that case don't read or write `frame`; use `bounds` and `center` instead.
- For a view positioned by constraints ([`translatesAutoresizingMaskIntoConstraints`](translatesautoresizingmaskintoconstraints.md) is `false`), you can read it but shouldn't write it: writing doesn't throw, but on the next layout pass the system overwrites it with the result of the constraints. **"The written `frame` gets overwritten" is not verified in the simulator.** To read the result right after activating constraints, call [`layoutIfNeeded()`](layoutifneeded.md) first.
- No change notification.

### Invalid values

- Not an object: throws `TypeError: frame needs an object with all of: x, y, width, height`.
- A field is missing or doesn't convert to a finite number: throws `TypeError: frame is missing …, or it is not a finite number`, with the missing field name in the middle.
- On error the property keeps its previous value. Field values are converted with `Number()`, so `'10'` works.

## Examples

```js
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);

const f = card.frame;
card.frame = new CGRect(f.x, f.y + 100, f.width, f.height);

card.frame = { x: 60, y: 270, width: 160, height: 80 };
console.log(String(card.frame));
```

**Effect**

- The second assignment moves the view down 100 pt without changing its size.
- The third assignment moves the view to `(60, 270)`, 160 pt wide and 80 pt tall. The console prints `CGRect(60, 270, 160, 80)`.

## Corresponding iOS API

`UIView.frame`. `CGRectMake(40, 120, 200, 120)` is written as `new CGRect(40, 120, 200, 120)`. `[[UIView alloc] initWithFrame:rect]` is written as `new UIView()` followed by assigning `frame`.

## See also

- [`bounds`](bounds.md), [`center`](center.md)
- [`frame`, `bounds`, and `center`](../ui-view.md#frame-bounds-and-center)
- [Two ways to position views](../ui-view.md#two-ways-to-position-views)
- [`CGRect`](../cg-rect.md)
