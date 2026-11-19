---
type: reference
native: "-[UIScrollView setZoomScale:animated:]"
---

# `UIScrollView`: `setZoomScale()` method

The **`setZoomScale()`** method changes the zoom scale, optionally animated.

## Syntax

```
setZoomScale(scale)
setZoomScale(scale, { animated })
```

### Parameters

**`scale`**

The zoom scale, a number. According to Apple's documentation, values outside [`minimumZoomScale`](minimumzoomscale.md) to [`maximumZoomScale`](maximumzoomscale.md) are clamped to the range. **Not verified in the simulator.**

**`options.animated`**

A boolean. Optional (verified by testing: omitting it does not throw).

### Return value

None (`undefined`).

### Exceptions

None.

## Description

This method was added from the iOS headers. It has been called in the simulator: without `animated` it does not throw. The zoom effect is **not verified in the simulator**.

## Examples

```js
const scroller = new UIScrollView();
scroller.minimumZoomScale = 0.5;
scroller.maximumZoomScale = 4;
scroller.setZoomScale(2, { animated: true });
```

**Effect**: the content is enlarged to twice its size. According to Apple's documentation, the system asks on the spot which subview to zoom, and that question is not wired up yet, so no change may be visible on screen. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIScrollView setZoomScale:animated:]`.

## See also

- [`zoomScale`](zoomscale.md)
