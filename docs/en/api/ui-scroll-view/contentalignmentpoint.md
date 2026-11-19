---
type: reference
native: UIScrollView.contentAlignmentPoint
---

# `UIScrollView`: `contentAlignmentPoint` property

The **`contentAlignmentPoint`** property determines how content smaller than the visible area is placed within the visible area.

## Value

A [`CGPoint`](../structs.md) whose `x` and `y` are fractions from 0 to 1: `(0, 0)` is the top-left corner and `(0.5, 0.5)` is the center. Per Apple's documentation; **not verified in the simulator**.

- Readable and writable. You can write a plain object `{ x, y }`.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after writing back the original value; its effect is **not verified in the simulator**, and the usage follows Apple's documentation.
- Each read returns a new object with read-only fields. To change it, assign a whole new value; see [Structs](../structs.md).
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.contentAlignmentPoint = new CGPoint(0.5, 0.5);
```

**Effect**: when the content is smaller than the visible area, it is placed in the center of the visible area. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.contentAlignmentPoint` (iOS 17.4 and later).

## See also

- [`contentSize`](contentsize.md)
