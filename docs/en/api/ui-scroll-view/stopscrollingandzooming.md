---
type: reference
native: "-[UIScrollView stopScrollingAndZooming]"
---

# `UIScrollView`: `stopScrollingAndZooming()` method

The **`stopScrollingAndZooming()`** method immediately stops any scrolling and zooming in progress.

## Syntax

```
stopScrollingAndZooming()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

This method was added from the iOS headers. **It has not been called in the simulator**; the usage follows Apple's documentation.

## Examples

```js
const scroller = new UIScrollView();
scroller.addEventListener('dragend', () => scroller.stopScrollingAndZooming());
```

**Effect**: after release, the content stops immediately with no momentum scrolling. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIScrollView stopScrollingAndZooming]` (iOS 17.4 and later).

## See also

- [`isDecelerating`](isdecelerating.md)
