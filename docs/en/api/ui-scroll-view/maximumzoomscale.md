---
type: reference
native: UIScrollView.maximumZoomScale
---

# `UIScrollView`: `maximumZoomScale` property

The **`maximumZoomScale`** property is the maximum scale it may be zoomed in to.

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
scroller.maximumZoomScale = 4;
console.log(scroller.maximumZoomScale);
```

**Result**: logs `4`.

## Corresponding iOS API

`UIScrollView.maximumZoomScale`.

## See also

- [`setZoomScale()`](setzoomscale.md)
- [`zoomToRect()`](zoomtorect.md)
