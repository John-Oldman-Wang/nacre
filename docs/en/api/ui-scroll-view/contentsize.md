---
type: reference
native: UIScrollView.contentSize
---

# `UIScrollView`: `contentSize` property

The **`contentSize`** property is the size of the content area. A direction can scroll only if this is larger than the visible area in that direction.

## Value

A [`CGSize`](../structs.md), in [pt](../units.md).

- Readable and writable.
- Defaults to `(0, 0)`.
- When the content is aligned with [`contentLayoutGuide`](contentlayoutguide.md) using constraints, the system computes it; do not write it. It is computed only after the system completes layout: after activating the constraints, call `layoutIfNeeded()` on the view controller's root view first, then read it.
- When subviews are positioned with `frame`, use it to tell the scroll view how large the content is. Write it again when the content changes; it does not update itself.
- No change notification; iOS does not provide one.
- Measured: with content of 12 rows, each 36 pt tall with 6 pt spacing, aligned to `contentLayoutGuide` with constraints, `contentSize.height` reads 498 pt (12 × 36 + 11 × 6), and `contentSize.width` equals the scroll view's width.
- Each read returns a new object with read-only fields. To change it, assign a whole new value; see [Structs](../structs.md).

### Invalid values

- Not an object: `TypeError: contentSize needs an object with all of: width, height`
- A missing field, or a field that is not a finite number: `TypeError: contentSize is missing height, or it is not a finite number`

After throwing, the property keeps its previous value.

## Examples

```js
const scroller = new UIScrollView();
scroller.frame = new CGRect(0, 0, 400, 800);
scroller.contentSize = new CGSize(400, 3000);
```

**Effect**: a 400 × 800 pt scrolling area that can scroll down 2200 pt (3000 minus 800). **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.contentSize`.

## See also

- [Content area size](../ui-scroll-view.md#content-area-size)
- [`contentLayoutGuide`](contentlayoutguide.md)
