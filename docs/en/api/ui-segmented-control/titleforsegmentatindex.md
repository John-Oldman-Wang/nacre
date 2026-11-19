---
type: reference
native: "-[UISegmentedControl titleForSegmentAtIndex:]"
---

# `UISegmentedControl`: `titleForSegmentAtIndex()` method

The **`titleForSegmentAtIndex()`** method returns a segment's title.

## Syntax

```
titleForSegmentAtIndex(index)
```

### Parameters

**`index`**

The segment index, starting at 0. Fractions are truncated toward zero. Must be less than [`numberOfSegments`](numberofsegments.md).

### Return value

A string, or `null`. Image segments and segments without a title return `null`.

### Exceptions

**`TypeError`**

- The index is out of range or negative: `titleForSegmentAtIndex: segment 4 is out of range; expected 0 to 3` (with 4 segments). With no segments at all: `titleForSegmentAtIndex: segment 0 is out of range; there are none`.
- The index does not convert to a finite number: `titleForSegmentAtIndex must be a finite number, got "first"`.

## Examples

```js
const seg = new UISegmentedControl(['Day', 'Week', 'Month']);
console.log(seg.titleForSegmentAtIndex(0));
```

**Result**: logs `Day`.

## Corresponding iOS API

`-[UISegmentedControl titleForSegmentAtIndex:]`. Natively an out-of-range index does not always raise an error; here it always throws `TypeError`.

## See also

- [`setTitle()`](settitle.md)
