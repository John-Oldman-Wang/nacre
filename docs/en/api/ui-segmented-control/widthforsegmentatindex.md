---
type: reference
native: "-[UISegmentedControl widthForSegmentAtIndex:]"
---

# `UISegmentedControl`: `widthForSegmentAtIndex()` method

The **`widthForSegmentAtIndex()`** method returns the width set for a segment with [`setWidth()`](setwidth.md).

## Syntax

```
widthForSegmentAtIndex(index)
```

### Parameters

**`index`**

The segment index, starting at 0. Fractions are truncated toward zero. Must be less than [`numberOfSegments`](numberofsegments.md).

### Return value

A number, in [pt](../units.md). If never set, it is 0, meaning automatic. It returns the width that was set, not the actual width on screen.

### Exceptions

**`TypeError`**

- The index is out of range or negative: `widthForSegmentAtIndex: segment 4 is out of range; expected 0 to 3` (with 4 segments). With no segments at all: `widthForSegmentAtIndex: segment 0 is out of range; there are none`.
- The index does not convert to a finite number: `widthForSegmentAtIndex must be a finite number, got "first"`.

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week']);
console.log(seg.widthForSegmentAtIndex(0));
seg.setWidth(80, { forSegmentAtIndex: 0 });
console.log(seg.widthForSegmentAtIndex(0));
```

**Result**: logs `0`, then `80`.

## Corresponding iOS API

`-[UISegmentedControl widthForSegmentAtIndex:]`. Natively an out-of-range index does not always raise an error; here it always throws `TypeError`.

## See also

- [`setWidth()`](setwidth.md)
