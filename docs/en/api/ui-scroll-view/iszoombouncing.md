---
type: reference
native: UIScrollView.zoomBouncing
---

# `UIScrollView`: `isZoomBouncing` property

The **`isZoomBouncing`** property indicates whether zooming is springing back to the minimum or maximum scale.

## Value

A boolean.

- Read-only. Assigning to it throws `TypeError`.
- `false` for a new scroll view.
- This property was added from the iOS headers. The acceptance tests verify that it can be read and has the right type; its effect is **not verified in the simulator**, and the usage follows Apple's documentation.
- No change event.

## Examples

```js
const scroller = new UIScrollView();
console.log(scroller.isZoomBouncing);
```

**Result**: logs `false`.

## Corresponding iOS API

`UIScrollView.zoomBouncing` (the getter is `isZoomBouncing`).

## See also

- [`zoomScale`](zoomscale.md)
