---
type: reference
native: "-[UISegmentedControl removeSegmentAtIndex:animated:]"
---

# `UISegmentedControl`: `removeSegmentAtIndex()` method

The **`removeSegmentAtIndex()`** method removes the given segment.

## Syntax

```
removeSegmentAtIndex(index[, { animated }])
```

### Parameters

**`index`**

The index of the segment to remove, starting at 0. Fractions are truncated toward zero. Must be less than [`numberOfSegments`](numberofsegments.md).

**`options.animated`** <small>optional</small>

A boolean. `true`: animates the removal. When omitted, there is no animation.

### Return value

None (`undefined`).

The number of segments has already decreased by one when the method returns; even when animated, you do not need to wait for the animation to finish. The indexes of the following segments decrease by one, and [`selectedSegmentIndex`](selectedsegmentindex.md) changes with them, so it still points to the segment that was selected. If the removed segment is the selected one, `selectedSegmentIndex` becomes -1.

### Exceptions

**`TypeError`**

- The index is out of range or negative: `removeSegmentAtIndex: segment 5 is out of range; expected 0 to 4` (with 5 segments). With no segments at all: `removeSegmentAtIndex: segment 0 is out of range; there are none`.
- The index does not convert to a finite number: `removeSegmentAtIndex must be a finite number, got "first"`.

After a throw, the number of segments is unchanged.

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week', 'Month']);
seg.selectedSegmentIndex = 1;
seg.removeSegmentAtIndex(0, { animated: true });
console.log(seg.numberOfSegments, seg.selectedSegmentIndex);
```

**Result**: logs `2 0`. "Day" is removed, and "Week" is still selected; it is now segment 0.

## Corresponding iOS API

`-[UISegmentedControl removeSegmentAtIndex:animated:]`. Natively an out-of-range index raises no error; here it throws `TypeError`.

## See also

- [`removeAllSegments()`](removeallsegments.md): removes all segments
- [`insertSegmentWithTitle()`](insertsegmentwithtitle.md)
