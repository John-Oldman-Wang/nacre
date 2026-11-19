---
type: reference
native: "-[UISegmentedControl contentOffsetForSegmentAtIndex:]"
---

# `UISegmentedControl`: `contentOffsetForSegmentAtIndex()` method

The **`contentOffsetForSegmentAtIndex()`** method returns the content offset set for a segment with [`setContentOffset()`](setcontentoffset.md).

## Syntax

```
contentOffsetForSegmentAtIndex(index)
```

### Parameters

**`index`**

The segment index, starting at 0. Fractions are truncated toward zero. Must be less than [`numberOfSegments`](numberofsegments.md).

### Return value

A [`CGSize`](../structs.md), in [pt](../units.md). `width` is the offset to the right, and `height` is the offset downward. If never set, it is 0, 0. Each read returns a new object, and its fields are read-only.

### Exceptions

**`TypeError`**

- The index is out of range or negative: `contentOffsetForSegmentAtIndex: segment 4 is out of range; expected 0 to 3` (with 4 segments). With no segments at all: `contentOffsetForSegmentAtIndex: segment 0 is out of range; there are none`.
- The index does not convert to a finite number: `contentOffsetForSegmentAtIndex must be a finite number, got "first"`.

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week']);
seg.setContentOffset({ width: 2, height: 3 }, { forSegmentAtIndex: 0 });
const offset = seg.contentOffsetForSegmentAtIndex(0);
console.log(offset.width, offset.height);
```

**Result**: logs `2 3`.

## Corresponding iOS API

`-[UISegmentedControl contentOffsetForSegmentAtIndex:]`. Natively an out-of-range index does not always raise an error; here it always throws `TypeError`.

## See also

- [`setContentOffset()`](setcontentoffset.md)
- [Structs](../structs.md)
