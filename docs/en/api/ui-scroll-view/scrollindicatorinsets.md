---
type: reference
native: UIScrollView.scrollIndicatorInsets
---

# `UIScrollView`: `scrollIndicatorInsets` property

The **`scrollIndicatorInsets`** property is the distance of both indicators from the edges of the scroll view. Deprecated since iOS 13; use [`verticalScrollIndicatorInsets`](verticalscrollindicatorinsets.md) and [`horizontalScrollIndicatorInsets`](horizontalscrollindicatorinsets.md).

## Value

A [`UIEdgeInsets`](../structs.md), in [pt](../units.md).

- Readable and writable. You can write a plain object `{ top, left, bottom, right }`.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after writing back the original value; its effect is **not verified in the simulator**, and the usage follows Apple's documentation.
- Each read returns a new object with read-only fields. To change it, assign a whole new value; see [Structs](../structs.md).
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.verticalScrollIndicatorInsets = new UIEdgeInsets(0, 0, 80, 0);
```

**Effect**: new code uses the non-deprecated property: the vertical indicator stays out of the bottom 80 pt. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.scrollIndicatorInsets`, deprecated since iOS 13.

## See also

- [`verticalScrollIndicatorInsets`](verticalscrollindicatorinsets.md)
