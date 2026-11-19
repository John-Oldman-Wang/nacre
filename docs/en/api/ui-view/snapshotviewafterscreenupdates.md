---
type: reference
native: "-[UIView snapshotViewAfterScreenUpdates:]"
---

# `UIView`: `snapshotViewAfterScreenUpdates()` method

The **`snapshotViewAfterScreenUpdates()`** method takes a snapshot of how the view looks right now and returns a new view that displays it. It is commonly used for transition animations: the snapshot is shown during the animation while the original view is hidden or moved away.

## Syntax

```
snapshotViewAfterScreenUpdates(afterUpdates)
```

### Parameters

**`afterUpdates`**

A boolean. `true`: wait until recent changes are drawn on screen, then take the snapshot. `false`: take it as the screen looks now.

### Return value

A new `UIView`, or `null` if the snapshot can't be taken. The snapshot view hasn't been added to the view hierarchy.

### Exceptions

None.

## Description

This method was added later and hasn't been called in the simulator. Its effect is **not verified in the simulator**.

## Examples

```js
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);

const copy = card.snapshotViewAfterScreenUpdates(false);
if (copy) {
  copy.frame = card.frame;
}
```

**Effect**: `copy` is a view that looks the same as `card`, visible once added to the view hierarchy. Whether a view that isn't on screen can be captured with content is **not verified in the simulator**.

## Corresponding iOS API

`-[UIView snapshotViewAfterScreenUpdates:]`.

## See also

- [`resizableSnapshotViewFromRect()`](resizablesnapshotviewfromrect.md)
