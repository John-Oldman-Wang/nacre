---
type: reference
native: "-[UIScrollView zoomToRect:animated:]"
---

# `UIScrollView`: `zoomToRect()` method

The **`zoomToRect()`** method zooms so that the given rectangle fills the visible area.

## Syntax

```
zoomToRect(rect)
zoomToRect(rect, { animated })
```

### Parameters

**`rect`**

The rectangle to fill the visible area, a [`CGRect`](../structs.md) or a plain object `{ x, y, width, height }`, in [pt](../units.md), in the coordinate system of the subview being zoomed.

**`options.animated`**

A boolean. Optional.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`rect` is not a rectangle (verified by testing).

## Description

This method was added from the iOS headers. It has been called in the simulator: passing something that is not a rectangle throws `TypeError`. The zoom effect is **not verified in the simulator**.

## Examples

```js
const scroller = new UIScrollView();
scroller.maximumZoomScale = 4;
scroller.zoomToRect(new CGRect(0, 0, 100, 100), { animated: true });
```

**Effect**: zooms in until the 100 × 100 pt area at the top-left corner fills the visible area. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIScrollView zoomToRect:animated:]`.

## See also

- [`setZoomScale()`](setzoomscale.md)
