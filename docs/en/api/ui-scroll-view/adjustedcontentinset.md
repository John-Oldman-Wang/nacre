---
type: reference
native: UIScrollView.adjustedContentInset
---

# `UIScrollView`: `adjustedContentInset` property

The **`adjustedContentInset`** property is the space actually in effect: [`contentInset`](contentinset.md) plus what the system adds automatically for the safe area.

## Value

A [`UIEdgeInsets`](../structs.md), in [pt](../units.md).

- Read-only. Assigning to it throws `TypeError`.
- Determined by the system. Whether the system adds space is determined by [`contentInsetAdjustmentBehavior`](contentinsetadjustmentbehavior.md).
- When the scroll view is entirely within the safe area, the system adds no space, and `adjustedContentInset.top` equals `contentInset.top` (asserted in the acceptance tests).
- Space above and below when filling the screen is **not verified in the simulator**.
- [`adjustedcontentinsetchange`](adjustedcontentinsetchange-event.md) fires when it changes.
- Each read returns a new object with read-only fields. To change it, assign a whole new value; see [Structs](../structs.md).

## Examples

```js
const scroller = new UIScrollView();
const top = -scroller.adjustedContentInset.top;
scroller.setContentOffset(new CGPoint(0, top), { animated: true });
```

**Effect**: scrolls smoothly back to the very top. The top position is not necessarily `0`, so `adjustedContentInset.top` is subtracted. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.adjustedContentInset`.

## See also

- [Safe area](../ui-scroll-view.md#safe-area)
