---
type: reference
native: "-[UISegmentedControl insertSegmentWithImage:atIndex:animated:]"
---

# `UISegmentedControl`: `insertSegmentWithImage()` method

The **`insertSegmentWithImage()`** method inserts an image segment at the given position.

## Syntax

```
insertSegmentWithImage(image, { atIndex[, animated] })
```

### Parameters

**`image`**

The segment's image: a [`UIImage`](../ui-image.md) or `null`.

**`options.atIndex`**

The index of the segment to insert before. An integer; required. When it equals the current number of segments, the segment is inserted at the end; when it is larger than that, the segment is also inserted at the end. Fractions are truncated toward zero.

**`options.animated`** <small>optional</small>

A boolean. `true`: animates the insertion. When omitted, there is no animation.

### Return value

None (`undefined`).

[`numberOfSegments`](numberofsegments.md) has already increased by one when the method returns; even when animated, you do not need to wait for the animation to finish. The indexes of the segments after the insertion point increase by one, and [`selectedSegmentIndex`](selectedsegmentindex.md) changes with them, so it still points to the segment that was selected.

### Exceptions

**`TypeError`**

- `atIndex` is not given: `insertSegmentWithImage needs { atIndex }`.
- `atIndex` is negative: `atIndex must be a non-negative integer, got -1`.
- `atIndex` does not convert to a finite number (for example `NaN`): the message starts with `atIndex must be a finite number`.
- `image` is neither a `UIImage` nor `null`: `insertSegmentWithImage needs a UIImage or null`.

After a throw, the number of segments is unchanged.

## Examples

```js
const seg = new UISegmentedControl(['List']);
const grid = UIImage.systemImageNamed('square.grid.2x2');
if (grid !== null) {
  seg.insertSegmentWithImage(grid, { atIndex: 1 });
  console.log(seg.imageForSegmentAtIndex(1) === grid);
}
```

**Result**: logs `true`. Segment 1 shows a grid icon. **How the icon looks is not verified in the simulator.**

## Corresponding iOS API

`-[UISegmentedControl insertSegmentWithImage:atIndex:animated:]`. `animated` is a required argument natively; here it can be omitted.

## See also

- [`insertSegmentWithTitle()`](insertsegmentwithtitle.md): inserts a title segment
- [`removeSegmentAtIndex()`](removesegmentatindex.md): removes one segment
