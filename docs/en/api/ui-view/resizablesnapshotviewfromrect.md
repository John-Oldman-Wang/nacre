---
type: reference
native: "-[UIView resizableSnapshotViewFromRect:afterScreenUpdates:withCapInsets:]"
---

# `UIView`: `resizableSnapshotViewFromRect()` method

The **`resizableSnapshotViewFromRect()`** method takes a snapshot of a rectangle within the view and returns a resizable snapshot view: when it stretches, the border given by `withCapInsets` stays fixed and only the middle stretches.

## Syntax

```
resizableSnapshotViewFromRect(rect, { afterScreenUpdates, withCapInsets })
```

### Parameters

**`rect`**

The rectangle to capture, a [`CGRect`](../cg-rect.md) or `{ x, y, width, height }`, in the view's own coordinate system, in [pt](../units.md).

**`options.afterScreenUpdates`**

A boolean. Required. Same meaning as in [`snapshotViewAfterScreenUpdates()`](snapshotviewafterscreenupdates.md).

**`options.withCapInsets`**

A [`UIEdgeInsets`](../ui-edge-insets.md) or a plain object with all four fields. Required. The widths around the edges that stay fixed when stretching, in pt.

### Return value

A new `UIView`, or `null` if the snapshot can't be taken.

### Exceptions

**`TypeError`**

- `afterScreenUpdates` is missing: `resizableSnapshotViewFromRect needs { afterScreenUpdates }`.
- `withCapInsets` is missing: `resizableSnapshotViewFromRect needs { withCapInsets }`.
- `rect` or `withCapInsets` isn't an object or is missing fields: same rules as for [structs](../structs.md#plain-objects-can-be-given-when-writing).

## Description

This method was added later and hasn't been called in the simulator. Its effect is **not verified in the simulator**.

## Examples

```js
const card = new UIView();
card.frame = new CGRect(0, 0, 200, 120);

const copy = card.resizableSnapshotViewFromRect(card.bounds, {
  afterScreenUpdates: false,
  withCapInsets: new UIEdgeInsets(12, 12, 12, 12),
});
```

**Effect**: When `copy` stretches, the 12 pt border around the edges stays fixed. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView resizableSnapshotViewFromRect:afterScreenUpdates:withCapInsets:]`. The last two parts become options keys.

## See also

- [`snapshotViewAfterScreenUpdates()`](snapshotviewafterscreenupdates.md)
