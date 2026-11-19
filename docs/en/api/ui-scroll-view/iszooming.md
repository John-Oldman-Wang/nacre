---
type: reference
native: UIScrollView.zooming
---

# `UIScrollView`: `isZooming` property

The **`isZooming`** property indicates whether the user is zooming with two fingers.

## Value

A boolean.

- Read-only. Assigning to it throws `TypeError`.
- `false` for a new scroll view (verified by testing).
- This property was added from the iOS headers. The acceptance tests verify that it can be read and has the right type; its effect is **not verified in the simulator**, and the usage follows Apple's documentation.
- No change event.

## Examples

```js
const scroller = new UIScrollView();
console.log(scroller.isZooming);
```

**Result**: logs `false`.

## Corresponding iOS API

`UIScrollView.zooming` (the getter is `isZooming`).

## See also

- [`zoomScale`](zoomscale.md)
