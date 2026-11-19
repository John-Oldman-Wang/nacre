---
type: reference
native: "-[UISegmentedControl setContentOffset:forSegmentAtIndex:]"
---

# `UISegmentedControl`: `setContentOffset()` method

The **`setContentOffset()`** method nudges the title or image inside a segment. The segment's own position and size do not change.

## Syntax

```
setContentOffset(offset, { forSegmentAtIndex })
```

### Parameters

**`offset`**

The offset: an object shaped like `{ width, height }`, or a [`CGSize`](../structs.md), in [pt](../units.md). A positive `width` moves the content right, and a positive `height` moves it down. Both fields are required.

**`options.forSegmentAtIndex`**

The segment index, starting at 0; required. Fractions are truncated toward zero. Must be less than [`numberOfSegments`](numberofsegments.md).

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `forSegmentAtIndex` is not given: `setContentOffset needs { forSegmentAtIndex }`.
- The index is out of range or negative: `setContentOffset: segment 4 is out of range; expected 0 to 3` (with 4 segments). With no segments at all: `setContentOffset: segment 0 is out of range; there are none`.
- `offset` is not a `{ width, height }`: `setContentOffset needs an object with all of: width, height`.

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week', 'Month']);
seg.setContentOffset({ width: 0, height: 2 }, { forSegmentAtIndex: 0 });
const offset = seg.contentOffsetForSegmentAtIndex(0);
console.log(offset.width, offset.height);
```

**Effect**: logs `0 2`. "Day" in segment 0 moves down 2 pt. **The on-screen position is not verified in the simulator.**

## Corresponding iOS API

`-[UISegmentedControl setContentOffset:forSegmentAtIndex:]`. Natively, an out-of-range index sometimes raises an exception and sometimes does nothing; here it always throws `TypeError`.

## See also

- [`contentOffsetForSegmentAtIndex()`](contentoffsetforsegmentatindex.md): reads the segment's offset
- [Structs](../structs.md): `CGSize`
