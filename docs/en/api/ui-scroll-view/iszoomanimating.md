---
type: reference
native: UIScrollView.zoomAnimating
---

# `UIScrollView`: `isZoomAnimating` property

The **`isZoomAnimating`** property indicates whether a zoom animation is running.

## Value

A boolean.

- Read-only. Assigning to it throws `TypeError`.
- `false` for a new scroll view.
- This property was added from the iOS headers. The acceptance tests verify that it can be read and has the right type; its effect is **not verified in the simulator**, and the usage follows Apple's documentation.
- No change event.

## Examples

```js
const scroller = new UIScrollView();
console.log(scroller.isZoomAnimating);
```

**Result**: logs `false`.

## Corresponding iOS API

`UIScrollView.zoomAnimating` (the getter is `isZoomAnimating`).

## See also

- [`zoomScale`](zoomscale.md)
