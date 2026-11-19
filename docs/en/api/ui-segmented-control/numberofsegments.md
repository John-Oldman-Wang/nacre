---
type: reference
native: UISegmentedControl.numberOfSegments
---

# `UISegmentedControl`: `numberOfSegments` property

The **`numberOfSegments`** property is the number of segments in the segmented control.

## Value

A number: a count.

- Read-only. Assigning to it throws `TypeError`.
- Its initial value is the number of items given to the constructor, or 0 if none were given.
- It changes immediately when segments are inserted or removed; even when animated, you do not need to wait for the animation to finish.
- Changes to it do not fire events. Only your own code changes the number of segments.

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week']);
seg.insertSegmentWithTitle('Month', { atIndex: 2, animated: true });
console.log(seg.numberOfSegments);
```

**Result**: logs `3`.

## Corresponding iOS API

`UISegmentedControl.numberOfSegments`.

## See also

- [`insertSegmentWithTitle()`](insertsegmentwithtitle.md), [`removeSegmentAtIndex()`](removesegmentatindex.md)
