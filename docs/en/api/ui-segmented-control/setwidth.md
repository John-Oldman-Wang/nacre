---
type: reference
native: "-[UISegmentedControl setWidth:forSegmentAtIndex:]"
---

# `UISegmentedControl`: `setWidth()` method

The **`setWidth()`** method sets the width of a segment.

## Syntax

```
setWidth(width, { forSegmentAtIndex })
```

### Parameters

**`width`**

The segment's width, in [pt](../units.md). Converted to a number. 0 means automatic: the segment shares the width equally with the others, or by content when [`apportionsSegmentWidthsByContent`](apportionssegmentwidthsbycontent.md) is set.

**`options.forSegmentAtIndex`**

The segment index, starting at 0; required. Fractions are truncated toward zero. Must be less than [`numberOfSegments`](numberofsegments.md).

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `forSegmentAtIndex` is not given: `setWidth needs { forSegmentAtIndex }`.
- The index is out of range or negative: `setWidth: segment 4 is out of range; expected 0 to 3` (with 4 segments). With no segments at all: `setWidth: segment 0 is out of range; there are none`.
- `width` does not convert to a finite number: `setWidth must be a finite number, got "wide"`.

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week', 'Month']);
seg.setWidth(120, { forSegmentAtIndex: 0 });
console.log(seg.widthForSegmentAtIndex(0));
```

**Effect**: logs `120`. Segment 0 is 120 pt wide, and the other segments share the remaining width equally. **The on-screen width is not verified in the simulator.**

## Corresponding iOS API

`-[UISegmentedControl setWidth:forSegmentAtIndex:]`. Natively, an out-of-range index sometimes raises an exception and sometimes does nothing; here it always throws `TypeError`.

## See also

- [`widthForSegmentAtIndex()`](widthforsegmentatindex.md): reads the segment's width
- [`apportionsSegmentWidthsByContent`](apportionssegmentwidthsbycontent.md): apportions segment widths by content
