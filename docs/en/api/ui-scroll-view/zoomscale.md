---
type: reference
native: UIScrollView.zoomScale
---

# `UIScrollView`: `zoomScale` property

The **`zoomScale`** property is the current zoom scale. `1` is the original size; `2` is twice as large.

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
scroller.maximumZoomScale = 4;
console.log(scroller.zoomScale);
```

**Result**: logs `1`.

## Corresponding iOS API

`UIScrollView.zoomScale`.

## See also

- [`setZoomScale()`](setzoomscale.md)
- [`zoomToRect()`](zoomtorect.md)
