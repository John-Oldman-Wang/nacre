---
type: reference
native: UIScrollView.minimumZoomScale
---

# `UIScrollView`: `minimumZoomScale` property

The **`minimumZoomScale`** property is the minimum scale it may be zoomed out to.

## Value

A number; a ratio with no unit.

- Readable and writable.
- Defaults to `1` (verified by testing). When both minimum and maximum are `1`, it cannot zoom.
- What is written reads back (verified by testing).
- Two-finger pinch zooming does not work yet: the system needs to ask on the spot "which subview is being zoomed", and that question is not wired up yet.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.minimumZoomScale = 0.5;
console.log(scroller.minimumZoomScale);
```

**Result**: logs `0.5`.

## Corresponding iOS API

`UIScrollView.minimumZoomScale`.

## See also

- [`setZoomScale()`](setzoomscale.md)
- [`zoomToRect()`](zoomtorect.md)
